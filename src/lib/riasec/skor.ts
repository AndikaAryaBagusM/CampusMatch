import { ITEM, TIPE, type Tipe } from "./item";

// Scoring as on the O*NET Interest Profiler Short Form: one point for each
// ticked activity, so each type scores 0–10. A Profil RIASEC is those six scores.

export type ProfilRiasec = Record<Tipe, number>;

export const SKOR_MAKS = 10;

export function hitungProfil(dicentang: Iterable<number>): ProfilRiasec {
  const profil: ProfilRiasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const id of new Set(dicentang)) {
    const item = ITEM[id - 1];
    if (item) profil[item.tipe]++;
  }
  return profil;
}

export const totalProfil = (p: ProfilRiasec) => TIPE.reduce((s, t) => s + p[t], 0);

// The types ranked by score. Equal scores keep the RIASEC order, and `seri`
// marks them: the form tells the person to choose among tied types.
export function urutkanTipe(p: ProfilRiasec): { tipe: Tipe; skor: number; seri: boolean }[] {
  const urut = [...TIPE].sort((a, b) => p[b] - p[a] || TIPE.indexOf(a) - TIPE.indexOf(b));
  return urut.map((tipe) => ({ tipe, skor: p[tipe], seri: urut.some((t) => t !== tipe && p[t] === p[tipe]) }));
}

// The three highest types, e.g. "SIA".
export const kodeProfil = (p: ProfilRiasec) =>
  urutkanTipe(p)
    .slice(0, 3)
    .map((x) => x.tipe)
    .join("");

// The shareable result link carries the scores, nothing is stored (decisions.md
// 17g): "4-9-2-5-3-1" in RIASEC order.
export function kodekanProfil(p: ProfilRiasec): string {
  return TIPE.map((t) => p[t]).join("-");
}

export function bacaProfil(value: string | undefined | null): ProfilRiasec | null {
  const bagian = (value ?? "").split("-");
  if (bagian.length !== 6 || !bagian.every((b) => /^\d{1,2}$/.test(b))) return null;
  const angka = bagian.map(Number);
  if (angka.some((n) => n > SKOR_MAKS)) return null;
  return Object.fromEntries(TIPE.map((t, i) => [t, angka[i]])) as ProfilRiasec;
}

// How well a Jurusan's Kode RIASEC (2–3 types, most important first) matches a
// profile: the profile's scores for those types, weighted 3, 2, 1 by position,
// as a share of the most a profile could score (0–1). It rewards a Jurusan
// whose first type is one of the person's strongest interests.
const BOBOT = [3, 2, 1];
export function kecocokan(p: ProfilRiasec, kode: readonly Tipe[]): number {
  const bobot = BOBOT.slice(0, kode.length);
  const nilai = kode.reduce((s, t, i) => s + bobot[i] * p[t], 0);
  return nilai / (bobot.reduce((s, b) => s + b, 0) * SKOR_MAKS);
}
