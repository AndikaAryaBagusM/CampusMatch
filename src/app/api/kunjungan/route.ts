import { withDb } from "@/db";
import { BOT, catatKunjungan, jalurTercatat, kelompokAsal } from "@/lib/kunjungan";
import { ASAL_SITUS } from "@/lib/situs";

const KOSONG = () => new Response(null, { status: 204 });

// Counts one page view (decisions.md 17t). The browser sends the pathname and
// the referrer; only the pathname, a referrer group and today's date are kept,
// as a total. The IP address is not read. Always 204, so nothing can be learnt
// from the answer.
export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return KOSONG();
  let data: { j?: unknown; r?: unknown };
  try {
    data = JSON.parse((await request.text()).slice(0, 2000));
  } catch {
    return KOSONG();
  }
  const jalur = jalurTercatat(data?.j);
  if (!jalur) return KOSONG();
  const asal = kelompokAsal(data.r, new URL(ASAL_SITUS).hostname);
  try {
    await withDb((db) => catatKunjungan(db, { jalur, asal }));
  } catch (e) {
    console.error("Kunjungan tidak tercatat", e);
  }
  return KOSONG();
}
