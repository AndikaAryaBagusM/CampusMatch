// The Prodi list of a Jurusan (decisions.md 17f, 17k): one row per Prodi at
// every Kampus, sorted by Kampus name unless the visitor picks UKT or Bintang,
// with filters for Jenjang, Unggulan, Kota and maximum UKT. It only lays the
// facts out; nothing here ranks a Prodi as better.
import { and, asc, count, countDistinct, desc, eq, inArray, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import type { Db } from "@/db";
import { biaya, jurusan, kampus, kota, prodi, ulasan, ulasanRevisi } from "@/db/schema";
import { jenjangOrder, joinJurusan, ulasanTerbit, type Jenjang } from "@/lib/katalog";

// The Bintang sort only orders Prodi with at least this many Terbit Ulasan;
// an average of one or two Ulasan says too little.
export const MIN_ULASAN_URUT = 3;

// Maximum-UKT choices, in millions of rupiah per semester.
export const UKT_MAKS_JUTA = [2, 5, 10, 15] as const;

export const URUT = ["nama", "ukt", "bintang"] as const;
export type Urut = (typeof URUT)[number];

export function parseUrut(value: unknown): Urut {
  return (URUT as readonly unknown[]).includes(value) ? (value as Urut) : "nama";
}

// "?ukt=5" -> 5 (million), only one of the offered choices.
export function parseUktMaksJuta(value: unknown): number | null {
  const n = Number(value);
  return (UKT_MAKS_JUTA as readonly number[]).includes(n) ? n : null;
}

export type FilterProdiJurusan = {
  jenjang: Jenjang | null;
  unggulanOnly: boolean;
  kotaSlug: string | null;
  // Rupiah per semester; keeps only Prodi whose UKT is known and at most this.
  uktMaks: number | null;
};

export const TANPA_FILTER: FilterProdiJurusan = { jenjang: null, unggulanOnly: false, kotaSlug: null, uktMaks: null };

// The UKT of a Prodi for this list: the highest per-semester UKT or SPP of the
// newest Tahun Akademik (what a student without a reduction pays), from Diperiksa
// rows only. The Prodi's own rows first; without them, the Kampus-wide ones.
// Computed here only; a Kampus-wide value is never stored per Prodi (17a).
function subkueri(db: Db) {
  const uktDiperiksa = and(eq(biaya.status, "diperiksa"), inArray(biaya.jenis, ["ukt", "spp"]));
  const uktProdi = db
    .selectDistinctOn([biaya.prodiId], {
      prodiId: sql<number>`${biaya.prodiId}`.as("ukt_prodi_id"),
      tahun: sql<number>`${biaya.tahunAkademik}`.as("ukt_prodi_tahun"),
      jumlah: sql<number>`max(${biaya.jumlah})::float8`.as("ukt_prodi_jumlah"),
    })
    .from(biaya)
    .where(and(uktDiperiksa, isNotNull(biaya.prodiId)))
    .groupBy(biaya.prodiId, biaya.tahunAkademik)
    .orderBy(biaya.prodiId, desc(biaya.tahunAkademik))
    .as("ukt_prodi");
  const uktKampus = db
    .selectDistinctOn([biaya.kampusId], {
      kampusId: sql<number>`${biaya.kampusId}`.as("ukt_kampus_id"),
      tahun: sql<number>`${biaya.tahunAkademik}`.as("ukt_kampus_tahun"),
      jumlah: sql<number>`max(${biaya.jumlah})::float8`.as("ukt_kampus_jumlah"),
    })
    .from(biaya)
    .where(and(uktDiperiksa, isNull(biaya.prodiId)))
    .groupBy(biaya.kampusId, biaya.tahunAkademik)
    .orderBy(biaya.kampusId, desc(biaya.tahunAkademik))
    .as("ukt_kampus");
  const bintang = db
    .select({
      prodiId: sql<number>`${ulasan.prodiId}`.as("bintang_prodi_id"),
      jumlah: sql<number>`count(*)::int`.as("bintang_jumlah"),
      rata: sql<number>`round(avg(${ulasanRevisi.bintang})::numeric, 1)::float8`.as("bintang_rata"),
    })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .where(ulasanTerbit)
    .groupBy(ulasan.prodiId)
    .as("bintang_prodi");
  const ukt = sql<number | null>`coalesce(${uktProdi.jumlah}, ${uktKampus.jumlah})`;
  return { uktProdi, uktKampus, bintang, ukt };
}

function syarat(jurusanSlug: string, f: FilterProdiJurusan, ukt: SQL<number | null>) {
  return and(
    eq(jurusan.slug, jurusanSlug),
    f.jenjang ? eq(prodi.jenjang, f.jenjang) : undefined,
    f.unggulanOnly ? eq(kampus.unggulan, true) : undefined,
    f.kotaSlug ? eq(kota.slug, f.kotaSlug) : undefined,
    f.uktMaks !== null ? sql`${ukt} <= ${f.uktMaks}` : undefined,
  );
}

export async function listProdiJurusan(
  db: Db,
  jurusanSlug: string,
  filter: FilterProdiJurusan & { urut: Urut; limit: number; offset: number },
) {
  const { uktProdi, uktKampus, bintang, ukt } = subkueri(db);
  const bintangUrut = sql`CASE WHEN ${bintang.jumlah} >= ${MIN_ULASAN_URUT} THEN ${bintang.rata} END`;
  const abjad = [asc(kampus.nama), asc(kampus.id), asc(jenjangOrder), asc(prodi.nama), asc(prodi.id)];
  const urutan = {
    nama: abjad,
    ukt: [sql`${ukt} ASC NULLS LAST`, ...abjad],
    bintang: [sql`${bintangUrut} DESC NULLS LAST`, sql`${bintang.jumlah} DESC NULLS LAST`, ...abjad],
  }[filter.urut];

  return joinJurusan(
    db
      .select({
        nama: prodi.nama,
        slug: prodi.slug,
        jenjang: prodi.jenjang,
        kampus: {
          npsn: kampus.npsn,
          nama: kampus.nama,
          slug: kampus.slug,
          akreditasi: kampus.akreditasi,
          unggulan: kampus.unggulan,
        },
        kotaNama: kota.nama,
        kotaSlug: kota.slug,
        ukt,
        uktTahun: sql<number | null>`CASE WHEN ${uktProdi.jumlah} IS NOT NULL THEN ${uktProdi.tahun} ELSE ${uktKampus.tahun} END`,
        uktTingkat: sql<"prodi" | "kampus" | null>`CASE WHEN ${uktProdi.jumlah} IS NOT NULL THEN 'prodi' WHEN ${uktKampus.jumlah} IS NOT NULL THEN 'kampus' END`,
        bintang: bintang.rata,
        jumlahUlasan: sql<number>`coalesce(${bintang.jumlah}, 0)`,
      })
      .from(prodi)
      .$dynamic(),
  )
    .leftJoin(uktProdi, eq(uktProdi.prodiId, prodi.id))
    .leftJoin(uktKampus, eq(uktKampus.kampusId, kampus.id))
    .leftJoin(bintang, eq(bintang.prodiId, prodi.id))
    .where(syarat(jurusanSlug, filter, ukt))
    .orderBy(...urutan)
    .limit(filter.limit)
    .offset(filter.offset);
}

export type ProdiJurusan = Awaited<ReturnType<typeof listProdiJurusan>>[number];

export async function countProdiJurusan(db: Db, jurusanSlug: string, filter: FilterProdiJurusan) {
  const { uktProdi, uktKampus, ukt } = subkueri(db);
  const [row] = await joinJurusan(
    db.select({ jumlahProdi: count(), jumlahKampus: countDistinct(prodi.kampusId) }).from(prodi).$dynamic(),
  )
    .leftJoin(uktProdi, eq(uktProdi.prodiId, prodi.id))
    .leftJoin(uktKampus, eq(uktKampus.kampusId, kampus.id))
    .where(syarat(jurusanSlug, filter, ukt));
  return { jumlahProdi: row?.jumlahProdi ?? 0, jumlahKampus: row?.jumlahKampus ?? 0 };
}

// The Kota with this Jurusan's Prodi, for the Kota filter (unfiltered counts).
export async function countJurusanPerKota(db: Db, jurusanSlug: string) {
  return joinJurusan(db.select({ slug: kota.slug, nama: kota.nama, provinsi: kota.provinsi, jumlahProdi: count() }).from(prodi).$dynamic())
    .where(eq(jurusan.slug, jurusanSlug))
    .groupBy(kota.id)
    .orderBy(asc(kota.nama));
}
