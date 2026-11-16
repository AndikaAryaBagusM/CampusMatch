// Loads the reviewed data/jurusan-deskripsi.csv into jurusan.deskripsi: the
// short text at the top of each Jurusan page. A Jurusan missing from the file
// keeps what it has; a blank `deskripsi` clears it. The Jurusan page renders
// per request, so no cache needs refreshing afterwards.
//
//   npm run jurusan:load-deskripsi -- --dry-run
//   npm run jurusan:load-deskripsi [-- --allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { existsSync } from "node:fs";
import { eq } from "drizzle-orm";
import { withDb } from "../src/db";
import { jurusan } from "../src/db/schema";
import { clean, readRows } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

const FILE = "data/jurusan-deskripsi.csv";
// Long enough to say what is studied and where graduates work; short enough to stay above the Prodi list.
const MAKS = 320;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function main() {
  if (!existsSync(FILE)) {
    console.error(`${FILE} not found.`);
    process.exit(1);
  }
  const galat: string[] = [];
  const deskripsiPerJurusan = new Map<string, string | null>();
  readRows(FILE, ["jurusan", "deskripsi"]).forEach((r, i) => {
    const nama = clean(r.jurusan);
    const teks = clean(r.deskripsi);
    if (!nama) return galat.push(`row ${i + 2}: jurusan is blank`);
    if (teks.length > MAKS) galat.push(`row ${i + 2}: "${nama}" is ${teks.length} characters (at most ${MAKS})`);
    if (deskripsiPerJurusan.has(nama)) galat.push(`row ${i + 2}: "${nama}" appears twice`);
    deskripsiPerJurusan.set(nama, teks || null);
  });
  if (galat.length) {
    console.error(`${FILE} has errors; fix them and re-run:`);
    for (const g of galat) console.error(`  ${g}`);
    process.exit(1);
  }
  if (dryRun) console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
  else guardDatabase(args);

  await withDb(async (db) => {
    const semua = await db.select({ id: jurusan.id, nama: jurusan.nama, deskripsi: jurusan.deskripsi }).from(jurusan);
    const perNama = new Map(semua.map((j) => [j.nama, j]));
    const tidakAda = [...deskripsiPerJurusan.keys()].filter((n) => !perNama.has(n));
    if (tidakAda.length) {
      console.error(`No Jurusan named: ${tidakAda.join(", ")}`);
      process.exit(1);
    }
    const berubah = [...deskripsiPerJurusan].filter(([nama, teks]) => perNama.get(nama)!.deskripsi !== teks);
    // What each Jurusan ends up with: the file's text if it is in the file, else what it has now.
    const tanpa = semua.filter((j) => !(deskripsiPerJurusan.has(j.nama) ? deskripsiPerJurusan.get(j.nama) : j.deskripsi));
    console.log(`${deskripsiPerJurusan.size} Jurusan in the file, ${berubah.length} to change, ${tanpa.length} Jurusan left without a description.`);
    for (const j of tanpa) console.log(`  no description: ${j.nama}`);
    if (dryRun || berubah.length === 0) return;

    await db.transaction(async (tx) => {
      for (const [nama, teks] of berubah) await tx.update(jurusan).set({ deskripsi: teks }).where(eq(jurusan.id, perNama.get(nama)!.id));
    });
    console.log("Loaded.");
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
