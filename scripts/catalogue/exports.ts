// Reads and normalises the official Kemenristekdikti exports in data/raw/
// (ADR 0003). Pure: no database access, so every script and --dry-run share it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import * as XLSX from "xlsx";
import { AKREDITASI, bentukKampus, jenjang as jenjangEnum } from "../../src/db/schema/enums";

export const PRODI_FILE = "data/raw/Program Studi.xlsx";
export const PT_FILE = "data/raw/Perguruan Tinggi Terakreditasi.xlsx";
export const UNGGULAN_FILE = "data/top-100-kampus.csv";
export const MAPPING_FILE = "data/jurusan-mapping.csv";

type Jenjang = (typeof jenjangEnum.enumValues)[number];
type Bentuk = (typeof bentukKampus.enumValues)[number];
const JENJANG = new Set<string>(jenjangEnum.enumValues);
const BENTUK = new Set<string>(bentukKampus.enumValues);
const AKRED = new Set<string>(AKREDITASI);

export type KotaRow = { key: string; nama: string; provinsi: string; slug: string };
export type KampusRow = {
  npsn: string;
  nama: string;
  bentuk: Bentuk;
  kotaKey: string;
  akreditasi: string | null;
  slug: string;
};
export type ProdiRow = {
  npsn: string;
  kodeProdi: string;
  nama: string;
  jenjang: Jenjang;
  bidang: string | null;
  slug: string;
};
export type UnggulanRow = { npsn: string; nama: string; peringkat: string };
export type Source = { file: string; sha256: string };

// Counted problems and oddities, printed by every script.
export class Report {
  readonly skipped = new Map<string, number>();
  readonly odd = new Map<string, Set<string>>();

  skip(reason: string, n = 1) {
    this.skipped.set(reason, (this.skipped.get(reason) ?? 0) + n);
  }
  note(category: string, value: string) {
    if (!this.odd.has(category)) this.odd.set(category, new Set());
    this.odd.get(category)!.add(value);
  }
  print(maxExamples = 10) {
    console.log("\nSkipped rows by reason");
    if (this.skipped.size === 0) console.log("  (none)");
    for (const [reason, n] of [...this.skipped].sort((a, b) => b[1] - a[1]))
      console.log(`  ${String(n).padStart(6)}  ${reason}`);
    console.log("\nOdd or unmatched values");
    if (this.odd.size === 0) console.log("  (none)");
    for (const [category, values] of this.odd) {
      console.log(`  ${category}: ${values.size}`);
      for (const v of [...values].slice(0, maxExamples)) console.log(`      ${v}`);
      if (values.size > maxExamples) console.log(`      … ${values.size - maxExamples} more`);
    }
  }
}

