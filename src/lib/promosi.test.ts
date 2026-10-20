import { afterAll, beforeAll, expect, test } from "vitest";
import { eq, sql } from "drizzle-orm";
import { jurusan, kodeProdiJurusan, promosi, promosiKlik } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna } from "../../test/fixtures";
import {
  aktifkan,
  buatDraf,
  catatKlik,
  domainTautan,
  getPromosi,
  hapusDraf,
  hariIniJakarta,
  hentikan,
  keadaanPromosi,
  klikCsv,
  listJurusanKampus,
  periksaTautan,
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

type DataKampus = Extract<DataPromosi, { jenis: "kampus" }>;
type DataBimbel = Extract<DataPromosi, { jenis: "bimbel" }>;

const data = (s: Awaited<ReturnType<typeof siapkan>>, ubah: Partial<DataKampus> = {}): DataKampus => ({
  jenis: "kampus",
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
  expect(tampil).toMatchObject({ id, jenis: "kampus", teks: "Pendaftaran Mandiri dibuka", kampus: { slug: s.kampus.slug } });
  expect(Object.keys(tampil!.jenis === "kampus" ? tampil!.kampus : {}).sort()).toEqual(["akreditasi", "kotaNama", "nama", "npsn", "slug"]);
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.b.id] }, SEKARANG)).toBeNull();
  expect((await pilihPromosi(t.db, { tempat: "beranda" }, SEKARANG))?.id).toBeDefined();
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.a.id] }, new Date("2026-11-01T03:00:00Z"))).toBeNull();
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [] }, SEKARANG)).toBeNull();

  // Clicks: a daily total, only while it shows.
  expect(await catatKlik(t.db, id, SEKARANG)).toBe(`/kampus/${s.kampus.slug}`);
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

// --- Bimbel (ADR 0012) -----------------------------------------------------------

const bimbel = (s: Awaited<ReturnType<typeof siapkan>>, ubah: Partial<DataBimbel> = {}): DataBimbel => ({
  jenis: "bimbel",
  namaPengiklan: "Bimbel Contoh",
  tautan: "https://www.contoh-bimbel.id/snbt?utm_source=campusmatch",
  jurusanIds: [s.c.id],
  diBeranda: false,
  mulai: "2026-10-01",
  selesai: "2026-10-31",
  teks: "Kelas persiapan SNBT 2027",
  catatanInternal: "",
  ...ubah,
});

test("periksaTautan accepts https on a public domain with utm_ only", () => {
  expect(periksaTautan(" https://Contoh-Bimbel.id/snbt?utm_source=campusmatch&UTM_Medium=promosi ")).toBe(
    "https://contoh-bimbel.id/snbt?utm_source=campusmatch&UTM_Medium=promosi",
  );
  expect(domainTautan("https://www.contoh-bimbel.id/a")).toBe("contoh-bimbel.id");
  for (const [tautan, pesan] of [
    ["contoh-bimbel.id", /https/],
    ["http://contoh-bimbel.id", /https/],
    ["javascript:alert(1)", /https/],
    ["https://user:pw@contoh-bimbel.id", /kata sandi/],
    ["https://contoh-bimbel.id:8443", /port/],
    ["https://localhost/", /domain publik/],
    ["https://127.0.0.1/", /domain publik/],
    ["https://[::1]/", /domain publik/],
    ["https://contoh-bimbel.id/?ref=abc", /"ref"/],
    ["https://contoh-bimbel.id/?utm_source=x&fbclid=y", /"fbclid"/],
    [`https://contoh-bimbel.id/${"a".repeat(500)}`, /500/],
  ] as const)
    expect(() => periksaTautan(tautan), tautan).toThrow(pesan);
});

