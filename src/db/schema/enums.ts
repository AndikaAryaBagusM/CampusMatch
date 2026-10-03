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
