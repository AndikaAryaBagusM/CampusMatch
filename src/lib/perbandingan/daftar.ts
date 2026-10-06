// The Prodi a visitor picked to compare (decisions.md 17k). The list lives
// only in their browser; the compare page takes it from its URL.

export const KUNCI_PENYIMPANAN = "campusmatch:bandingkan";
export const MAKS_PRODI = 3;

export type ProdiPilihan = { slug: string; label: string };

const slugSah = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9-]{1,200}$/.test(v);

// Stored JSON -> a valid list; anything malformed is dropped, never thrown.
export function bacaDaftar(json: string | null): ProdiPilihan[] {
  let data: unknown;
  try {
    data = JSON.parse(json ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const daftar: ProdiPilihan[] = [];
  for (const x of data) {
    if (!x || typeof x !== "object") continue;
    const { slug, label } = x as Record<string, unknown>;
    if (!slugSah(slug) || daftar.some((p) => p.slug === slug)) continue;
    daftar.push({ slug, label: typeof label === "string" && label.trim() ? label.slice(0, 200) : slug });
  }
  return daftar.slice(0, MAKS_PRODI);
}

// Unchanged when the Prodi is already there or the list is full.
export function tambah(daftar: ProdiPilihan[], p: ProdiPilihan): ProdiPilihan[] {
  if (daftar.some((x) => x.slug === p.slug) || daftar.length >= MAKS_PRODI) return daftar;
  return [...daftar, p];
}

export const hapus = (daftar: ProdiPilihan[], slug: string) => daftar.filter((p) => p.slug !== slug);

export function hrefBandingkan(slugs: string[]): string {
  const qs = new URLSearchParams();
  for (const s of slugs) qs.append("p", s);
  const q = qs.toString();
  return q ? `/bandingkan?${q}` : "/bandingkan";
}

// ?p=a&p=b -> ["a", "b"]: valid slugs only, no repeats, at most three.
export function bacaSlugs(p: string | string[] | undefined): string[] {
  const semua = (Array.isArray(p) ? p : p ? [p] : []).filter(slugSah);
  return [...new Set(semua)].slice(0, MAKS_PRODI);
}
