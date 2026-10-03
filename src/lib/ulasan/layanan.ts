import { and, eq, isNull, max, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { riwayatModerasi, ulasan, ulasanRevisi } from "@/db/schema";
import { pelanggaranUnik } from "@/lib/db-error";
import type { DataUlasan } from "./skema";
import { sedangDiperiksa } from "./status";

// Writes by a Pengulas. Each runs in one interactive transaction (ADR 0005).
// Every new revision starts Menunggu; Screening decides what happens next.

export class UlasanSudahAda extends Error {
  constructor() {
    super("Kamu sudah menulis ulasan untuk Prodi ini.");
    this.name = "UlasanSudahAda";
  }
}

export class RevisiMasihDiperiksa extends Error {
  constructor() {
    super("Revisi sebelumnya masih diperiksa. Kamu bisa mengubah ulasan lagi setelah pemeriksaan selesai.");
    this.name = "RevisiMasihDiperiksa";
  }
}

export class UlasanTidakDitemukan extends Error {
  constructor() {
    super("Ulasan tidak ditemukan.");
    this.name = "UlasanTidakDitemukan";
  }
}

function isiRevisi(data: DataUlasan) {
  return {
    judul: data.judul,
    isi: data.isi,
    bintang: data.bintang,
    aspekKurikulum: data.aspekKurikulum,
    aspekDosen: data.aspekDosen,
    aspekFasilitas: data.aspekFasilitas,
    aspekSuasanaBelajar: data.aspekSuasanaBelajar,
    aspekOrganisasi: data.aspekOrganisasi,
    aspekBiayaKualitas: data.aspekBiayaKualitas,
    rekomendasi: data.rekomendasi,
  };
}

export type RevisiBaru = { ulasanId: string; revisiId: string };

// One Ulasan per Pengulas per Prodi: the partial unique index
// ulasan_pengulas_prodi_aktif_unique enforces it, even under concurrent submits.
export async function tulisUlasan(
  db: Db,
  { pengulasId, prodiId, data }: { pengulasId: string; prodiId: number; data: DataUlasan },
): Promise<RevisiBaru> {
  try {
    return await db.transaction(async (tx) => {
      const [u] = await tx
        .insert(ulasan)
        .values({ pengulasId, prodiId, statusPengulas: data.statusPengulas, tahunMasuk: data.tahunMasuk })
        .returning({ id: ulasan.id });
      const [r] = await tx
        .insert(ulasanRevisi)
        .values({ ulasanId: u.id, nomor: 1, ...isiRevisi(data) })
        .returning({ id: ulasanRevisi.id });
      return { ulasanId: u.id, revisiId: r.id };
    });
  } catch (e) {
    if (pelanggaranUnik(e, "ulasan_pengulas_prodi_aktif_unique")) throw new UlasanSudahAda();
    throw e;
  }
}

// An edit is a new revision. The live revision (revisi_terbit_id) stays shown
// until the new one is Terbit. Status Pengulas and tahun masuk are fixed
// choices, not free text, so they change straight away.
export async function editUlasan(
  db: Db,
  { pengulasId, ulasanId, data }: { pengulasId: string; ulasanId: string; data: DataUlasan },
): Promise<RevisiBaru> {
  return db.transaction(async (tx) => {
    const [u] = await tx
      .select({ id: ulasan.id })
      .from(ulasan)
      .where(and(eq(ulasan.id, ulasanId), eq(ulasan.pengulasId, pengulasId), isNull(ulasan.dihapusAt)))
      .for("update");
    if (!u) throw new UlasanTidakDitemukan();

    const revisi = await tx
      .select({ status: ulasanRevisi.status })
      .from(ulasanRevisi)
      .where(eq(ulasanRevisi.ulasanId, ulasanId));
    if (revisi.some((r) => sedangDiperiksa(r.status))) throw new RevisiMasihDiperiksa();

    const [{ nomor }] = await tx
      .select({ nomor: max(ulasanRevisi.nomor) })
      .from(ulasanRevisi)
      .where(eq(ulasanRevisi.ulasanId, ulasanId));
    const [r] = await tx
      .insert(ulasanRevisi)
      .values({ ulasanId, nomor: (nomor ?? 0) + 1, ...isiRevisi(data) })
      .returning({ id: ulasanRevisi.id });
    await tx
      .update(ulasan)
      .set({ statusPengulas: data.statusPengulas, tahunMasuk: data.tahunMasuk })
      .where(eq(ulasan.id, ulasanId));
    return { ulasanId, revisiId: r.id };
  });
}

// Soft delete: hides the Ulasan at once and frees the Prodi for a new one.
// Returns whether it was live, so the caller knows to revalidate pages.
export async function hapusUlasan(
  db: Db,
  { pengulasId, ulasanId }: { pengulasId: string; ulasanId: string },
): Promise<{ wasTerbit: boolean; prodiId: number }> {
  return db.transaction(async (tx) => {
    const [u] = await tx
      .update(ulasan)
      .set({ dihapusAt: sql`now()` })
      .where(and(eq(ulasan.id, ulasanId), eq(ulasan.pengulasId, pengulasId), isNull(ulasan.dihapusAt)))
      .returning({ revisiTerbitId: ulasan.revisiTerbitId, prodiId: ulasan.prodiId });
    if (!u) throw new UlasanTidakDitemukan();
    await tx.insert(riwayatModerasi).values({ ulasanId, aksi: "dihapus_pengulas", oleh: pengulasId });
    return { wasTerbit: u.revisiTerbitId !== null, prodiId: u.prodiId };
  });
}
