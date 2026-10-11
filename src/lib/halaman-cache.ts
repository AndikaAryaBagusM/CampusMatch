import { revalidatePath } from "next/cache";
import { asc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { beasiswa, beasiswaKampus, kampus, prodi, sumber } from "@/db/schema";

// The cached (ISR) pages a data change touches, so an action refreshes only
// those. Revalidating a whole route ("/prodi/[slug]") re-renders every one of
// its ~27,000 pages on their next visit (decisions.md 15).

// Above this many paths, refreshing the whole route is cheaper than listing them.
export const BATAS_PATH = 500;

// A Kampus page, with `ulasan` its Ulasan tab, and with `prodi` every Prodi
// page of the Kampus (they show its Kampus-wide fees and its Pengulas' badges).
export async function halamanKampus(
  db: Db,
  kampusIds: number[],
  { prodi: denganProdi, ulasan = false }: { prodi: boolean; ulasan?: boolean },
) {
  if (kampusIds.length === 0) return [];
  const daftarKampus = await db
    .select({ slug: kampus.slug })
    .from(kampus)
    .where(inArray(kampus.id, kampusIds))
    .orderBy(asc(kampus.slug));
  const paths = daftarKampus.flatMap((k) => (ulasan ? [`/kampus/${k.slug}`, `/kampus/${k.slug}/ulasan`] : [`/kampus/${k.slug}`]));
  if (!denganProdi) return paths;
  const daftarProdi = await db
    .select({ slug: prodi.slug })
    .from(prodi)
    .where(inArray(prodi.kampusId, kampusIds))
    .orderBy(asc(prodi.slug));
  return [...paths, ...daftarProdi.map((p) => `/prodi/${p.slug}`)];
}

// The pages a checked or withdrawn Sumber shows on: its Kampus and every
// Prodi there, or for a national Sumber (a national Beasiswa) the Kampus
// pages of every Kampus taking part. Prodi pages never show Beasiswa.
export async function halamanSumberFakta(db: Db, sumberId: number) {
  const [s] = await db.select({ kampusId: sumber.kampusId }).from(sumber).where(eq(sumber.id, sumberId));
  if (!s) return [];
  if (s.kampusId !== null) return halamanKampus(db, [s.kampusId], { prodi: true });
  const ikut = await db
    .selectDistinct({ kampusId: beasiswaKampus.kampusId })
    .from(beasiswaKampus)
    .innerJoin(beasiswa, eq(beasiswaKampus.beasiswaId, beasiswa.id))
    .where(eq(beasiswa.sumberId, sumberId));
  return halamanKampus(
    db,
    ikut.map((r) => r.kampusId),
    { prodi: false },
  );
}

// Prodi pages whose Jurusan follows this Kode Prodi, and the home page (its
// Bidang highlights count Jurusan). Kampus pages don't show Jurusan.
export async function halamanKodeProdi(db: Db, kode: string) {
  const rows = await db.select({ slug: prodi.slug }).from(prodi).where(eq(prodi.kodeProdi, kode)).orderBy(asc(prodi.slug));
  return ["/", ...rows.map((p) => `/prodi/${p.slug}`)];
}

// Refreshes the listed pages on their next visit, or, when there are too many
// to list, the whole routes in `cadangan` (e.g. "/prodi/[slug]").
export function segarkanHalaman(paths: string[], cadangan: string[]) {
  if (paths.length > BATAS_PATH) for (const pola of cadangan) revalidatePath(pola, "page");
  else for (const p of paths) revalidatePath(p);
}
