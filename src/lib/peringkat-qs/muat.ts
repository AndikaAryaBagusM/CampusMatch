import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, peringkatQs } from "@/db/schema";
import type { EdisiQs } from "./baca";

// Writes one QS edition to peringkat_qs (ADR 0011). The file is the whole
// edition: entries are upserted on (kampus, edisi), and rows of that edition
// whose Kampus is no longer listed are removed. Other editions are kept as
// history. Running it twice changes nothing.

export class PeringkatQsDitolak extends Error {}

export type HasilMuat = { ditambah: number; diubah: number; tetap: number; dihapus: number };

export async function muatPeringkatQs(db: Db, data: EdisiQs): Promise<HasilMuat> {
  return db.transaction(async (tx) => {
    const npsn = data.entri.map((e) => e.npsn);
    const kampusRows = await tx.select({ id: kampus.id, npsn: kampus.npsn }).from(kampus).where(inArray(kampus.npsn, npsn));
    const idPerNpsn = new Map(kampusRows.map((k) => [k.npsn, k.id]));
    const hilang = npsn.filter((n) => !idPerNpsn.has(n));
    if (hilang.length) throw new PeringkatQsDitolak(`No Kampus with NPSN: ${hilang.join(", ")}`);

    const ada = await tx.select().from(peringkatQs).where(eq(peringkatQs.edisi, data.edisi));
    const adaPerKampus = new Map(ada.map((r) => [r.kampusId, r]));
    const hasil: HasilMuat = { ditambah: 0, diubah: 0, tetap: 0, dihapus: 0 };

    for (const e of data.entri) {
      const kampusId = idPerNpsn.get(e.npsn)!;
      const nilai = {
        peringkat: e.peringkat,
        peringkatMin: e.min,
        peringkatMax: e.max,
        namaQs: e.namaQs,
        sumberUrl: data.sumberUrl,
        tanggalAmbil: data.tanggalAmbil,
      };
      const lama = adaPerKampus.get(kampusId);
      if (!lama) {
        await tx.insert(peringkatQs).values({ kampusId, edisi: data.edisi, ...nilai });
        hasil.ditambah++;
      } else if ((Object.keys(nilai) as (keyof typeof nilai)[]).some((k) => lama[k] !== nilai[k])) {
        await tx.update(peringkatQs).set({ ...nilai, updatedAt: sql`now()` }).where(eq(peringkatQs.id, lama.id));
        hasil.diubah++;
      } else {
        hasil.tetap++;
      }
    }

    const keluar = await tx
      .delete(peringkatQs)
      .where(and(eq(peringkatQs.edisi, data.edisi), notInArray(peringkatQs.kampusId, [...idPerNpsn.values()])))
      .returning({ id: peringkatQs.id });
    hasil.dihapus = keluar.length;
    return hasil;
  });
}
