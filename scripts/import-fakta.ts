// Imports one Sumber folder of Biaya & Masuk facts as Draf (ADR 0006). A
// different Moderator then checks them at /moderasi/fakta before they show.
// The folder format is in data/fakta/README.md.
//
//   npm run fakta:import -- data/fakta/<kode> --oleh you@example.com --dry-run
//   npm run fakta:import -- data/fakta/<kode> --oleh you@example.com [--allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { withDb, type Db } from "../src/db";
import { users } from "../src/db/schema";
import { FaktaDitolak, imporSumber } from "../src/lib/fakta/impor";
import { isModerator } from "../src/lib/moderator-email";
import { guardDatabase } from "./catalogue/guard";
import { bacaFolder } from "./fakta/baca-folder";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const folder = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--oleh");
const oleh = args[args.indexOf("--oleh") + 1];

function gagal(...baris: string[]): never {
  for (const b of baris) console.error(b);
  process.exit(1);
}

class UjiCoba extends Error {}

async function main() {
  if (!folder || !args.includes("--oleh") || !oleh)
    gagal("Usage: npm run fakta:import -- data/fakta/<kode> --oleh <moderator email> [--dry-run] [--allow-production]");
  if (!isModerator(oleh)) gagal(`${oleh} is not in MODERATOR_EMAILS.`);

  const { kode, paket, galat } = bacaFolder(folder);
  if (!paket) gagal(`${kode} has errors; fix them and re-run:`, ...galat.map((g) => `  ${g}`));

  if (dryRun) console.log(`Target database: ${new URL(process.env.DATABASE_URL ?? "").host} (dry run, nothing is written)`);
  else guardDatabase(args);

  await withDb(async (db) => {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, oleh.trim().toLowerCase()));
    if (!user) gagal(`No account for ${oleh}: sign in to the app once first.`);

    try {
      // A dry run does the whole import, then rolls it back.
      const hasil = await db
        .transaction(async (tx) => {
          const h = await imporSumber(tx as unknown as Db, paket, user.id);
          if (dryRun) throw Object.assign(new UjiCoba(), { hasil: h });
          return h;
        })
        .catch((e) => {
          if (e instanceof UjiCoba) return (e as UjiCoba & { hasil: Awaited<ReturnType<typeof imporSumber>> }).hasil;
          throw e;
        });

      const { jumlah } = hasil;
      console.log(
        `\n${dryRun ? "Would import" : "Imported"} "${kode}" as Draf (${hasil.baru ? "new Sumber" : "replacing its Draf facts"}):`,
      );
      console.log(`  Jalur Masuk ${jumlah.jalur}, Biaya ${jumlah.biaya}, Beasiswa ${jumlah.beasiswa}, national Beasiswa taken part in ${jumlah.beasiswaKampus}`);
      if (hasil.catatanSebelumnya) console.log(`  The checker had sent it back: "${hasil.catatanSebelumnya}"`);
      if (!paket.meta.arsipUrl)
        console.log("  No arsip_url: the checker must give a reason for accepting a Sumber without a Wayback copy.");
      if (!dryRun) console.log("\nNext: a different Moderator checks it at /moderasi/fakta.");
    } catch (e) {
      if (e instanceof FaktaDitolak) gagal(`${kode} was not imported:`, ...e.galat.map((g) => `  ${g}`));
      throw e;
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
