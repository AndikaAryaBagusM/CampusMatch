import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { biaya, jurusan, kampus, kodeProdiJurusan, prodi, sumber } from "@/db/schema";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../test/fixtures";
import { countJurusanPerKota, countProdiJurusan, listProdiJurusan, TANPA_FILTER, type Urut } from "./prodi-jurusan";
import { tulisUlasan } from "./ulasan/layanan";
import { prosesScreening } from "./ulasan/proses-screening";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

let n = 0;
const model: ScreeningModel = { id: "model-uji", klasifikasi: async () => ({ tingkatRisiko: "rendah", alasan: "x" }) };

// A Jurusan with one Prodi at each of the named Kampus (in its own Kota).
async function buatJurusan(namaKampus: string[]) {
  const kode = `9${String(++n).padStart(4, "0")}`;
  const [j] = await t.db.insert(jurusan).values({ nama: `Jurusan ${kode}`, slug: `jurusan-${kode}` }).returning();
  await t.db.insert(kodeProdiJurusan).values({ kodeProdi: kode, jurusanId: j.id });
  const daftar = [];
  for (const nama of namaKampus) {
    const kat = await buatKatalog(t.db);
    await t.db.update(kampus).set({ nama }).where(eq(kampus.id, kat.kampus.id));
    const [p] = await t.db
      .insert(prodi)
      .values({ kampusId: kat.kampus.id, kodeProdi: kode, nama: "Ilmu Uji", jenjang: "S1", slug: `uji-${kode}-${kat.kampus.id}` })
      .returning();
    daftar.push({ kampus: kat.kampus, prodi: p });
  }
  return { slug: j.slug, daftar };
}

async function buatSumber(kampusId: number) {
  const [s] = await t.db
    .insert(sumber)
    .values({ kode: `s-${++n}`, kampusId, url: "https://contoh.ac.id/ukt", judul: "UKT", penerbit: "Kampus", diaksesPada: "2026-06-01" })
    .returning();
  return s.id;
}

type Status = "draf" | "diperiksa" | "ditarik";
async function ukt(kampusId: number, prodiId: number | null, jumlah: number, tahunAkademik = 2026, status: Status = "diperiksa") {
  const [a, b] = [await buatPengguna(t.db), await buatPengguna(t.db)];
  await t.db.insert(biaya).values({
    kampusId,
    prodiId,
    jenis: "ukt",
    jumlah,
    periode: "per_semester",
    sumberId: await buatSumber(kampusId),
    tahunAkademik,
    status,
    dimasukkanOleh: a.id,
    diperiksaOleh: status === "draf" ? null : b.id,
    diperiksaAt: status === "draf" ? null : new Date(),
    ditarikAt: status === "ditarik" ? new Date() : null,
    alasanDitarik: status === "ditarik" ? "salah ketik" : null,
  });
}

async function ulas(prodiId: number, bintang: number, kali: number) {
  for (let i = 0; i < kali; i++) {
    const u = await buatPengguna(t.db);
    const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId, data: dataUlasan({ bintang }) });
    await prosesScreening(t.db, r.revisiId, model, { tidur: async () => {} });
  }
}

const daftar = (slug: string, urut: Urut = "nama", f = {}) =>
  listProdiJurusan(t.db, slug, { ...TANPA_FILTER, ...f, urut, limit: 20, offset: 0 });

test("default order is by Kampus name; Kota filter and per-Kota counts", async () => {
  const j = await buatJurusan(["Universitas Citra", "Institut Alfa", "Universitas Beta"]);
  expect((await daftar(j.slug)).map((p) => p.kampus.nama)).toEqual(["Institut Alfa", "Universitas Beta", "Universitas Citra"]);

  const kota = await countJurusanPerKota(t.db, j.slug);
  expect(kota).toHaveLength(3);
  expect((await daftar(j.slug, "nama", { kotaSlug: kota[0].slug })).map((p) => p.kotaNama)).toEqual([kota[0].nama]);
  expect(await countProdiJurusan(t.db, j.slug, { ...TANPA_FILTER, kotaSlug: kota[0].slug })).toEqual({ jumlahProdi: 1, jumlahKampus: 1 });
});

test("UKT: the highest Diperiksa UKT of the newest Tahun Akademik, Prodi before Kampus-wide", async () => {
  const j = await buatJurusan(["A Kampus", "B Kampus", "C Kampus", "D Kampus"]);
  const [a, b, c] = j.daftar;
  // A: two groups this year, an older higher one, a Draf and a Ditarik one.
  await ukt(a.kampus.id, a.prodi.id, 500_000);
  await ukt(a.kampus.id, a.prodi.id, 4_000_000);
  await ukt(a.kampus.id, a.prodi.id, 9_000_000, 2025);
  await ukt(a.kampus.id, a.prodi.id, 20_000_000, 2026, "draf");
  await ukt(a.kampus.id, a.prodi.id, 30_000_000, 2026, "ditarik");
  // B: only a Kampus-wide value. C: both; its own wins. D: nothing.
  await ukt(b.kampus.id, null, 3_000_000);
  await ukt(c.kampus.id, null, 1_000_000);
  await ukt(c.kampus.id, c.prodi.id, 7_000_000);

  const rows = await daftar(j.slug, "ukt");
  expect(rows.map((r) => [r.kampus.nama, r.ukt, r.uktTingkat, r.uktTahun])).toEqual([
    ["B Kampus", 3_000_000, "kampus", 2026],
    ["A Kampus", 4_000_000, "prodi", 2026],
    ["C Kampus", 7_000_000, "prodi", 2026],
    ["D Kampus", null, null, null],
  ]);

  const murah = await daftar(j.slug, "nama", { uktMaks: 5_000_000 });
  expect(murah.map((r) => r.kampus.nama)).toEqual(["A Kampus", "B Kampus"]);
  expect(await countProdiJurusan(t.db, j.slug, { ...TANPA_FILTER, uktMaks: 5_000_000 })).toEqual({ jumlahProdi: 2, jumlahKampus: 2 });
});

test("Bintang sort orders only Prodi with enough Ulasan; the rest follow by name", async () => {
  const j = await buatJurusan(["A Kampus", "B Kampus", "C Kampus", "D Kampus"]);
  const [a, b, c] = j.daftar;
  await ulas(a.prodi.id, 5, 2); // too few to be ordered
  await ulas(b.prodi.id, 3, 3);
  await ulas(c.prodi.id, 4, 3);

  const rows = await daftar(j.slug, "bintang");
  expect(rows.map((r) => [r.kampus.nama, r.bintang, r.jumlahUlasan])).toEqual([
    ["C Kampus", 4, 3],
    ["B Kampus", 3, 3],
    ["A Kampus", 5, 2],
    ["D Kampus", null, 0],
  ]);
});
