import { and, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { ulasan, users } from "@/db/schema";

// The "18 tahun atau lebih" declaration every account needs (ADR 0008).

export async function nyatakanDewasa(db: Db, userId: string) {
  await db
    .update(users)
    .set({ usia18At: sql`now()` })
    .where(and(eq(users.id, userId), isNull(users.dikunciAt), isNull(users.usia18At)));
}

// Under 18: an account that has never written an Ulasan is deleted at once
// (its Profil Minat and sessions go with it), so no data about the child is
// kept. One that has is locked instead; its Ulasan stay, as they are shown
// without a name, until the holder asks for deletion.
export async function nyatakanBelumDewasa(db: Db, userId: string): Promise<"dihapus" | "dikunci"> {
  return db.transaction(async (tx) => {
    const [punyaUlasan] = await tx.select({ id: ulasan.id }).from(ulasan).where(eq(ulasan.pengulasId, userId)).limit(1);
    if (!punyaUlasan) {
      await tx.delete(users).where(eq(users.id, userId));
      return "dihapus";
    }
    await tx.update(users).set({ dikunciAt: sql`now()` }).where(eq(users.id, userId));
    return "dikunci";
  });
}
