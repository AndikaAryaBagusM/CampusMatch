"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb } from "@/db";
import { requireModerator } from "@/lib/moderator";
import { kodeSah, PemetaanDitolak, setOverrideProdi, ubahJurusanKode } from "@/lib/pemetaan-jurusan";

// Every action checks the Moderator itself; the page check isn't enough,
// because a Server Action can be called directly.

const teks = (formData: FormData, nama: string) => String(formData.get(nama) ?? "");

function angka(v: unknown): number | null {
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

const hrefKode = (kode: string, pesan?: string, ok = false) =>
  `/moderasi/jurusan/kode/${kode}${pesan ? `?pesan=${encodeURIComponent(pesan)}${ok ? "&ok=1" : ""}` : ""}`;

// A Prodi's Jurusan shows on its own page, its Kampus pages and the home
// page's Bidang highlights; Jurusan, search, Kota and Tes Minat pages render
// per request already.
function segarkan() {
  revalidatePath("/prodi/[slug]", "page");
  revalidatePath("/kampus/[slug]", "page");
  revalidatePath("/kampus/[slug]/prodi", "page");
  revalidatePath("/", "page");
}

async function jalankan(kode: string, ubah: (moderatorId: string) => Promise<string>) {
  const moderator = await requireModerator();
  if (!kodeSah(kode)) redirect("/moderasi/jurusan");
  let pesan: string;
  try {
    pesan = await ubah(moderator.id);
  } catch (e) {
    if (!(e instanceof PemetaanDitolak)) throw e;
    redirect(hrefKode(kode, e.message));
  }
  segarkan();
  redirect(hrefKode(kode, pesan, true));
}

export async function ubahKode(formData: FormData) {
  const kode = teks(formData, "kode");
  await jalankan(kode, async (moderatorId) => {
    const jurusanId = angka(formData.get("jurusanId"));
    if (!jurusanId) throw new PemetaanDitolak("Pilih Jurusan tujuan.");
    await withDb((db) => ubahJurusanKode(db, { kode, jurusanId, alasan: teks(formData, "alasan"), moderatorId }));
    return "Jurusan Kode Prodi diubah.";
  });
}

export async function pindahkanProdi(formData: FormData) {
  const kode = teks(formData, "kode");
  await jalankan(kode, async (moderatorId) => {
    // A name group's checkbox carries all its ids ("1,2,3"); single Prodi carry one.
    const prodiIds = [...formData.getAll("grup"), ...formData.getAll("prodi")]
      .flatMap((v) => String(v).split(","))
      .map(angka)
      .filter((n): n is number => n !== null);
    const tujuan = teks(formData, "jurusanId");
    const jurusanId = tujuan === "kode" ? null : angka(tujuan);
    if (tujuan !== "kode" && !jurusanId) throw new PemetaanDitolak("Pilih Jurusan tujuan.");
    const slugs = await withDb((db) => setOverrideProdi(db, { prodiIds, jurusanId, alasan: teks(formData, "alasan"), moderatorId }));
    return `${slugs.length} Prodi dipindahkan.`;
  });
}
