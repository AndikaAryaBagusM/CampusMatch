import { pgEnum } from "drizzle-orm/pg-core";

// Terms follow CONTEXT.md.

export const jenjang = pgEnum("jenjang", ["D3", "D4", "S1"]);

export const bentukKampus = pgEnum("bentuk_kampus", [
  "Universitas",
  "Institut",
  "Sekolah Tinggi",
  "Politeknik",
  "Akademi",
  "Akademi Komunitas",
]);

export const peran = pgEnum("peran", ["pengulas", "moderator"]);

export const statusPengulas = pgEnum("status_pengulas", [
  "mahasiswa_aktif",
  "alumni",
]);

export const statusUlasan = pgEnum("status_ulasan", [
  "menunggu",
  "terbit",
  "ditinjau",
  "ditolak",
]);

export const tingkatRisiko = pgEnum("tingkat_risiko", [
  "rendah",
  "perlu_dicek",
  "melanggar",
]);

export const riasecTipe = pgEnum("riasec_tipe", ["R", "I", "A", "S", "E", "C"]);

// Mirrors the Screening categories in ADR 0002.
export const alasanLaporan = pgEnum("alasan_laporan", [
  "sara_kebencian",
  "hinaan",
  "menyebut_individu",
  "tidak_relevan",
  "promosi_spam",
  "lainnya",
]);

export const statusLaporan = pgEnum("status_laporan", ["baru", "ditangani"]);

// Akreditasi is text with a CHECK rather than an enum: labels mix the old
// (A/B/C) and new (Unggul/Baik Sekali/Baik) scales, and new ones appear.
export const AKREDITASI = [
  "Unggul",
  "Baik Sekali",
  "Baik",
  "A",
  "B",
  "C",
  "Terakreditasi",
  "Terakreditasi Sementara",
] as const;
export type Akreditasi = (typeof AKREDITASI)[number];

// One entry in riwayat_moderasi, the history a Moderator sees per Ulasan.
export const aksiModerasi = pgEnum("aksi_moderasi", [
  "screening",
  "disetujui",
  "ditolak",
  "diturunkan",
  "laporan_ditutup",
  "dihapus_pengulas",
]);

// Biaya & Masuk facts (ADR 0006).
// Ditarik: withdrawn by a Moderator after it was shown; kept as history.
export const statusFakta = pgEnum("status_fakta", ["draf", "diperiksa", "ditarik"]);

export const jenisBiaya = pgEnum("jenis_biaya", [
  "ukt",
  "spp",
  "uang_pangkal",
  "pendaftaran",
  "lain",
]);

// NULL batas means the amount is exact.
export const batasBiaya = pgEnum("batas_biaya", ["minimal", "maksimal"]);

export const periodeBiaya = pgEnum("periode_biaya", ["per_semester", "sekali"]);

export const kategoriJalur = pgEnum("kategori_jalur", [
  "snbp",
  "snbt",
  "mandiri",
  "pts",
]);

export const tesJalur = pgEnum("tes_jalur", [
  "utbk",
  "tes_kampus",
  "rapor",
  "portofolio",
  "wawancara",
  "prestasi",
  "lain",
]);

// Promosi (ADR 0009): entered as Draf, activated by a second Moderator,
// stopped early with a reason. Its dates decide when an aktif Promosi shows.
export const statusPromosi = pgEnum("status_promosi", ["draf", "aktif", "dihentikan"]);
