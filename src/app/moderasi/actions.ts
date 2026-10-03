"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb, type Db } from "@/db";
import { requireModerator } from "@/lib/moderator";
import { jalurAman } from "@/lib/sesi";
import {
  KeputusanTidakBerlaku,
  setujuiRevisi,
  tolakRevisi,
  turunkanUlasan,
  tutupLaporan,
  type HasilKeputusan,
} from "@/lib/ulasan/moderasi";
import { revalidasiHalamanUlasan } from "@/lib/ulasan/revalidasi";
import { TransisiTidakSah } from "@/lib/ulasan/status";

type Keputusan = (db: Db, moderatorId: string) => Promise<HasilKeputusan>;

// Every action checks the Moderator itself; the page check isn't enough,
// because a Server Action can be called directly.
async function putuskan(formData: FormData, keputusan: Keputusan) {
  const moderator = await requireModerator();
  const kembali = jalurAman(formData.get("kembali"), "/moderasi");
  let pesan: string | null = null;
  try {
    const hasil = await withDb((db) => keputusan(db, moderator.id));
    if (hasil.liveBerubah) revalidasiHalamanUlasan(hasil.target);
  } catch (e) {
    if (!(e instanceof KeputusanTidakBerlaku || e instanceof TransisiTidakSah)) throw e;
    pesan = e.message;
  }
  revalidatePath("/moderasi", "layout");
  if (pesan) redirect(`${kembali}${kembali.includes("?") ? "&" : "?"}pesan=${encodeURIComponent(pesan)}`);
}

const teks = (formData: FormData, nama: string) => String(formData.get(nama) ?? "");

export async function setujui(formData: FormData) {
  await putuskan(formData, (db, moderatorId) => setujuiRevisi(db, { revisiId: teks(formData, "revisiId"), moderatorId }));
}

export async function tolak(formData: FormData) {
  await putuskan(formData, (db, moderatorId) =>
    tolakRevisi(db, { revisiId: teks(formData, "revisiId"), moderatorId, alasan: teks(formData, "alasan") }),
  );
}

export async function turunkan(formData: FormData) {
  await putuskan(formData, (db, moderatorId) =>
    turunkanUlasan(db, { laporanId: teks(formData, "laporanId"), moderatorId, alasan: teks(formData, "alasan") }),
  );
}

export async function tutup(formData: FormData) {
  await putuskan(formData, (db, moderatorId) =>
    tutupLaporan(db, { laporanId: teks(formData, "laporanId"), moderatorId, alasan: teks(formData, "alasan") }),
  );
}
