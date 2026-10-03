"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { withDb } from "@/db";
import { requirePengulas } from "@/lib/sesi";
import { targetHalamanProdi } from "@/lib/ulasan/kueri";
import { hapusUlasan, UlasanTidakDitemukan } from "@/lib/ulasan/layanan";
import { revalidasiHalamanUlasan } from "@/lib/ulasan/revalidasi";

export async function keluar() {
  await signOut({ redirectTo: "/" });
}

// A Pengulas deletes their own Ulasan (decisions.md 10). Ownership is checked
// in hapusUlasan, not trusted from the form.
export async function hapusUlasanSaya(formData: FormData) {
  const pengulas = await requirePengulas("/akun");
  const ulasanId = String(formData.get("ulasanId") ?? "");
  const target = await withDb(async (db) => {
    try {
      const { wasTerbit, prodiId } = await hapusUlasan(db, { pengulasId: pengulas.id, ulasanId });
      return wasTerbit ? await targetHalamanProdi(db, prodiId) : null;
    } catch (e) {
      if (e instanceof UlasanTidakDitemukan) return null;
      throw e;
    }
  });
  if (target) revalidasiHalamanUlasan(target);
  revalidatePath("/akun");
}
