// Proposes a curated Jurusan list and the Kode Prodi → Jurusan mapping from the
// exports, as a CSV for review. Edit the `jurusan` column, then run
// `npm run catalogue:load-jurusan`. A blank `jurusan` leaves that Kode unmapped.
//
//   npm run catalogue:propose-jurusan [-- --force]
import { existsSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { loadExports, MAPPING_FILE } from "./catalogue/exports";

const AGREEMENT_THRESHOLD = 0.7;

// Branch-campus suffixes are not part of the field's name.
function cleanName(nama: string): string {
  const stripped = nama
    .replace(/\s*\((kampus|psdku)\b[^)]*\)\s*/gi, " ")
    .replace(/\s+(K|PSDKU)\s+[A-Z][\w ]*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped === stripped.toLowerCase()
    ? stripped.replace(/\b\p{L}/gu, (c) => c.toUpperCase())
    : stripped;
}

type KodeGroup = {
  kodeProdi: string;
  jenjang: Set<string>;
  bidang: Map<string, number>;
  // lowercased cleaned name → { display casing counts, total }
  names: Map<string, { total: number; casings: Map<string, number> }>;
  total: number;
};

function top<K>(m: Map<K, number>): [K, number] {
  return [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0];
}

function main() {
  if (existsSync(MAPPING_FILE) && !process.argv.includes("--force")) {
    console.error(`${MAPPING_FILE} already exists and may hold your edits. Pass --force to overwrite it.`);
    process.exit(1);
  }

  const { prodi } = loadExports();
  const groups = new Map<string, KodeGroup>();
  for (const p of prodi) {
    let g = groups.get(p.kodeProdi);
    if (!g) {
      g = { kodeProdi: p.kodeProdi, jenjang: new Set(), bidang: new Map(), names: new Map(), total: 0 };
      groups.set(p.kodeProdi, g);
    }
    g.total++;
    g.jenjang.add(p.jenjang);
    if (p.bidang) g.bidang.set(p.bidang, (g.bidang.get(p.bidang) ?? 0) + 1);
    const nama = cleanName(p.nama);
    const key = nama.toLowerCase();
    const n = g.names.get(key) ?? { total: 0, casings: new Map<string, number>() };
    n.total++;
    n.casings.set(nama, (n.casings.get(nama) ?? 0) + 1);
    g.names.set(key, n);
  }

  // The proposed Jurusan for a Kode is its most common cleaned name. Kode values
  // with the same name (any case) share one Jurusan, so its casing is chosen across all of them.
  const casingAcross = new Map<string, Map<string, number>>();
  for (const g of groups.values())
    for (const [key, n] of g.names) {
      const m = casingAcross.get(key) ?? new Map<string, number>();
      for (const [c, k] of n.casings) m.set(c, (m.get(c) ?? 0) + k);
      casingAcross.set(key, m);
    }

  const rows = [...groups.values()].map((g) => {
    const ranked = [...g.names].sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]));
    const [topKey, topName] = ranked[0];
    const usulan = top(casingAcross.get(topKey)!)[0];
    const agreement = topName.total / g.total;
    const perluCek = agreement < AGREEMENT_THRESHOLD || g.bidang.size > 1;
    return {
      kode_prodi: g.kodeProdi,
      jenjang: [...g.jenjang].sort().join(";"),
      bidang: [...g.bidang].sort((a, b) => b[1] - a[1]).map(([b]) => b).join(";"),
      jumlah_prodi: g.total,
      nama_teratas: ranked
        .slice(0, 3)
        .map(([, n]) => `${top(n.casings)[0]} (${n.total})`)
        .join("; "),
      kesepakatan: `${Math.round(agreement * 100)}%`,
      perlu_cek: perluCek ? "ya" : "",
      jurusan_usulan: usulan,
      jurusan: usulan,
    };
  });
  rows.sort(
    (a, b) =>
      a.bidang.localeCompare(b.bidang) ||
      a.jurusan_usulan.localeCompare(b.jurusan_usulan) ||
      a.kode_prodi.localeCompare(b.kode_prodi),
  );

  const sheet = XLSX.utils.json_to_sheet(rows);
  // BOM so Excel opens the file as UTF-8.
  writeFileSync(MAPPING_FILE, String.fromCharCode(0xfeff) + XLSX.utils.sheet_to_csv(sheet) + "\n");

  const jurusanCount = new Set(rows.map((r) => r.jurusan.toLowerCase())).size;
  console.log(`Wrote ${MAPPING_FILE}`);
  console.log(`  ${rows.length} Kode Prodi, ${prodi.length} Prodi`);
  console.log(`  ${jurusanCount} proposed Jurusan`);
  console.log(`  ${rows.filter((r) => r.perlu_cek).length} Kode flagged perlu_cek (agreement < ${AGREEMENT_THRESHOLD * 100}% or more than one bidang)`);
  console.log("Edit the `jurusan` column (blank = unmapped), then run: npm run catalogue:load-jurusan -- --dry-run");
}

main();
