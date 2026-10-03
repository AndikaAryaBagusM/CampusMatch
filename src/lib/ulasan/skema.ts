import { z } from "zod";

export const ASPEK = [
  { kolom: "aspekKurikulum", label: "Kurikulum" },
  { kolom: "aspekDosen", label: "Dosen" },
  { kolom: "aspekFasilitas", label: "Fasilitas" },
  { kolom: "aspekSuasanaBelajar", label: "Suasana belajar" },
  { kolom: "aspekOrganisasi", label: "Organisasi/administrasi" },
  { kolom: "aspekBiayaKualitas", label: "Biaya vs kualitas" },
] as const;

export type KolomAspek = (typeof ASPEK)[number]["kolom"];

export const STATUS_PENGULAS = [
  { nilai: "mahasiswa_aktif", label: "Mahasiswa aktif" },
  { nilai: "alumni", label: "Alumni" },
] as const;

export const JUDUL_MIN = 5;
export const JUDUL_MAKS = 100;
export const ISI_MIN = 150;
export const ISI_MAKS = 5000;
export const TAHUN_MIN = 1950;

const nilai = z.coerce
  .number({ error: "Pilih 1 sampai 5 bintang." })
  .int()
  .min(1, "Pilih 1 sampai 5 bintang.")
  .max(5, "Pilih 1 sampai 5 bintang.");

// Server-side check of the Ulasan form (decisions.md 9). Takes the current year
// so tests don't depend on the clock.
export function skemaUlasan(tahunIni = new Date().getFullYear()) {
  return z.object({
    bintang: nilai,
    aspekKurikulum: nilai,
    aspekDosen: nilai,
    aspekFasilitas: nilai,
    aspekSuasanaBelajar: nilai,
    aspekOrganisasi: nilai,
    aspekBiayaKualitas: nilai,
    rekomendasi: z.enum(["ya", "tidak"], { error: "Pilih ya atau tidak." }).transform((v) => v === "ya"),
    judul: z
      .string()
      .trim()
      .min(JUDUL_MIN, `Judul minimal ${JUDUL_MIN} karakter.`)
      .max(JUDUL_MAKS, `Judul maksimal ${JUDUL_MAKS} karakter.`),
    isi: z
      .string()
      .trim()
      .min(ISI_MIN, `Ulasan minimal ${ISI_MIN} karakter.`)
      .max(ISI_MAKS, `Ulasan maksimal ${ISI_MAKS} karakter.`),
    statusPengulas: z.enum(["mahasiswa_aktif", "alumni"], { error: "Pilih status kamu." }),
    tahunMasuk: z.coerce
      .number({ error: "Isi tahun masuk." })
      .int("Isi tahun masuk.")
      .min(TAHUN_MIN, `Tahun masuk paling awal ${TAHUN_MIN}.`)
      .max(tahunIni, "Tahun masuk tidak boleh di masa depan."),
  });
}

export type DataUlasan = z.output<ReturnType<typeof skemaUlasan>>;
export type IsianUlasan = Partial<Record<keyof DataUlasan, string>>;

const KOLOM = [
  "bintang",
  ...ASPEK.map((a) => a.kolom),
  "rekomendasi",
  "judul",
  "isi",
  "statusPengulas",
  "tahunMasuk",
] as const satisfies readonly (keyof DataUlasan)[];

// FormData -> plain strings, kept to re-fill the form after an error.
export function bacaIsian(formData: FormData): IsianUlasan {
  return Object.fromEntries(
    KOLOM.flatMap((k) => {
      const v = formData.get(k);
      return typeof v === "string" ? [[k, v]] : [];
    }),
  );
}
