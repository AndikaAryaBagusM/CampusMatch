// Promosi (ADR 0009 and 0012, decisions.md 17n and 17r): a paid, labelled
// placement by a Kampus or a bimbel on the home page, Jurusan pages and
// search. A Moderator enters it as Draf, a different Moderator activates it,
// and it shows (Tayang) between its dates. It never changes Ulasan, Bintang or
// the order of any list, and only daily click totals are kept.
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { jurusan, kampus, kodeProdiJurusan, kota, prodi, promosi, promosiJurusan, promosiKlik, users } from "@/db/schema";
import { jurusanEfektif } from "@/lib/search";

export class PromosiDitolak extends Error {}

export const TEKS_MAKS = 140;
export const NAMA_MAKS = 80;
const ALASAN_MAKS = 500;
const TAUTAN_MAKS = 500;

// A bimbel's address, normalised: https on a public domain name, no
// credentials or port, and no query parameters but utm_*, so the link tells
// the bimbel only that the visitor came from CampusMatch (ADR 0012).
export function periksaTautan(masukan: string): string {
  let u: URL;
  try {
    u = new URL(masukan.trim());
  } catch {
    throw new PromosiDitolak("Tautan tidak sah. Tulis alamat lengkap yang diawali https://.");
  }
  if (u.protocol !== "https:") throw new PromosiDitolak("Tautan harus diawali https://.");
  if (u.username || u.password || u.port) throw new PromosiDitolak("Tautan tidak boleh memuat nama pengguna, kata sandi, atau port.");
  const host = u.hostname;
  if (!host.includes(".") || host.endsWith(".") || host.startsWith("[") || /^[\d.]+$/.test(host) || host.endsWith(".localhost"))
    throw new PromosiDitolak("Tautan harus memakai nama domain publik.");
  for (const k of u.searchParams.keys())
    if (!k.toLowerCase().startsWith("utm_")) throw new PromosiDitolak(`Parameter "${k}" tidak boleh; hanya parameter utm_ yang diizinkan.`);
  const hasil = u.toString();
  if (hasil.length > TAUTAN_MAKS) throw new PromosiDitolak(`Tautan paling panjang ${TAUTAN_MAKS} karakter.`);
  return hasil;
}

// "ruangguru.com": what a reader sees before leaving CampusMatch.
export const domainTautan = (tautan: string) => new URL(tautan).hostname.replace(/^www\./, "");

// The click report a Moderator sends the Pengiklan: one row per day, oldest first.
export function klikCsv(klik: { tanggal: string; jumlah: number }[]): string {
  const baris = [...klik].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((k) => `${k.tanggal},${k.jumlah}`);
  return ["tanggal,klik", ...baris].join("\r\n") + "\r\n";
}

const tanggalJakarta = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" });

// "2026-10-06": today in Asia/Jakarta, the dates a Promosi runs on.
export function hariIniJakarta(sekarang = new Date()): string {
  return tanggalJakarta.format(sekarang);
}

const tanggalSah = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

export type Keadaan = "draf" | "terjadwal" | "tayang" | "selesai" | "dihentikan";

export const LABEL_KEADAAN: Record<Keadaan, string> = {
  draf: "Draf",
  terjadwal: "Terjadwal",
  tayang: "Tayang",
  selesai: "Selesai",
  dihentikan: "Dihentikan",
};

export function keadaanPromosi(p: { status: string; mulai: string; selesai: string }, hariIni: string): Keadaan {
  if (p.status === "draf") return "draf";
  if (p.status === "dihentikan") return "dihentikan";
  if (hariIni < p.mulai) return "terjadwal";
  if (hariIni > p.selesai) return "selesai";
  return "tayang";
}

const tayang = (hariIni: string) => and(eq(promosi.status, "aktif"), lte(promosi.mulai, hariIni), gte(promosi.selesai, hariIni));

// --- Showing ----------------------------------------------------------------

export type Tempat = { tempat: "beranda" } | { tempat: "jurusan"; jurusanIds: number[] };

type KampusTampil = { npsn: string; nama: string; slug: string; akreditasi: string | null; kotaNama: string };

export type PromosiTampil = { id: number; teks: string | null } & (
  | { jenis: "kampus"; kampus: KampusTampil }
  | { jenis: "bimbel"; nama: string; tautan: string }
);

// The columns a Promosi box needs; Kampus is left-joined, so a bimbel row has none.
const kolomTampil = {
  id: promosi.id,
  jenis: promosi.jenis,
  teks: promosi.teks,
  namaPengiklan: promosi.namaPengiklan,
  tautan: promosi.tautan,
  kampus: { npsn: kampus.npsn, nama: kampus.nama, slug: kampus.slug, akreditasi: kampus.akreditasi, kotaNama: kota.nama },
};

