import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { kampus, kota } from "@/db/schema";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../test/fixtures";
import { countBentukKota, countKampusKota, getKota, listKampusKota, listKotaPerProvinsi, namaKota, slugProvinsi } from "./kota";
import { tulisUlasan } from "./ulasan/layanan";
import { prosesScreening } from "./ulasan/proses-screening";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

let n = 0;
const model = (tingkatRisiko: string): ScreeningModel => ({ id: "uji", klasifikasi: async () => ({ tingkatRisiko, alasan: "x" }) });

// A Kota in its own Provinsi, with Kampus named as given (each with two Prodi).
async function buatKota(namaKampus: string[], nama = "Kota Uji") {
  const s = ++n;
  const [k] = await t.db.insert(kota).values({ nama, provinsi: `Prov. Uji ${s}`, slug: `kota-uji-${s}` }).returning();
  const daftar = [];
  for (const namaK of namaKampus) {
    const kat = await buatKatalog(t.db);
    await t.db.update(kampus).set({ nama: namaK, kotaId: k.id }).where(eq(kampus.id, kat.kampus.id));
    daftar.push(kat);
  }
  return { kota: k, daftar };
}

const filter = { unggulanOnly: false, bentuk: null, limit: 20, offset: 0 };

test("namaKota names each Provinsi's Lainnya; slugProvinsi", () => {
  expect(namaKota({ nama: "Lainnya", provinsi: "Prov. D.K.I. Jakarta" })).toBe("Lainnya (D.K.I. Jakarta)");
  expect(namaKota({ nama: "Kota Bandung", provinsi: "Prov. Jawa Barat" })).toBe("Kota Bandung");
  expect(slugProvinsi("Prov. D.K.I. Jakarta")).toBe("dki-jakarta");
  expect(slugProvinsi("Prov. Kepulauan Bangka Belitung")).toBe("kepulauan-bangka-belitung");
});

test("Kampus of a Kota in name order; Unggulan and Bentuk filter, never reorder", async () => {
  const { kota: k, daftar } = await buatKota(["Universitas Citra", "Institut Alfa", "Universitas Beta"]);
  await t.db.update(kampus).set({ unggulan: true }).where(eq(kampus.id, daftar[0].kampus.id));
  await t.db.update(kampus).set({ bentuk: "Institut" }).where(eq(kampus.id, daftar[1].kampus.id));

  const semua = await listKampusKota(t.db, k.slug, filter);
  expect(semua.map((x) => x.nama)).toEqual(["Institut Alfa", "Universitas Beta", "Universitas Citra"]);
  expect(semua[0].jumlahProdi).toBe(2);
  expect(await countKampusKota(t.db, k.slug, filter)).toBe(3);

  expect((await listKampusKota(t.db, k.slug, { ...filter, unggulanOnly: true })).map((x) => x.nama)).toEqual(["Universitas Citra"]);
  expect((await listKampusKota(t.db, k.slug, { ...filter, bentuk: "Institut" })).map((x) => x.nama)).toEqual(["Institut Alfa"]);
  expect(await countKampusKota(t.db, k.slug, { ...filter, bentuk: "Universitas" })).toBe(2);
  expect(await countBentukKota(t.db, k.slug)).toEqual([
    { bentuk: "Universitas", jumlah: 2 },
    { bentuk: "Institut", jumlah: 1 },
  ]);
  expect(await getKota(t.db, k.slug)).toMatchObject({ jumlahKampus: 3, jumlahProdi: 6 });
});

test("a Kampus's Bintang averages the Terbit Ulasan of all its Prodi", async () => {
  const { kota: k, daftar } = await buatKota(["Universitas Satu", "Universitas Dua"]);
  const [p1, p2] = daftar[0].prodi;
  for (const [prodiId, bintang, risiko] of [
    [p1.id, 5, "rendah"],
    [p2.id, 4, "rendah"],
    [p1.id, 1, "perlu_dicek"], // held for review: not counted
  ] as const) {
    const u = await buatPengguna(t.db);
    const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId, data: dataUlasan({ bintang }) });
    await prosesScreening(t.db, r.revisiId, model(risiko), { tidur: async () => {} });
  }
  const rows = await listKampusKota(t.db, k.slug, filter);
  expect(rows.map((r) => [r.nama, r.bintang, r.jumlahUlasan])).toEqual([
    ["Universitas Dua", null, 0],
    ["Universitas Satu", 4.5, 2],
  ]);
});

test("Kota grouped by Provinsi, Lainnya last", async () => {
  const a = await buatKota(["Universitas A"], "Lainnya");
  const [b] = await t.db.insert(kota).values({ nama: "Kota Zeta", provinsi: a.kota.provinsi, slug: `kota-zeta-${++n}` }).returning();
  const kat = await buatKatalog(t.db);
  await t.db.update(kampus).set({ kotaId: b.id }).where(eq(kampus.id, kat.kampus.id));

  const prov = (await listKotaPerProvinsi(t.db)).find((p) => p.provinsi === a.kota.provinsi)!;
  expect(prov.kota.map((k) => k.nama)).toEqual(["Kota Zeta", "Lainnya"]);
  expect(prov.jumlahKampus).toBe(2);
});
