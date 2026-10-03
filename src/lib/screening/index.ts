import { z } from "zod";
import type { TingkatRisiko } from "@/lib/ulasan/status";
import { lebihKetat, periksaDaftarKata } from "./daftar-kata";
import { pesanScreening, SYSTEM_PROMPT, type InputScreening } from "./prompt";

export { PROMPT_VERSI, type InputScreening } from "./prompt";

// What the model must return. Anything else is a failed attempt (fail-closed).
export const skemaHasilModel = z.object({
  tingkatRisiko: z.enum(["rendah", "perlu_dicek", "melanggar"]),
  alasan: z.string().trim().min(1).max(500),
});

export type HasilModel = z.infer<typeof skemaHasilModel>;

// The classifier behind Screening. The real one calls Claude; tests pass a mock.
export interface ScreeningModel {
  readonly id: string;
  klasifikasi(input: { system: string; pesan: string }): Promise<unknown>;
}

// A failure the round should not retry, e.g. a bad API key or a 400.
export class GagalPermanen extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GagalPermanen";
  }
}

export type HasilScreening =
  | { ok: true; tingkatRisiko: TingkatRisiko; alasan: string; model: string }
  | { ok: false; galat: string; model: string };

export type OpsiPutaran = {
  // Quick retries inside one round (ADR 0002): 2, after a short delay.
  ulangCepat?: number;
  jedaMs?: number;
  tidur?: (ms: number) => Promise<void>;
};

const tidurAsli = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// One Screening round: one attempt plus up to `ulangCepat` quick retries.
// Errors, timeouts and output that doesn't match the schema all fail the
// attempt; only a valid result returns ok. The wordlist can raise the model's
// verdict, never lower it.
export async function screenUlasan(
  input: InputScreening,
  model: ScreeningModel,
  { ulangCepat = 2, jedaMs = 1500, tidur = tidurAsli }: OpsiPutaran = {},
): Promise<HasilScreening> {
  const pesan = pesanScreening(input);
  let galat = "";
  for (let percobaan = 0; percobaan <= ulangCepat; percobaan++) {
    if (percobaan > 0) await tidur(jedaMs * percobaan);
    try {
      const mentah = await model.klasifikasi({ system: SYSTEM_PROMPT, pesan });
      const hasil = skemaHasilModel.safeParse(mentah);
      if (!hasil.success) {
        galat = "Keluaran model tidak sesuai skema.";
        continue;
      }
      const temuan = periksaDaftarKata(`${input.judul}\n${input.isi}`);
      const tingkatRisiko = temuan ? lebihKetat(hasil.data.tingkatRisiko, temuan.tingkatRisiko) : hasil.data.tingkatRisiko;
      const alasan =
        temuan && tingkatRisiko !== hasil.data.tingkatRisiko ? temuan.alasan : hasil.data.alasan;
      return { ok: true, tingkatRisiko, alasan, model: model.id };
    } catch (e) {
      galat = e instanceof Error ? e.message : String(e);
      if (e instanceof GagalPermanen) break;
    }
  }
  return { ok: false, galat: galat.slice(0, 500), model: model.id };
}
