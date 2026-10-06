// Info Biaya choices, limits and labels (ADR 0010). Free of server imports, so
// the forms can use them.

export const KATEGORI_JALUR = ["snbp", "snbt", "mandiri", "pts"] as const;
export const TES = ["utbk", "tes_kampus", "rapor", "portofolio", "wawancara", "prestasi", "lain"] as const;
export const BEASISWA = ["tidak_ada", "kip_kuliah", "kampus", "lain"] as const;

export type BeasiswaPengulas = (typeof BEASISWA)[number];

export const LABEL_BEASISWA: Record<BeasiswaPengulas, string> = {
  tidak_ada: "Tanpa beasiswa",
  kip_kuliah: "KIP Kuliah",
  kampus: "Beasiswa dari Kampus",
  lain: "Beasiswa lain",
};

// Hard limits on what a Pengulas can enter; the database CHECK says the same.
export const BATAS_INFO_BIAYA = {
  biayaSemester: 50_000_000,
  uangPangkal: 1_000_000_000,
  biayaLainMasuk: 100_000_000,
  kelompokUkt: 20,
} as const;
