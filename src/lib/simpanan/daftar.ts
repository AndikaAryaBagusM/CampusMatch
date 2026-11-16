// The Prodi a visitor saved to come back to (decisions.md 17s). Like the
// Bandingkan list it lives only in their browser: most readers are under 18
// and can't have an account (ADR 0008), and nothing about them is stored.

export const KUNCI_TERSIMPAN = "campusmatch:tersimpan";
export const MAKS_TERSIMPAN = 30;

export type ProdiTersimpan = { slug: string; label: string };

const slugSah = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9-]{1,200}$/.test(v);

// Stored JSON -> a valid list; anything malformed is dropped, never thrown.
export function bacaTersimpan(json: string | null): ProdiTersimpan[] {
  let data: unknown;
  try {
    data = JSON.parse(json ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const daftar: ProdiTersimpan[] = [];
  for (const x of data) {
    if (!x || typeof x !== "object") continue;
    const { slug, label } = x as Record<string, unknown>;
    if (!slugSah(slug) || daftar.some((p) => p.slug === slug)) continue;
    daftar.push({ slug, label: typeof label === "string" && label.trim() ? label.slice(0, 200) : slug });
  }
  return daftar.slice(0, MAKS_TERSIMPAN);
}

// Unchanged when the Prodi is already there or the list is full.
export function simpanProdi(daftar: ProdiTersimpan[], p: ProdiTersimpan): ProdiTersimpan[] {
  if (daftar.some((x) => x.slug === p.slug) || daftar.length >= MAKS_TERSIMPAN) return daftar;
  return [...daftar, p];
}

export const lepasProdi = (daftar: ProdiTersimpan[], slug: string) => daftar.filter((p) => p.slug !== slug);

// The saved list as a message to send to oneself, a parent or a guru BK.
export function pesanTersimpan(daftar: ProdiTersimpan[], url: (jalur: string) => string): string {
  return ["Daftar Prodi yang kusimpan di CampusMatch:", ...daftar.map((p) => `• ${p.label}\n  ${url(`/prodi/${p.slug}`)}`)].join("\n");
}
