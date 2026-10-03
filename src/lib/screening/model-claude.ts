import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GagalPermanen, skemaHasilModel, type ScreeningModel } from "./index";

// Claude Haiku 4.5, the model ADR 0002 and decisions.md 15 name.
export const MODEL_SCREENING_DEFAULT = "claude-haiku-4-5-20251001";

// SDK retries are off: the Screening round does its own quick retries and
// counts them (ADR 0002).
export function modelClaude(): ScreeningModel {
  const id = process.env.SCREENING_MODEL || MODEL_SCREENING_DEFAULT;
  const client = new Anthropic({ timeout: 20_000, maxRetries: 0 });
  return {
    id,
    async klasifikasi({ system, pesan }) {
      try {
        const response = await client.messages.parse({
          model: id,
          max_tokens: 512,
          system,
          messages: [{ role: "user", content: pesan }],
          output_config: { format: zodOutputFormat(skemaHasilModel) },
        });
        if (response.stop_reason === "refusal") throw new Error("Model menolak mengklasifikasi.");
        // null when the output didn't parse; the round treats that as a failure.
        return response.parsed_output;
      } catch (e) {
        // 4xx other than timeout, conflict and rate limit won't fix themselves.
        if (
          e instanceof Anthropic.APIError &&
          e.status !== undefined &&
          e.status >= 400 &&
          e.status < 500 &&
          ![408, 409, 429].includes(e.status)
        ) {
          throw new GagalPermanen(`Anthropic API ${e.status}: ${e.message}`, { cause: e });
        }
        throw e;
      }
    },
  };
}
