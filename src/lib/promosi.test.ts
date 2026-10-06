import { afterAll, beforeAll, expect, test } from "vitest";
import { eq, sql } from "drizzle-orm";
import { jurusan, kodeProdiJurusan, promosi, promosiKlik } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna } from "../../test/fixtures";
import {
  aktifkan,
  buatDraf,
  catatKlik,
  getPromosi,
  hapusDraf,
  hariIniJakarta,
  hentikan,
  keadaanPromosi,
  listJurusanKampus,
  pilihPromosi,
  PromosiDitolak,
  type DataPromosi,
} from "./promosi";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

// 2026-10-06 10:00 in Jakarta.
const SEKARANG = new Date("2026-10-06T03:00:00Z");
let n = 0;

// A Kampus whose two Prodi map to Jurusan A and B, plus Jurusan C it doesn't offer.
async function siapkan() {
  const kat = await buatKatalog(t.db);
  const [a, b, c] = await t.db
    .insert(jurusan)
    .values(["A", "B", "C"].map((x) => ({ nama: `Jurusan ${x} ${++n}`, slug: `jurusan-${x.toLowerCase()}-${n}` })))
    .returning();
  // buatKatalog's Prodi use Kode 55201 and 61201; remap them for this Kampus's test.
  await t.db
    .insert(kodeProdiJurusan)
    .values([
      { kodeProdi: kat.prodi[0].kodeProdi, jurusanId: a.id },
      { kodeProdi: kat.prodi[1].kodeProdi, jurusanId: b.id },
    ])
    .onConflictDoUpdate({ target: kodeProdiJurusan.kodeProdi, set: { jurusanId: sql`excluded.jurusan_id` } });
  const [m1, m2] = [await buatPengguna(t.db), await buatPengguna(t.db)];
  return { kampus: kat.kampus, a, b, c, m1, m2 };
}

const data = (s: Awaited<ReturnType<typeof siapkan>>, ubah: Partial<DataPromosi> = {}): DataPromosi => ({
  kampusId: s.kampus.id,
  jurusanIds: [s.a.id],
  diBeranda: false,
  mulai: "2026-10-01",
  selesai: "2026-10-31",
  teks: "Pendaftaran Mandiri dibuka",
  catatanInternal: "Kontrak 12/2026",
  ...ubah,
});

const tolak = (p: Promise<unknown>, pesan: RegExp) => expect(p).rejects.toThrow(pesan);

test("hariIniJakarta and keadaan", () => {
  expect(hariIniJakarta(new Date("2026-10-06T18:00:00Z"))).toBe("2026-10-07");
  const p = { status: "aktif", mulai: "2026-10-05", selesai: "2026-10-06" };
  expect(keadaanPromosi(p, "2026-10-04")).toBe("terjadwal");
  expect(keadaanPromosi(p, "2026-10-06")).toBe("tayang");
  expect(keadaanPromosi(p, "2026-10-07")).toBe("selesai");
  expect(keadaanPromosi({ ...p, status: "draf" }, "2026-10-06")).toBe("draf");
});

test("a Draf is validated", async () => {
  const s = await siapkan();
  expect((await listJurusanKampus(t.db, s.kampus.id)).map((j) => j.id).sort()).toEqual([s.a.id, s.b.id].sort());
  await tolak(buatDraf(t.db, data(s, { jurusanIds: [s.c.id] }), s.m1.id, SEKARANG), /tidak ditawarkan/);
  await tolak(buatDraf(t.db, data(s, { jurusanIds: [] }), s.m1.id, SEKARANG), /tempat tampil/);
  await tolak(buatDraf(t.db, data(s, { selesai: "2026-09-30" }), s.m1.id, SEKARANG), /selesai/);
  await tolak(buatDraf(t.db, data(s, { mulai: "2026-10-10", selesai: "2026-10-09" }), s.m1.id, SEKARANG), /selesai/);
  await tolak(buatDraf(t.db, data(s, { teks: "x".repeat(141) }), s.m1.id, SEKARANG), /140/);
  await tolak(buatDraf(t.db, data(s, { kampusId: 999999 }), s.m1.id, SEKARANG), /Kampus/);
});

