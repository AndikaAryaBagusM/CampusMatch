import { sql } from "drizzle-orm";
import type { Db } from "@/db";
import { batasLaju } from "@/db/schema";

export type Batas = { maks: number; jendelaDetik: number };

const JAM = 3600;
const HARI = 86400;

// Limits per action. IP limits are generous because a campus network puts many
// students behind one address; the per-Pengulas limits do the real work.
export const BATAS = {
  ulasanPengulas: { maks: 5, jendelaDetik: HARI },
  ulasanIp: { maks: 30, jendelaDetik: JAM },
  laporanPengulas: { maks: 10, jendelaDetik: HARI },
  laporanIp: { maks: 20, jendelaDetik: HARI },
  emailMasukIp: { maks: 5, jendelaDetik: JAM },
  verifikasiKampusPengulas: { maks: 5, jendelaDetik: HARI },
  verifikasiKampusIp: { maks: 20, jendelaDetik: JAM },
  infoBiayaPengulas: { maks: 10, jendelaDetik: HARI },
  infoBiayaIp: { maks: 30, jendelaDetik: JAM },
} satisfies Record<string, Batas>;

export const kunciIp = (ipHash: string, aksi: string) => `ip:${ipHash}:${aksi}`;
export const kunciPengulas = (userId: string, aksi: string) => `user:${userId}:${aksi}`;

export function awalJendela(sekarang: Date, jendelaDetik: number): Date {
  const ms = jendelaDetik * 1000;
  return new Date(Math.floor(sekarang.getTime() / ms) * ms);
}

// Counts one use of kunci in the current fixed window and says whether it is
// still within the limit. The increment is a single atomic upsert, so
// concurrent requests can't both slip under the limit.
export async function pakaiBatas(db: Db, kunci: string, batas: Batas, sekarang = new Date()): Promise<boolean> {
  const [row] = await db
    .insert(batasLaju)
    .values({ kunci, mulai: awalJendela(sekarang, batas.jendelaDetik), jumlah: 1 })
    .onConflictDoUpdate({
      target: [batasLaju.kunci, batasLaju.mulai],
      set: { jumlah: sql`${batasLaju.jumlah} + 1` },
    })
    .returning({ jumlah: batasLaju.jumlah });
  return row.jumlah <= batas.maks;
}

// All limits must pass; every one is counted, so a blocked caller keeps using up
// their window.
export async function pakaiSemuaBatas(db: Db, daftar: [kunci: string, batas: Batas][], sekarang = new Date()) {
  const hasil = await Promise.all(daftar.map(([kunci, batas]) => pakaiBatas(db, kunci, batas, sekarang)));
  return hasil.every(Boolean);
}

// Windows end after at most a day; the Screening cron clears older rows.
export async function hapusBatasLama(db: Db, sekarang = new Date()) {
  await db.delete(batasLaju).where(sql`${batasLaju.mulai} < ${new Date(sekarang.getTime() - 2 * HARI * 1000)}`);
}
