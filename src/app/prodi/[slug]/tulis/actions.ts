"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { withDb } from "@/db";
import { BATAS, kunciIp, kunciPengulas, pakaiSemuaBatas } from "@/lib/batas-laju";
import { hashIpPemanggil } from "@/lib/ip";
import { requirePengulas } from "@/lib/sesi";
import { screeningSetelahRespons } from "@/lib/ulasan/jalankan-screening";
import { getProdiTujuan, getUlasanSaya } from "@/lib/ulasan/kueri";
import { editUlasan, RevisiMasihDiperiksa, tulisUlasan, UlasanSudahAda } from "@/lib/ulasan/layanan";
import { bacaIsian, skemaUlasan, type DataUlasan, type IsianUlasan } from "@/lib/ulasan/skema";

export type GalatForm = Partial<Record<keyof DataUlasan, string>>;

export type StatusFormUlasan = {
  kali: number;
  pesan?: string;
  galat?: GalatForm;
  isian?: IsianUlasan;
} | null;

// Write or edit the signed-in Pengulas's Ulasan for one Prodi. Whether this is
// a new Ulasan or an edit comes from the database, never from the form.
export async function kirimUlasan(prev: StatusFormUlasan, formData: FormData): Promise<StatusFormUlasan> {
  const prodiSlug = String(formData.get("prodiSlug") ?? "");
  const pengulas = await requirePengulas(`/prodi/${prodiSlug}/tulis`);
  const kali = (prev?.kali ?? 0) + 1;
  const isian = bacaIsian(formData);

  const parsed = skemaUlasan().safeParse(isian);
  if (!parsed.success) {
    const galat = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v?.[0]]),
    ) as GalatForm;
    return { kali, isian, galat, pesan: "Periksa lagi isian yang ditandai." };
  }

  const ipHash = await hashIpPemanggil();
  const hasil = await withDb(async (db) => {
    const prodi = await getProdiTujuan(db, prodiSlug);
    if (!prodi) return { pesan: "Prodi tidak ditemukan." };

    const boleh = await pakaiSemuaBatas(db, [
      [kunciPengulas(pengulas.id, "ulasan"), BATAS.ulasanPengulas],
      [kunciIp(ipHash, "ulasan"), BATAS.ulasanIp],
    ]);
    if (!boleh) return { pesan: "Kamu sudah mengirim terlalu banyak ulasan hari ini. Coba lagi besok." };

    try {
      const ada = await getUlasanSaya(db, pengulas.id, prodi.id);
      const revisi = ada
        ? await editUlasan(db, { pengulasId: pengulas.id, ulasanId: ada.id, data: parsed.data })
        : await tulisUlasan(db, { pengulasId: pengulas.id, prodiId: prodi.id, data: parsed.data });
      return { revisiId: revisi.revisiId };
    } catch (e) {
      if (e instanceof UlasanSudahAda || e instanceof RevisiMasihDiperiksa) return { pesan: e.message };
      throw e;
    }
  });

  if ("pesan" in hasil) return { kali, isian, pesan: hasil.pesan };
  screeningSetelahRespons(hasil.revisiId);
  redirect(`/akun?terkirim=${encodeURIComponent(prodiSlug)}`);
}
