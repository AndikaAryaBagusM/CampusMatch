// Loads campus email domains from the reviewed data/domain-kampus.csv into
// kampus.domain_email (decisions.md 17o). Only the `domain` column counts:
// the team fills it after checking each Kampus's official site.
//
//   npm run kampus:load-domain -- --dry-run
//   npm run kampus:load-domain [-- --allow-production]
//   npm run kampus:load-domain -- --usulan   (development only: also loads the
//                                              unchecked domain_usulan column)
import { config } from "dotenv";

config({ path: ".env.local" });

import { inArray } from "drizzle-orm";
import { withDb } from "../src/db";
import { kampus } from "../src/db/schema";
import { bacaDomain } from "../src/lib/akun/domain-kampus";
import { readRows } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

const FILE = "data/domain-kampus.csv";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const usulan = args.includes("--usulan");

async function main() {
  if (usulan && process.env.DB_ENV !== "development") {
    console.error("--usulan loads unchecked domains and is only allowed when DB_ENV=development.");
    process.exit(1);
  }
  const { baris, galat } = bacaDomain(readRows(FILE, ["npsn", "domain_usulan", "domain"]), usulan);
  if (galat.length) {
    console.error(`${FILE} has errors; fix them and re-run:`);
    for (const g of galat) console.error(`  ${g}`);
    process.exit(1);
  }
  if (dryRun) console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
  else guardDatabase(args);

  await withDb(async (db) => {
    const ada = new Set(
      (await db.select({ npsn: kampus.npsn }).from(kampus).where(inArray(kampus.npsn, baris.map((b) => b.npsn)))).map((k) => k.npsn),
    );
    const hilang = baris.filter((b) => !ada.has(b.npsn));
    if (hilang.length) {
      console.error(`No Kampus with NPSN: ${hilang.map((b) => b.npsn).join(", ")}`);
      process.exit(1);
    }
    console.log(`${baris.length} Kampus domains${usulan ? " (including unchecked proposals)" : ""}.`);
    if (dryRun) return;
    await db.transaction(async (tx) => {
      // Clear first, so a domain can move between Kampus without hitting the unique index.
      await tx.update(kampus).set({ domainEmail: null }).where(inArray(kampus.npsn, baris.map((b) => b.npsn)));
      for (const b of baris) await tx.update(kampus).set({ domainEmail: b.domain }).where(inArray(kampus.npsn, [b.npsn]));
    });
    console.log("Loaded.");
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
