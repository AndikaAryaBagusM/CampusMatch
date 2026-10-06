// Terverifikasi (decisions.md 17o): a Pengulas proves a link to a Kampus by
// opening a link sent to an address on its email domain. The address is
// used once, to send the link; we keep only the domain and the date. The
// badge is permanent and shows on their Ulasan for that Kampus's Prodi.
import { createHash, randomBytes } from "node:crypto";
import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, tokenVerifikasiKampus, verifikasiKampus } from "@/db/schema";
import { BATAS, kunciIp, kunciPengulas, pakaiSemuaBatas } from "@/lib/batas-laju";
import { domainEmail } from "./domain-kampus";

export class VerifikasiDitolak extends Error {}

const BERLAKU_MS = 24 * 3_600_000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// The Kampus whose domain is the address's domain or a parent of it; the
// most specific domain wins.
export async function cariKampusDomain(db: Db, domain: string) {
  const [k] = await db
    .select({ id: kampus.id, nama: kampus.nama, slug: kampus.slug, domain: kampus.domainEmail })
    .from(kampus)
    .where(sql`${kampus.domainEmail} = ${domain} OR ${domain} LIKE '%.' || ${kampus.domainEmail}`)
    .orderBy(desc(sql`length(${kampus.domainEmail})`))
    .limit(1);
  return k ? { ...k, domain: k.domain! } : null;
}

export type Kirim = (ke: string, tautan: string, namaKampus: string) => Promise<void>;

// Sends a confirmation link to a campus address. Throws VerifikasiDitolak
// with a message for the visitor.
export async function mintaVerifikasi(
  db: Db,
  { userId, email, ipHash, asal }: { userId: string; email: string; ipHash: string; asal: string },
  kirim: Kirim,
  sekarang = new Date(),
) {
  const domain = domainEmail(email);
  if (!domain) throw new VerifikasiDitolak("Masukkan alamat email kampus, misalnya nama@mail.ugm.ac.id.");
  const k = await cariKampusDomain(db, domain);
  if (!k) throw new VerifikasiDitolak("Domain email ini belum terdaftar untuk Kampus mana pun. Kami menambahkannya bertahap.");
  const [sudah] = await db
    .select({ kampusId: verifikasiKampus.kampusId })
    .from(verifikasiKampus)
    .where(and(eq(verifikasiKampus.userId, userId), eq(verifikasiKampus.kampusId, k.id)));
  if (sudah) throw new VerifikasiDitolak(`Kamu sudah Terverifikasi di ${k.nama}.`);
  const boleh = await pakaiSemuaBatas(
    db,
    [
      [kunciPengulas(userId, "verifikasi-kampus"), BATAS.verifikasiKampusPengulas],
      [kunciIp(ipHash, "verifikasi-kampus"), BATAS.verifikasiKampusIp],
    ],
    sekarang,
  );
  if (!boleh) throw new VerifikasiDitolak("Terlalu banyak permintaan. Coba lagi besok.");

  const token = randomBytes(32).toString("base64url");
  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    await t.delete(tokenVerifikasiKampus).where(and(eq(tokenVerifikasiKampus.userId, userId), eq(tokenVerifikasiKampus.kampusId, k.id)));
    await t.insert(tokenVerifikasiKampus).values({
      userId,
      kampusId: k.id,
      domain: k.domain,
      tokenHash: hashToken(token),
      expiresAt: new Date(sekarang.getTime() + BERLAKU_MS),
    });
  });
  await kirim(email.trim(), `${asal}/akun/verifikasi-kampus?token=${token}`, k.nama);
  return { kampusNama: k.nama };
}

// For the confirmation page: which Kampus, and whether the link still works.
export async function getTokenVerifikasi(db: Db, token: string, sekarang = new Date()) {
  if (!token) return null;
  const [r] = await db
    .select({ kampusNama: kampus.nama, expiresAt: tokenVerifikasiKampus.expiresAt })
    .from(tokenVerifikasiKampus)
    .innerJoin(kampus, eq(tokenVerifikasiKampus.kampusId, kampus.id))
    .where(eq(tokenVerifikasiKampus.tokenHash, hashToken(token)));
  if (!r) return null;
  return { kampusNama: r.kampusNama, berlaku: r.expiresAt > sekarang };
}

// Turns a valid link into a Terverifikasi record and uses the link up.
export async function konfirmasiVerifikasi(db: Db, token: string, sekarang = new Date()) {
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const [r] = await t
      .delete(tokenVerifikasiKampus)
      .where(and(eq(tokenVerifikasiKampus.tokenHash, hashToken(token)), gt(tokenVerifikasiKampus.expiresAt, sekarang)))
      .returning({ userId: tokenVerifikasiKampus.userId, kampusId: tokenVerifikasiKampus.kampusId, domain: tokenVerifikasiKampus.domain });
    if (!r) throw new VerifikasiDitolak("Tautan ini sudah dipakai atau kedaluwarsa. Minta tautan baru di halaman Akun.");
    await t
      .insert(verifikasiKampus)
      .values({ userId: r.userId, kampusId: r.kampusId, domain: r.domain, verifiedAt: sekarang })
      .onConflictDoNothing();
    const [k] = await t.select({ slug: kampus.slug, nama: kampus.nama }).from(kampus).where(eq(kampus.id, r.kampusId));
    return k;
  });
}

export async function listVerifikasiSaya(db: Db, userId: string) {
  return db
    .select({ kampusId: kampus.id, kampusNama: kampus.nama, kampusSlug: kampus.slug, domain: verifikasiKampus.domain, verifiedAt: verifikasiKampus.verifiedAt })
    .from(verifikasiKampus)
    .innerJoin(kampus, eq(verifikasiKampus.kampusId, kampus.id))
    .where(eq(verifikasiKampus.userId, userId))
    .orderBy(asc(kampus.nama));
}

// Only the owner's own row; returns the Kampus slug to refresh its pages.
export async function hapusVerifikasi(db: Db, userId: string, kampusId: number) {
  const [r] = await db
    .delete(verifikasiKampus)
    .where(and(eq(verifikasiKampus.userId, userId), eq(verifikasiKampus.kampusId, kampusId)))
    .returning({ kampusId: verifikasiKampus.kampusId });
  return r ?? null;
}
