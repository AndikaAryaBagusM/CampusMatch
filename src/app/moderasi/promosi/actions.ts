"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDb, type Db } from "@/db";
import { requireModerator } from "@/lib/moderator";
import { aktifkan, buatDraf, hapusDraf, hentikan, PromosiDitolak } from "@/lib/promosi";

// Every action checks the Moderator itself; the page check isn't enough,
// because a Server Action can be called directly.

const teks = (formData: FormData, nama: string) => String(formData.get(nama) ?? "");

function angka(v: unknown): number {
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 ? n : 0;
}

const pesan = (path: string, isi: string, ok = false) => `${path}?pesan=${encodeURIComponent(isi)}${ok ? "&ok=1" : ""}`;

// The home page is cached for an hour; Jurusan and search pages render per request.
const segarkan = () => revalidatePath("/", "page");

export async function buat(formData: FormData) {
  const moderator = await requireModerator();
  const kampusId = angka(formData.get("kampusId"));
  let id: number;
  try {
    id = await withDb((db) =>
      buatDraf(
        db,
        {
          kampusId,
          jurusanIds: formData.getAll("jurusan").map(angka).filter(Boolean),
          diBeranda: formData.get("diBeranda") === "1",
          mulai: teks(formData, "mulai"),
          selesai: teks(formData, "selesai"),
          teks: teks(formData, "teks"),
          catatanInternal: teks(formData, "catatanInternal"),
        },
        moderator.id,
      ),
    );
  } catch (e) {
    if (!(e instanceof PromosiDitolak)) throw e;
    redirect(`${pesan("/moderasi/promosi/baru", e.message)}&kampus=${kampusId}`);
  }
  redirect(pesan(`/moderasi/promosi/${id}`, "Draf tersimpan. Minta Moderator lain memeriksa dan mengaktifkannya.", true));
}

async function ubahStatus(formData: FormData, ubah: (db: Db, id: number, moderatorId: string) => Promise<void>, berhasil: string, ke?: string) {
  const moderator = await requireModerator();
  const id = angka(formData.get("id"));
  try {
    await withDb((db) => ubah(db, id, moderator.id));
  } catch (e) {
    if (!(e instanceof PromosiDitolak)) throw e;
    redirect(pesan(`/moderasi/promosi/${id}`, e.message));
  }
  segarkan();
  redirect(pesan(ke ?? `/moderasi/promosi/${id}`, berhasil, true));
}

export async function aktifkanPromosi(formData: FormData) {
  await ubahStatus(formData, (db, id, m) => aktifkan(db, id, m), "Promosi diaktifkan.");
}

export async function hentikanPromosi(formData: FormData) {
  await ubahStatus(formData, (db, id, m) => hentikan(db, id, m, teks(formData, "alasan")), "Promosi dihentikan.");
}

export async function hapusDrafPromosi(formData: FormData) {
  await ubahStatus(formData, (db, id) => hapusDraf(db, id), "Draf dihapus.", "/moderasi/promosi");
}
