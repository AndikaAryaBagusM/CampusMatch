import { formatAngka } from "@/lib/format";
import type { BatasBiaya, JenisBiaya, KategoriJalur, PeriodeBiaya, TesJalur } from "./baca";

// Indonesian labels for the fact enums.

export const LABEL_JENIS_BIAYA: Record<JenisBiaya, string> = {
  ukt: "UKT",
  spp: "SPP",
  uang_pangkal: "Uang Pangkal",
  pendaftaran: "Biaya pendaftaran",
  lain: "Biaya Lain",
};

export const LABEL_KATEGORI_JALUR: Record<KategoriJalur, string> = {
  snbp: "SNBP",
  snbt: "SNBT",
  mandiri: "Mandiri",
  pts: "Seleksi Kampus",
};

export const LABEL_TES: Record<TesJalur, string> = {
  utbk: "UTBK",
  tes_kampus: "Tes tertulis Kampus",
  rapor: "Nilai rapor",
  portofolio: "Portofolio",
  wawancara: "Wawancara",
  prestasi: "Prestasi",
  lain: "Lainnya",
};

// 7500000 -> "Rp 7.500.000"; with batas, "minimal Rp 25.000.000".
export function formatRupiah(jumlah: number, batas: BatasBiaya | null = null): string {
  const rp = `Rp ${formatAngka(jumlah)}`;
  return batas ? `${batas} ${rp}` : rp;
}

export const LABEL_PERIODE: Record<PeriodeBiaya, string> = {
  per_semester: "per semester",
  sekali: "sekali bayar",
};
