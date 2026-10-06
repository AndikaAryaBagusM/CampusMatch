// The Moderator's Jurusan mapping tool (decisions.md 17m): remap a Kode Prodi
// to another Jurusan, or move single Prodi with an override. Only existing
// Jurusan can be targets, and every change is logged in riwayat_jurusan with
// a reason. The CSV loader skips any Kode a Moderator changed (4d).
import { asc, count, desc, eq, ilike, inArray, like, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { jurusan, kampus, kodeProdiJurusan, prodi, riwayatJurusan, users } from "@/db/schema";

export class PemetaanDitolak extends Error {}

export const ALASAN_MAKS = 500;
const MAKS_PRODI_SEKALIGUS = 500;

function alasanSah(alasan: string): string {
  const a = alasan.trim().slice(0, ALASAN_MAKS);
  if (!a) throw new PemetaanDitolak("Tulis alasan perubahannya.");
  return a;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

// --- Reading ----------------------------------------------------------------

export async function listSemuaJurusan(db: Db) {
  return db.select({ id: jurusan.id, nama: jurusan.nama }).from(jurusan).orderBy(asc(jurusan.nama));
}

// Search on the tool's start page: a Kode Prodi by its digits, Prodi by name
// (grouped to their Kode), and Jurusan by name.
export async function cariPemetaan(db: Db, query: string) {
  const q = query.replace(/\s+/g, " ").trim().slice(0, 100);
  if (q.length < 2) return null;
  const kodeCocok = /^\d+$/.test(q) ? like(prodi.kodeProdi, `${q}%`) : ilike(prodi.nama, `%${escapeLike(q)}%`);
  const [kode, daftarJurusan] = await Promise.all([
    db
      .select({
        kode: prodi.kodeProdi,
        jumlah: count(),
        contoh: sql<string>`mode() WITHIN GROUP (ORDER BY ${prodi.nama})`,
        jurusanNama: sql<string | null>`min(${jurusan.nama})`,
      })
      .from(prodi)
      .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
      .leftJoin(jurusan, eq(kodeProdiJurusan.jurusanId, jurusan.id))
      .where(kodeCocok)
      .groupBy(prodi.kodeProdi)
      .orderBy(desc(count()), asc(prodi.kodeProdi))
      .limit(30),
    db
      .select({ nama: jurusan.nama, slug: jurusan.slug })
      .from(jurusan)
      .where(ilike(jurusan.nama, `%${escapeLike(q)}%`))
      .orderBy(asc(jurusan.nama))
      .limit(10),
  ]);
  return { q, kode, jurusan: daftarJurusan };
}

// What a Jurusan holds: the Kode mapped to it, and Prodi overridden into it.
export async function listIsiJurusan(db: Db, jurusanSlug: string) {
  const [j] = await db.select({ id: jurusan.id, nama: jurusan.nama, slug: jurusan.slug }).from(jurusan).where(eq(jurusan.slug, jurusanSlug));
  if (!j) return null;
  const [kode, override] = await Promise.all([
    db
      .select({ kode: kodeProdiJurusan.kodeProdi, jumlah: count(prodi.id), contoh: sql<string | null>`mode() WITHIN GROUP (ORDER BY ${prodi.nama})` })
      .from(kodeProdiJurusan)
      .leftJoin(prodi, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
      .where(eq(kodeProdiJurusan.jurusanId, j.id))
      .groupBy(kodeProdiJurusan.kodeProdi)
      .orderBy(asc(kodeProdiJurusan.kodeProdi)),
    db
      .select({ kode: prodi.kodeProdi, jumlah: count() })
      .from(prodi)
      .where(eq(prodi.jurusanOverrideId, j.id))
      .groupBy(prodi.kodeProdi)
      .orderBy(asc(prodi.kodeProdi)),
  ]);
  return { jurusan: j, kode, override };
}

export type ProdiPemetaan = {
  id: number;
  slug: string;
  kampusNama: string;
  override: boolean;
  jurusanNama: string | null;
};

export type GrupPemetaan = { nama: string; jenjang: string; prodi: ProdiPemetaan[] };

// One Kode Prodi: its Jurusan, its Prodi grouped by name and Jenjang (the
// usual unit of a fix, e.g. every "Pendidikan Islam Anak Usia Dini"), and its log.
export async function getKodePemetaan(db: Db, kode: string) {
  const jurusanOverride = alias(jurusan, "jurusan_override");
  const [[peta], baris] = await Promise.all([
    db
      .select({ jurusanId: kodeProdiJurusan.jurusanId, jurusanNama: jurusan.nama, jurusanSlug: jurusan.slug, diubahOleh: kodeProdiJurusan.diubahOleh })
      .from(kodeProdiJurusan)
      .innerJoin(jurusan, eq(kodeProdiJurusan.jurusanId, jurusan.id))
      .where(eq(kodeProdiJurusan.kodeProdi, kode)),
    db
      .select({
        id: prodi.id,
        slug: prodi.slug,
        nama: prodi.nama,
        jenjang: prodi.jenjang,
        bidang: prodi.bidang,
        kampusNama: kampus.nama,
        overrideId: prodi.jurusanOverrideId,
        overrideNama: jurusanOverride.nama,
      })
      .from(prodi)
      .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
      .leftJoin(jurusanOverride, eq(prodi.jurusanOverrideId, jurusanOverride.id))
      .where(eq(prodi.kodeProdi, kode))
      .orderBy(asc(prodi.nama), asc(kampus.nama), asc(prodi.id)),
  ]);
  if (baris.length === 0) return null;

  const grup = new Map<string, GrupPemetaan>();
  for (const b of baris) {
    const kunci = `${b.jenjang}|${b.nama}`;
    const g = grup.get(kunci) ?? { nama: b.nama, jenjang: b.jenjang, prodi: [] };
    g.prodi.push({
      id: b.id,
      slug: b.slug,
      kampusNama: b.kampusNama,
      override: b.overrideId !== null,
      jurusanNama: b.overrideNama ?? peta?.jurusanNama ?? null,
    });
    grup.set(kunci, g);
  }
  const riwayat = await listRiwayatKode(db, kode);
  return {
    kode,
    jenjang: [...new Set(baris.map((b) => b.jenjang))],
    bidang: [...new Set(baris.map((b) => b.bidang).filter((b): b is string => Boolean(b)))],
    jumlahProdi: baris.length,
    jurusan: peta ? { id: peta.jurusanId, nama: peta.jurusanNama, slug: peta.jurusanSlug, olehModerator: peta.diubahOleh !== null } : null,
    grup: [...grup.values()].sort((a, b) => b.prodi.length - a.prodi.length || a.nama.localeCompare(b.nama, "id")),
    riwayat,
  };
}

export type KodePemetaan = NonNullable<Awaited<ReturnType<typeof getKodePemetaan>>>;

async function listRiwayatKode(db: Db, kode: string) {
  const lama = alias(jurusan, "jurusan_lama");
  const baru = alias(jurusan, "jurusan_baru");
  return db
    .select({
      id: riwayatJurusan.id,
      jenis: riwayatJurusan.jenis,
      createdAt: riwayatJurusan.createdAt,
      alasan: riwayatJurusan.alasan,
      lama: lama.nama,
      baru: baru.nama,
      prodiNama: prodi.nama,
      kampusNama: kampus.nama,
      olehEmail: users.email,
    })
    .from(riwayatJurusan)
    .leftJoin(lama, eq(riwayatJurusan.jurusanLamaId, lama.id))
    .leftJoin(baru, eq(riwayatJurusan.jurusanBaruId, baru.id))
    .leftJoin(prodi, eq(riwayatJurusan.prodiId, prodi.id))
    .leftJoin(kampus, eq(prodi.kampusId, kampus.id))
    .leftJoin(users, eq(riwayatJurusan.oleh, users.id))
    .where(eq(riwayatJurusan.kodeProdi, kode))
    .orderBy(desc(riwayatJurusan.createdAt), desc(riwayatJurusan.id))
    .limit(200);
}

// --- Changing ---------------------------------------------------------------

async function jurusanAda(db: Db, id: number) {
  const [j] = await db.select({ id: jurusan.id }).from(jurusan).where(eq(jurusan.id, id));
  if (!j) throw new PemetaanDitolak("Jurusan tujuan tidak ditemukan.");
}

// Remaps every Prodi of a Kode (except those with an override). Marking it
// diubah_oleh keeps the CSV loader from undoing it.
export async function ubahJurusanKode(
  db: Db,
  { kode, jurusanId, alasan, moderatorId }: { kode: string; jurusanId: number; alasan: string; moderatorId: string },
) {
  const a = alasanSah(alasan);
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const [ada] = await t.select({ n: count() }).from(prodi).where(eq(prodi.kodeProdi, kode));
    if (!ada?.n) throw new PemetaanDitolak("Kode Prodi ini tidak ada di katalog.");
    await jurusanAda(t, jurusanId);
    const [lama] = await t.select({ jurusanId: kodeProdiJurusan.jurusanId }).from(kodeProdiJurusan).where(eq(kodeProdiJurusan.kodeProdi, kode)).for("update");
    if (lama?.jurusanId === jurusanId) throw new PemetaanDitolak("Kode ini sudah di Jurusan tersebut.");
    await t
      .insert(kodeProdiJurusan)
      .values({ kodeProdi: kode, jurusanId, diubahOleh: moderatorId })
      .onConflictDoUpdate({ target: kodeProdiJurusan.kodeProdi, set: { jurusanId, diubahOleh: moderatorId, updatedAt: sql`now()` } });
    await t.insert(riwayatJurusan).values({
      jenis: "kode",
      kodeProdi: kode,
      jurusanLamaId: lama?.jurusanId ?? null,
      jurusanBaruId: jurusanId,
      alasan: a,
      oleh: moderatorId,
    });
  });
}

// Moves the given Prodi (all of one Kode) to a Jurusan, or back to their
// Kode's Jurusan with null. An override equal to the Kode's Jurusan is stored
// as none. Returns the slugs of the Prodi that changed.
export async function setOverrideProdi(
  db: Db,
  { prodiIds, jurusanId, alasan, moderatorId }: { prodiIds: number[]; jurusanId: number | null; alasan: string; moderatorId: string },
): Promise<string[]> {
  const a = alasanSah(alasan);
  const ids = [...new Set(prodiIds)].filter((id) => Number.isSafeInteger(id) && id > 0);
  if (ids.length === 0) throw new PemetaanDitolak("Pilih Prodi yang akan dipindahkan.");
  if (ids.length > MAKS_PRODI_SEKALIGUS) throw new PemetaanDitolak(`Paling banyak ${MAKS_PRODI_SEKALIGUS} Prodi sekaligus.`);
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    if (jurusanId !== null) await jurusanAda(t, jurusanId);
    const rows = await t
      .select({ id: prodi.id, slug: prodi.slug, kode: prodi.kodeProdi, override: prodi.jurusanOverrideId })
      .from(prodi)
      .where(inArray(prodi.id, ids))
      .for("update");
    if (rows.length !== ids.length) throw new PemetaanDitolak("Sebagian Prodi tidak ditemukan.");
    const kode = [...new Set(rows.map((r) => r.kode))];
    if (kode.length !== 1) throw new PemetaanDitolak("Semua Prodi yang dipindahkan harus dari Kode Prodi yang sama.");
    const [peta] = await t.select({ jurusanId: kodeProdiJurusan.jurusanId }).from(kodeProdiJurusan).where(eq(kodeProdiJurusan.kodeProdi, kode[0]));
    const jurusanKode = peta?.jurusanId ?? null;
    const simpan = jurusanId === jurusanKode ? null : jurusanId;

    const berubah = rows.filter((r) => r.override !== simpan);
    if (berubah.length === 0) throw new PemetaanDitolak("Tidak ada yang berubah: Prodi itu sudah di Jurusan tersebut.");
    await t.update(prodi).set({ jurusanOverrideId: simpan, updatedAt: sql`now()` }).where(inArray(prodi.id, berubah.map((r) => r.id)));
    await t.insert(riwayatJurusan).values(
      berubah.map((r) => ({
        jenis: "prodi" as const,
        kodeProdi: r.kode,
        prodiId: r.id,
        jurusanLamaId: r.override ?? jurusanKode,
        jurusanBaruId: simpan ?? jurusanKode,
        alasan: a,
        oleh: moderatorId,
      })),
    );
    return berubah.map((r) => r.slug);
  });
}

// The Kode a Moderator should look at first (data/jurusan-curation.md, "Kode
// left untouched" and the notes on per-Prodi overrides).
export const KODE_PERLU_DICEK = [
  { kode: "86207", catatan: "Prodi bernama PIAUD di bawah PG-PAUD → Pendidikan Islam Anak Usia Dini" },
  { kode: "86201", catatan: "Prodi BK Islam/BKPI di bawah BK umum → Bimbingan dan Konseling Islam; cek juga Pastoral Konseling" },
  { kode: "12401", catatan: "Kesehatan/Keperawatan Gigi di bawah Teknik Gigi → Kesehatan Gigi" },
  { kode: "86202", catatan: "Prodi bernama PAUD di bawah Pendidikan Luar Biasa" },
  { kode: "57482", catatan: "Sistem Informasi Tasikmalaya di bawah Manajemen Informatika → Sistem Informasi" },
] as const;

// For the action's validation: a Kode Prodi as in the exports.
export const kodeSah = (v: unknown): v is string => typeof v === "string" && /^\d{1,10}$/.test(v);