test("only a second Moderator activates; it shows only where and when it should", async () => {
  const s = await siapkan();
  const id = await buatDraf(t.db, data(s, { diBeranda: true }), s.m1.id, SEKARANG);
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.a.id] }, SEKARANG)).toBeNull();

  await expect(aktifkan(t.db, id, s.m1.id, SEKARANG)).rejects.toBeInstanceOf(PromosiDitolak);
  await aktifkan(t.db, id, s.m2.id, SEKARANG);

  const tampil = await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.a.id, s.c.id] }, SEKARANG);
  expect(tampil).toMatchObject({ id, teks: "Pendaftaran Mandiri dibuka", kampus: { slug: s.kampus.slug } });
  expect(Object.keys(tampil!.kampus).sort()).toEqual(["akreditasi", "kotaNama", "nama", "npsn", "slug"]);
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.b.id] }, SEKARANG)).toBeNull();
  expect((await pilihPromosi(t.db, { tempat: "beranda" }, SEKARANG))?.id).toBeDefined();
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.a.id] }, new Date("2026-11-01T03:00:00Z"))).toBeNull();
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [] }, SEKARANG)).toBeNull();

  // Clicks: a daily total, only while it shows.
  expect(await catatKlik(t.db, id, SEKARANG)).toBe(s.kampus.slug);
  await catatKlik(t.db, id, SEKARANG);
  await catatKlik(t.db, id, new Date("2026-11-02T03:00:00Z"));
  expect(await t.db.select({ tanggal: promosiKlik.tanggal, jumlah: promosiKlik.jumlah }).from(promosiKlik).where(eq(promosiKlik.promosiId, id))).toEqual([
    { tanggal: "2026-10-06", jumlah: 2 },
  ]);
  expect(await catatKlik(t.db, 999999, SEKARANG)).toBeNull();

  await tolak(hentikan(t.db, id, s.m1.id, " "), /alasan/);
  await tolak(hapusDraf(t.db, id), /Draf/);
  await hentikan(t.db, id, s.m1.id, "Kontrak berakhir");
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.a.id] }, SEKARANG)).toBeNull();
  await catatKlik(t.db, id, SEKARANG);
  const detail = await getPromosi(t.db, id, SEKARANG);
  expect(detail).toMatchObject({ keadaan: "dihentikan", dimasukkanEmail: s.m1.email, diaktifkanEmail: s.m2.email, alasanDihentikan: "Kontrak berakhir" });
  expect(detail!.klik).toEqual([{ tanggal: "2026-10-06", jumlah: 2 }]);
});

test("several Promosi take turns by the hour", async () => {
  const s = await siapkan();
  const ids = [];
  for (let i = 0; i < 2; i++) {
    const id = await buatDraf(t.db, data(s, { jurusanIds: [s.b.id] }), s.m1.id, SEKARANG);
    await aktifkan(t.db, id, s.m2.id, SEKARANG);
    ids.push(id);
  }
  const jam = (h: number) => new Date(Date.UTC(2026, 9, 6, h));
  const pilih = async (d: Date) => (await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.b.id] }, d))!.id;
  expect(await pilih(jam(3))).toBe(await pilih(jam(3)));
  expect(new Set([await pilih(jam(3)), await pilih(jam(4))])).toEqual(new Set(ids));
});

test("a Draf can be deleted; the database refuses a self-activated Promosi", async () => {
  const s = await siapkan();
  const id = await buatDraf(t.db, data(s), s.m1.id, SEKARANG);
  await expect(
    t.db.update(promosi).set({ status: "aktif", diaktifkanOleh: s.m1.id, diaktifkanAt: new Date() }).where(eq(promosi.id, id)),
  ).rejects.toThrow();
  await hapusDraf(t.db, id);
  expect(await getPromosi(t.db, id)).toBeNull();
});
