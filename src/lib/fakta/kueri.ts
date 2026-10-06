import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { beasiswa, beasiswaKampus, biaya, jalurMasuk, sumber } from "@/db/schema";

// What the public pages show: Diperiksa facts only, each with its Sumber, and
// per section only the newest Tahun Akademik (older rows stay in the database
// as history, decisions.md 17e).

const kolomSumber = {
  id: sumber.id,
  judul: sumber.judul,
  penerbit: sumber.penerbit,
  url: sumber.url,
  arsipUrl: sumber.arsipUrl,
  diaksesPada: sumber.diaksesPada,
};
export type SumberRingkas = { id: number; judul: string; penerbit: string; url: string; arsipUrl: string | null; diaksesPada: string };

export type Bagian<T> = { tahunAkademik: number; daftar: T[] } | null;

// The rows of the newest Tahun Akademik.
export function bagianTerbaru<T extends { tahunAkademik: number }>(rows: T[]): Bagian<T> {
  if (rows.length === 0) return null;
  const tahunAkademik = Math.max(...rows.map((r) => r.tahunAkademik));
  return { tahunAkademik, daftar: rows.filter((r) => r.tahunAkademik === tahunAkademik) };
}

const kolomBiaya = {
  id: biaya.id,
  tahunAkademik: biaya.tahunAkademik,
  jenis: biaya.jenis,
  label: biaya.label,
  jumlah: biaya.jumlah,
  batas: biaya.batas,
  periode: biaya.periode,
  jalurNama: jalurMasuk.nama,
  sumber: kolomSumber,
};

export type BiayaTampil = {
  id: number;
  tahunAkademik: number;
  jenis: "ukt" | "spp" | "uang_pangkal" | "pendaftaran" | "lain";
  label: string | null;
  jumlah: number;
  batas: "minimal" | "maksimal" | null;
  periode: "per_semester" | "sekali";
  jalurNama: string | null;
  sumber: SumberRingkas;
};

const URUTAN_JENIS = ["ukt", "spp", "uang_pangkal", "lain", "pendaftaran"] as const;
const urutBiaya = (a: BiayaTampil, b: BiayaTampil) =>
  URUTAN_JENIS.indexOf(a.jenis) - URUTAN_JENIS.indexOf(b.jenis) ||
  (a.jalurNama ?? "").localeCompare(b.jalurNama ?? "", "id") ||
  a.jumlah - b.jumlah;

// Biaya the Kampus publishes for one Prodi.
export async function listBiayaProdi(db: Db, prodiId: number): Promise<Bagian<BiayaTampil>> {
  const rows = await db
    .select(kolomBiaya)
    .from(biaya)
    .innerJoin(sumber, eq(biaya.sumberId, sumber.id))
    .leftJoin(jalurMasuk, eq(biaya.jalurMasukId, jalurMasuk.id))
    .where(and(eq(biaya.prodiId, prodiId), eq(biaya.status, "diperiksa")));
  const bagian = bagianTerbaru(rows);
  return bagian && { ...bagian, daftar: bagian.daftar.sort(urutBiaya) };
}

// Biaya the Kampus publishes for the whole Kampus, except registration fees of
// a Jalur Masuk (those are shown with the Jalur Masuk).
export async function listBiayaKampus(db: Db, kampusId: number): Promise<Bagian<BiayaTampil>> {
  const rows = await db
    .select(kolomBiaya)
    .from(biaya)
    .innerJoin(sumber, eq(biaya.sumberId, sumber.id))
    .leftJoin(jalurMasuk, eq(biaya.jalurMasukId, jalurMasuk.id))
    .where(and(eq(biaya.kampusId, kampusId), isNull(biaya.prodiId), eq(biaya.status, "diperiksa")));
  const bagian = bagianTerbaru(rows.filter((r) => !(r.jenis === "pendaftaran" && r.jalurNama)));
  return bagian && { ...bagian, daftar: bagian.daftar.sort(urutBiaya) };
}

