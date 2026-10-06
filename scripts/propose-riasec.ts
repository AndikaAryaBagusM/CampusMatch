// Proposes a Kode RIASEC per Jurusan from data/riasec/jurusan-onet.csv (the
// O*NET® occupations each Jurusan typically leads to) and the O*NET 31.0
// interest ratings in data/riasec/onet-31-0-minat.csv, as a CSV for review.
// Edit the `kode` column (2–3 letters, most important first; blank = none),
// then run `npm run riasec:load`. Re-running keeps `kode` edits that differ
// from the old proposal.
//
//   npm run riasec:propose
import { config } from "dotenv";

config({ path: ".env.local" });

import { existsSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { withDb } from "../src/db";
import { jurusan } from "../src/db/schema";
import { TIPE, type Tipe } from "../src/lib/riasec/item";
import { usulkanKode, type RatingOnet } from "../src/lib/riasec/usulan";
import { clean, readRows } from "./catalogue/exports";

export const PEMETAAN_FILE = "data/riasec/jurusan-onet.csv";
export const ONET_FILE = "data/riasec/onet-31-0-minat.csv";
export const KODE_FILE = "data/riasec/kode-riasec.csv";

async function main() {
  const onet = new Map(
    readRows(ONET_FILE, ["onet_soc", "title", ...TIPE]).map((r) => [
      clean(r.onet_soc),
      { title: clean(r.title), rating: Object.fromEntries(TIPE.map((t) => [t, Number(r[t])])) as RatingOnet },
    ]),
  );

  // Edits made in an earlier kode-riasec.csv survive a re-run.
  const editLama = new Map<string, string>();
  if (existsSync(KODE_FILE))
    for (const r of readRows(KODE_FILE, ["jurusan", "kode", "usulan"]))
      if (clean(r.kode) !== clean(r.usulan)) editLama.set(clean(r.jurusan), clean(r.kode).toUpperCase());

  const namaJurusan = new Set((await withDb((db) => db.select({ nama: jurusan.nama }).from(jurusan))).map((j) => j.nama));
  const galat: string[] = [];
  const baris: Record<string, string>[] = [];
  const terpetakan = new Set<string>();

  readRows(PEMETAAN_FILE, ["jurusan", "onet_soc"]).forEach((r, i) => {
    const nama = clean(r.jurusan);
    const kode = clean(r.onet_soc).split(/[\s;]+/).filter(Boolean);
    const lokasi = `${PEMETAAN_FILE} row ${i + 2}`;
    const sebelum = galat.length;
    if (!namaJurusan.has(nama)) galat.push(`${lokasi}: no Jurusan named "${nama}"`);
    if (terpetakan.has(nama)) galat.push(`${lokasi}: "${nama}" appears twice`);
    terpetakan.add(nama);
    const tidakAda = kode.filter((k) => !onet.has(k));
    if (kode.length === 0 || kode.length > 3) galat.push(`${lokasi}: give 1–3 O*NET-SOC codes`);
    if (tidakAda.length) galat.push(`${lokasi}: unknown O*NET-SOC code(s) ${tidakAda.join(", ")}`);
    if (galat.length > sebelum) return;

    const { kode: usulan, rataRata } = usulkanKode(kode.map((k) => onet.get(k)!.rating));
    const usulanTeks = usulan.join("");
    baris.push({
      jurusan: nama,
      kode: editLama.get(nama) ?? usulanTeks,
      usulan: usulanTeks,
      ...Object.fromEntries(TIPE.map((t: Tipe) => [`rata_${t}`, rataRata[t].toFixed(2)])),
      onet: kode.map((k) => `${k} ${onet.get(k)!.title}`).join("; "),
    });
  });
  for (const nama of namaJurusan) if (!terpetakan.has(nama)) galat.push(`Jurusan "${nama}" is not in ${PEMETAAN_FILE}`);

  if (galat.length) {
    console.error("Fix these and re-run:");
    for (const g of galat) console.error(`  ${g}`);
    process.exit(1);
  }
  baris.sort((a, b) => a.jurusan.localeCompare(b.jurusan, "id"));
  const sheet = XLSX.utils.json_to_sheet(baris);
  writeFileSync(KODE_FILE, String.fromCharCode(0xfeff) + XLSX.utils.sheet_to_csv(sheet) + "\n");
  const diubah = baris.filter((b) => b.kode !== b.usulan).length;
  console.log(`Wrote ${KODE_FILE}: ${baris.length} Jurusan, ${diubah} with an edited kode kept.`);
  console.log("Review the `kode` column, then run npm run riasec:load.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
