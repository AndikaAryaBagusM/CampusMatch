import { inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { sumber } from "@/db/schema";
import type { PaketSumber } from "./baca";
import { FaktaDitolak, imporSumber, type HasilImpor } from "./impor";
import { urutkanPaket } from "./urutan";

export type LangkahImpor = { paket: PaketSumber } & ({ dilewati: true } | { dilewati: false; hasil: HasilImpor });

// The import refused folder `kode`; the `diimpor` folders before it were imported.
export class ImporBerhenti extends Error {
  constructor(
    readonly kode: string,
    readonly galat: string[],
    readonly diimpor: number,
  ) {
    super(`${kode}: ${galat.join("\n")}`);
    this.name = "ImporBerhenti";
  }
}

// Imports many Sumber as Draf in dependency order (urutkanPaket), each in its
// own transaction. Sumber whose kode is already in the database are skipped:
// re-importing one whose Jalur Masuk other Sumber use is refused anyway.
// Stops at the first folder the import refuses. Returns how many it imported.
export async function imporBanyak(
  db: Db,
  paket: PaketSumber[],
  moderatorId: string,
  setiapLangkah: (langkah: LangkahImpor) => void = () => {},
): Promise<number> {
  const urut = urutkanPaket(paket);
  if (!urut.length) return 0;
  const ada = await db.select({ kode: sumber.kode }).from(sumber).where(inArray(sumber.kode, urut.map((p) => p.kode)));
  const sudahAda = new Set(ada.map((s) => s.kode));

  let diimpor = 0;
  for (const p of urut) {
    if (sudahAda.has(p.kode)) {
      setiapLangkah({ paket: p, dilewati: true });
      continue;
    }
    try {
      const hasil = await imporSumber(db, p, moderatorId);
      diimpor++;
      setiapLangkah({ paket: p, dilewati: false, hasil });
    } catch (e) {
      if (e instanceof FaktaDitolak) throw new ImporBerhenti(p.kode, e.galat, diimpor);
      throw e;
    }
  }
  return diimpor;
}
