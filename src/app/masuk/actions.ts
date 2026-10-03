"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { caraMasuk, signIn } from "@/auth";
import { withDb } from "@/db";
import { BATAS, kunciIp, pakaiBatas } from "@/lib/batas-laju";
import { hashIpPemanggil } from "@/lib/ip";
import { jalurAman } from "@/lib/sesi";

export async function masukGoogle(formData: FormData) {
  if (!caraMasuk().google) return;
  await signIn("google", { redirectTo: jalurAman(formData.get("callbackUrl")) });
}

export type StatusMasukEmail = { pesan: string } | null;

const email = z.email().max(254);

export async function masukEmail(_prev: StatusMasukEmail, formData: FormData): Promise<StatusMasukEmail> {
  if (!caraMasuk().email) return { pesan: "Masuk lewat email belum tersedia." };
  const parsed = email.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { pesan: "Alamat email tidak valid." };

  // Each request sends an email, so cap it per IP.
  const ipHash = await hashIpPemanggil();
  const boleh = await withDb((db) => pakaiBatas(db, kunciIp(ipHash, "email_masuk"), BATAS.emailMasukIp));
  if (!boleh) return { pesan: "Terlalu banyak permintaan. Coba lagi dalam satu jam." };

  try {
    // Redirects to /masuk/cek-email on success.
    await signIn("resend", { email: parsed.data, redirectTo: jalurAman(formData.get("callbackUrl")) });
  } catch (e) {
    if (e instanceof AuthError) return { pesan: "Email masuk belum bisa dikirim. Coba lagi nanti." };
    throw e;
  }
  return null;
}
