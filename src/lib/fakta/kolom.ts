import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

// Any fact table: jalur_masuk, biaya, beasiswa or beasiswa_kampus.
type TabelFakta = { sumberId: AnyPgColumn; status: AnyPgColumn };

// A Sumber's Draf facts in one fact table.
export function drafSumber(t: TabelFakta, sumberId: number): SQL {
  return and(eq(t.sumberId, sumberId), eq(t.status, "draf"))!;
}
