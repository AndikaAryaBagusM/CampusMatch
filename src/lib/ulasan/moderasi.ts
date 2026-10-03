import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { kampus, laporan, prodi, riwayatModerasi, ulasan, ulasanRevisi, users } from "@/db/schema";
import type { TargetHalaman } from "./proses-screening";
import { transisi } from "./status";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Moderator decisions. Each runs in one transaction, goes through transisi(),
// and writes riwayat_moderasi. Callers must have passed requireModerator().

export class KeputusanTidakBerlaku extends Error {
  constructor(message = "Item ini sudah diputuskan atau tidak ada lagi.") {
    super(message);
    this.name = "KeputusanTidakBerlaku";
  }
}

export type HasilKeputusan = { target: TargetHalaman; liveBerubah: boolean };

const ALASAN_MAKS = 1000;
function alasanWajib(alasan: string) {
  const a = alasan.trim().slice(0, ALASAN_MAKS);
  if (!a) throw new KeputusanTidakBerlaku("Alasan wajib diisi.");
  return a;
}

const kolomTarget = { prodiSlug: prodi.slug, kampusSlug: kampus.slug };

// A Ditinjau revision, locked, with the pages it appears on.
async function kunciRevisi(tx: Tx, revisiId: string) {
  const [r] = await tx
    .select({ id: ulasanRevisi.id, ulasanId: ulasanRevisi.ulasanId, status: ulasanRevisi.status, percobaan: ulasanRevisi.percobaanScreening, ...kolomTarget })
    .from(ulasanRevisi)
    .innerJoin(ulasan, eq(ulasanRevisi.ulasanId, ulasan.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(ulasanRevisi.id, revisiId), isNull(ulasan.dihapusAt)))
    .for("update", { of: ulasanRevisi });
  if (!r || r.status !== "ditinjau") throw new KeputusanTidakBerlaku();
  return r;
}

// Setujui: the revision becomes the live one (it may replace an older live revision).
export async function setujuiRevisi(db: Db, { revisiId, moderatorId }: { revisiId: string; moderatorId: string }): Promise<HasilKeputusan> {
  return db.transaction(async (tx) => {
    const r = await kunciRevisi(tx, revisiId);
    const ke = transisi({ status: r.status, percobaan: r.percobaan }, { jenis: "setujui" });
    await tx
      .update(ulasanRevisi)
      .set({ status: ke.status, diputuskanOleh: moderatorId, diputuskanAt: sql`now()` })
      .where(eq(ulasanRevisi.id, r.id));
    await tx.update(ulasan).set({ revisiTerbitId: r.id }).where(eq(ulasan.id, r.ulasanId));
    await tx.insert(riwayatModerasi).values({ ulasanId: r.ulasanId, revisiId: r.id, aksi: "disetujui", oleh: moderatorId });
    return { target: { prodiSlug: r.prodiSlug, kampusSlug: r.kampusSlug }, liveBerubah: true };
  });
}

// Tolak: the revision is never shown; an older live revision stays live.
export async function tolakRevisi(
  db: Db,
  { revisiId, moderatorId, alasan }: { revisiId: string; moderatorId: string; alasan: string },
): Promise<HasilKeputusan> {
  const a = alasanWajib(alasan);
  return db.transaction(async (tx) => {
    const r = await kunciRevisi(tx, revisiId);
    const ke = transisi({ status: r.status, percobaan: r.percobaan }, { jenis: "tolak", alasan: a });
    await tx
      .update(ulasanRevisi)
      .set({ status: ke.status, alasanModerator: a, diputuskanOleh: moderatorId, diputuskanAt: sql`now()` })
      .where(eq(ulasanRevisi.id, r.id));
    await tx.insert(riwayatModerasi).values({ ulasanId: r.ulasanId, revisiId: r.id, aksi: "ditolak", oleh: moderatorId, alasan: a });
    return { target: { prodiSlug: r.prodiSlug, kampusSlug: r.kampusSlug }, liveBerubah: false };
  });
}

