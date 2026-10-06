import type { Jenjang, ProdiDiminta } from "./baca";

// Matches a Prodi named in a Sumber to one of the Kampus's Prodi. Names in an
// SK Rektor rarely match the export exactly ("Program Studi S1 Teknik
// Informatika"), so both sides are normalised; a name that still matches
// nothing, or matches several Prodi (branch campuses), blocks the import.

export type ProdiKampus = { id: number; nama: string; jenjang: Jenjang; slug: string };
export type HasilCocok = { ok: true; prodi: ProdiKampus } | { ok: false; pesan: string };

const AWALAN =
  /^(program studi|prodi|sarjana terapan|sarjana|diploma (iii|iv|3|4|tiga|empat)|d ?(iii|iv|3|4)|s ?1)\b\s*/;

export function normalisasiNama(nama: string): string {
  let s = nama
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9()]+/g, " ")
    .trim();
  for (let sebelum = ""; sebelum !== s; ) {
    sebelum = s;
    s = s.replace(AWALAN, "");
  }
  return s.replace(/\s+/g, " ").trim();
}

function trigram(s: string): Set<string> {
  const t = new Set<string>();
  for (const kata of s.split(" ").filter(Boolean)) {
    const p = `  ${kata} `;
    for (let i = 0; i + 3 <= p.length; i++) t.add(p.slice(i, i + 3));
  }
  return t;
}

// Like pg_trgm's similarity(): shared trigrams over all trigrams.
export function kemiripan(a: string, b: string): number {
  const ta = trigram(a);
  const tb = trigram(b);
  let sama = 0;
  for (const t of ta) if (tb.has(t)) sama++;
  const semua = ta.size + tb.size - sama;
  return semua === 0 ? 0 : sama / semua;
}

const sebut = (p: ProdiKampus) => `${p.jenjang} ${p.nama} (prodi_slug ${p.slug})`;

export function cocokkanProdi(diminta: ProdiDiminta, daftar: ProdiKampus[]): HasilCocok {
  if (diminta.slug) {
    const p = daftar.find((d) => d.slug === diminta.slug);
    return p ? { ok: true, prodi: p } : { ok: false, pesan: `prodi_slug "${diminta.slug}" is not a Prodi of this Kampus` };
  }
  const nama = normalisasiNama(diminta.nama);
  const sejenjang = daftar.filter((d) => d.jenjang === diminta.jenjang);
  const cocok = sejenjang.filter((d) => normalisasiNama(d.nama) === nama);
  if (cocok.length === 1) return { ok: true, prodi: cocok[0] };
  if (cocok.length > 1)
    return { ok: false, pesan: `"${diminta.nama}" matches several Prodi; set prodi_slug to one of: ${cocok.map(sebut).join("; ")}` };

  const terdekat = (sejenjang.length ? sejenjang : daftar)
    .map((d) => ({ d, skor: kemiripan(nama, normalisasiNama(d.nama)) }))
    .filter((x) => x.skor > 0.2)
    .sort((a, b) => b.skor - a.skor)
    .slice(0, 3)
    .map((x) => sebut(x.d));
  return {
    ok: false,
    pesan: `no ${diminta.jenjang ?? ""} Prodi named "${diminta.nama}" at this Kampus${terdekat.length ? `; closest: ${terdekat.join("; ")}` : ""}`,
  };
}
