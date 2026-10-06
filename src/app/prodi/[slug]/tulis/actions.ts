"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { withDb } from "@/db";
import { BATAS, kunciIp, kunciPengulas, pakaiSemuaBatas } from "@/lib/batas-laju";
import { simpanInfoBiaya } from "@/lib/info-biaya/layanan";
import {
  adaJawaban,
  bacaIsianInfoBiaya,
  galatDari,
  skemaInfoBiaya,
  type GalatInfoBiaya,
  type IsianInfoBiaya,
} from "@/lib/info-biaya/skema";
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
  galatInfoBiaya?: GalatInfoBiaya;
  isianInfoBiaya?: IsianInfoBiaya;
} | null;

// Write or edit the signed-in Pengulas's Ulasan for one Prodi. Whether this is
// a new Ulasan or an edit comes from the database, never from the form.
export async function kirimUlasan(prev: StatusFormUlasan, formData: FormData): Promise<StatusFormUlasan> {
  const prodiSlug = String(formData.get("prodiSlug") ?? "");
  const pengulas = await requirePengulas(`/prodi/${prodiSlug}/tulis`);
  const kali = (prev?.kali ?? 0) + 1;
  const isian = bacaIsian(formData);
  // The optional Info Biaya section (ADR 0010) shares Status Pengulas and tahun
  // masuk with the Ulasan. Checked only when something in it was filled in.
  const isianInfoBiaya = bacaIsianInfoBiaya(formData);
  const infoBiaya = adaJawaban(isianInfoBiaya) ? skemaInfoBiaya().safeParse(isianInfoBiaya) : null;

  const parsed = skemaUlasan().safeParse(isian);
  if (!parsed.success || infoBiaya?.success === false) {
    const galat = parsed.success
      ? {}
      : (Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v?.[0]])) as GalatForm);
    const galatInfoBiaya = infoBiaya?.success === false ? galatDari(infoBiaya.error) : undefined;
    return { kali, isian, galat, isianInfoBiaya, galatInfoBiaya, pesan: "Periksa lagi isian yang ditandai." };
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
      // The Ulasan is saved; Info Biaya failing (e.g. its rate limit) never undoes it.
      let infoBiayaTersimpan: boolean | null = null;
      if (infoBiaya?.success) {
        try {
          await simpanInfoBiaya(db, { userId: pengulas.id, prodiId: prodi.id, ipHash, data: infoBiaya.data });
          infoBiayaTersimpan = true;
        } catch (e) {
          console.error("Info Biaya from the Ulasan form not saved", e);
          infoBiayaTersimpan = false;
        }
      }
      return { revisiId: revisi.revisiId, infoBiayaTersimpan };
    } catch (e) {
      if (e instanceof UlasanSudahAda || e instanceof RevisiMasihDiperiksa) return { pesan: e.message };
      throw e;
    }
  });

  if ("pesan" in hasil) return { kali, isian, isianInfoBiaya, pesan: hasil.pesan };
  screeningSetelahRespons(hasil.revisiId);
  if (hasil.infoBiayaTersimpan) revalidatePath(`/prodi/${prodiSlug}`);
  const infoBiayaParam = hasil.infoBiayaTersimpan === null ? "" : `&infoBiaya=${hasil.infoBiayaTersimpan ? "tersimpan" : "gagal"}`;
  redirect(`/akun?terkirim=${encodeURIComponent(prodiSlug)}${infoBiayaParam}`);
}
