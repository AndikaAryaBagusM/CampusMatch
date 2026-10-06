"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { withDb } from "@/db";
import { kampus } from "@/db/schema";
import { hapusVerifikasi, konfirmasiVerifikasi, mintaVerifikasi, VerifikasiDitolak } from "@/lib/akun/verifikasi-kampus";
import { EmailTidakTersedia, kirimEmail } from "@/lib/email";
import { hapusInfoBiaya } from "@/lib/info-biaya/layanan";
import { hashIpPemanggil } from "@/lib/ip";
import { hapusProfilMinat } from "@/lib/riasec/profil";
import { requirePengulas } from "@/lib/sesi";
import { targetHalamanProdi } from "@/lib/ulasan/kueri";
import { hapusUlasan, UlasanTidakDitemukan } from "@/lib/ulasan/layanan";
import { revalidasiHalamanUlasan } from "@/lib/ulasan/revalidasi";

// A Pengulas deletes their own Info Biaya (ADR 0010); ownership is checked in
// hapusInfoBiaya.
export async function hapusInfoBiayaSaya(formData: FormData) {
  const pengulas = await requirePengulas("/akun");
  const id = Number(formData.get("infoBiayaId"));
  if (!Number.isSafeInteger(id) || id <= 0) return;
  const hasil = await withDb((db) => hapusInfoBiaya(db, pengulas.id, id));
  if (hasil) revalidatePath(`/prodi/${hasil.prodiSlug}`);
  revalidatePath("/akun");
}

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

// Deletes one of the owner's saved Profil Minat (decisions.md 17g).
export async function hapusProfilSaya(formData: FormData) {
  const pengguna = await requirePengulas("/akun");
  const id = String(formData.get("profilId") ?? "");
  if (/^[0-9a-f-]{36}$/i.test(id)) await withDb((db) => hapusProfilMinat(db, pengguna.id, id));
  revalidatePath("/akun");
}

// Every cached page that can show this Pengulas's Ulasan at the Kampus: the
// badge appears or disappears there.
function segarkanHalamanKampus(kampusSlug: string) {
  revalidatePath("/prodi/[slug]", "page");
  revalidatePath(`/kampus/${kampusSlug}`);
  revalidatePath(`/kampus/${kampusSlug}/ulasan`);
}

async function asalSitus() {
  if (process.env.AUTH_URL) return new URL(process.env.AUTH_URL).origin;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const keAkun = (pesan: string, ok = false) => `/akun?kampus=${encodeURIComponent(pesan)}${ok ? "&ok=1" : ""}#email-kampus`;

// Sends the Terverifikasi link to a campus address (decisions.md 17o). The
// address is only used for this email; nothing but its domain is stored.
export async function kirimVerifikasiKampus(formData: FormData) {
  const pengulas = await requirePengulas("/akun");
  const email = String(formData.get("email") ?? "").slice(0, 320);
  let kampusNama: string;
  try {
    const [ipHash, asal] = await Promise.all([hashIpPemanggil(), asalSitus()]);
    ({ kampusNama } = await withDb((db) =>
      mintaVerifikasi(db, { userId: pengulas.id, email, ipHash, asal }, (ke, tautan, nama) =>
        kirimEmail({
          ke,
          judul: "Konfirmasi email kampus di CampusMatch",
          isi: `Halo,\n\nBuka tautan ini untuk menandai ulasanmu di ${nama} sebagai Terverifikasi:\n${tautan}\n\nTautan berlaku 24 jam. Jika kamu tidak memintanya, abaikan email ini.\n\nCampusMatch`,
        }),
      ),
    ));
  } catch (e) {
    if (!(e instanceof VerifikasiDitolak || e instanceof EmailTidakTersedia)) throw e;
    redirect(keAkun(e.message));
  }
  redirect(keAkun(`Tautan dikirim ke alamat email kampusmu. Buka dalam 24 jam untuk Terverifikasi di ${kampusNama}.`, true));
}

export async function hapusVerifikasiKampus(formData: FormData) {
  const pengulas = await requirePengulas("/akun");
  const kampusId = Number(formData.get("kampusId"));
  if (!Number.isSafeInteger(kampusId) || kampusId <= 0) return;
  const slug = await withDb(async (db) => {
    const r = await hapusVerifikasi(db, pengulas.id, kampusId);
    if (!r) return null;
    const [k] = await db.select({ slug: kampus.slug }).from(kampus).where(eq(kampus.id, kampusId));
    return k?.slug ?? null;
  });
  if (slug) segarkanHalamanKampus(slug);
  revalidatePath("/akun");
}

// Opening the link and pressing Konfirmasi. No session needed: the token
// proves the mailbox and is bound to the account that asked for it.
export async function konfirmasiVerifikasiKampus(formData: FormData) {
  const token = String(formData.get("token") ?? "").slice(0, 100);
  let k: { slug: string; nama: string };
  try {
    k = await withDb((db) => konfirmasiVerifikasi(db, token));
  } catch (e) {
    if (!(e instanceof VerifikasiDitolak)) throw e;
    redirect(`/akun/verifikasi-kampus?gagal=1`);
  }
  segarkanHalamanKampus(k.slug);
  redirect(`/akun/verifikasi-kampus?berhasil=${encodeURIComponent(k.nama)}`);
}
