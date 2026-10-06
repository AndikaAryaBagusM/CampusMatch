// Read queries for the public catalogue pages. Every function takes the
// request's Db so a page can run all of its queries in one Promise.all on one
// pool. Lists filter by slug through joins, never by an id fetched first, so no
// query waits on another.
import { and, asc, countDistinct, count, desc, eq, isNotNull, isNull, sql, type AnyColumn } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { imporKatalog, jenjang as jenjangEnum, jurusan, kampus, kodeProdiJurusan, kota, prodi, ulasan, ulasanRevisi, verifikasiKampus } from "@/db/schema";
import { jurusanEfektif } from "@/lib/search";
import type { KolomAspek } from "@/lib/ulasan/skema";

export type Jenjang = (typeof jenjangEnum.enumValues)[number];
// Display order: S1 first, the level most visitors look for.
export const JENJANG_URUTAN: readonly Jenjang[] = ["S1", "D4", "D3"];

export function parseJenjang(value: unknown): Jenjang | null {
  return typeof value === "string" && (JENJANG_URUTAN as readonly string[]).includes(value) ? (value as Jenjang) : null;
}

export const jenjangOrder = sql`array_position(array['S1','D4','D3']::jenjang[], ${prodi.jenjang})`;

// Prodi LEFT JOIN its effective Jurusan; the Jurusan columns are NULL when unmapped.
const jurusanProdi = sql`${jurusan.id} = ${jurusanEfektif}`;

// Publicly shown Ulasan: a live revision and not deleted.
export const ulasanTerbit = and(isNotNull(ulasan.revisiTerbitId), isNull(ulasan.dihapusAt));

// --- Catalogue as-of date and Daftar Kampus Unggulan provenance ------------

export type InfoKatalog = {
  tanggalData: string;
  jumlahKampus: number;
  jumlahProdi: number;
  unggulanSumber: string | null;
  unggulanTanggalAmbil: string | null;
};

export async function getInfoKatalog(db: Db): Promise<InfoKatalog | null> {
  const [row] = await db
    .select({
      tanggalData: imporKatalog.tanggalData,
      jumlahKampus: imporKatalog.jumlahKampus,
      jumlahProdi: imporKatalog.jumlahProdi,
      unggulanSumber: imporKatalog.unggulanSumber,
      unggulanTanggalAmbil: imporKatalog.unggulanTanggalAmbil,
    })
    .from(imporKatalog)
    .orderBy(desc(imporKatalog.id))
    .limit(1);
  return row ?? null;
}

// --- Kampus ----------------------------------------------------------------

export async function getKampus(db: Db, slug: string) {
  const [row] = await db
    .select({
      id: kampus.id,
      npsn: kampus.npsn,
      nama: kampus.nama,
      slug: kampus.slug,
      bentuk: kampus.bentuk,
      akreditasi: kampus.akreditasi,
      unggulan: kampus.unggulan,
      kotaNama: kota.nama,
      kotaSlug: kota.slug,
      provinsi: kota.provinsi,
    })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(eq(kampus.slug, slug))
    .limit(1);
  return row;
}

export type KampusDetail = NonNullable<Awaited<ReturnType<typeof getKampus>>>;

// Number of Prodi per Jenjang, in display order; Jenjang without Prodi are left out.
export async function countProdiPerJenjang(db: Db, kampusSlug: string) {
  const rows = await db
    .select({ jenjang: prodi.jenjang, jumlah: count() })
    .from(prodi)
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(eq(kampus.slug, kampusSlug))
    .groupBy(prodi.jenjang);
  return JENJANG_URUTAN.flatMap((j) => rows.filter((r) => r.jenjang === j));
}

export async function listProdiKampus(
  db: Db,
  kampusSlug: string,
  { jenjang, limit, offset }: { jenjang: Jenjang | null; limit: number; offset: number },
) {
  return db
    .select({
      id: prodi.id,
      nama: prodi.nama,
      slug: prodi.slug,
      jenjang: prodi.jenjang,
      jurusanNama: jurusan.nama,
      jurusanSlug: jurusan.slug,
      jumlahUlasan: sql<number>`(SELECT count(*)::int FROM ${ulasan} WHERE ${ulasan.prodiId} = ${prodi.id} AND ${ulasanTerbit})`,
    })
    .from(prodi)
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .leftJoin(jurusan, jurusanProdi)
    .where(and(eq(kampus.slug, kampusSlug), jenjang ? eq(prodi.jenjang, jenjang) : undefined))
    .orderBy(jenjangOrder, asc(prodi.nama), asc(prodi.id))
    .limit(limit)
    .offset(offset);
}

