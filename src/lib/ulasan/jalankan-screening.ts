import { after } from "next/server";
import { withDb } from "@/db";
import { modelClaude } from "@/lib/screening/model-claude";
import { prosesScreening } from "./proses-screening";
import { revalidasiHalamanUlasan } from "./revalidasi";

// One Screening round with the real model, then revalidation if the live
// revision changed. Never throws: a failure leaves the revision Menunggu for
// the cron (fail-closed).
export async function jalankanScreening(revisiId: string) {
  try {
    const hasil = await withDb((db) => prosesScreening(db, revisiId, modelClaude()));
    if (hasil.diproses && hasil.liveBerubah) revalidasiHalamanUlasan(hasil.target);
    return hasil;
  } catch (e) {
    console.error("Screening gagal dijalankan", { revisiId, e });
    return { diproses: false as const };
  }
}

// Round 1 runs after the response is sent, so the Pengulas isn't kept waiting.
export function screeningSetelahRespons(revisiId: string) {
  after(() => jalankanScreening(revisiId));
}
