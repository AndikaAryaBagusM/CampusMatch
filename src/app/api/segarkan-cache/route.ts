import { revalidatePath } from "next/cache";
import { berwenangCron } from "@/lib/rahasia-cron";

// Marks every cached page stale after an import run outside the app (the
// catalogue, the Peringkat QS, the Jurusan mapping), which the app can't see.
// Each page re-renders on its next visit; only pages whose output changed cost
// an ISR write. Called by `npm run cache:segarkan` (decisions.md 15).
export async function POST(request: Request) {
  if (!berwenangCron(request)) return new Response("Unauthorized", { status: 401 });
  for (const pola of ["/prodi/[slug]", "/kampus/[slug]", "/kampus/[slug]/ulasan"]) revalidatePath(pola, "page");
  revalidatePath("/");
  revalidatePath("/kota");
  return Response.json({ disegarkan: true });
}
