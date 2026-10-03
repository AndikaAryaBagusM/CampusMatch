import { and, asc, eq, isNull, lt, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, prodi, riwayatModerasi, ulasan, ulasanRevisi } from "@/db/schema";
import { screenUlasan, type OpsiPutaran, type ScreeningModel } from "@/lib/screening";
import { ALASAN_SCREENING_GAGAL, transisi, type StatusUlasan } from "./status";

// The pages that show an Ulasan, for revalidation.
export type TargetHalaman = { prodiSlug: string; kampusSlug: string };

export type HasilProses =
  | { diproses: false }
  | { diproses: true; status: StatusUlasan; percobaan: number; liveBerubah: boolean; target: TargetHalaman };

// Runs one Screening round on a Menunggu revision and applies the result.
// The revision is locked with FOR UPDATE SKIP LOCKED for the whole round, so
// the after() call and the cron can never screen it twice at once; a locked or
// already-decided revision is skipped. Only a rendah result moves the live
// pointer (fail-closed, ADR 0002).
export async function prosesScreening(
  db: Db,
  revisiId: string,
  model: ScreeningModel,
  opsi?: OpsiPutaran,
): Promise<HasilProses> {
  return db.transaction(async (tx) => {
    const [r] = await tx
      .select({
        id: ulasanRevisi.id,
        ulasanId: ulasanRevisi.ulasanId,
        status: ulasanRevisi.status,
        percobaan: ulasanRevisi.percobaanScreening,
        judul: ulasanRevisi.judul,
        isi: ulasanRevisi.isi,
        prodiNama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
        prodiSlug: prodi.slug,
        kampusNama: kampus.nama,
        kampusSlug: kampus.slug,
      })
      .from(ulasanRevisi)
      .innerJoin(ulasan, eq(ulasanRevisi.ulasanId, ulasan.id))
      .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
      .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
      .where(and(eq(ulasanRevisi.id, revisiId), eq(ulasanRevisi.status, "menunggu"), isNull(ulasan.dihapusAt)))
      .for("update", { of: ulasanRevisi, skipLocked: true });
    if (!r) return { diproses: false };

    const hasil = await screenUlasan(
      { judul: r.judul, isi: r.isi, prodi: r.prodiNama, kampus: r.kampusNama },
      model,
      opsi,
    );
    const ke = transisi(
      { status: r.status, percobaan: r.percobaan },
      hasil.ok ? { jenis: "screening", tingkatRisiko: hasil.tingkatRisiko } : { jenis: "screening_gagal" },
    );

    // A failure only counts the round, unless it was the last one.
    const keModerator = !hasil.ok && ke.status === "ditinjau";
    await tx
      .update(ulasanRevisi)
      .set({
        status: ke.status,
        percobaanScreening: ke.percobaan,
        ...(hasil.ok
          ? {
              tingkatRisiko: hasil.tingkatRisiko,
              alasanScreening: hasil.alasan,
              modelScreening: hasil.model,
              discreeningAt: sql`now()`,
            }
          : keModerator
            ? { alasanScreening: `${ALASAN_SCREENING_GAGAL}: ${hasil.galat}`, modelScreening: hasil.model }
            : {}),
      })
      .where(eq(ulasanRevisi.id, r.id));

    const liveBerubah = ke.status === "terbit";
    if (liveBerubah) {
      await tx.update(ulasan).set({ revisiTerbitId: r.id }).where(eq(ulasan.id, r.ulasanId));
    }
    if (hasil.ok || keModerator) {
      await tx.insert(riwayatModerasi).values({
        ulasanId: r.ulasanId,
        revisiId: r.id,
        aksi: "screening",
        alasan: hasil.ok
          ? `${hasil.tingkatRisiko}: ${hasil.alasan} (${hasil.model})`
          : `${ALASAN_SCREENING_GAGAL} setelah ${ke.percobaan} putaran: ${hasil.galat}`,
      });
    }

    return {
      diproses: true,
      status: ke.status,
      percobaan: ke.percobaan,
      liveBerubah,
      target: { prodiSlug: r.prodiSlug, kampusSlug: r.kampusSlug },
    };
  });
}

// Menunggu revisions the cron should retry: older than `umurMenit`, oldest first.
export async function revisiMenungguLama(db: Db, { umurMenit = 10, batas = 20 } = {}) {
  const rows = await db
    .select({ id: ulasanRevisi.id })
    .from(ulasanRevisi)
    .innerJoin(ulasan, eq(ulasanRevisi.ulasanId, ulasan.id))
    .where(
      and(
        eq(ulasanRevisi.status, "menunggu"),
        isNull(ulasan.dihapusAt),
        lt(ulasanRevisi.createdAt, sql`now() - make_interval(mins => ${umurMenit})`),
      ),
    )
    .orderBy(asc(ulasanRevisi.createdAt))
    .limit(batas);
  return rows.map((r) => r.id);
}
