import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, prodi, ulasan, ulasanRevisi } from "@/db/schema";

// Reads for a signed-in Pengulas: the Prodi they're writing about and their own
// Ulasan. Public reads live in src/lib/katalog.ts.

export async function getProdiTujuan(db: Db, slug: string) {
  const [row] = await db
    .select({
      id: prodi.id,
      slug: prodi.slug,
      nama: prodi.nama,
      jenjang: prodi.jenjang,
      kampusNama: kampus.nama,
      kampusSlug: kampus.slug,
    })
    .from(prodi)
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(eq(prodi.slug, slug))
    .limit(1);
  return row;
}

export type ProdiTujuan = NonNullable<Awaited<ReturnType<typeof getProdiTujuan>>>;

// The newest revision of the Ulasan in the outer query.
const revisiTerakhir = sql`(
  SELECT r.id, r.nomor, r.status, r.judul, r.isi, r.bintang, r.aspek_kurikulum, r.aspek_dosen, r.aspek_fasilitas,
         r.aspek_suasana_belajar, r.aspek_organisasi, r.aspek_biaya_kualitas, r.rekomendasi, r.alasan_moderator,
         r.created_at
  FROM ${ulasanRevisi} r WHERE r.ulasan_id = ${ulasan.id} ORDER BY r.nomor DESC LIMIT 1
)`;

export type RevisiSaya = {
  id: string;
  nomor: number;
  status: "menunggu" | "terbit" | "ditinjau" | "ditolak";
  judul: string;
  isi: string;
  bintang: number;
  aspek_kurikulum: number;
  aspek_dosen: number;
  aspek_fasilitas: number;
  aspek_suasana_belajar: number;
  aspek_organisasi: number;
  aspek_biaya_kualitas: number;
  rekomendasi: boolean;
  alasan_moderator: string | null;
  created_at: string;
};

const kolomUlasanSaya = {
  id: ulasan.id,
  statusPengulas: ulasan.statusPengulas,
  tahunMasuk: ulasan.tahunMasuk,
  terbit: sql<boolean>`${ulasan.revisiTerbitId} IS NOT NULL`,
  revisi: sql<RevisiSaya>`(SELECT row_to_json(t) FROM ${revisiTerakhir} t)`,
};

// The Pengulas's active Ulasan for one Prodi, with its newest revision.
export async function getUlasanSaya(db: Db, pengulasId: string, prodiId: number) {
  const [row] = await db
    .select(kolomUlasanSaya)
    .from(ulasan)
    .where(and(eq(ulasan.pengulasId, pengulasId), eq(ulasan.prodiId, prodiId), isNull(ulasan.dihapusAt)))
    .limit(1);
  return row;
}

export type UlasanSaya = NonNullable<Awaited<ReturnType<typeof getUlasanSaya>>>;

// All of the Pengulas's active Ulasan, newest first, for /akun.
export async function listUlasanSaya(db: Db, pengulasId: string) {
  return db
    .select({
      ...kolomUlasanSaya,
      prodiNama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
      prodiSlug: prodi.slug,
      kampusNama: kampus.nama,
    })
    .from(ulasan)
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(ulasan.pengulasId, pengulasId), isNull(ulasan.dihapusAt)))
    .orderBy(desc(ulasan.updatedAt));
}

// The pages to revalidate for a Prodi.
export async function targetHalamanProdi(db: Db, prodiId: number) {
  const [row] = await db
    .select({ prodiSlug: prodi.slug, kampusSlug: kampus.slug })
    .from(prodi)
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(eq(prodi.id, prodiId))
    .limit(1);
  return row;
}