type BarisTampil = {
  id: number;
  jenis: "kampus" | "bimbel";
  teks: string | null;
  namaPengiklan: string | null;
  tautan: string | null;
  kampus: { npsn: string | null; nama: string | null; slug: string | null; akreditasi: string | null; kotaNama: string | null } | null;
};

// The database check guarantees the columns each kind needs.
export function keTampil(r: BarisTampil): PromosiTampil {
  if (r.jenis === "bimbel") return { id: r.id, teks: r.teks, jenis: "bimbel", nama: r.namaPengiklan!, tautan: r.tautan! };
  return { id: r.id, teks: r.teks, jenis: "kampus", kampus: r.kampus as KampusTampil };
}

// The Promosi to show in one place, or null. Several qualifying Promosi of
// either kind take turns by the hour, so a cached page needs no randomness or
// visitor state.
export async function pilihPromosi(db: Db, t: Tempat, sekarang = new Date()): Promise<PromosiTampil | null> {
  if (t.tempat === "jurusan" && t.jurusanIds.length === 0) return null;
  const tempat =
    t.tempat === "beranda"
      ? eq(promosi.diBeranda, true)
      : sql`EXISTS (SELECT 1 FROM ${promosiJurusan} WHERE ${promosiJurusan.promosiId} = ${promosi.id} AND ${inArray(promosiJurusan.jurusanId, t.jurusanIds)})`;
  const calon = await db
    .select(kolomTampil)
    .from(promosi)
    .leftJoin(kampus, eq(promosi.kampusId, kampus.id))
    .leftJoin(kota, eq(kampus.kotaId, kota.id))
    .where(and(tayang(hariIniJakarta(sekarang)), tempat))
    .orderBy(asc(promosi.id));
  if (calon.length === 0) return null;
  return keTampil(calon[Math.floor(sekarang.getTime() / 3_600_000) % calon.length]);
}

// Counts a click if the Promosi is showing, and returns where it leads (the
// Kampus's page, or the bimbel's checked address), or null for an unknown id.
// Only a daily total is stored.
export async function catatKlik(db: Db, id: number, sekarang = new Date()): Promise<string | null> {
  const hariIni = hariIniJakarta(sekarang);
  const [p] = await db
    .select({ jenis: promosi.jenis, tautan: promosi.tautan, slug: kampus.slug, sedangTayang: sql<boolean>`${tayang(hariIni)}` })
    .from(promosi)
    .leftJoin(kampus, eq(promosi.kampusId, kampus.id))
    .where(eq(promosi.id, id));
  if (!p) return null;
  if (p.sedangTayang)
    await db
      .insert(promosiKlik)
      .values({ promosiId: id, tanggal: hariIni, jumlah: 1 })
      .onConflictDoUpdate({ target: [promosiKlik.promosiId, promosiKlik.tanggal], set: { jumlah: sql`${promosiKlik.jumlah} + 1` } });
  return p.jenis === "bimbel" ? p.tautan : `/kampus/${p.slug}`;
}

// --- Entering ---------------------------------------------------------------

export async function cariKampusPromosi(db: Db, query: string) {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  const escape = q.replace(/[\\%_]/g, (c) => `\\${c}`);
  return db
    .select({ id: kampus.id, npsn: kampus.npsn, nama: kampus.nama, kotaNama: kota.nama })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(or(eq(kampus.npsn, q), ilike(kampus.nama, `%${escape}%`)))
    .orderBy(asc(kampus.nama))
    .limit(15);
}

export async function getKampusPromosi(db: Db, kampusId: number) {
  const [k] = await db
    .select({ id: kampus.id, npsn: kampus.npsn, nama: kampus.nama, slug: kampus.slug, akreditasi: kampus.akreditasi, kotaNama: kota.nama })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(eq(kampus.id, kampusId));
  return k ?? null;
}

// The Jurusan a Kampus offers (through its Prodi's effective Jurusan): the
// only Jurusan a Promosi for it can target.
export async function listJurusanKampus(db: Db, kampusId: number) {
  return db
    .selectDistinct({ id: jurusan.id, nama: jurusan.nama })
    .from(prodi)
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .innerJoin(jurusan, sql`${jurusan.id} = ${jurusanEfektif}`)
    .where(eq(prodi.kampusId, kampusId))
    .orderBy(asc(jurusan.nama));
}

type DataUmum = {
  jurusanIds: number[];
  diBeranda: boolean;
  mulai: string;
  selesai: string;
  teks: string;
  catatanInternal: string;
};

export type DataPromosi = DataUmum &
  ({ jenis: "kampus"; kampusId: number } | { jenis: "bimbel"; namaPengiklan: string; tautan: string });

