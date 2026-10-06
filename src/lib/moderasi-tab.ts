import type { Db } from "@/db";
import type { JumlahModerasi } from "@/components/moderasi/tab-moderasi";
import { hitungSumberDraf } from "@/lib/fakta/periksa";
import { hitungPromosiDraf } from "@/lib/promosi";
import { hitungAntrean } from "@/lib/ulasan/moderasi";

// The counts on the Moderator area's tabs.
export async function hitungTabModerasi(db: Db): Promise<JumlahModerasi> {
  const [antrean, fakta, promosi] = await Promise.all([hitungAntrean(db), hitungSumberDraf(db), hitungPromosiDraf(db)]);
  return { ...antrean, fakta, promosi };
}
