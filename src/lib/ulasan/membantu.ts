import { and, count, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { kampus, prodi, ulasan, ulasanMembantu, ulasanRevisi } from "@/db/schema";
import { ulasanTerbit } from "@/lib/katalog";

// Marks a Terbit Ulasan that has a story as Membantu, once per ip_hash, and
// returns the new count with the Prodi page to refresh. null when the Ulasan
// isn't shown (or has ratings only); `baru` is false for a repeat mark.
export async function tandaiMembantu(db: Db, { ulasanId, ipHash }: { ulasanId: string; ipHash: string }) {
  const [u] = await db
    .select({ id: ulasan.id, prodiSlug: prodi.slug, kampusSlug: kampus.slug })
    .from(ulasan)
    .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
    .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
    .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
    .where(and(eq(ulasan.id, ulasanId), ulasanTerbit))
    .limit(1);
  if (!u) return null;

  const masuk = await db.insert(ulasanMembantu).values({ ulasanId, ipHash }).onConflictDoNothing().returning({ ulasanId: ulasanMembantu.ulasanId });
  const [{ jumlah }] = await db.select({ jumlah: count() }).from(ulasanMembantu).where(eq(ulasanMembantu.ulasanId, ulasanId));
  return { jumlah, baru: masuk.length > 0, prodiSlug: u.prodiSlug, kampusSlug: u.kampusSlug };
}
