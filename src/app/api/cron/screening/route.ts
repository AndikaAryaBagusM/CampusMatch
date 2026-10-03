import { timingSafeEqual } from "node:crypto";
import { withDb } from "@/db";
import { hapusBatasLama } from "@/lib/batas-laju";
import { jalankanScreening } from "@/lib/ulasan/jalankan-screening";
import { revisiMenungguLama } from "@/lib/ulasan/proses-screening";

// Each round can take up to three model calls and their delays.
export const maxDuration = 300;

function berwenang(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Vercel Cron: one more Screening round for every Menunggu revision older than
// 10 minutes (ADR 0002). Revisions are screened one at a time; each is locked
// with SKIP LOCKED, so an overlapping run or a late after() can't double-screen.
export async function GET(request: Request) {
  if (!berwenang(request)) return new Response("Unauthorized", { status: 401 });

  const ids = await withDb(async (db) => {
    await hapusBatasLama(db);
    return revisiMenungguLama(db);
  });
  const hasil = { dicoba: ids.length, terbit: 0, ditinjau: 0, menunggu: 0, dilewati: 0 };
  for (const id of ids) {
    const h = await jalankanScreening(id);
    if (!h.diproses) hasil.dilewati++;
    else hasil[h.status === "terbit" ? "terbit" : h.status === "ditinjau" ? "ditinjau" : "menunggu"]++;
  }
  return Response.json(hasil);
}
