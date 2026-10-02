// Loads the reviewed data/jurusan-mapping.csv: creates the Jurusan named in the
// `jurusan` column and maps each Kode Prodi to it. A blank `jurusan` leaves the
// Kode unmapped. Mappings a Moderator changed (diubah_oleh set) are never touched.
//
//   npm run catalogue:load-jurusan -- --dry-run
//   npm run catalogue:load-jurusan [-- --allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { existsSync } from "node:fs";
import { inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { withDb } from "../src/db";
import { jurusan, kodeProdiJurusan, prodi } from "../src/db/schema";
import { clean, MAPPING_FILE, readRows, Report, slugify } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function readMapping(): Map<string, string> {
  if (!existsSync(MAPPING_FILE)) {
    console.error(`${MAPPING_FILE} not found. Run npm run catalogue:propose-jurusan first.`);
    process.exit(1);
  }
  const mapping = new Map<string, string>();
  const errors: string[] = [];
  const byFolded = new Map<string, string>();
  for (const r of readRows(MAPPING_FILE, ["kode_prodi", "jurusan"])) {
    const kode = clean(r.kode_prodi);
    const nama = clean(r.jurusan);
    if (!kode) continue;
    if (mapping.has(kode)) errors.push(`Kode ${kode} appears more than once`);
    mapping.set(kode, nama);
    if (!nama) continue;
    const folded = nama.toLowerCase();
    const other = byFolded.get(folded);
    if (other && other !== nama) errors.push(`Jurusan "${nama}" and "${other}" differ only in case`);
    byFolded.set(folded, nama);
  }
  if (errors.length) {
    console.error(`${MAPPING_FILE} has errors; fix them and re-run:`);
    for (const e of new Set(errors)) console.error(`  ${e}`);
    process.exit(1);
  }
  return mapping;
}

async function main() {
  const report = new Report();
  const mapping = readMapping();
  if (!dryRun) guardDatabase(args);

  await withDb(async (db) => {
    const kodeInProdi = new Set(
      (await db.selectDistinct({ kode: prodi.kodeProdi }).from(prodi)).map((r) => r.kode),
    );
    if (kodeInProdi.size === 0) {
      console.error("The prodi table is empty. Run npm run catalogue:import first.");
      process.exit(1);
    }
    const jurusanDb = await db.select().from(jurusan);
    const mappingDb = new Map(
      (await db.select().from(kodeProdiJurusan)).map((m) => [m.kodeProdi, m]),
    );

    for (const kode of mapping.keys())
      if (!kodeInProdi.has(kode)) report.note("Kode in CSV but not in prodi (ignored)", kode);
    const missing = [...kodeInProdi].filter((k) => !mapping.has(k));
    for (const k of missing) report.note("Kode in prodi but not in CSV (left as is)", k);

    // Jurusan to create.
    const jurusanId = new Map(jurusanDb.map((j) => [j.nama, j.id]));
    const takenSlugs = new Set(jurusanDb.map((j) => j.slug));
    const wanted = new Set([...mapping].filter(([k, n]) => n && kodeInProdi.has(k)).map(([, n]) => n));
    const newJurusan = [...wanted]
      .filter((n) => !jurusanId.has(n))
      .sort()
      .map((nama) => {
        let slug = slugify(nama);
        for (let i = 2; takenSlugs.has(slug); i++) slug = `${slugify(nama)}-${i}`;
        takenSlugs.add(slug);
        return { nama, slug };
      });

    // Mapping changes.
    let unchanged = 0;
    const upserts: { kodeProdi: string; nama: string }[] = [];
    const removals: string[] = [];
    for (const [kode, nama] of mapping) {
      if (!kodeInProdi.has(kode)) continue;
      const prev = mappingDb.get(kode);
      if (prev?.diubahOleh) {
        const prevNama = jurusanDb.find((j) => j.id === prev.jurusanId)?.nama;
        if (prevNama !== nama)
          report.note("Kode changed by a Moderator (CSV ignored)", `${kode}: kept "${prevNama}", CSV "${nama}"`);
        continue;
      }
      if (!nama) {
        if (prev) removals.push(kode);
        continue;
      }
      if (prev && prev.jurusanId === jurusanId.get(nama)) unchanged++;
      else upserts.push({ kodeProdi: kode, nama });
    }

    // Jurusan that end up with no Kode and no per-Prodi override are reported, not deleted.
    const finalTargets = new Map<string, string>();
    for (const [kode, m] of mappingDb) {
      const nama = jurusanDb.find((j) => j.id === m.jurusanId)?.nama;
      if (nama) finalTargets.set(kode, nama);
    }
    for (const k of removals) finalTargets.delete(k);
    for (const u of upserts) finalTargets.set(u.kodeProdi, u.nama);
    const overrideIds = new Set(
      (await db.selectDistinct({ id: prodi.jurusanOverrideId }).from(prodi).where(isNotNull(prodi.jurusanOverrideId))).map((r) => r.id),
    );
    const used = new Set(finalTargets.values());
    for (const j of jurusanDb)
      if (!used.has(j.nama) && !overrideIds.has(j.id)) report.note("Jurusan with no Kode Prodi (kept)", j.nama);

    const mappedKode = [...finalTargets.keys()].filter((k) => kodeInProdi.has(k)).length;
    console.log(`Jurusan: ${newJurusan.length} new, ${jurusanDb.length} existing, ${used.size} in use`);
    console.log(`Kode Prodi mappings: ${upserts.length} to insert/update, ${removals.length} to remove, ${unchanged} unchanged`);
    console.log(`Kode Prodi mapped: ${mappedKode} of ${kodeInProdi.size} (the rest stay unmapped)`);
    report.print();

    if (dryRun) {
      console.log("\nDry run: nothing was written.");
      return;
    }

    await db.transaction(async (tx) => {
      if (newJurusan.length) {
        const rows = await tx.insert(jurusan).values(newJurusan).returning({ id: jurusan.id, nama: jurusan.nama });
        for (const r of rows) jurusanId.set(r.nama, r.id);
      }
      if (upserts.length)
        await tx
          .insert(kodeProdiJurusan)
          .values(upserts.map((u) => ({ kodeProdi: u.kodeProdi, jurusanId: jurusanId.get(u.nama)! })))
          .onConflictDoUpdate({
            target: kodeProdiJurusan.kodeProdi,
            set: { jurusanId: sql`excluded.jurusan_id`, updatedAt: sql`now()` },
            setWhere: isNull(kodeProdiJurusan.diubahOleh),
          });
      if (removals.length) await tx.delete(kodeProdiJurusan).where(inArray(kodeProdiJurusan.kodeProdi, removals));
    });
    console.log("\nLoaded.");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