export async function countUlasanKampus(db: Db, kampusSlug: string): Promise<number> {
  const [row] = await db
    .select({ jumlah: count() })
    .from(ulasan)
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(kampus.slug, kampusSlug), ulasanTerbit));
  return row?.jumlah ?? 0;
}

// --- Jurusan ---------------------------------------------------------------

export async function getJurusan(db: Db, slug: string) {
  const [row] = await db
    .select({ id: jurusan.id, nama: jurusan.nama, slug: jurusan.slug, deskripsi: jurusan.deskripsi })
    .from(jurusan)
    .where(eq(jurusan.slug, slug))
    .limit(1);
  return row;
}

// prodi -> kampus, kota, and its effective Jurusan (inner: only mapped Prodi).
export function joinJurusan<T extends PgSelect>(qb: T) {
  return qb
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .innerJoin(jurusan, jurusanProdi);
}

// Unfiltered totals for the header and the Jenjang filter counts.
export async function countJurusanPerJenjang(db: Db, jurusanSlug: string) {
  const rows = await joinJurusan(
    db
      .select({ jenjang: prodi.jenjang, jumlahProdi: count(), jumlahKampus: countDistinct(prodi.kampusId) })
      .from(prodi)
      .$dynamic(),
  )
    .where(eq(jurusan.slug, jurusanSlug))
    .groupBy(prodi.jenjang);
  return JENJANG_URUTAN.flatMap((j) => rows.filter((r) => r.jenjang === j));
}

// --- Prodi -----------------------------------------------------------------

export async function getProdi(db: Db, slug: string) {
  const [row] = await db
    .select({
      id: prodi.id,
      nama: prodi.nama,
      slug: prodi.slug,
      jenjang: prodi.jenjang,
      kodeProdi: prodi.kodeProdi,
      bidang: prodi.bidang,
      kampus: {
        id: kampus.id,
        npsn: kampus.npsn,
        nama: kampus.nama,
        slug: kampus.slug,
        bentuk: kampus.bentuk,
        akreditasi: kampus.akreditasi,
        unggulan: kampus.unggulan,
      },
      kotaNama: kota.nama,
      kotaSlug: kota.slug,
      provinsi: kota.provinsi,
      jurusanNama: jurusan.nama,
      jurusanSlug: jurusan.slug,
    })
    .from(prodi)
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .leftJoin(jurusan, jurusanProdi)
    .where(eq(prodi.slug, slug))
    .limit(1);
  return row;
}

export async function countUlasanProdi(db: Db, prodiSlug: string): Promise<number> {
  const [row] = await db
    .select({ jumlah: count() })
    .from(ulasan)
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .where(and(eq(prodi.slug, prodiSlug), ulasanTerbit));
  return row?.jumlah ?? 0;
}

// --- Beranda ---------------------------------------------------------------

export type BidangSorotan = {
  bidang: string;
  jumlahProdi: number;
  jurusan: { nama: string; slug: string; jumlahProdi: number }[];
};

// Per bidang (from the exports): its Prodi count and the five Jurusan with the
// most Prodi in it.
export async function getBidangSorotan(db: Db): Promise<BidangSorotan[]> {
  const [totals, top] = await Promise.all([
    db
      .select({ bidang: prodi.bidang, jumlahProdi: count() })
      .from(prodi)
      .where(isNotNull(prodi.bidang))
      .groupBy(prodi.bidang)
      .orderBy(desc(count()), asc(prodi.bidang)),
    db.execute<{ bidang: string; nama: string; slug: string; jumlah: number }>(sql`
      SELECT bidang, nama, slug, jumlah FROM (
        SELECT ${prodi.bidang} AS bidang, ${jurusan.nama} AS nama, ${jurusan.slug} AS slug, count(*)::int AS jumlah,
               row_number() OVER (PARTITION BY ${prodi.bidang} ORDER BY count(*) DESC, ${jurusan.nama}) AS urutan
        FROM ${prodi}
        LEFT JOIN ${kodeProdiJurusan} ON ${prodi.kodeProdi} = ${kodeProdiJurusan.kodeProdi}
        JOIN ${jurusan} ON ${jurusanProdi}
        WHERE ${prodi.bidang} IS NOT NULL
        GROUP BY ${prodi.bidang}, ${jurusan.id}
      ) t WHERE urutan <= 5 ORDER BY bidang, urutan`),
  ]);
  return totals.map((t) => ({
    bidang: t.bidang!,
    jumlahProdi: t.jumlahProdi,
    jurusan: top.rows.filter((r) => r.bidang === t.bidang).map((r) => ({ nama: r.nama, slug: r.slug, jumlahProdi: r.jumlah })),
  }));
}

