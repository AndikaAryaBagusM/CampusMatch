import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { beasiswa, beasiswaKampus, biaya, jalurMasuk, kampus, prodi, sumber, users } from "@/db/schema";
import { FaktaDitolak, hapusDraf, hitungStatusFakta } from "./impor";
import { drafSumber } from "./kolom";

// The second Moderator's check (ADR 0006). The checker compares a Sumber's
// Draf facts with the document and either marks them all Diperiksa or sends
// them back. Callers must have passed requireModerator().

export class PemeriksaanDitolak extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PemeriksaanDitolak";
  }
}

const ALASAN_MAKS = 1000;

// Sumber with Draf facts, oldest first, and Sumber sent back that are still empty.
export async function listSumberDraf(db: Db) {
  const { rows } = await db.execute<{
    id: number;
    kode: string;
    judul: string;
    penerbit: string;
    url: string;
    arsip_url: string | null;
    catatan_pemeriksa: string | null;
    updated_at: string;
    kampus_nama: string | null;
    dimasukkan_email: string | null;
    draf: number;
  }>(sql`
    SELECT s.id, s.kode, s.judul, s.penerbit, s.url, s.arsip_url, s.catatan_pemeriksa, s.updated_at,
      k.nama AS kampus_nama, u.email AS dimasukkan_email,
      ((SELECT count(*) FROM jalur_masuk WHERE sumber_id = s.id AND status = 'draf')
       + (SELECT count(*) FROM biaya WHERE sumber_id = s.id AND status = 'draf')
       + (SELECT count(*) FROM beasiswa WHERE sumber_id = s.id AND status = 'draf')
       + (SELECT count(*) FROM beasiswa_kampus WHERE sumber_id = s.id AND status = 'draf'))::int AS draf
    FROM sumber s
    LEFT JOIN kampus k ON k.id = s.kampus_id
    LEFT JOIN users u ON u.id = s.dimasukkan_oleh
    ORDER BY s.updated_at`);
  const semua = rows.map((r) => ({ ...r, draf: Number(r.draf) }));
  return {
    draf: semua.filter((s) => s.draf > 0),
    // Sent back and not yet re-imported: the entering Moderator reads why here.
    dikembalikan: semua.filter((s) => s.draf === 0 && s.catatan_pemeriksa),
  };
}