export async function listJalurMasuk(db: Db, kampusId: number) {
  const rows = await db
    .select({
      id: jalurMasuk.id,
      tahunAkademik: jalurMasuk.tahunAkademik,
      nama: jalurMasuk.nama,
      kategori: jalurMasuk.kategori,
      tes: jalurMasuk.tes,
      pendaftaranBuka: jalurMasuk.pendaftaranBuka,
      pendaftaranTutup: jalurMasuk.pendaftaranTutup,
      sumber: kolomSumber,
    })
    .from(jalurMasuk)
    .innerJoin(sumber, eq(jalurMasuk.sumberId, sumber.id))
    .where(and(eq(jalurMasuk.kampusId, kampusId), eq(jalurMasuk.status, "diperiksa")));
  const bagian = bagianTerbaru(rows);
  if (!bagian) return null;

  // Registration fees of these Jalur Masuk.
  const biayaJalur = await db
    .select({ ...kolomBiaya, jalurMasukId: biaya.jalurMasukId })
    .from(biaya)
    .innerJoin(sumber, eq(biaya.sumberId, sumber.id))
    .innerJoin(jalurMasuk, eq(biaya.jalurMasukId, jalurMasuk.id))
    .where(
      and(
        inArray(biaya.jalurMasukId, bagian.daftar.map((j) => j.id)),
        isNull(biaya.prodiId),
        eq(biaya.jenis, "pendaftaran"),
        eq(biaya.status, "diperiksa"),
      ),
    )
    .orderBy(asc(biaya.jumlah));
  const URUTAN = ["snbp", "snbt", "mandiri", "pts"];
  return {
    tahunAkademik: bagian.tahunAkademik,
    daftar: bagian.daftar
      .sort((a, b) => URUTAN.indexOf(a.kategori) - URUTAN.indexOf(b.kategori) || a.nama.localeCompare(b.nama, "id"))
      .map((j) => ({ ...j, biaya: biayaJalur.filter((b) => b.jalurMasukId === j.id) })),
  };
}

export type JalurTampil = NonNullable<Awaited<ReturnType<typeof listJalurMasuk>>>["daftar"][number];

export type BeasiswaTampil = {
  tahunAkademik: number;
  nama: string;
  penyelenggara: string;
  sasaran: string;
  cakupan: string;
  url: string | null;
  nasional: boolean;
  // The Sumber of the Beasiswa itself, and for a national one also the Sumber
  // showing this Kampus takes part.
  sumber: SumberRingkas;
  sumberIkut: SumberRingkas | null;
};

// The Kampus's own Beasiswa and the national ones it takes part in. A national
// Beasiswa shows only once both its own facts and the link are Diperiksa.
export async function listBeasiswa(db: Db, kampusId: number): Promise<Bagian<BeasiswaTampil>> {
  const kolom = {
    tahunAkademik: beasiswa.tahunAkademik,
    nama: beasiswa.nama,
    penyelenggara: beasiswa.penyelenggara,
    sasaran: beasiswa.sasaran,
    cakupan: beasiswa.cakupan,
    url: beasiswa.url,
    sumber: kolomSumber,
  };
  const [sendiri, ikut] = await Promise.all([
    db
      .select(kolom)
      .from(beasiswa)
      .innerJoin(sumber, eq(beasiswa.sumberId, sumber.id))
      .where(and(eq(beasiswa.kampusId, kampusId), eq(beasiswa.status, "diperiksa"))),
    db
      .select({ ...kolom, tahunAkademik: beasiswaKampus.tahunAkademik, sumberIkutId: beasiswaKampus.sumberId })
      .from(beasiswaKampus)
      .innerJoin(beasiswa, eq(beasiswaKampus.beasiswaId, beasiswa.id))
      .innerJoin(sumber, eq(beasiswa.sumberId, sumber.id))
      .where(
        and(eq(beasiswaKampus.kampusId, kampusId), eq(beasiswaKampus.status, "diperiksa"), eq(beasiswa.status, "diperiksa")),
      ),
  ]);
  const sumberIkut = ikut.length
    ? await db.select(kolomSumber).from(sumber).where(inArray(sumber.id, [...new Set(ikut.map((i) => i.sumberIkutId))]))
    : [];
  const semua: BeasiswaTampil[] = [
    ...sendiri.map((b) => ({ ...b, nasional: false, sumberIkut: null })),
    ...ikut.map(({ sumberIkutId, ...b }) => ({ ...b, nasional: true, sumberIkut: sumberIkut.find((s) => s.id === sumberIkutId) ?? null })),
  ];
  const bagian = bagianTerbaru(semua);
  return bagian && { ...bagian, daftar: bagian.daftar.sort((a, b) => Number(a.nasional) - Number(b.nasional) || a.nama.localeCompare(b.nama, "id")) };
}

// Everything the Kampus page shows.
export async function getFaktaKampus(db: Db, kampusId: number) {
  const [jalur, biayaKampus, daftarBeasiswa] = await Promise.all([
    listJalurMasuk(db, kampusId),
    listBiayaKampus(db, kampusId),
    listBeasiswa(db, kampusId),
  ]);
  return jalur || biayaKampus || daftarBeasiswa ? { jalur, biaya: biayaKampus, beasiswa: daftarBeasiswa } : null;
}

export type FaktaKampus = NonNullable<Awaited<ReturnType<typeof getFaktaKampus>>>;
