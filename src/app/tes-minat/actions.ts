"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb } from "@/db";
import { simpanProfilMinat } from "@/lib/riasec/profil";
import { bacaProfil, kodekanProfil } from "@/lib/riasec/skor";
import { requirePengulas } from "@/lib/sesi";

// Saves the result as a Profil Minat. requirePengulas sends a visitor to sign
// in and to the 18+ declaration first, then back to this result (ADR 0008).
export async function simpanProfil(formData: FormData) {
  const profil = bacaProfil(String(formData.get("p") ?? ""));
  if (!profil) redirect("/tes-minat");
  const pengguna = await requirePengulas(`/tes-minat/hasil?p=${kodekanProfil(profil)}`);
  await withDb((db) => simpanProfilMinat(db, pengguna.id, profil));
  revalidatePath("/akun");
  redirect("/akun?profil=tersimpan#profil-minat");
}
