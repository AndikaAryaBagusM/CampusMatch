// Kota browsing (decisions.md 17l): every Kota by Provinsi, and the Kampus of
// one Kota in name order. Unggulan and Bintang never change that order
// (ADR 0003, ADR 0007).
import { and, asc, count, countDistinct, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { bentukKampus, kampus, kota, prodi, ulasan, ulasanRevisi } from "@/db/schema";
import { formatProvinsi } from "@/lib/format";
import { ulasanTerbit } from "@/lib/katalog";

export type Bentuk = (typeof bentukKampus.enumValues)[number];

export function parseBentuk(value: unknown): Bentuk | null {
  return (bentukKampus.enumValues as readonly unknown[]).includes(value) ? (value as Bentuk) : null;
}

// Each Provinsi has its own "Lainnya" Kota (decisions.md 4c), so it never
// stands alone: "Lainnya (D.K.I. Jakarta)".
export function namaKota({ nama, provinsi }: { nama: string; provinsi: string }): string {
  return nama === "Lainnya" ? `Lainnya (${formatProvinsi(provinsi)})` : nama;
}

// "Prov. D.K.I. Jakarta" -> "dki-jakarta", for in-page anchors.
export function slugProvinsi(provinsi: string): string {
  return formatProvinsi(provinsi)
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const lainnyaTerakhir = (a: { nama: string }, b: { nama: string }) =>
  Number(a.nama === "Lainnya") - Number(b.nama === "Lainnya") || a.nama.localeCompare(b.nama, "id");

export type KotaRingkas = { nama: string; provinsi: string; slug: string; jumlahKampus: number };

// Every Kota that has a Kampus, grouped by Provinsi (alphabetical), Lainnya last.
export async function listKotaPerProvinsi(db: Db) {
  const rows: KotaRingkas[] = await db
    .select({ nama: kota.nama, provinsi: kota.provinsi, slug: kota.slug, jumlahKampus: count() })
    .from(kota)
    .innerJoin(kampus, eq(kampus.kotaId, kota.id))
    .groupBy(kota.id);
  const perProvinsi = new Map<string, KotaRingkas[]>();
  for (const r of rows) perProvinsi.set(r.provinsi, [...(perProvinsi.get(r.provinsi) ?? []), r]);
  return [...perProvinsi]
    .map(([provinsi, daftar]) => ({
      provinsi,
      slug: slugProvinsi(provinsi),
      jumlahKampus: daftar.reduce((s, k) => s + k.jumlahKampus, 0),
      kota: daftar.sort(lainnyaTerakhir),
    }))
    .sort((a, b) => formatProvinsi(a.provinsi).localeCompare(formatProvinsi(b.provinsi), "id"));
}

export async function getKota(db: Db, slug: string) {
  const [row] = await db
    .select({
      nama: kota.nama,
      provinsi: kota.provinsi,
      slug: kota.slug,
      jumlahKampus: countDistinct(kampus.id),
      jumlahProdi: countDistinct(prodi.id),
    })
    .from(kota)
    .leftJoin(kampus, eq(kampus.kotaId, kota.id))
    .leftJoin(prodi, eq(prodi.kampusId, kampus.id))
    .where(eq(kota.slug, slug))
    .groupBy(kota.id);
  return row;
}

// The other Kota of the same Provinsi, for links at the foot of a Kota page.
export async function listKotaSeprovinsi(db: Db, provinsi: string, kecuali: string): Promise<KotaRingkas[]> {
  const rows = await db
    .select({ nama: kota.nama, provinsi: kota.provinsi, slug: kota.slug, jumlahKampus: count() })
    .from(kota)
    .innerJoin(kampus, eq(kampus.kotaId, kota.id))
    .where(and(eq(kota.provinsi, provinsi), sql`${kota.slug} <> ${kecuali}`))
    .groupBy(kota.id);
  return rows.sort(lainnyaTerakhir);
}

export type FilterKampusKota = { unggulanOnly: boolean; bentuk: Bentuk | null };

function syarat(kotaSlug: string, { unggulanOnly, bentuk }: FilterKampusKota) {
  return and(
    eq(kota.slug, kotaSlug),
    unggulanOnly ? eq(kampus.unggulan, true) : undefined,
    bentuk ? eq(kampus.bentuk, bentuk) : undefined,
  );
}

export async function listKampusKota(db: Db, kotaSlug: string, filter: FilterKampusKota & { limit: number; offset: number }) {
  // A Kampus's scores aggregate the Terbit Ulasan of all its Prodi (ADR 0001).
  const bintang = db
    .select({
      kampusId: sql<number>`${prodi.kampusId}`.as("bintang_kampus_id"),
      jumlah: sql<number>`count(*)::int`.as("bintang_jumlah"),
      rata: sql<number>`round(avg(${ulasanRevisi.bintang})::numeric, 1)::float8`.as("bintang_rata"),
    })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .where(ulasanTerbit)
    .groupBy(prodi.kampusId)
    .as("bintang_kampus");
  return db
    .select({
      npsn: kampus.npsn,
      nama: kampus.nama,
      slug: kampus.slug,
      bentuk: kampus.bentuk,
      akreditasi: kampus.akreditasi,
      unggulan: kampus.unggulan,
      jumlahProdi: sql<number>`(SELECT count(*)::int FROM ${prodi} WHERE ${prodi.kampusId} = ${kampus.id})`,
      bintang: bintang.rata,
      jumlahUlasan: sql<number>`coalesce(${bintang.jumlah}, 0)`,
    })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .leftJoin(bintang, eq(bintang.kampusId, kampus.id))
    .where(syarat(kotaSlug, filter))
    .orderBy(asc(kampus.nama), asc(kampus.id))
    .limit(filter.limit)
    .offset(filter.offset);
}

export type KampusKota = Awaited<ReturnType<typeof listKampusKota>>[number];

export async function countKampusKota(db: Db, kotaSlug: string, filter: FilterKampusKota): Promise<number> {
  const [row] = await db
    .select({ jumlah: count() })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(syarat(kotaSlug, filter));
  return row?.jumlah ?? 0;
}

// Kampus per Bentuk in this Kota, in the enum's order, for the filter chips.
export async function countBentukKota(db: Db, kotaSlug: string) {
  const rows = await db
    .select({ bentuk: kampus.bentuk, jumlah: count() })
    .from(kampus)
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(eq(kota.slug, kotaSlug))
    .groupBy(kampus.bentuk);
  return bentukKampus.enumValues.flatMap((b) => rows.filter((r) => r.bentuk === b));
}