test("a bimbel Draf targets any Jurusan and needs its name, text and link", async () => {
  const s = await siapkan();
  await tolak(buatDraf(t.db, bimbel(s, { namaPengiklan: " " }), s.m1.id, SEKARANG), /nama bimbel/);
  await tolak(buatDraf(t.db, bimbel(s, { namaPengiklan: "x".repeat(81) }), s.m1.id, SEKARANG), /80/);
  await tolak(buatDraf(t.db, bimbel(s, { teks: " " }), s.m1.id, SEKARANG), /perlu teks/);
  await tolak(buatDraf(t.db, bimbel(s, { tautan: "http://contoh-bimbel.id" }), s.m1.id, SEKARANG), /https/);
  await tolak(buatDraf(t.db, bimbel(s, { jurusanIds: [999999] }), s.m1.id, SEKARANG), /tidak ditemukan/);

  // Jurusan C is offered by no Kampus here; a bimbel may still buy it.
  const id = await buatDraf(t.db, bimbel(s), s.m1.id, SEKARANG);
  await aktifkan(t.db, id, s.m2.id, SEKARANG);
  expect(await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.c.id] }, SEKARANG)).toEqual({
    id,
    jenis: "bimbel",
    nama: "Bimbel Contoh",
    teks: "Kelas persiapan SNBT 2027",
    tautan: "https://www.contoh-bimbel.id/snbt?utm_source=campusmatch",
  });
  expect(await catatKlik(t.db, id, SEKARANG)).toBe("https://www.contoh-bimbel.id/snbt?utm_source=campusmatch");
  const detail = await getPromosi(t.db, id, SEKARANG);
  expect(detail).toMatchObject({
    nama: "Bimbel Contoh",
    keadaan: "tayang",
    klik: [{ tanggal: "2026-10-06", jumlah: 1 }],
  });
  expect(detail!.tampil.jenis).toBe("bimbel");
});

test("a Kampus Promosi and a bimbel one take turns in the same slot", async () => {
  const s = await siapkan();
  const ids = [
    await buatDraf(t.db, data(s, { jurusanIds: [s.b.id] }), s.m1.id, SEKARANG),
    await buatDraf(t.db, bimbel(s, { jurusanIds: [s.b.id] }), s.m1.id, SEKARANG),
  ];
  for (const id of ids) await aktifkan(t.db, id, s.m2.id, SEKARANG);
  const jam = (h: number) => new Date(Date.UTC(2026, 9, 6, h));
  const pilih = async (d: Date) => (await pilihPromosi(t.db, { tempat: "jurusan", jurusanIds: [s.b.id] }, d))!;
  const [satu, dua] = [await pilih(jam(3)), await pilih(jam(4))];
  expect(new Set([satu.id, dua.id])).toEqual(new Set(ids));
  expect(new Set([satu.jenis, dua.jenis])).toEqual(new Set(["kampus", "bimbel"]));
});

test("the database refuses a row that mixes the two kinds", async () => {
  const s = await siapkan();
  const dasar = { mulai: "2026-10-01", selesai: "2026-10-31", teks: "Teks" };
  await expect(t.db.insert(promosi).values({ ...dasar, jenis: "bimbel", namaPengiklan: "X" })).rejects.toThrow();
  await expect(
    t.db.insert(promosi).values({
      ...dasar,
      jenis: "bimbel",
      namaPengiklan: "X",
      tautan: "https://x.id",
      kampusId: s.kampus.id,
    }),
  ).rejects.toThrow();
  await expect(
    t.db.insert(promosi).values({
      ...dasar,
      jenis: "bimbel",
      namaPengiklan: "X",
      tautan: "http://x.id",
    }),
  ).rejects.toThrow();
  await expect(
    t.db.insert(promosi).values({
      ...dasar,
      jenis: "kampus",
      kampusId: s.kampus.id,
      tautan: "https://x.id",
    }),
  ).rejects.toThrow();
  await expect(t.db.insert(promosi).values({ ...dasar, jenis: "kampus" })).rejects.toThrow();
});

test("klikCsv lists days oldest first", () => {
  expect(klikCsv([])).toBe("tanggal,klik\r\n");
  expect(
    klikCsv([
      { tanggal: "2026-10-07", jumlah: 3 },
      { tanggal: "2026-10-05", jumlah: 12 },
    ]),
  ).toBe("tanggal,klik\r\n2026-10-05,12\r\n2026-10-07,3\r\n");
});
