import { asc, count, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, kota, peringkatQs } from "@/db/schema";

// Reads of the QS World University Rankings (ADR 0011). Only the latest
// edition counts; older editions stay in peringkat_qs as history. Nothing here
// is used to order search results or to compute any Ulasan score.

const edisiTerbaru = sql`(SELECT max(${peringkatQs.edisi}) FROM ${peringkatQs})`;

// A Kampus's rank in the latest edition, exactly as QS publishes it, or NULL.
// Needs `kampus` in the query.
export const peringkatQsKampus = sql<string | null>`(
  SELECT ${peringkatQs.peringkat} FROM ${peringkatQs}
  WHERE ${peringkatQs.kampusId} = ${kampus.id} AND ${peringkatQs.edisi} = ${edisiTerbaru}
)`;

// The Kampus is listed in the latest edition. Needs `kampus` in the query.
export const diQs = sql<boolean>`EXISTS (
  SELECT 1 FROM ${peringkatQs}
  WHERE ${peringkatQs.kampusId} = ${kampus.id} AND ${peringkatQs.edisi} = ${edisiTerbaru}
)`;

// The "only Kampus in QS" filter from a page's search params: ?qs=1, or the
// old ?unggulan=1 so earlier links keep working.
export function filterQsAktif(sp: Record<string, string | string[] | undefined>): boolean {
  const satu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) === "1";
  return satu(sp.qs) || satu(sp.unggulan);
}

export type InfoQs ={ edisi: number; sumberUrl: string; tanggalAmbil: string; jumlahKampus: number };

// The latest edition's source, for the label and link next to every rank.
export async function getInfoQs(db: Db): Promise<InfoQs | null> {
  const [row] = await db
    .select({
      edisi: peringkatQs.edisi,
      sumberUrl: sql<string>`max(${peringkatQs.sumberUrl})`,
      tanggalAmbil: sql<string>`max(${peringkatQs.tanggalAmbil})::text`,
      jumlahKampus: count(),
    })
    .from(peringkatQs)
    .where(sql`${peringkatQs.edisi} = ${edisiTerbaru}`)
    .groupBy(peringkatQs.edisi);
  return row ?? null;
}

// Every Kampus in the latest edition, in QS's order (shared ranks and bands by
// Kampus name). Used only for the home page section.
export async function listKampusQs(db: Db) {
  return db
    .select({
      npsn: kampus.npsn,
      nama: kampus.nama,
      slug: kampus.slug,
      kotaNama: kota.nama,
      peringkat: peringkatQs.peringkat,
    })
    .from(peringkatQs)
    .innerJoin(kampus, eq(peringkatQs.kampusId, kampus.id))
    .innerJoin(kota, eq(kampus.kotaId, kota.id))
    .where(sql`${peringkatQs.edisi} = ${edisiTerbaru}`)
    .orderBy(asc(peringkatQs.peringkatMin), asc(kampus.nama));
}

export type KampusQs = Awaited<ReturnType<typeof listKampusQs>>[number];