// An open Laporan, locked, with its Ulasan's current live revision.
async function kunciLaporan(tx: Tx, laporanId: string) {
  const [l] = await tx
    .select({
      id: laporan.id,
      ulasanId: laporan.ulasanId,
      status: laporan.status,
      revisiTerbitId: ulasan.revisiTerbitId,
      ...kolomTarget,
    })
    .from(laporan)
    .innerJoin(ulasan, eq(laporan.ulasanId, ulasan.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(eq(laporan.id, laporanId))
    .for("update", { of: laporan });
  if (!l || l.status !== "baru") throw new KeputusanTidakBerlaku();
  return l;
}

async function tutupSemuaLaporan(tx: Tx, ulasanId: string, moderatorId: string) {
  await tx
    .update(laporan)
    .set({ status: "ditangani", ditanganiOleh: moderatorId, ditanganiAt: sql`now()` })
    .where(and(eq(laporan.ulasanId, ulasanId), eq(laporan.status, "baru")));
}

// Turunkan: unpublish the reported Ulasan. Its live revision (which may be
// newer than the reported one) becomes Ditolak, and every open Laporan on it
// is closed.
export async function turunkanUlasan(
  db: Db,
  { laporanId, moderatorId, alasan }: { laporanId: string; moderatorId: string; alasan: string },
): Promise<HasilKeputusan> {
  const a = alasanWajib(alasan);
  return db.transaction(async (tx) => {
    const l = await kunciLaporan(tx, laporanId);
    const target = { prodiSlug: l.prodiSlug, kampusSlug: l.kampusSlug };
    if (l.revisiTerbitId) {
      const [r] = await tx
        .select({ status: ulasanRevisi.status, percobaan: ulasanRevisi.percobaanScreening })
        .from(ulasanRevisi)
        .where(eq(ulasanRevisi.id, l.revisiTerbitId))
        .for("update");
      const ke = transisi(r, { jenis: "turunkan", alasan: a });
      await tx
        .update(ulasanRevisi)
        .set({ status: ke.status, alasanModerator: a, diputuskanOleh: moderatorId, diputuskanAt: sql`now()` })
        .where(eq(ulasanRevisi.id, l.revisiTerbitId));
      await tx.update(ulasan).set({ revisiTerbitId: null }).where(eq(ulasan.id, l.ulasanId));
    }
    await tutupSemuaLaporan(tx, l.ulasanId, moderatorId);
    await tx.insert(riwayatModerasi).values({
      ulasanId: l.ulasanId,
      revisiId: l.revisiTerbitId,
      laporanId: l.id,
      aksi: "diturunkan",
      oleh: moderatorId,
      alasan: a,
    });
    return { target, liveBerubah: l.revisiTerbitId !== null };
  });
}

// Tutup laporan: the Ulasan is fine and stays up.
export async function tutupLaporan(
  db: Db,
  { laporanId, moderatorId, alasan }: { laporanId: string; moderatorId: string; alasan?: string },
): Promise<HasilKeputusan> {
  return db.transaction(async (tx) => {
    const l = await kunciLaporan(tx, laporanId);
    await tx
      .update(laporan)
      .set({ status: "ditangani", ditanganiOleh: moderatorId, ditanganiAt: sql`now()` })
      .where(eq(laporan.id, l.id));
    await tx.insert(riwayatModerasi).values({
      ulasanId: l.ulasanId,
      laporanId: l.id,
      aksi: "laporan_ditutup",
      oleh: moderatorId,
      alasan: alasan?.trim().slice(0, ALASAN_MAKS) || null,
    });
    return { target: { prodiSlug: l.prodiSlug, kampusSlug: l.kampusSlug }, liveBerubah: false };
  });
}

// --- Reads for /moderasi ------------------------------------------------------

const namaProdi = sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`;

// Ditinjau revisions: melanggar first, then perlu dicek, then failed Screening;
// oldest first within each.
export async function listAntrean(db: Db) {
  return db
    .select({
      revisiId: ulasanRevisi.id,
      ulasanId: ulasanRevisi.ulasanId,
      nomor: ulasanRevisi.nomor,
      judul: ulasanRevisi.judul,
      isi: ulasanRevisi.isi,
      bintang: ulasanRevisi.bintang,
      rekomendasi: ulasanRevisi.rekomendasi,
      tingkatRisiko: ulasanRevisi.tingkatRisiko,
      alasanScreening: ulasanRevisi.alasanScreening,
      modelScreening: ulasanRevisi.modelScreening,
      discreeningAt: ulasanRevisi.discreeningAt,
      percobaan: ulasanRevisi.percobaanScreening,
      createdAt: ulasanRevisi.createdAt,
      adaVersiTerbit: sql<boolean>`${ulasan.revisiTerbitId} IS NOT NULL`,
      prodiNama: namaProdi,
      prodiSlug: prodi.slug,
      kampusNama: kampus.nama,
    })
    .from(ulasanRevisi)
    .innerJoin(ulasan, eq(ulasanRevisi.ulasanId, ulasan.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(ulasanRevisi.status, "ditinjau"), isNull(ulasan.dihapusAt)))
    .orderBy(
      sql`CASE ${ulasanRevisi.tingkatRisiko} WHEN 'melanggar' THEN 0 WHEN 'perlu_dicek' THEN 1 ELSE 2 END`,
      asc(ulasanRevisi.createdAt),
    )
    .limit(100);
}

const revisiTerbit = alias(ulasanRevisi, "revisi_terbit");

// Open Laporan, oldest first, with the text currently shown.
export async function listLaporanTerbuka(db: Db) {
  return db
    .select({
      laporanId: laporan.id,
      ulasanId: laporan.ulasanId,
      alasan: laporan.alasan,
      catatan: laporan.catatan,
      createdAt: laporan.createdAt,
      judul: revisiTerbit.judul,
      isi: revisiTerbit.isi,
      bintang: revisiTerbit.bintang,
      masihTerbit: sql<boolean>`${ulasan.revisiTerbitId} IS NOT NULL AND ${ulasan.dihapusAt} IS NULL`,
      prodiNama: namaProdi,
      prodiSlug: prodi.slug,
      kampusNama: kampus.nama,
    })
    .from(laporan)
    .innerJoin(ulasan, eq(laporan.ulasanId, ulasan.id))
    .leftJoin(revisiTerbit, eq(ulasan.revisiTerbitId, revisiTerbit.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(eq(laporan.status, "baru"))
    .orderBy(asc(laporan.createdAt))
    .limit(100);
}

// Menunggu revisions, for spotting Screening that keeps failing. Read-only.
export async function listMenunggu(db: Db) {
  return db
    .select({
      revisiId: ulasanRevisi.id,
      ulasanId: ulasanRevisi.ulasanId,
      judul: ulasanRevisi.judul,
      percobaan: ulasanRevisi.percobaanScreening,
      createdAt: ulasanRevisi.createdAt,
      prodiNama: namaProdi,
      kampusNama: kampus.nama,
    })
    .from(ulasanRevisi)
    .innerJoin(ulasan, eq(ulasanRevisi.ulasanId, ulasan.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(ulasanRevisi.status, "menunggu"), isNull(ulasan.dihapusAt)))
    .orderBy(asc(ulasanRevisi.createdAt))
    .limit(100);
}

export async function hitungAntrean(db: Db) {
  const { rows } = await db.execute<{ ditinjau: number; laporan: number; menunggu: number }>(sql`
    SELECT
      (SELECT count(*)::int FROM ${ulasanRevisi} r JOIN ${ulasan} u ON u.id = r.ulasan_id
        WHERE r.status = 'ditinjau' AND u.dihapus_at IS NULL) AS ditinjau,
      (SELECT count(*)::int FROM ${laporan} WHERE status = 'baru') AS laporan,
      (SELECT count(*)::int FROM ${ulasanRevisi} r JOIN ${ulasan} u ON u.id = r.ulasan_id
        WHERE r.status = 'menunggu' AND u.dihapus_at IS NULL) AS menunggu`);
  return rows[0];
}

// Everything that happened to one Ulasan, for /moderasi/ulasan/[id].
export async function getRiwayatUlasan(db: Db, ulasanId: string) {
  const moderator = alias(users, "moderator");
  const [[u], revisi, daftarLaporan, riwayat] = await Promise.all([
    db
      .select({
        id: ulasan.id,
        statusPengulas: ulasan.statusPengulas,
        tahunMasuk: ulasan.tahunMasuk,
        revisiTerbitId: ulasan.revisiTerbitId,
        dihapusAt: ulasan.dihapusAt,
        createdAt: ulasan.createdAt,
        prodiNama: namaProdi,
        prodiSlug: prodi.slug,
        kampusNama: kampus.nama,
      })
      .from(ulasan)
      .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
      .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
      .where(eq(ulasan.id, ulasanId)),
    db.select().from(ulasanRevisi).where(eq(ulasanRevisi.ulasanId, ulasanId)).orderBy(desc(ulasanRevisi.nomor)),
    db.select().from(laporan).where(eq(laporan.ulasanId, ulasanId)).orderBy(desc(laporan.createdAt)),
    db
      .select({
        id: riwayatModerasi.id,
        aksi: riwayatModerasi.aksi,
        alasan: riwayatModerasi.alasan,
        revisiId: riwayatModerasi.revisiId,
        createdAt: riwayatModerasi.createdAt,
        olehEmail: moderator.email,
      })
      .from(riwayatModerasi)
      .leftJoin(moderator, eq(riwayatModerasi.oleh, moderator.id))
      .where(eq(riwayatModerasi.ulasanId, ulasanId))
      .orderBy(desc(riwayatModerasi.createdAt)),
  ]);
  return u ? { ulasan: u, revisi, laporan: daftarLaporan, riwayat } : null;
}