export async function listKampusUnggulan(db: Db) {
  return db
    .select({ npsn: kampus.npsn, nama: kampus.nama, slug: kampus.slug, kotaNama: kota.nama })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(eq(kampus.unggulan, true))
    .orderBy(asc(kampus.nama));
}

// --- Ulasan (public) ---------------------------------------------------------
// Only Terbit, not-deleted Ulasan, shown anonymously: these queries never
// select the Pengulas, only Status Pengulas and tahun masuk.

export type RingkasanUlasan = {
  jumlah: number;
  bintang: number;
  aspek: Record<KolomAspek, number>;
  // Share of Ulasan whose Rekomendasi is yes, 0–1.
  tingkatRekomendasi: number;
};

const rata = (kolom: AnyColumn) => sql<number>`round(avg(${kolom})::numeric, 1)::float`;

function filterUlasan(target: { prodiSlug: string } | { kampusSlug: string }) {
  return and(ulasanTerbit, "prodiSlug" in target ? eq(prodi.slug, target.prodiSlug) : eq(kampus.slug, target.kampusSlug));
}

export async function getRingkasanUlasan(
  db: Db,
  target: { prodiSlug: string } | { kampusSlug: string },
): Promise<RingkasanUlasan | null> {
  const [row] = await db
    .select({
      jumlah: count(),
      bintang: rata(ulasanRevisi.bintang),
      aspekKurikulum: rata(ulasanRevisi.aspekKurikulum),
      aspekDosen: rata(ulasanRevisi.aspekDosen),
      aspekFasilitas: rata(ulasanRevisi.aspekFasilitas),
      aspekSuasanaBelajar: rata(ulasanRevisi.aspekSuasanaBelajar),
      aspekOrganisasi: rata(ulasanRevisi.aspekOrganisasi),
      aspekBiayaKualitas: rata(ulasanRevisi.aspekBiayaKualitas),
      tingkatRekomendasi: sql<number>`avg(CASE WHEN ${ulasanRevisi.rekomendasi} THEN 1 ELSE 0 END)::float`,
    })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(filterUlasan(target));
  if (!row || row.jumlah === 0) return null;
  const { jumlah, bintang, tingkatRekomendasi, ...aspek } = row;
  return { jumlah, bintang, tingkatRekomendasi, aspek };
}

export async function listUlasanTerbit(
  db: Db,
  target: { prodiSlug: string } | { kampusSlug: string },
  limit: number,
) {
  return db
    .select({
      id: ulasan.id,
      statusPengulas: ulasan.statusPengulas,
      tahunMasuk: ulasan.tahunMasuk,
      judul: ulasanRevisi.judul,
      isi: ulasanRevisi.isi,
      bintang: ulasanRevisi.bintang,
      rekomendasi: ulasanRevisi.rekomendasi,
      terbitAt: ulasanRevisi.createdAt,
      prodiNama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
      prodiSlug: prodi.slug,
      // Terverifikasi at this Prodi's Kampus (decisions.md 17o): only the date,
      // never who or which address.
      terverifikasiSejak: sql<Date | null>`(SELECT ${verifikasiKampus.verifiedAt} FROM ${verifikasiKampus} WHERE ${verifikasiKampus.userId} = ${ulasan.pengulasId} AND ${verifikasiKampus.kampusId} = ${prodi.kampusId})`.mapWith((v) => (v ? new Date(v) : null)),
    })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(filterUlasan(target))
    .orderBy(desc(ulasanRevisi.createdAt), desc(ulasan.id))
    .limit(limit);
}

export type UlasanPublik = Awaited<ReturnType<typeof listUlasanTerbit>>[number];