export async function hitungSumberDraf(db: Db): Promise<number> {
  const { rows } = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM sumber s WHERE
      EXISTS (SELECT 1 FROM jalur_masuk WHERE sumber_id = s.id AND status = 'draf')
      OR EXISTS (SELECT 1 FROM biaya WHERE sumber_id = s.id AND status = 'draf')
      OR EXISTS (SELECT 1 FROM beasiswa WHERE sumber_id = s.id AND status = 'draf')
      OR EXISTS (SELECT 1 FROM beasiswa_kampus WHERE sumber_id = s.id AND status = 'draf')`);
  return Number(rows[0]?.n ?? 0);
}

// Status columns every fact row carries on the Moderator page.
const kolomStatus = <T extends { status: AnyPgColumn; ditarikAt: AnyPgColumn; alasanDitarik: AnyPgColumn }>(t: T) => ({
  status: t.status as T["status"],
  ditarikAt: t.ditarikAt as T["ditarikAt"],
  alasanDitarik: t.alasanDitarik as T["alasanDitarik"],
});

// One Sumber with all its facts (Draf, Diperiksa and Ditarik), for the checker
// to compare with the document and for withdrawing shown facts.
export async function getSumber(db: Db, sumberId: number) {
  const [s] = await db
    .select({
      id: sumber.id,
      kode: sumber.kode,
      url: sumber.url,
      judul: sumber.judul,
      penerbit: sumber.penerbit,
      diaksesPada: sumber.diaksesPada,
      arsipUrl: sumber.arsipUrl,
      dimasukkanOleh: sumber.dimasukkanOleh,
      dimasukkanEmail: users.email,
      kampusNama: kampus.nama,
      kampusSlug: kampus.slug,
    })
    .from(sumber)
    .leftJoin(kampus, eq(sumber.kampusId, kampus.id))
    .leftJoin(users, eq(sumber.dimasukkanOleh, users.id))
    .where(eq(sumber.id, sumberId));
  if (!s) return null;

  const [jalur, daftarBiaya, daftarBeasiswa, ikut] = await Promise.all([
    db
      .select({
        id: jalurMasuk.id,
        ...kolomStatus(jalurMasuk),
        tahunAkademik: jalurMasuk.tahunAkademik,
        nama: jalurMasuk.nama,
        kategori: jalurMasuk.kategori,
        tes: jalurMasuk.tes,
        pendaftaranBuka: jalurMasuk.pendaftaranBuka,
        pendaftaranTutup: jalurMasuk.pendaftaranTutup,
      })
      .from(jalurMasuk)
      .where(eq(jalurMasuk.sumberId, sumberId))
      .orderBy(asc(jalurMasuk.tahunAkademik), asc(jalurMasuk.nama)),
    db
      .select({
        id: biaya.id,
        ...kolomStatus(biaya),
        tahunAkademik: biaya.tahunAkademik,
        jenis: biaya.jenis,
        label: biaya.label,
        jumlah: biaya.jumlah,
        batas: biaya.batas,
        periode: biaya.periode,
        prodiNama: prodi.nama,
        prodiJenjang: prodi.jenjang,
        prodiSlug: prodi.slug,
        jalurNama: jalurMasuk.nama,
      })
      .from(biaya)
      .leftJoin(prodi, eq(biaya.prodiId, prodi.id))
      .leftJoin(jalurMasuk, eq(biaya.jalurMasukId, jalurMasuk.id))
      .where(eq(biaya.sumberId, sumberId))
      .orderBy(asc(biaya.tahunAkademik), asc(prodi.nama), asc(biaya.jenis), asc(biaya.jumlah)),
    db
      .select({
        id: beasiswa.id,
        ...kolomStatus(beasiswa),
        tahunAkademik: beasiswa.tahunAkademik,
        nama: beasiswa.nama,
        penyelenggara: beasiswa.penyelenggara,
        sasaran: beasiswa.sasaran,
        cakupan: beasiswa.cakupan,
        url: beasiswa.url,
      })
      .from(beasiswa)
      .where(eq(beasiswa.sumberId, sumberId))
      .orderBy(asc(beasiswa.tahunAkademik), asc(beasiswa.nama)),
    db
      .select({ id: beasiswaKampus.id, ...kolomStatus(beasiswaKampus), tahunAkademik: beasiswaKampus.tahunAkademik, nama: beasiswa.nama })
      .from(beasiswaKampus)
      .innerJoin(beasiswa, eq(beasiswaKampus.beasiswaId, beasiswa.id))
      .where(eq(beasiswaKampus.sumberId, sumberId))
      .orderBy(asc(beasiswaKampus.tahunAkademik), asc(beasiswa.nama)),
  ]);
  return { ...s, jalur, biaya: daftarBiaya, beasiswa: daftarBeasiswa, ikutNasional: ikut };
}

export type SumberLengkap = NonNullable<Awaited<ReturnType<typeof getSumber>>>;

async function kunciSumber(tx: Parameters<Parameters<Db["transaction"]>[0]>[0], sumberId: number) {
  const [s] = await tx
    .select({ id: sumber.id, arsipUrl: sumber.arsipUrl, dimasukkanOleh: sumber.dimasukkanOleh, kampusId: sumber.kampusId })
    .from(sumber)
    .where(eq(sumber.id, sumberId))
    .for("update");
  if (!s) throw new PemeriksaanDitolak("Sumber ini tidak ada lagi.");
  if ((await hitungStatusFakta(tx, sumberId)).draf === 0)
    throw new PemeriksaanDitolak("Sumber ini tidak punya fakta Draf lagi.");
  return s;
}

// Marks every Draf fact of the Sumber Diperiksa. A Sumber without a Wayback
// copy needs the checker's reason for accepting it anyway.
export async function tandaiDiperiksa(
  db: Db,
  { sumberId, moderatorId, alasanTanpaArsip }: { sumberId: number; moderatorId: string; alasanTanpaArsip?: string },
) {
  return db.transaction(async (tx) => {
    const s = await kunciSumber(tx, sumberId);
    if (s.dimasukkanOleh === moderatorId)
      throw new PemeriksaanDitolak("Fakta harus diperiksa Moderator lain, bukan yang memasukkannya.");
    let alasan: string | null = null;
    if (!s.arsipUrl) {
      alasan = (alasanTanpaArsip ?? "").trim().slice(0, ALASAN_MAKS);
      if (!alasan) throw new PemeriksaanDitolak("Sumber ini tanpa arsip: tulis alasan menerimanya.");
      await tx.update(sumber).set({ alasanTanpaArsip: alasan }).where(eq(sumber.id, sumberId));
    }
    // A Jalur Masuk or national Beasiswa may have been withdrawn since the import.
    const { rows: menunjukDitarik } = await tx.execute(sql`
      SELECT 1 FROM biaya b JOIN jalur_masuk j ON j.id = b.jalur_masuk_id
        WHERE b.sumber_id = ${sumberId} AND b.status = 'draf' AND j.status = 'ditarik'
      UNION ALL
      SELECT 1 FROM beasiswa_kampus bk JOIN beasiswa bs ON bs.id = bk.beasiswa_id
        WHERE bk.sumber_id = ${sumberId} AND bk.status = 'draf' AND bs.status = 'ditarik'
      LIMIT 1`);
    if (menunjukDitarik.length)
      throw new PemeriksaanDitolak("Ada fakta yang menunjuk ke Jalur Masuk atau Beasiswa yang sudah ditarik. Kembalikan Sumber ini.");
    const nilai = { status: "diperiksa" as const, diperiksaOleh: moderatorId, diperiksaAt: sql`now()` };
    await tx.update(jalurMasuk).set(nilai).where(drafSumber(jalurMasuk, sumberId));
    await tx.update(biaya).set(nilai).where(drafSumber(biaya, sumberId));
    await tx.update(beasiswa).set(nilai).where(drafSumber(beasiswa, sumberId));
    await tx.update(beasiswaKampus).set(nilai).where(drafSumber(beasiswaKampus, sumberId));
    return { kampusId: s.kampusId };
  });
}

// Sends the Draf facts back: they are deleted (Draf facts were never shown),
// and the note tells the entering Moderator what to fix before re-importing.
export async function kembalikanSumber(db: Db, { sumberId, catatan }: { sumberId: number; catatan: string }) {
  const c = catatan.trim().slice(0, ALASAN_MAKS);
  if (!c) throw new PemeriksaanDitolak("Tulis apa yang perlu diperbaiki.");
  return db.transaction(async (tx) => {
    await kunciSumber(tx, sumberId);
    try {
      await hapusDraf(tx, sumberId);
    } catch (e) {
      if (e instanceof FaktaDitolak) throw new PemeriksaanDitolak(e.message);
      throw e;
    }
    await tx.update(sumber).set({ catatanPemeriksa: c }).where(eq(sumber.id, sumberId));
  });
}

// Sumber with shown (Diperiksa) facts, newest first, optionally filtered by
// Kampus name, kode or title: where a Moderator finds a fact to withdraw.
export async function listSumberDiperiksa(db: Db, cari = "", batas = 50) {
  // Escape LIKE wildcards so "%" or "_" in the search are matched literally.
  const pola = `%${cari.trim().replace(/[\\%_]/g, (c) => "\\" + c)}%`;
  const { rows } = await db.execute<{
    id: number;
    kode: string;
    judul: string;
    kampus_nama: string | null;
    updated_at: string;
    diperiksa: number;
    ditarik: number;
  }>(sql`
    SELECT * FROM (
      SELECT s.id, s.kode, s.judul, k.nama AS kampus_nama, s.updated_at,
        ((SELECT count(*) FROM jalur_masuk WHERE sumber_id = s.id AND status = 'diperiksa')
         + (SELECT count(*) FROM biaya WHERE sumber_id = s.id AND status = 'diperiksa')
         + (SELECT count(*) FROM beasiswa WHERE sumber_id = s.id AND status = 'diperiksa')
         + (SELECT count(*) FROM beasiswa_kampus WHERE sumber_id = s.id AND status = 'diperiksa'))::int AS diperiksa,
        ((SELECT count(*) FROM jalur_masuk WHERE sumber_id = s.id AND status = 'ditarik')
         + (SELECT count(*) FROM biaya WHERE sumber_id = s.id AND status = 'ditarik')
         + (SELECT count(*) FROM beasiswa WHERE sumber_id = s.id AND status = 'ditarik')
         + (SELECT count(*) FROM beasiswa_kampus WHERE sumber_id = s.id AND status = 'ditarik'))::int AS ditarik
      FROM sumber s
      LEFT JOIN kampus k ON k.id = s.kampus_id
      WHERE k.nama ILIKE ${pola} OR s.kode ILIKE ${pola} OR s.judul ILIKE ${pola}
    ) x
    WHERE diperiksa > 0
    ORDER BY updated_at DESC
    LIMIT ${batas}`);
  return rows.map((r) => ({ ...r, diperiksa: Number(r.diperiksa), ditarik: Number(r.ditarik) }));
}

export type PilihanTarik = { jalur: number[]; biaya: number[]; beasiswa: number[]; beasiswaKampus: number[] };

// Withdraws shown facts of one Sumber: the chosen ones, or all of them. One
// Moderator is enough (taking a wrong fact down must be quick), with a reason;
// the rows stay as history. A withdrawn Jalur Masuk takes the Diperiksa Biaya
// attached to it (of any Sumber) down with it.
export async function tarikFakta(
  db: Db,
  {
    sumberId,
    moderatorId,
    alasan,
    pilihan,
  }: { sumberId: number; moderatorId: string; alasan: string; pilihan: PilihanTarik | "semua" },
) {
  const a = alasan.trim().slice(0, ALASAN_MAKS);
  if (!a) throw new PemeriksaanDitolak("Tulis alasan menarik fakta ini.");
  return db.transaction(async (tx) => {
    const tarik = { status: "ditarik" as const, ditarikOleh: moderatorId, ditarikAt: sql`now()`, alasanDitarik: a };
    const tabel = { jalur: jalurMasuk, biaya, beasiswa, beasiswaKampus } as const;
    const jumlah = { jalur: 0, biaya: 0, beasiswa: 0, beasiswaKampus: 0, biayaIkut: 0 };
    const jalurDitarik: number[] = [];

    for (const kunci of ["jalur", "biaya", "beasiswa", "beasiswaKampus"] as const) {
      const t = tabel[kunci];
      const ids = pilihan === "semua" ? null : [...new Set(pilihan[kunci])];
      if (ids && ids.length === 0) continue;
      const kena = await tx
        .update(t)
        .set(tarik)
        .where(and(eq(t.sumberId, sumberId), eq(t.status, "diperiksa"), ids ? inArray(t.id, ids) : undefined))
        .returning({ id: t.id });
      if (ids && kena.length !== ids.length)
        throw new PemeriksaanDitolak("Sebagian fakta yang dipilih sudah ditarik atau belum Diperiksa. Muat ulang halaman ini.");
      jumlah[kunci] = kena.length;
      if (kunci === "jalur") jalurDitarik.push(...kena.map((k) => k.id));
    }
    if (jalurDitarik.length) {
      const ikut = await tx
        .update(biaya)
        .set({ ...tarik, alasanDitarik: `Jalur Masuk ditarik: ${a}`.slice(0, ALASAN_MAKS) })
        .where(and(inArray(biaya.jalurMasukId, jalurDitarik), eq(biaya.status, "diperiksa")))
        .returning({ id: biaya.id });
      jumlah.biayaIkut = ikut.length;
    }
    const total = jumlah.jalur + jumlah.biaya + jumlah.beasiswa + jumlah.beasiswaKampus;
    if (total === 0) throw new PemeriksaanDitolak("Tidak ada fakta Diperiksa yang bisa ditarik.");
    return jumlah;
  });
}
