import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import type { Db } from "@/db";
import { kunjunganHarian } from "@/db/schema";
import { hariIniJakarta } from "@/lib/promosi";

// Page views as daily totals (decisions.md 17t): which page, which kind of
// place the visit came from, how many. Nothing about the visitor is stored or
// even read for this: no IP, no cookie, no identifier.

const SLUG = "[a-z0-9-]{1,200}";

// The public pages that are counted. Account and Moderator pages never are.
const HALAMAN: RegExp[] = [
  /^\/$/,
  /^\/(cari|tes-minat|tes-minat\/hasil|bandingkan|tersimpan|kota|masuk|privasi|ketentuan|pasang-promosi)$/,
  new RegExp(`^/(jurusan|kota)/${SLUG}$`),
  new RegExp(`^/kampus/${SLUG}(/(prodi|ulasan|tulis))?$`),
  new RegExp(`^/prodi/${SLUG}(/(tulis|info-biaya))?$`),
];

// A pathname -> the path that is counted, or null. Query strings never reach
// here: a Tes Minat result's scores or a search term are not stored.
export function jalurTercatat(pathname: unknown): string | null {
  if (typeof pathname !== "string" || pathname.length > 260) return null;
  const jalur = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return HALAMAN.some((h) => h.test(jalur)) ? jalur : null;
}

export const ASAL = ["langsung", "internal", "pencarian", "sosial", "lain"] as const;
export type Asal = (typeof ASAL)[number];

export const LABEL_ASAL: Record<Asal, string> = {
  langsung: "Langsung (ketik alamat, tautan di aplikasi)",
  internal: "Dari halaman CampusMatch lain",
  pencarian: "Mesin pencari",
  sosial: "Media sosial dan pesan",
  lain: "Situs lain",
};

const PENCARIAN = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|ecosia|brave)\./;
const SOSIAL = /(^|\.)(whatsapp\.com|wa\.me|instagram\.com|tiktok\.com|facebook\.com|fb\.com|t\.co|x\.com|twitter\.com|youtube\.com|youtu\.be|line\.me|telegram\.org|t\.me|threads\.net|threads\.com|linkedin\.com)$/;

// The referrer is reduced to one of five groups before anything is stored, so
// no address a visitor came from is ever kept.
export function kelompokAsal(referrer: unknown, hostSitus: string): Asal {
  if (typeof referrer !== "string" || !referrer) return "langsung";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "lain";
  }
  if (host === hostSitus.toLowerCase()) return "internal";
  if (PENCARIAN.test(host)) return "pencarian";
  if (SOSIAL.test(host)) return "sosial";
  return "lain";
}

export const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|scrapy|facebookexternalhit/i;

// At most this many distinct pages are counted per day, so made-up addresses
// can't grow the table without limit. Pages already counted today keep counting.
export const MAKS_JALUR_PER_HARI = 20_000;

export async function catatKunjungan(db: Db, { jalur, asal }: { jalur: string; asal: Asal }, sekarang = new Date()) {
  const tanggal = hariIniJakarta(sekarang);
  const naik = await db
    .update(kunjunganHarian)
    .set({ jumlah: sql`${kunjunganHarian.jumlah} + 1` })
    .where(and(eq(kunjunganHarian.tanggal, tanggal), eq(kunjunganHarian.jalur, jalur), eq(kunjunganHarian.asal, asal)))
    .returning({ jumlah: kunjunganHarian.jumlah });
  if (naik.length > 0) return;
  await db.execute(sql`
    INSERT INTO ${kunjunganHarian} (tanggal, jalur, asal, jumlah)
    SELECT ${tanggal}::date, ${jalur}, ${asal}, 1
    WHERE (SELECT count(*) FROM ${kunjunganHarian} WHERE tanggal = ${tanggal}::date) < ${MAKS_JALUR_PER_HARI}
    ON CONFLICT (tanggal, jalur, asal) DO UPDATE SET jumlah = ${kunjunganHarian.jumlah} + 1`);
}

// --- Reading (Moderators) -----------------------------------------------------

const jumlah = sql<number>`coalesce(${sum(kunjunganHarian.jumlah)}, 0)::int`;

// The kind of page a path belongs to, for the summary by section.
export const BAGIAN_SQL = sql<string>`CASE
  WHEN ${kunjunganHarian.jalur} = '/' THEN 'Beranda'
  WHEN ${kunjunganHarian.jalur} LIKE '/prodi/%/tulis' OR ${kunjunganHarian.jalur} LIKE '/kampus/%/tulis' THEN 'Formulir ulasan'
  WHEN ${kunjunganHarian.jalur} LIKE '/prodi/%' THEN 'Prodi'
  WHEN ${kunjunganHarian.jalur} LIKE '/kampus/%' THEN 'Kampus'
  WHEN ${kunjunganHarian.jalur} LIKE '/jurusan/%' THEN 'Jurusan'
  WHEN ${kunjunganHarian.jalur} LIKE '/kota%' THEN 'Kota'
  WHEN ${kunjunganHarian.jalur} LIKE '/tes-minat%' THEN 'Tes Minat'
  WHEN ${kunjunganHarian.jalur} = '/cari' THEN 'Pencarian'
  WHEN ${kunjunganHarian.jalur} IN ('/bandingkan', '/tersimpan') THEN 'Bandingkan dan tersimpan'
  ELSE 'Lainnya' END`;

export async function ringkasanKunjungan(db: Db, hari: number, sekarang = new Date()) {
  const mulai = hariIniJakarta(new Date(sekarang.getTime() - (hari - 1) * 86_400_000));
  const dalamRentang = gte(kunjunganHarian.tanggal, mulai);
  const [perHari, perAsal, perBagian, teratas] = await Promise.all([
    db.select({ tanggal: kunjunganHarian.tanggal, jumlah }).from(kunjunganHarian).where(dalamRentang).groupBy(kunjunganHarian.tanggal).orderBy(desc(kunjunganHarian.tanggal)),
    db.select({ asal: kunjunganHarian.asal, jumlah }).from(kunjunganHarian).where(dalamRentang).groupBy(kunjunganHarian.asal).orderBy(desc(jumlah)),
    db.select({ bagian: BAGIAN_SQL, jumlah }).from(kunjunganHarian).where(dalamRentang).groupBy(BAGIAN_SQL).orderBy(desc(jumlah)),
    db
      .select({ jalur: kunjunganHarian.jalur, jumlah })
      .from(kunjunganHarian)
      .where(dalamRentang)
      .groupBy(kunjunganHarian.jalur)
      .orderBy(desc(jumlah), kunjunganHarian.jalur)
      .limit(40),
  ]);
  return { mulai, total: perHari.reduce((s, h) => s + h.jumlah, 0), perHari, perAsal, perBagian, teratas };
}
