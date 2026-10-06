// Loads the reviewed data/riasec/kode-riasec.csv into kode_riasec: each
// Jurusan's types are replaced by the `kode` column (2–3 letters, most
// important first). A blank `kode` removes that Jurusan's Kode RIASEC.
//
//   npm run riasec:load -- --dry-run
//   npm run riasec:load [-- --allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { existsSync } from "node:fs";
import { inArray } from "drizzle-orm";
import { withDb } from "../src/db";
import { jurusan, kodeRiasec } from "../src/db/schema";
import { parseKode } from "../src/lib/riasec/usulan";
import { clean, readRows } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

const KODE_FILE = "data/riasec/kode-riasec.csv";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function main() {
  if (!existsSync(KODE_FILE)) {
    console.error(`${KODE_FILE} not found. Run npm run riasec:propose first.`);
    process.exit(1);
  }
  const galat: string[] = [];
  const kodePerJurusan = new Map<string, ReturnType<typeof parseKode>>();
  readRows(KODE_FILE, ["jurusan", "kode"]).forEach((r, i) => {
    const nama = clean(r.jurusan);
    const teks = clean(r.kode);
    const kode = teks ? parseKode(teks) : null;
    if (teks && !kode) galat.push(`row ${i + 2}: kode "${teks}" must be 2–3 different letters of RIASEC`);
    if (kodePerJurusan.has(nama)) galat.push(`row ${i + 2}: "${nama}" appears twice`);
    kodePerJurusan.set(nama, kode);
  });
  if (galat.length) {
    console.error(`${KODE_FILE} has errors; fix them and re-run:`);
    for (const g of galat) console.error(`  ${g}`);
    process.exit(1);
  }
  if (dryRun) console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
  else guardDatabase(args);

  await withDb(async (db) => {
    const semua = await db.select({ id: jurusan.id, nama: jurusan.nama }).from(jurusan);
    const idPerNama = new Map(semua.map((j) => [j.nama, j.id]));
    const tidakAda = [...kodePerJurusan.keys()].filter((n) => !idPerNama.has(n));
    if (tidakAda.length) {
      console.error(`No Jurusan named: ${tidakAda.join(", ")}`);
      process.exit(1);
    }
    const dengan = [...kodePerJurusan].filter(([, k]) => k);
    console.log(`${dengan.length} Jurusan with a Kode RIASEC, ${kodePerJurusan.size - dengan.length} blank.`);
    if (dryRun) return;

    await db.transaction(async (tx) => {
      const ids = [...kodePerJurusan.keys()].map((n) => idPerNama.get(n)!);
      await tx.delete(kodeRiasec).where(inArray(kodeRiasec.jurusanId, ids));
      const nilai = dengan.flatMap(([nama, kode]) =>
        kode!.map((tipe, i) => ({ jurusanId: idPerNama.get(nama)!, urutan: i + 1, tipe })),
      );
      if (nilai.length) await tx.insert(kodeRiasec).values(nilai);
    });
    console.log("Loaded.");
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
