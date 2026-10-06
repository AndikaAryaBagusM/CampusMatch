"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb } from "@/db";
import { InfoBiayaDitolak, kesampingkanInfoBiaya, pulihkanInfoBiaya } from "@/lib/info-biaya/layanan";
import { requireModerator } from "@/lib/moderator";

// Every action checks the Moderator itself; the page check isn't enough,
// because a Server Action can be called directly.

const kembali = (prodi: string, pesan: string, ok = false) =>
  `/moderasi/info-biaya?prodi=${encodeURIComponent(prodi)}&pesan=${encodeURIComponent(pesan)}${ok ? "&ok=1" : ""}`;

function segarkan(slugs: string[]) {
  for (const s of slugs) revalidatePath(`/prodi/${s}`);
}

// Set aside one Info Biaya (id) or every Info Biaya of its account (semuaAkun).
export async function kesampingkan(formData: FormData) {
  const moderator = await requireModerator();
  const prodi = String(formData.get("prodi") ?? "");
  const id = Number(formData.get("id"));
  const userId = String(formData.get("userId") ?? "");
  const semuaAkun = formData.get("semuaAkun") === "1";
  const alasan = String(formData.get("alasan") ?? "");
  if (semuaAkun ? !userId : !Number.isSafeInteger(id) || id <= 0) redirect(kembali(prodi, "Info Biaya tidak ditemukan."));
  let slugs: string[];
  try {
    slugs = await withDb((db) => kesampingkanInfoBiaya(db, semuaAkun ? { userId } : { id }, moderator.id, alasan));
  } catch (e) {
    if (e instanceof InfoBiayaDitolak) redirect(kembali(prodi, e.message));
    throw e;
  }
  segarkan(slugs);
  redirect(kembali(prodi, semuaAkun ? `${slugs.length} Prodi diperbarui; semua info biaya akun itu dikesampingkan.` : "Info Biaya dikesampingkan.", true));
}

export async function pulihkan(formData: FormData) {
  await requireModerator();
  const prodi = String(formData.get("prodi") ?? "");
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect(kembali(prodi, "Info Biaya tidak ditemukan."));
  segarkan(await withDb((db) => pulihkanInfoBiaya(db, id)));
  redirect(kembali(prodi, "Info Biaya dihitung lagi.", true));
}
