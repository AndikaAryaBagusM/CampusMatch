// Imports every Sumber folder in data/fakta that the database doesn't have
// yet, as Draf, and stops at the first error. Folders come in dependency order
// (src/lib/fakta/urutan.ts): national Sumber first, and a folder after the one
// defining the Jalur Masuk its Biaya point at. Folders already in the database
// are skipped (re-import one with `npm run fakta:import`), so after fixing an
// error, run it again to continue.
//
//   npm run fakta:import-semua -- --oleh you@example.com --dry-run
//   npm run fakta:import-semua -- --oleh you@example.com [--allow-production]
//   npm run fakta:import-semua -- data/fakta/<kode> ... --oleh you@example.com   (only these folders)
import { config } from "dotenv";

config({ path: ".env.local" });

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { withDb, type Db } from "../src/db";
import { users } from "../src/db/schema";
import type { PaketSumber } from "../src/lib/fakta/baca";
import { ImporBerhenti, imporBanyak, type LangkahImpor } from "../src/lib/fakta/impor-banyak";
import { isModerator } from "../src/lib/moderator-email";
import { guardDatabase } from "./catalogue/guard";
import { bacaFolder } from "./fakta/baca-folder";

const AKAR = join("data", "fakta");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const oleh = args[args.indexOf("--oleh") + 1];
const folderDiminta = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--oleh");

function gagal(...baris: string[]): never {
  for (const b of baris) console.error(b);
  process.exit(1);
}

class UjiCoba extends Error {}

function cetak(l: LangkahImpor) {
  if (l.dilewati) return console.log(`  skipped   ${l.paket.kode} (already in the database)`);
  const { jumlah } = l.hasil;
  console.log(
    `  ${dryRun ? "would add" : "imported "} ${l.paket.kode}: Jalur Masuk ${jumlah.jalur}, Biaya ${jumlah.biaya}, Beasiswa ${jumlah.beasiswa}, national Beasiswa taken part in ${jumlah.beasiswaKampus}${l.paket.meta.arsipUrl ? "" : " (no arsip_url)"}`,
  );
}

async function main() {
  if (!args.includes("--oleh") || !oleh || oleh.startsWith("--"))
    gagal("Usage: npm run fakta:import-semua -- [data/fakta/<kode> ...] --oleh <moderator email> [--dry-run] [--allow-production]");
  if (!isModerator(oleh)) gagal(`${oleh} is not in MODERATOR_EMAILS.`);

  const folders = folderDiminta.length
    ? folderDiminta
    : readdirSync(AKAR)
        .filter((n) => !n.startsWith("_") && statSync(join(AKAR, n)).isDirectory())
        .map((n) => join(AKAR, n));

  // Read every folder before touching the database.
  const paket: PaketSumber[] = [];
  const salah: string[] = [];
  for (const f of folders) {
    const { kode, paket: p, galat } = bacaFolder(f);
    if (p) paket.push(p);
    else salah.push(`${kode}:`, ...galat.map((g) => `  ${g}`));
  }
  if (salah.length) gagal("Some folders have errors; fix them and re-run. Nothing was imported.", ...salah);

  if (dryRun) console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
  else guardDatabase(args);

  await withDb(async (db) => {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, oleh.trim().toLowerCase()));
    if (!user) gagal(`No account for ${oleh}: sign in to the app once first.`);

    console.log(`\n${paket.length} folder(s), in import order:`);
    try {
      // A dry run imports everything in one transaction, so later folders see
      // the earlier ones, then rolls it all back. A real run commits each
      // folder on its own.
      const diimpor = dryRun
        ? await db
            .transaction(async (tx) => {
              const n = await imporBanyak(tx as unknown as Db, paket, user.id, cetak);
              throw Object.assign(new UjiCoba(), { n });
            })
            .catch((e) => {
              if (e instanceof UjiCoba) return (e as UjiCoba & { n: number }).n;
              throw e;
            })
        : await imporBanyak(db, paket, user.id, cetak);

      console.log(`\n${dryRun ? "Would import" : "Imported"} ${diimpor} folder(s) as Draf.`);
      if (!dryRun && diimpor)
        console.log("Next: refresh the cached pages (npm run cache:segarkan), then a different Moderator checks them at /moderasi/fakta.");
    } catch (e) {
      if (!(e instanceof ImporBerhenti)) throw e;
      gagal(
        `\n${e.kode} was not imported:`,
        ...e.galat.map((g) => `  ${g}`),
        dryRun
          ? "\nDry run stopped here; nothing was written."
          : `\nStopped. The ${e.diimpor} folder(s) imported before it stay imported; fix ${e.kode} and run this again to continue.`,
      );
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
