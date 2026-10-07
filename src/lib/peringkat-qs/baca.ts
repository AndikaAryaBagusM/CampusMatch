import { z } from "zod";

// Reads one QS World University Rankings edition (data/raw/qs-wur-<edisi>-indonesia.json,
// copied by hand from QS's ranking page) and the reviewed matches to our Kampus
// (data/qs-kampus.csv), ADR 0011. Pure: the loader in muat.ts writes them.
// Messages are for the person running the loader, so they name the entry.

export type Baris = Record<string, string>;

// "276" and "=191" (a shared rank) are exact; "851-900" is a band; "1401+" is open-ended.
export type Peringkat = { peringkat: string; min: number; max: number | null };

export function parsePeringkat(teks: string): Peringkat | null {
  const p = teks.trim();
  let m = /^=?(\d+)$/.exec(p);
  if (m) {
    const n = Number(m[1]);
    return n > 0 ? { peringkat: p, min: n, max: n } : null;
  }
  m = /^(\d+)-(\d+)$/.exec(p);
  if (m) {
    const [min, max] = [Number(m[1]), Number(m[2])];
    return min > 0 && max > min ? { peringkat: p, min, max } : null;
  }
  m = /^(\d+)\+$/.exec(p);
  if (m) {
    const n = Number(m[1]);
    return n > 0 ? { peringkat: p, min: n, max: null } : null;
  }
  return null;
}

export type EntriQs = Peringkat & { namaQs: string; npsn: string };

export type EdisiQs = {
  edisi: number;
  sumberUrl: string;
  tanggalAmbil: string;
  entri: EntriQs[];
};

const tanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");

const skemaFile = z.object({
  judul: z.string(),
  edisi: z.number().int().min(2000).max(2100),
  sumber_url: z.url({ protocol: /^https$/ }),
  tanggal_ambil: tanggal,
  entri: z
    .array(z.object({ nama_qs: z.string().trim().min(1), peringkat: z.string().trim().min(1) }))
    .min(1, "must list at least one university"),
});

// The edition plus its matches, or every problem found. Every QS entry needs
// exactly one reviewed match, and a Kampus can stand for only one entry.
export function bacaQs(file: unknown, cocok: Baris[]): { edisi: EdisiQs; galat: [] } | { edisi: null; galat: string[] } {
  const parsed = skemaFile.safeParse(file);
  if (!parsed.success) {
    return { edisi: null, galat: parsed.error.issues.map((i) => `${i.path.join(".") || "file"}: ${i.message}`) };
  }
  const f = parsed.data;
  const galat: string[] = [];
  if (f.judul !== `QS World University Rankings ${f.edisi}`) {
    galat.push(`judul must be "QS World University Rankings ${f.edisi}", got "${f.judul}"`);
  }

  const npsnPerNama = new Map<string, string[]>();
  for (const b of cocok) {
    const nama = (b.nama_qs ?? "").trim();
    if (!nama) continue;
    npsnPerNama.set(nama, [...(npsnPerNama.get(nama) ?? []), (b.npsn ?? "").trim()]);
  }
  const namaFile = new Set(f.entri.map((e) => e.nama_qs));
  for (const nama of npsnPerNama.keys()) {
    if (!namaFile.has(nama)) galat.push(`"${nama}" is matched in the CSV but is not in the QS file`);
  }

  const entri: EntriQs[] = [];
  const dipakai = new Map<string, string>();
  const namaDilihat = new Set<string>();
  for (const e of f.entri) {
    if (namaDilihat.has(e.nama_qs)) {
      galat.push(`"${e.nama_qs}" is listed twice in the QS file`);
      continue;
    }
    namaDilihat.add(e.nama_qs);
    const p = parsePeringkat(e.peringkat);
    if (!p) galat.push(`"${e.nama_qs}": unknown rank format "${e.peringkat}" (expected 276, =191, 851-900 or 1401+)`);
    const npsn = npsnPerNama.get(e.nama_qs) ?? [];
    if (npsn.length === 0) galat.push(`"${e.nama_qs}" has no row in the match CSV; decide its Kampus first`);
    else if (npsn.length > 1) galat.push(`"${e.nama_qs}" has ${npsn.length} rows in the match CSV; keep one`);
    else if (!/^\d+$/.test(npsn[0])) galat.push(`"${e.nama_qs}": npsn "${npsn[0]}" is not a number`);
    else if (dipakai.has(npsn[0])) galat.push(`npsn ${npsn[0]} is matched to both "${dipakai.get(npsn[0])}" and "${e.nama_qs}"`);
    else {
      dipakai.set(npsn[0], e.nama_qs);
      if (p) entri.push({ ...p, namaQs: e.nama_qs, npsn: npsn[0] });
    }
  }

  if (galat.length) return { edisi: null, galat };
  return { edisi: { edisi: f.edisi, sumberUrl: f.sumber_url, tanggalAmbil: f.tanggal_ambil, entri }, galat: [] };
}
