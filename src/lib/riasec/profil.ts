import { and, asc, count, desc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { jurusan, kodeProdiJurusan, kodeRiasec, prodi, profilMinat } from "@/db/schema";
import type { Tipe } from "./item";
import { kecocokan, type ProfilRiasec } from "./skor";

// --- Rekomendasi Jurusan ------------------------------------------------------

export type JurusanRekomendasi = {
  nama: string;
  slug: string;
  kode: Tipe[];
  jumlahProdi: number;
  kecocokan: number;
};

// Jurusan ranked by how well their Kode RIASEC match a profile (decisions.md
// 17f): Jurusan only, never a Prodi or Kampus. Jurusan without a Kode RIASEC
// or without any Prodi are left out. Many Jurusan share a Kode RIASEC, so
// equal matches come in order of how many Prodi offer them, then by name.
export async function listRekomendasiJurusan(db: Db, profil: ProfilRiasec, batas = 10): Promise<JurusanRekomendasi[]> {
  const [kode, jumlah] = await Promise.all([
    db
      .select({ id: jurusan.id, nama: jurusan.nama, slug: jurusan.slug, tipe: kodeRiasec.tipe })
      .from(kodeRiasec)
      .innerJoin(jurusan, eq(kodeRiasec.jurusanId, jurusan.id))
      .orderBy(asc(jurusan.id), asc(kodeRiasec.urutan)),
    // Prodi per Jurusan through the Kode Prodi mapping; a per-Prodi override
    // moves a Prodi elsewhere, which this count ignores (it is shown, and orders ties).
    db
      .select({ jurusanId: kodeProdiJurusan.jurusanId, n: count() })
      .from(prodi)
      .innerJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
      .groupBy(kodeProdiJurusan.jurusanId),
  ]);
  const jumlahPerJurusan = new Map(jumlah.map((j) => [j.jurusanId, Number(j.n)]));
  const perJurusan = new Map<number, { nama: string; slug: string; kode: Tipe[] }>();
  for (const r of kode) {
    const j = perJurusan.get(r.id) ?? { nama: r.nama, slug: r.slug, kode: [] };
    j.kode.push(r.tipe);
    perJurusan.set(r.id, j);
  }
  return [...perJurusan]
    .filter(([id, j]) => j.kode.length >= 2 && (jumlahPerJurusan.get(id) ?? 0) > 0)
    .map(([id, j]) => ({ ...j, jumlahProdi: jumlahPerJurusan.get(id)!, kecocokan: kecocokan(profil, j.kode) }))
    .sort((a, b) => b.kecocokan - a.kecocokan || b.jumlahProdi - a.jumlahProdi || a.nama.localeCompare(b.nama, "id"))
    .slice(0, batas);
}

// --- Profil Minat -------------------------------------------------------------

const kolomProfil = {
  id: profilMinat.id,
  createdAt: profilMinat.createdAt,
  R: profilMinat.skorR,
  I: profilMinat.skorI,
  A: profilMinat.skorA,
  S: profilMinat.skorS,
  E: profilMinat.skorE,
  C: profilMinat.skorC,
};

export async function simpanProfilMinat(db: Db, userId: string, p: ProfilRiasec) {
  const [baru] = await db
    .insert(profilMinat)
    .values({ userId, skorR: p.R, skorI: p.I, skorA: p.A, skorS: p.S, skorE: p.E, skorC: p.C })
    .returning({ id: profilMinat.id });
  return baru.id;
}

// Newest first: the first is the latest Profil Minat, the rest its history.
export async function listProfilMinat(db: Db, userId: string) {
  const rows = await db.select(kolomProfil).from(profilMinat).where(eq(profilMinat.userId, userId)).orderBy(desc(profilMinat.createdAt));
  return rows.map(({ id, createdAt, ...profil }) => ({ id, createdAt, profil: profil as ProfilRiasec }));
}

// Only the owner can delete; someone else's id simply matches nothing.
export async function hapusProfilMinat(db: Db, userId: string, id: string) {
  const hapus = await db
    .delete(profilMinat)
    .where(and(eq(profilMinat.id, id), eq(profilMinat.userId, userId)))
    .returning({ id: profilMinat.id });
  return hapus.length > 0;
}
