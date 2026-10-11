"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb, type Db } from "@/db";
import { halamanSumberFakta, segarkanHalaman } from "@/lib/halaman-cache";
import { kembalikanSumber, PemeriksaanDitolak, tandaiDiperiksa, tarikFakta, type PilihanTarik } from "@/lib/fakta/periksa";
import { requireModerator } from "@/lib/moderator";

// Every action checks the Moderator itself; the page check isn't enough,
// because a Server Action can be called directly.

const teks = (formData: FormData, nama: string) => String(formData.get(nama) ?? "");

async function putuskan(formData: FormData, keputusan: (db: Db, moderatorId: string, sumberId: number) => Promise<unknown>) {
  const moderator = await requireModerator();
  const id = Number(formData.get("sumberId"));
  const sumberId = Number.isSafeInteger(id) && id > 0 ? id : 0;
  try {
    await withDb((db) => keputusan(db, moderator.id, sumberId));
  } catch (e) {
    if (!(e instanceof PemeriksaanDitolak)) throw e;
    redirect(`/moderasi/fakta/${sumberId}?pesan=${encodeURIComponent(e.message)}`);
  }
  revalidatePath("/moderasi", "layout");
}

// A Sumber's facts show on its Kampus page and every Prodi page there, or for
// a national Beasiswa on the Kampus pages of every Kampus taking part. Only
// those pages are refreshed on their next visit.
async function segarkanFakta(formData: FormData) {
  const sumberId = Number(formData.get("sumberId"));
  if (!Number.isSafeInteger(sumberId) || sumberId <= 0) return;
  const paths = await withDb((db) => halamanSumberFakta(db, sumberId));
  segarkanHalaman(paths, ["/kampus/[slug]", "/prodi/[slug]"]);
}

export async function periksa(formData: FormData) {
  await putuskan(formData, (db, moderatorId, sumberId) =>
    tandaiDiperiksa(db, { sumberId, moderatorId, alasanTanpaArsip: teks(formData, "alasanTanpaArsip") }),
  );
  await segarkanFakta(formData);
  redirect("/moderasi/fakta");
}

export async function kembalikan(formData: FormData) {
  await putuskan(formData, (db, _, sumberId) => kembalikanSumber(db, { sumberId, catatan: teks(formData, "catatan") }));
  redirect("/moderasi/fakta");
}

// Facts can be withdrawn by any Moderator, including the one who entered or
// checked them (ADR 0006). The chosen rows arrive as checkbox values.
export async function tarik(formData: FormData) {
  const ids = (nama: keyof PilihanTarik) =>
    formData
      .getAll(nama)
      .map(Number)
      .filter((n) => Number.isSafeInteger(n) && n > 0);
  const pilihan: PilihanTarik | "semua" =
    formData.get("semua") === "ya"
      ? "semua"
      : { jalur: ids("jalur"), biaya: ids("biaya"), beasiswa: ids("beasiswa"), beasiswaKampus: ids("beasiswaKampus") };
  let sumberId = 0;
  await putuskan(formData, (db, moderatorId, id) => {
    sumberId = id;
    if (pilihan !== "semua" && Object.values(pilihan).every((d) => d.length === 0))
      throw new PemeriksaanDitolak("Pilih fakta yang mau ditarik.");
    return tarikFakta(db, { sumberId: id, moderatorId, alasan: teks(formData, "alasan"), pilihan });
  });
  await segarkanFakta(formData);
  redirect(`/moderasi/fakta/${sumberId}?pesan=${encodeURIComponent("Fakta ditarik dan tidak tampil lagi.")}&ok=1`);
}
