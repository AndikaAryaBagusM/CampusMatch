import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { alasanLaporan, laporan, ulasan, ulasanRevisi } from "@/db/schema";
import { pelanggaranUnik } from "@/lib/db-error";

export type AlasanLaporan = (typeof alasanLaporan.enumValues)[number];

export const LABEL_ALASAN_LAPORAN: Record<AlasanLaporan, string> = {
  sara_kebencian: "SARA atau ujaran kebencian",
  hinaan: "Hinaan atau serangan pribadi",
  menyebut_individu: "Menyebut nama atau data pribadi seseorang",
  tidak_relevan: "Bukan tentang Prodi ini",
  promosi_spam: "Promosi atau spam",
  lainnya: "Lainnya",
};

export const CATATAN_MAKS = 1000;

export const skemaLaporan = z.object({
  alasan: z.enum(alasanLaporan.enumValues, { error: "Pilih alasan laporan." }),
  catatan: z
    .string()
    .trim()
    .max(CATATAN_MAKS, `Catatan maksimal ${CATATAN_MAKS} karakter.`)
    .transform((v) => v || null),
});

export class LaporanSudahAda extends Error {
  constructor() {
    super("Kamu sudah melaporkan ulasan ini. Tim kami akan memeriksanya.");
    this.name = "LaporanSudahAda";
  }
}

export class TidakBisaDilaporkan extends Error {
  constructor(message = "Ulasan ini tidak bisa dilaporkan.") {
    super(message);
    this.name = "TidakBisaDilaporkan";
  }
}

// The Terbit Ulasan a visitor sees, if it can be reported.
export async function getUlasanTerlapor(db: Db, ulasanId: string) {
  const [row] = await db
    .select({ id: ulasan.id, pengulasId: ulasan.pengulasId, revisiId: ulasanRevisi.id, judul: ulasanRevisi.judul })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .where(and(eq(ulasan.id, ulasanId), isNotNull(ulasan.revisiTerbitId), isNull(ulasan.dihapusAt)))
    .limit(1);
  return row;
}

// A Laporan on the live revision. The Ulasan stays Terbit; the open Laporan
// is what puts it in the Antrean Moderasi (CONTEXT.md).
export async function buatLaporan(
  db: Db,
  {
    ulasanId,
    pelaporId,
    ipHash,
    alasan,
    catatan,
  }: { ulasanId: string; pelaporId: string; ipHash: string; alasan: AlasanLaporan; catatan: string | null },
) {
  const target = await getUlasanTerlapor(db, ulasanId);
  if (!target) throw new TidakBisaDilaporkan();
  if (target.pengulasId === pelaporId) throw new TidakBisaDilaporkan("Kamu tidak bisa melaporkan ulasanmu sendiri.");
  try {
    const [row] = await db
      .insert(laporan)
      .values({ ulasanId, revisiId: target.revisiId, pelaporId, ipHash, alasan, catatan })
      .returning({ id: laporan.id });
    return row;
  } catch (e) {
    if (pelanggaranUnik(e, "laporan_ulasan_pelapor_baru_unique")) throw new LaporanSudahAda();
    throw e;
  }
}
