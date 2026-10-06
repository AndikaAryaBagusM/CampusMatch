import { and, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { infoBiaya, prodi, verifikasiKampus } from "@/db/schema";
import { tahunAkademikBerjalan } from "@/lib/fakta/tahun-akademik";
import { BEASISWA, KATEGORI_JALUR, TES } from "./label";

// The Estimasi Pengulas (ADR 0010): what Pengulas say they paid, combined per
// Prodi. Never a single entry: each field is shown only once at least K
// Pengulas answered it, fields are never cross-tabulated, and nothing here
// carries an id or one person's value.

export const K = 5;
export const JENDELA_ANGKATAN = 5;

// The oldest tahun masuk still counted: the last five angkatan, this one included.
export function awalJendela(sekarang = new Date()): number {
  return tahunAkademikBerjalan(sekarang) - (JENDELA_ANGKATAN - 1);
}

// Linear interpolation between closest ranks; `urut` must be sorted.
function persentil(urut: number[], p: number): number {
  const i = (urut.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return Math.round(urut[lo] + (urut[hi] - urut[lo]) * (i - lo));
}

// Values outside these limits are left out of the Estimasi. The band is three
// times the interquartile range, but at least a quarter of the median, so a
// Prodi where most Pengulas paid the same amount doesn't drop every other one.
export function batasPencilan(nilai: number[]): { bawah: number; atas: number } | null {
  if (nilai.length < K) return null;
  const urut = [...nilai].sort((a, b) => a - b);
  const q1 = persentil(urut, 0.25);
  const q3 = persentil(urut, 0.75);
  const lebar = 3 * Math.max(q3 - q1, persentil(urut, 0.5) / 4, 1);
  return { bawah: q1 - lebar, atas: q3 + lebar };
}

export type RingkasanAngka = { n: number; median?: number; p25?: number; p75?: number };

export function ringkasAngka(nilai: number[]): RingkasanAngka {
  const batas = batasPencilan(nilai);
  const dipakai = batas ? nilai.filter((v) => v >= batas.bawah && v <= batas.atas) : nilai;
  if (dipakai.length < K) return { n: dipakai.length };
  const urut = dipakai.sort((a, b) => a - b);
  return { n: urut.length, median: persentil(urut, 0.5), p25: persentil(urut, 0.25), p75: persentil(urut, 0.75) };
}

export type RingkasanPilihan<T extends string> = { n: number; jumlah?: { nilai: T; jumlah: number }[] };

// How many answered each option, in the given order, only once n reaches K.
// `jawaban` holds one list per Pengulas (a single choice is a list of one).
export function hitungPilihan<T extends string>(jawaban: T[][], urutan: readonly T[]): RingkasanPilihan<T> {
  const n = jawaban.length;
  if (n < K) return { n };
  const hitung = new Map<T, number>();
  for (const daftar of jawaban) for (const v of new Set(daftar)) hitung.set(v, (hitung.get(v) ?? 0) + 1);
  return { n, jumlah: urutan.filter((v) => hitung.has(v)).map((nilai) => ({ nilai, jumlah: hitung.get(nilai)! })) };
}

type Baris = {
  tahunMasuk: number;
  kategoriJalur: (typeof KATEGORI_JALUR)[number] | null;
  tes: (typeof TES)[number][] | null;
  biayaSemester: number | null;
  uangPangkal: number | null;
  biayaLainMasuk: number | null;
  beasiswa: (typeof BEASISWA)[number] | null;
  terverifikasi: boolean;
};

export type EstimasiPengulas = {
  n: number;
  nTerverifikasi: number;
  // Shown only once n reaches K.
  angkatan: { dari: number; sampai: number } | null;
  biayaSemester: RingkasanAngka;
  // Of those who answered, how many paid none; the amount only over those who paid.
  uangPangkal: { n: number; nTidakAda?: number; bayar?: RingkasanAngka };
  biayaLainMasuk: RingkasanAngka;
  jalur: RingkasanPilihan<(typeof KATEGORI_JALUR)[number]>;
  tes: RingkasanPilihan<(typeof TES)[number]>;
  beasiswa: RingkasanPilihan<(typeof BEASISWA)[number]>;
};

const ada = <T,>(v: T | null): v is T => v !== null;

export function ringkasEstimasi(baris: Baris[]): EstimasiPengulas {
  const n = baris.length;
  const tahun = baris.map((b) => b.tahunMasuk);
  const pangkal = baris.map((b) => b.uangPangkal).filter(ada);
  return {
    n,
    nTerverifikasi: baris.filter((b) => b.terverifikasi).length,
    angkatan: n >= K ? { dari: Math.min(...tahun), sampai: Math.max(...tahun) } : null,
    biayaSemester: ringkasAngka(baris.map((b) => b.biayaSemester).filter(ada)),
    uangPangkal:
      pangkal.length < K
        ? { n: pangkal.length }
        : { n: pangkal.length, nTidakAda: pangkal.filter((v) => v === 0).length, bayar: ringkasAngka(pangkal.filter((v) => v > 0)) },
    biayaLainMasuk: ringkasAngka(baris.map((b) => b.biayaLainMasuk).filter(ada)),
    jalur: hitungPilihan(baris.map((b) => b.kategoriJalur).filter(ada).map((v) => [v]), KATEGORI_JALUR),
    tes: hitungPilihan(baris.map((b) => b.tes).filter(ada), TES),
    beasiswa: hitungPilihan(baris.map((b) => b.beasiswa).filter(ada).map((v) => [v]), BEASISWA),
  };
}

// Whether the Pengulas behind an Info Biaya is Terverifikasi at that Prodi's Kampus.
export const terverifikasiDiKampus = sql<boolean>`exists (
  select 1 from ${verifikasiKampus}
  where ${verifikasiKampus.userId} = ${infoBiaya.userId} and ${verifikasiKampus.kampusId} = ${prodi.kampusId}
)`;

// One Estimasi per Prodi id, from Info Biaya in the window that no Moderator
// has set aside. Every id asked for gets an entry, even with no data.
export async function estimasiProdi(db: Db, prodiIds: number[], sekarang = new Date()): Promise<Map<number, EstimasiPengulas>> {
  const rows = prodiIds.length
    ? await db
        .select({
          prodiId: infoBiaya.prodiId,
          tahunMasuk: infoBiaya.tahunMasuk,
          kategoriJalur: infoBiaya.kategoriJalur,
          tes: infoBiaya.tes,
          biayaSemester: infoBiaya.biayaSemester,
          uangPangkal: infoBiaya.uangPangkal,
          biayaLainMasuk: infoBiaya.biayaLainMasuk,
          beasiswa: infoBiaya.beasiswa,
          terverifikasi: terverifikasiDiKampus,
        })
        .from(infoBiaya)
        .innerJoin(prodi, eq(prodi.id, infoBiaya.prodiId))
        .where(
          and(
            inArray(infoBiaya.prodiId, prodiIds),
            isNull(infoBiaya.dikesampingkanAt),
            gte(infoBiaya.tahunMasuk, awalJendela(sekarang)),
          ),
        )
    : [];
  const perProdi = new Map<number, Baris[]>(prodiIds.map((id) => [id, []]));
  for (const { prodiId, ...b } of rows) perProdi.get(prodiId)?.push({ ...b, tes: b.tes?.length ? b.tes : null });
  return new Map([...perProdi].map(([id, baris]) => [id, ringkasEstimasi(baris)]));
}
