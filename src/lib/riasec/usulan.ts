import { TIPE, type Tipe } from "./item";

// Proposes a Jurusan's Kode RIASEC from the O*NET® occupations it typically
// leads to: the average of their O*NET interest ratings (1–7 per type), and
// its three highest types. Moderators review and can change every proposal
// (decisions.md 11).

export type RatingOnet = Record<Tipe, number>;

export function usulkanKode(ratings: RatingOnet[]): { kode: Tipe[]; rataRata: RatingOnet } {
  if (ratings.length === 0) throw new Error("No occupations to average");
  const rataRata = Object.fromEntries(
    TIPE.map((t) => [t, Math.round((ratings.reduce((s, r) => s + r[t], 0) / ratings.length) * 100) / 100]),
  ) as RatingOnet;
  const kode = [...TIPE].sort((a, b) => rataRata[b] - rataRata[a] || TIPE.indexOf(a) - TIPE.indexOf(b)).slice(0, 3);
  return { kode, rataRata };
}

// "SIA" -> ["S", "I", "A"]; 2–3 distinct types, or null.
export function parseKode(value: string): Tipe[] | null {
  const huruf = value.trim().toUpperCase().split("");
  if (huruf.length < 2 || huruf.length > 3) return null;
  if (!huruf.every((h) => (TIPE as readonly string[]).includes(h))) return null;
  if (new Set(huruf).size !== huruf.length) return null;
  return huruf as Tipe[];
}
