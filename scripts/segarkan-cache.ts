// Refreshes a deployed site's cached pages after an import changed what they
// show (catalogue:import, kampus:load-qs, catalogue:load-jurusan). Cached
// Prodi and Kampus pages otherwise update only every 7 days or on the next
// deployment. Each page re-renders on its next visit (decisions.md 15).
//
//   CRON_SECRET=<that site's secret> npm run cache:segarkan -- --url https://<site>
//
// Without CRON_SECRET in the environment, the one in .env.local is used, which
// only matches a local or dev server.
import { config } from "dotenv";

config({ path: ".env.local" });

const args = process.argv.slice(2);
const urlArg = args.indexOf("--url");
const url = urlArg === -1 ? null : args[urlArg + 1];

function gagal(...baris: string[]): never {
  for (const b of baris) console.error(b);
  process.exit(1);
}

async function main() {
  if (!url || !/^https?:\/\//.test(url)) gagal("Usage: npm run cache:segarkan -- --url https://<site>");
  const secret = process.env.CRON_SECRET;
  if (!secret) gagal("CRON_SECRET is not set.");
  const tujuan = new URL("/api/segarkan-cache", url);
  console.log(`Refreshing cached pages on ${tujuan.origin}`);
  const res = await fetch(tujuan, { method: "POST", headers: { authorization: `Bearer ${secret}` } });
  if (res.status === 401) gagal("Refused: CRON_SECRET doesn't match that site's.");
  if (!res.ok) gagal(`Failed: HTTP ${res.status}`);
  console.log("Done. Cached Prodi and Kampus pages, the home page and /kota re-render on their next visit.");
}

main().catch((e) => gagal(String(e)));
