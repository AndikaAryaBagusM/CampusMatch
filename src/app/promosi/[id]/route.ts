import { notFound, redirect } from "next/navigation";
import { withDb } from "@/db";
import { catatKlik } from "@/lib/promosi";

// A click on a Promosi: add one to today's total (only while it shows), then
// go to the Kampus's page. Nothing about the visitor is stored (ADR 0009).
export async function GET(_req: Request, ctx: RouteContext<"/promosi/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const slug = await withDb((db) => catatKlik(db, id));
  if (!slug) notFound();
  redirect(`/kampus/${slug}`);
}
