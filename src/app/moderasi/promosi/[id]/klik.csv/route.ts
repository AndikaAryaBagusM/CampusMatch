import { notFound } from "next/navigation";
import { withDb } from "@/db";
import { requireModerator } from "@/lib/moderator";
import { getPromosi, klikCsv } from "@/lib/promosi";

// A Promosi's daily clicks as CSV, the report a Moderator sends the
// Pengiklan (decisions.md 17r). Moderators only; anyone else gets a 404.
export async function GET(_req: Request, ctx: RouteContext<"/moderasi/promosi/[id]/klik.csv">) {
  await requireModerator();
  const id = Number((await ctx.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const p = await withDb((db) => getPromosi(db, id));
  if (!p) notFound();
  return new Response(klikCsv(p.klik), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="promosi-${id}-klik.csv"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
