import { and, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { infoBiaya, kampus, prodi, users } from "@/db/schema";
import { BATAS, kunciIp, kunciPengulas, pakaiSemuaBatas } from "@/lib/batas-laju";
import { awalJendela, batasPencilan, terverifikasiDiKampus } from "./estimasi";
import type { DataInfoBiaya } from "./skema";

// Writes and reads of Info Biaya (ADR 0010). A Pengulas sees only their own;
// Moderators see entries one Prodi at a time; the public sees only the Estimasi.

export class InfoBiayaDitolak extends Error {}

function kolom(data: DataInfoBiaya) {
  return {
    statusPengulas: data.statusPengulas,
    tahunMasuk: data.tahunMasuk,
    kategoriJalur: data.jalur,
    tes: data.tes,
    biayaSemester: data.biayaSemester,
    kelompokUkt: data.kelompokUkt,
    uangPangkal: data.uangPangkal,
    biayaLainMasuk: data.biayaLainMasuk,
    beasiswa: data.beasiswa,
  };
}

// One Info Biaya per Pengulas per Prodi: a second save replaces the first and
// renews the consent time. A Moderator's Kesampingkan survives an edit.
export async function simpanInfoBiaya(
  db: Db,
  { userId, prodiId, ipHash, data }: { userId: string; prodiId: number; ipHash: string; data: DataInfoBiaya },
  sekarang = new Date(),
) {
  const boleh = await pakaiSemuaBatas(
    db,
    [
      [kunciPengulas(userId, "info-biaya"), BATAS.infoBiayaPengulas],
      [kunciIp(ipHash, "info-biaya"), BATAS.infoBiayaIp],
    ],
    sekarang,
  );
  if (!boleh) throw new InfoBiayaDitolak("Terlalu banyak info biaya dikirim. Coba lagi nanti.");
  const isi = { ...kolom(data), disetujuiAt: sekarang };
  await db
    .insert(infoBiaya)
    .values({ userId, prodiId, ...isi })
    .onConflictDoUpdate({ target: [infoBiaya.userId, infoBiaya.prodiId], set: { ...isi, updatedAt: sekarang } });
}

export async function getInfoBiayaSaya(db: Db, userId: string, prodiId: number) {
  const [row] = await db
    .select()
    .from(infoBiaya)
    .where(and(eq(infoBiaya.userId, userId), eq(infoBiaya.prodiId, prodiId)));
  return row ?? null;
}

export async function listInfoBiayaSaya(db: Db, userId: string) {
  return db
    .select({
      id: infoBiaya.id,
      prodiSlug: prodi.slug,
      prodiNama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
      kampusNama: kampus.nama,
      tahunMasuk: infoBiaya.tahunMasuk,
      updatedAt: infoBiaya.updatedAt,
    })
    .from(infoBiaya)
    .innerJoin(prodi, eq(prodi.id, infoBiaya.prodiId))
    .innerJoin(kampus, eq(kampus.id, prodi.kampusId))
    .where(eq(infoBiaya.userId, userId))
    .orderBy(desc(infoBiaya.updatedAt));
}

// Only the owner can delete; returns the Prodi to revalidate, or null.
export async function hapusInfoBiaya(db: Db, userId: string, id: number) {
  const [row] = await db
    .delete(infoBiaya)
    .where(and(eq(infoBiaya.id, id), eq(infoBiaya.userId, userId)))
    .returning({ prodiId: infoBiaya.prodiId });
  if (!row) return null;
  const [p] = await db.select({ slug: prodi.slug }).from(prodi).where(eq(prodi.id, row.prodiId));
  return { prodiSlug: p.slug };
}

// Entries whose angkatan has left the window are no longer used, so they are
// deleted (data minimisation). Run daily by the cron.
export async function hapusInfoBiayaLama(db: Db, sekarang = new Date()) {
  const rows = await db.delete(infoBiaya).where(lt(infoBiaya.tahunMasuk, awalJendela(sekarang))).returning({ id: infoBiaya.id });
  return rows.length;
}

// --- Moderators ---

// Prodi with Info Biaya, most recently updated first, for the Moderator list.
export async function listProdiInfoBiaya(db: Db, batas = 100) {
  return db
    .select({
      slug: prodi.slug,
      nama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
      kampusNama: kampus.nama,
      jumlah: sql<number>`count(*)::int`,
      dikesampingkan: sql<number>`count(${infoBiaya.dikesampingkanAt})::int`,
      terakhir: sql<Date>`max(${infoBiaya.updatedAt})`.mapWith((v) => new Date(v)),
    })
    .from(infoBiaya)
    .innerJoin(prodi, eq(prodi.id, infoBiaya.prodiId))
    .innerJoin(kampus, eq(kampus.id, prodi.kampusId))
    .groupBy(prodi.id, kampus.id)
    .orderBy(sql`max(${infoBiaya.updatedAt}) desc`)
    .limit(batas);
}

// Every entry for one Prodi, with who wrote it and whether an amount falls
// outside the band the Estimasi uses (computed over the counted entries).
export async function listInfoBiayaProdiModerasi(db: Db, prodiSlug: string, sekarang = new Date()) {
  const [p] = await db
    .select({ id: prodi.id, slug: prodi.slug, nama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`, kampusNama: kampus.nama })
    .from(prodi)
    .innerJoin(kampus, eq(kampus.id, prodi.kampusId))
    .where(eq(prodi.slug, prodiSlug));
  if (!p) return null;
  const moderator = alias(users, "moderator");
  const rows = await db
    .select({
      id: infoBiaya.id,
      userId: infoBiaya.userId,
      email: users.email,
      statusPengulas: infoBiaya.statusPengulas,
      tahunMasuk: infoBiaya.tahunMasuk,
      kategoriJalur: infoBiaya.kategoriJalur,
      tes: infoBiaya.tes,
      biayaSemester: infoBiaya.biayaSemester,
      kelompokUkt: infoBiaya.kelompokUkt,
      uangPangkal: infoBiaya.uangPangkal,
      biayaLainMasuk: infoBiaya.biayaLainMasuk,
      beasiswa: infoBiaya.beasiswa,
      updatedAt: infoBiaya.updatedAt,
      dikesampingkanAt: infoBiaya.dikesampingkanAt,
      alasanDikesampingkan: infoBiaya.alasanDikesampingkan,
      dikesampingkanEmail: moderator.email,
      terverifikasi: terverifikasiDiKampus,
    })
    .from(infoBiaya)
    .innerJoin(prodi, eq(prodi.id, infoBiaya.prodiId))
    .innerJoin(users, eq(users.id, infoBiaya.userId))
    .leftJoin(moderator, eq(moderator.id, infoBiaya.dikesampingkanOleh))
    .where(eq(infoBiaya.prodiId, p.id))
    .orderBy(desc(infoBiaya.updatedAt));

  const awal = awalJendela(sekarang);
  const dihitung = rows.filter((r) => !r.dikesampingkanAt && r.tahunMasuk >= awal);
  const pagar = {
    biayaSemester: batasPencilan(dihitung.map((r) => r.biayaSemester).filter((v): v is number => v !== null)),
    uangPangkal: batasPencilan(dihitung.map((r) => r.uangPangkal).filter((v): v is number => v !== null && v > 0)),
    biayaLainMasuk: batasPencilan(dihitung.map((r) => r.biayaLainMasuk).filter((v): v is number => v !== null)),
  };
  const di = (b: { bawah: number; atas: number } | null, v: number | null) => b !== null && v !== null && (v < b.bawah || v > b.atas);
  return {
    prodi: p,
    entri: rows.map((r) => ({
      ...r,
      diLuarJendela: r.tahunMasuk < awal,
      pencilan:
        di(pagar.biayaSemester, r.biayaSemester) ||
        (r.uangPangkal !== null && r.uangPangkal > 0 && di(pagar.uangPangkal, r.uangPangkal)) ||
        di(pagar.biayaLainMasuk, r.biayaLainMasuk),
    })),
  };
}

// Set aside one entry, or every not-yet-set-aside entry of one account. The
// entries stay but stop counting. Returns the Prodi slugs to revalidate.
export async function kesampingkanInfoBiaya(
  db: Db,
  sasaran: { id: number } | { userId: string },
  moderatorId: string,
  alasan: string,
  sekarang = new Date(),
): Promise<string[]> {
  const teks = alasan.trim();
  if (!teks) throw new InfoBiayaDitolak("Tulis alasannya.");
  const rows = await db
    .update(infoBiaya)
    .set({ dikesampingkanOleh: moderatorId, dikesampingkanAt: sekarang, alasanDikesampingkan: teks.slice(0, 500) })
    .where(
      and(
        "id" in sasaran ? eq(infoBiaya.id, sasaran.id) : eq(infoBiaya.userId, sasaran.userId),
        isNull(infoBiaya.dikesampingkanAt),
      ),
    )
    .returning({ prodiId: infoBiaya.prodiId });
  return slugProdi(db, rows.map((r) => r.prodiId));
}

// Undo a Kesampingkan on one entry.
export async function pulihkanInfoBiaya(db: Db, id: number): Promise<string[]> {
  const rows = await db
    .update(infoBiaya)
    .set({ dikesampingkanOleh: null, dikesampingkanAt: null, alasanDikesampingkan: null })
    .where(eq(infoBiaya.id, id))
    .returning({ prodiId: infoBiaya.prodiId });
  return slugProdi(db, rows.map((r) => r.prodiId));
}

async function slugProdi(db: Db, ids: number[]): Promise<string[]> {
  const unik = [...new Set(ids)];
  if (!unik.length) return [];
  const rows = await db.select({ slug: prodi.slug }).from(prodi).where(inArray(prodi.id, unik));
  return rows.map((r) => r.slug);
}