const rapikan = (s: string) => s.replace(/\s+/g, " ").trim();

// A Kampus targets only the Jurusan it offers; a bimbel any Jurusan, and it
// needs its name, text and a checked address.
async function pengiklan(db: Db, data: DataPromosi, teks: string, jurusanIds: number[]) {
  if (data.jenis === "bimbel") {
    const nama = rapikan(data.namaPengiklan);
    if (!nama || nama.length > NAMA_MAKS) throw new PromosiDitolak(`Tulis nama bimbel, paling banyak ${NAMA_MAKS} karakter.`);
    if (!teks) throw new PromosiDitolak("Promosi bimbel perlu teks.");
    const tautan = periksaTautan(data.tautan);
    const ada = jurusanIds.length ? await db.select({ id: jurusan.id }).from(jurusan).where(inArray(jurusan.id, jurusanIds)) : [];
    if (ada.length !== jurusanIds.length) throw new PromosiDitolak("Ada Jurusan yang tidak ditemukan.");
    return { jenis: "bimbel" as const, namaPengiklan: nama, tautan };
  }
  const k = await getKampusPromosi(db, data.kampusId);
  if (!k) throw new PromosiDitolak("Kampus tidak ditemukan.");
  const ditawarkan = new Set((await listJurusanKampus(db, k.id)).map((j) => j.id));
  if (jurusanIds.some((id) => !ditawarkan.has(id))) throw new PromosiDitolak("Ada Jurusan yang tidak ditawarkan Kampus ini.");
  return { jenis: "kampus" as const, kampusId: k.id };
}

export async function buatDraf(db: Db, data: DataPromosi, moderatorId: string, sekarang = new Date()): Promise<number> {
  const teks = rapikan(data.teks);
  if (teks.length > TEKS_MAKS) throw new PromosiDitolak(`Teks paling banyak ${TEKS_MAKS} karakter.`);
  if (!tanggalSah(data.mulai) || !tanggalSah(data.selesai)) throw new PromosiDitolak("Isi tanggal mulai dan selesai.");
  if (data.selesai < data.mulai) throw new PromosiDitolak("Tanggal selesai harus sama dengan atau setelah tanggal mulai.");
  if (data.selesai < hariIniJakarta(sekarang)) throw new PromosiDitolak("Tanggal selesai sudah lewat.");
  const jurusanIds = [...new Set(data.jurusanIds)];
  if (!data.diBeranda && jurusanIds.length === 0) throw new PromosiDitolak("Pilih tempat tampil: Beranda atau minimal satu Jurusan.");
  const siapa = await pengiklan(db, data, teks, jurusanIds);

  return db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const [baru] = await t
      .insert(promosi)
      .values({
        ...siapa,
        teks: teks || null,
        diBeranda: data.diBeranda,
        mulai: data.mulai,
        selesai: data.selesai,
        catatanInternal: data.catatanInternal.trim().slice(0, ALASAN_MAKS) || null,
        dimasukkanOleh: moderatorId,
      })
      .returning({ id: promosi.id });
    if (jurusanIds.length) await t.insert(promosiJurusan).values(jurusanIds.map((jurusanId) => ({ promosiId: baru.id, jurusanId })));
    return baru.id;
  });
}

// --- Checking and stopping ----------------------------------------------------

async function kunci(db: Db, id: number) {
  const [p] = await db
    .select({ status: promosi.status, dimasukkanOleh: promosi.dimasukkanOleh, selesai: promosi.selesai })
    .from(promosi)
    .where(eq(promosi.id, id))
    .for("update");
  if (!p) throw new PromosiDitolak("Promosi tidak ditemukan.");
  return p;
}

export async function aktifkan(db: Db, id: number, moderatorId: string, sekarang = new Date()) {
  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const p = await kunci(t, id);
    if (p.status !== "draf") throw new PromosiDitolak("Hanya Draf yang bisa diaktifkan.");
    if (p.dimasukkanOleh === moderatorId) throw new PromosiDitolak("Promosi harus diaktifkan Moderator lain, bukan yang memasukkannya.");
    if (p.selesai < hariIniJakarta(sekarang)) throw new PromosiDitolak("Tanggal selesainya sudah lewat; buat Promosi baru.");
    await t.update(promosi).set({ status: "aktif", diaktifkanOleh: moderatorId, diaktifkanAt: sql`now()` }).where(eq(promosi.id, id));
  });
}

export async function hentikan(db: Db, id: number, moderatorId: string, alasan: string) {
  const a = alasan.trim().slice(0, ALASAN_MAKS);
  if (!a) throw new PromosiDitolak("Tulis alasan menghentikannya.");
  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const p = await kunci(t, id);
    if (p.status !== "aktif") throw new PromosiDitolak("Hanya Promosi aktif yang bisa dihentikan.");
    await t.update(promosi).set({ status: "dihentikan", dihentikanOleh: moderatorId, dihentikanAt: sql`now()`, alasanDihentikan: a }).where(eq(promosi.id, id));
  });
}

