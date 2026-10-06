"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { withDb } from "@/db";
import { nyatakanBelumDewasa, nyatakanDewasa } from "@/lib/akun/usia";
import { jalurAman, requireSesi } from "@/lib/sesi";

// The 18+ declaration (ADR 0008). The session is re-read on the next request,
// so the gate in requirePengulas sees the new value straight away.
export async function nyatakanUsia(formData: FormData) {
  const pengguna = await requireSesi("/akun/usia");
  const kembali = jalurAman(formData.get("callbackUrl"), "/akun");
  if (formData.get("jawaban") === "dewasa") {
    await withDb((db) => nyatakanDewasa(db, pengguna.id));
    redirect(kembali);
  }
  const hasil = await withDb((db) => nyatakanBelumDewasa(db, pengguna.id));
  if (hasil === "dihapus") await signOut({ redirectTo: "/akun/usia/dihapus" });
  redirect("/akun/dikunci");
}
