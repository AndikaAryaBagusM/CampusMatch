// Loads one edition of the QS World University Rankings into peringkat_qs
// (ADR 0011): the Indonesian entries copied by hand into data/raw/, matched to
// our Kampus through the reviewed data/qs-kampus.csv. Safe to re-run.
//
//   npm run kampus:load-qs -- --dry-run
//   npm run kampus:load-qs [-- --file data/raw/qs-wur-2027-indonesia.json] [--allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { withDb } from "../src/db";
import { bacaQs } from "../src/lib/peringkat-qs/baca";
import { muatPeringkatQs, PeringkatQsDitolak } from "../src/lib/peringkat-qs/muat";
import { readRows } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

const COCOK_FILE = "data/qs-kampus.csv";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileArg = args.indexOf("--file");
const file = fileArg === -1 ? "data/raw/qs-wur-2027-indonesia.json" : args[fileArg + 1];

function gagal(...baris: string[]): never {
  for (const b of baris) console.error(b);
  process.exit(1);
}

async function main() {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    gagal(`Cannot read ${file}: ${(e as Error).message}`);
  }
  const { edisi, galat } = bacaQs(json, readRows(COCOK_FILE, ["nama_qs", "npsn"]));
  if (!edisi) gagal(`${file} or ${COCOK_FILE} has errors; fix them and re-run:`, ...galat.map((g) => `  ${g}`));

  console.log(`QS World University Rankings ${edisi.edisi}: ${edisi.entri.length} entries, taken ${edisi.tanggalAmbil}`);
  console.log(`  ${edisi.sumberUrl}`);
  if (dryRun) {
    console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
    return;
  }
  guardDatabase(args);
  const hasil = await withDb((db) => muatPeringkatQs(db, edisi));
  console.log(`Loaded: ${hasil.ditambah} added, ${hasil.diubah} updated, ${hasil.tetap} unchanged, ${hasil.dihapus} removed.`);
}

main().catch((e) => {
  if (e instanceof PeringkatQsDitolak) gagal(e.message);
  console.error(e);
  process.exit(1);
});