// Trim and collapse internal whitespace.
export function clean(value: unknown): string {
  return value == null ? "" : String(value).replace(/\s+/g, " ").trim();
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[`'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

// Rows of the first sheet keyed by header, all values as strings.
// raw: true keeps CSV cells such as "001001" as text instead of numbers.
export function readRows(path: string, required: string[]): Record<string, string>[] {
  let buf = readFileSync(path);
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3);
  const isCsv = path.toLowerCase().endsWith(".csv");
  const wb = isCsv
    ? XLSX.read(buf.toString("utf8"), { type: "string", raw: true })
    : XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });
  const headers = new Set(Object.keys(rows[0] ?? {}));
  const missing = required.filter((c) => !headers.has(c));
  if (missing.length)
    throw new Error(`${basename(path)} is missing column(s): ${missing.join(", ")}`);
  return rows;
}

function normaliseKota(raw: string, report: Report, kampusLabel: string): string {
  const nama = clean(raw);
  if (nama.startsWith("Kota. ")) {
    report.note('Kota with a stray dot, normalised ("Kota. X" → "Kota X")', nama);
    return "Kota " + nama.slice("Kota. ".length);
  }
  if (nama === "Lainnya") report.note('Kampus with Kota "Lainnya"', kampusLabel);
  return nama;
}

// Assigns base slugs, disambiguating collisions with `extra(row)`, then a counter.
function assignSlugs<T>(
  rows: T[],
  base: (r: T) => string,
  extra: (r: T) => string,
): Map<T, string> {
  const count = (slugs: string[]) =>
    slugs.reduce((m, s) => m.set(s, (m.get(s) ?? 0) + 1), new Map<string, number>());
  const first = rows.map(base);
  const firstCount = count(first);
  const second = rows.map((r, i) =>
    firstCount.get(first[i])! > 1 ? `${first[i]}-${extra(r)}` : first[i],
  );
  const secondCount = count(second);
  const seen = new Map<string, number>();
  const out = new Map<T, string>();
  rows.forEach((r, i) => {
    let s = second[i];
    if (secondCount.get(s)! > 1) {
      const n = (seen.get(s) ?? 0) + 1;
      seen.set(s, n);
      if (n > 1) s = `${s}-${n}`;
    }
    out.set(r, s);
  });
  return out;
}

export type Catalogue = {
  kota: KotaRow[];
  kampus: KampusRow[];
  prodi: ProdiRow[];
  sources: Source[];
  report: Report;
};

export function loadExports(): Catalogue {
  const report = new Report();
  const prodiRaw = readRows(PRODI_FILE, [
    "npsn",
    "nama_pt",
    "provinsi_pt",
    "Kabupaten_pt",
    "bentuk_pendidikan",
    "kode_prodi",
    "nm_prodi",
    "nm_jenj_didik",
    "nm_kel_bidang",
  ]);
  const ptRaw = readRows(PT_FILE, ["npsn", "nama_pt", "kab_kota_pt", "provinsi_pt", "akred_pt"]);

  const akredByNpsn = new Map<string, string>();
  for (const r of ptRaw) {
    const npsn = clean(r.npsn);
    const akred = clean(r.akred_pt);
    if (!npsn) continue;
    if (akred && !AKRED.has(akred)) {
      report.note("Akreditasi not in AKREDITASI, stored as NULL", `${npsn}: ${akred}`);
      continue;
    }
    if (akred) akredByNpsn.set(npsn, akred);
  }

  const kotaByKey = new Map<string, { nama: string; provinsi: string }>();
  const kampusByNpsn = new Map<string, Omit<KampusRow, "slug">>();
  const prodiByKey = new Map<string, Omit<ProdiRow, "slug">>();

  for (const r of prodiRaw) {
    const jenjangRaw = clean(r.nm_jenj_didik);
    if (!JENJANG.has(jenjangRaw)) {
      report.skip(`Jenjang ${jenjangRaw || "(empty)"}`);
      continue;
    }
    const npsn = clean(r.npsn);
    const kodeProdi = clean(r.kode_prodi);
    const nama = clean(r.nm_prodi);
    const namaPt = clean(r.nama_pt);
    const provinsi = clean(r.provinsi_pt);
    const bentuk = clean(r.bentuk_pendidikan);
    if (!npsn || !kodeProdi || !nama || !namaPt || !provinsi) {
      report.skip("required field empty (npsn, kode_prodi, nm_prodi, nama_pt or provinsi_pt)");
      continue;
    }
    if (!BENTUK.has(bentuk)) {
      report.skip(`bentuk_pendidikan not in enum: ${bentuk || "(empty)"}`);
      continue;
    }

    const kotaNama = normaliseKota(r.Kabupaten_pt, report, `${npsn} ${namaPt} (${provinsi})`);
    if (!kotaNama) {
      report.skip("Kabupaten_pt empty");
      continue;
    }
    const kotaKey = `${kotaNama}|${provinsi}`;
    kotaByKey.set(kotaKey, { nama: kotaNama, provinsi });

    const kampus = { npsn, nama: namaPt, bentuk: bentuk as Bentuk, kotaKey, akreditasi: akredByNpsn.get(npsn) ?? null };
    const prev = kampusByNpsn.get(npsn);
    if (!prev) kampusByNpsn.set(npsn, kampus);
    else if (prev.nama !== kampus.nama || prev.kotaKey !== kotaKey || prev.bentuk !== kampus.bentuk)
      report.note("Kampus with differing name/Kota/bentuk across rows (first row kept)", npsn);

    if (nama === nama.toLowerCase())
      report.note("Prodi names in all lowercase (kept as published)", `${npsn} ${kodeProdi} ${nama}`);

    const key = [npsn, kodeProdi, jenjangRaw, nama].join("|");
    if (prodiByKey.has(key)) {
      report.skip("exact duplicate Prodi row (same Kampus, Kode Prodi, Jenjang, name)");
      report.note("Duplicate Prodi rows collapsed", key);
      continue;
    }
    prodiByKey.set(key, {
      npsn,
      kodeProdi,
      nama,
      jenjang: jenjangRaw as Jenjang,
      bidang: clean(r.nm_kel_bidang) || null,
    });
  }

  // Cross-file checks.
  for (const r of ptRaw) {
    const npsn = clean(r.npsn);
    if (npsn && !kampusByNpsn.has(npsn)) {
      report.skip("Kampus in PT file with no S1/D3/D4 Prodi");
      report.note("Kampus in PT file with no S1/D3/D4 Prodi (not imported)", `${npsn} ${clean(r.nama_pt)}`);
    }
  }
  for (const k of kampusByNpsn.values())
    if (!k.akreditasi) report.note("Kampus missing from PT file (akreditasi NULL)", `${k.npsn} ${k.nama}`);

  const kotaNames = new Map<string, string[]>();
  for (const k of kotaByKey.values())
    kotaNames.set(k.nama, [...(kotaNames.get(k.nama) ?? []), k.provinsi]);
  for (const [nama, provs] of kotaNames)
    if (provs.length > 1 && nama !== "Lainnya")
      report.note("Kota name in more than one province", `${nama}: ${provs.join(", ")}`);

  const kampusNames = new Map<string, string[]>();
  for (const k of kampusByNpsn.values())
    kampusNames.set(k.nama, [...(kampusNames.get(k.nama) ?? []), k.npsn]);
  for (const [nama, npsns] of kampusNames)
    if (npsns.length > 1) report.note("Kampus name shared by several NPSN", `${nama}: ${npsns.join(", ")}`);

  // Deterministic slugs: sort first so the same input always gives the same slugs.
  const kotaList = [...kotaByKey].sort(([a], [b]) => a.localeCompare(b));
  const kotaSlugs = assignSlugs(
    kotaList,
    ([, k]) => slugify(k.nama),
    ([, k]) => slugify(k.provinsi.replace(/^Prov\. /, "")),
  );
  const kota: KotaRow[] = kotaList.map((e) => ({ key: e[0], ...e[1], slug: kotaSlugs.get(e)! }));
  const kotaSlugByKey = new Map(kota.map((k) => [k.key, k.slug]));

  const kampusList = [...kampusByNpsn.values()].sort((a, b) => a.npsn.localeCompare(b.npsn));
  const kampusSlugs = assignSlugs(
    kampusList,
    (k) => slugify(k.nama),
    (k) => kotaSlugByKey.get(k.kotaKey)!,
  );
  const kampus: KampusRow[] = kampusList.map((k) => ({ ...k, slug: kampusSlugs.get(k)! }));
  const kampusSlugByNpsn = new Map(kampus.map((k) => [k.npsn, k.slug]));

  const prodiList = [...prodiByKey.values()].sort((a, b) =>
    [a.npsn, a.kodeProdi, a.jenjang, a.nama].join("|").localeCompare([b.npsn, b.kodeProdi, b.jenjang, b.nama].join("|")),
  );
  const prodiSlugs = assignSlugs(
    prodiList,
    (p) => `${kampusSlugByNpsn.get(p.npsn)}-${p.jenjang.toLowerCase()}-${slugify(p.nama)}`,
    (p) => p.kodeProdi,
  );
  const prodi: ProdiRow[] = prodiList.map((p) => ({ ...p, slug: prodiSlugs.get(p)! }));

  const sources = [PRODI_FILE, PT_FILE].map((f) => ({ file: basename(f), sha256: sha256(f) }));
  return { kota, kampus, prodi, sources, report };
}

// The one value a column holds across all rows; throws if it is missing or varies.
function singleValue(rows: Record<string, string>[], column: string): string {
  const values = new Set(rows.map((r) => clean(r[column])));
  if (values.size !== 1 || values.has("")) {
    throw new Error(`${UNGGULAN_FILE}: column "${column}" must hold one value in every row, got ${[...values].map((v) => `"${v}"`).join(", ")}`);
  }
  return [...values][0];
}

// Daftar Kampus Unggulan, or null when the CSV does not exist yet. `sumber` and
// `tanggalAmbil` are its provenance, recorded in impor_katalog.
export function loadUnggulan(): {
  rows: UnggulanRow[];
  source: Source;
  sumber: string;
  tanggalAmbil: string;
} | null {
  if (!existsSync(UNGGULAN_FILE)) return null;
  const raw = readRows(UNGGULAN_FILE, ["npsn", "nama", "sumber", "tanggal_ambil"]);
  const rows = raw.map((r) => ({
    npsn: clean(r.npsn),
    nama: clean(r.nama),
    peringkat: clean(r.peringkat),
  }));
  const tanggalAmbil = singleValue(raw, "tanggal_ambil");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalAmbil)) {
    throw new Error(`${UNGGULAN_FILE}: tanggal_ambil must be YYYY-MM-DD, got "${tanggalAmbil}"`);
  }
  return {
    rows: rows.filter((r) => r.npsn),
    source: { file: basename(UNGGULAN_FILE), sha256: sha256(UNGGULAN_FILE) },
    sumber: singleValue(raw, "sumber"),
    tanggalAmbil,
  };
}
