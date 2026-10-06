"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb } from "@/db";
import { InfoBiayaDitolak, simpanInfoBiaya } from "@/lib/info-biaya/layanan";
import { bacaIsianInfoBiaya, galatDari, skemaInfoBiaya, type GalatInfoBiaya, type IsianInfoBiaya } from "@/lib/info-biaya/skema";
import { hashIpPemanggil } from "@/lib/ip";
import { requirePengulas } from "@/lib/sesi";
import { getProdiTujuan } from "@/lib/ulasan/kueri";

export type StatusFormInfoBiaya = {
  kali: number;
  pesan?: string;
  galat?: GalatInfoBiaya;
  isian?: IsianInfoBiaya;
} | null;

// Save the signed-in Pengulas's Info Biaya for one Prodi (ADR 0010). One per
// Pengulas per Prodi: a second save replaces the first.
export async function kirimInfoBiaya(prev: StatusFormInfoBiaya, formData: FormData): Promise<StatusFormInfoBiaya> {
  const prodiSlug = String(formData.get("prodiSlug") ?? "");
  const pengulas = await requirePengulas(`/prodi/${prodiSlug}/info-biaya`);
  const kali = (prev?.kali ?? 0) + 1;
  const isian = bacaIsianInfoBiaya(formData);

  const parsed = skemaInfoBiaya().safeParse(isian);
  if (!parsed.success) return { kali, isian, galat: galatDari(parsed.error), pesan: "Periksa lagi isian yang ditandai." };

  const ipHash = await hashIpPemanggil();
  const pesan = await withDb(async (db) => {
    const prodi = await getProdiTujuan(db, prodiSlug);
    if (!prodi) return "Prodi tidak ditemukan.";
    try {
      await simpanInfoBiaya(db, { userId: pengulas.id, prodiId: prodi.id, ipHash, data: parsed.data });
      return null;
    } catch (e) {
      if (e instanceof InfoBiayaDitolak) return e.message;
      throw e;
    }
  });
  if (pesan) return { kali, isian, pesan };

  revalidatePath(`/prodi/${prodiSlug}`);
  redirect("/akun?infoBiaya=tersimpan#info-biaya");
}