export async function hapusDraf(db: Db, id: number) {
  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const p = await kunci(t, id);
    if (p.status !== "draf") throw new PromosiDitolak("Hanya Draf yang bisa dihapus; hentikan Promosi yang aktif.");
    await t.delete(promosi).where(eq(promosi.id, id));
  });
}

// --- Moderator views ------------------------------------------------------------

export async function hitungPromosiDraf(db: Db): Promise<number> {
  const [r] = await db.select({ n: count() }).from(promosi).where(eq(promosi.status, "draf"));
  return r?.n ?? 0;
}

const jurusanPromosi = sql<string | null>`(SELECT string_agg(${jurusan.nama}, ', ' ORDER BY ${jurusan.nama}) FROM ${promosiJurusan} JOIN ${jurusan} ON ${jurusan.id} = ${promosiJurusan.jurusanId} WHERE ${promosiJurusan.promosiId} = ${promosi.id})`;

export async function listPromosiModerasi(db: Db, sekarang = new Date()) {
  const hariIni = hariIniJakarta(sekarang);
  const duaMinggu = hariIniJakarta(new Date(sekarang.getTime() - 13 * 86_400_000));
  const rows = await db
    .select({
      id: promosi.id,
      status: promosi.status,
      mulai: promosi.mulai,
      selesai: promosi.selesai,
      diBeranda: promosi.diBeranda,
      jenis: promosi.jenis,
      nama: sql<string>`coalesce(${kampus.nama}, ${promosi.namaPengiklan})`,
      jurusan: jurusanPromosi,
      klikTotal: sql<number>`(SELECT coalesce(sum(${promosiKlik.jumlah}), 0)::int FROM ${promosiKlik} WHERE ${promosiKlik.promosiId} = ${promosi.id})`,
      klik14: sql<number>`(SELECT coalesce(sum(${promosiKlik.jumlah}), 0)::int FROM ${promosiKlik} WHERE ${promosiKlik.promosiId} = ${promosi.id} AND ${promosiKlik.tanggal} >= ${duaMinggu})`,
    })
    .from(promosi)
    .leftJoin(kampus, eq(promosi.kampusId, kampus.id))
    .orderBy(desc(promosi.mulai), desc(promosi.id))
    .limit(200);
  return rows.map((r) => ({ ...r, keadaan: keadaanPromosi(r, hariIni) }));
}

export async function getPromosi(db: Db, id: number, sekarang = new Date()) {
  const masuk = alias(users, "dimasukkan");
  const aktif = alias(users, "diaktifkan");
  const henti = alias(users, "dihentikan");
  const [p] = await db
    .select({
      ...kolomTampil,
      status: promosi.status,
      diBeranda: promosi.diBeranda,
      mulai: promosi.mulai,
      selesai: promosi.selesai,
      catatanInternal: promosi.catatanInternal,
      dimasukkanOleh: promosi.dimasukkanOleh,
      dimasukkanEmail: masuk.email,
      diaktifkanEmail: aktif.email,
      diaktifkanAt: promosi.diaktifkanAt,
      dihentikanEmail: henti.email,
      dihentikanAt: promosi.dihentikanAt,
      alasanDihentikan: promosi.alasanDihentikan,
      createdAt: promosi.createdAt,
      jurusan: jurusanPromosi,
    })
    .from(promosi)
    .leftJoin(kampus, eq(promosi.kampusId, kampus.id))
    .leftJoin(kota, eq(kampus.kotaId, kota.id))
    .leftJoin(masuk, eq(promosi.dimasukkanOleh, masuk.id))
    .leftJoin(aktif, and(isNotNull(promosi.diaktifkanOleh), eq(promosi.diaktifkanOleh, aktif.id)))
    .leftJoin(henti, eq(promosi.dihentikanOleh, henti.id))
    .where(eq(promosi.id, id));
  if (!p) return null;
  const klik = await db
    .select({ tanggal: promosiKlik.tanggal, jumlah: promosiKlik.jumlah })
    .from(promosiKlik)
    .where(eq(promosiKlik.promosiId, id))
    .orderBy(desc(promosiKlik.tanggal));
  const tampil = keTampil(p);
  const nama = tampil.jenis === "bimbel" ? tampil.nama : tampil.kampus.nama;
  return { ...p, tampil, nama, keadaan: keadaanPromosi(p, hariIniJakarta(sekarang)), klik };
}

export type PromosiDetail = NonNullable<Awaited<ReturnType<typeof getPromosi>>>;
