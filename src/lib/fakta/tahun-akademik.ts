// A Tahun Akademik is stored as its first year: 2026 means 2026/2027.

// "2026/2027" -> 2026; anything else -> null.
export function parseTahunAkademik(value: string): number | null {
  const m = /^\s*(\d{4})\s*\/\s*(\d{4})\s*$/.exec(value);
  if (!m) return null;
  const mulai = Number(m[1]);
  return Number(m[2]) === mulai + 1 && mulai >= 2000 && mulai < 2100 ? mulai : null;
}

export function formatTahunAkademik(mulai: number): string {
  return `${mulai}/${mulai + 1}`;
}

// The Tahun Akademik running on `tanggal`; a new one starts in August.
export function tahunAkademikBerjalan(tanggal = new Date()): number {
  const tahun = tanggal.getUTCFullYear();
  return tanggal.getUTCMonth() >= 7 ? tahun : tahun - 1;
}

// Facts from before the running Tahun Akademik are shown with a warning
// (decisions.md 17e), never hidden.
export function tahunAkademikLama(mulai: number, tanggal = new Date()): boolean {
  return mulai < tahunAkademikBerjalan(tanggal);
}
