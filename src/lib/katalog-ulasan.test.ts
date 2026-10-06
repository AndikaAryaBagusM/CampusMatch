import { afterAll, beforeAll, expect, test } from "vitest";
import { eq, sql } from "drizzle-orm";
import { ulasan, ulasanRevisi, verifikasiKampus } from "@/db/schema";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../test/fixtures";
import { countUlasanKampus, countUlasanProdi, getRingkasanUlasan, listUlasanTerbit } from "./katalog";
import { editUlasan, hapusUlasan, tulisUlasan } from "./ulasan/layanan";
import { prosesScreening } from "./ulasan/proses-screening";
import type { DataUlasan } from "./ulasan/skema";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const tanpaJeda = { tidur: async () => {} };
const model = (tingkatRisiko: string): ScreeningModel => ({
  id: "model-uji",
  klasifikasi: async () => ({ tingkatRisiko, alasan: "x" }),
});

async function tulis(prodiId: number, data: Partial<DataUlasan>, tingkat = "rendah") {
  const u = await buatPengguna(t.db);
  const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId, data: dataUlasan(data) });
  await prosesScreening(t.db, r.revisiId, model(tingkat), tanpaJeda);
  return { ...r, pengulas: u };
}

test("lists only Terbit, not-deleted Ulasan, newest first, without any Pengulas field", async () => {
  const { prodi, kampus } = await buatKatalog(t.db);
  const lama = await tulis(prodi[0].id, { judul: "Ulasan lama" });
  await t.db.update(ulasanRevisi).set({ createdAt: sql`now() - interval '2 days'` }).where(eq(ulasanRevisi.id, lama.revisiId));
  const baru = await tulis(prodi[0].id, { judul: "Ulasan baru" });
  await tulis(prodi[0].id, { judul: "Ditahan" }, "perlu_dicek");
  const dihapus = await tulis(prodi[0].id, { judul: "Dihapus" });
  await hapusUlasan(t.db, { pengulasId: dihapus.pengulas.id, ulasanId: dihapus.ulasanId });

  const daftar = await listUlasanTerbit(t.db, { prodiSlug: prodi[0].slug }, 10);
  expect(daftar.map((u) => u.judul)).toEqual(["Ulasan baru", "Ulasan lama"]);
  expect(daftar[0].id).toBe(baru.ulasanId);
  expect(Object.keys(daftar[0]).sort()).toEqual(
    ["bintang", "id", "isi", "judul", "prodiNama", "prodiSlug", "rekomendasi", "statusPengulas", "tahunMasuk", "terbitAt", "terverifikasiSejak"].sort(),
  );
  expect(JSON.stringify(daftar)).not.toContain(baru.pengulas.id);
  expect(JSON.stringify(daftar)).not.toContain(baru.pengulas.email!);

  expect(await countUlasanProdi(t.db, prodi[0].slug)).toBe(2);
  expect(await countUlasanKampus(t.db, kampus.slug)).toBe(2);
});

test("an edit waiting for Screening keeps the previous text public", async () => {
  const { prodi } = await buatKatalog(t.db);
  const a = await tulis(prodi[0].id, { judul: "Versi pertama" });
  await editUlasan(t.db, { pengulasId: a.pengulas.id, ulasanId: a.ulasanId, data: dataUlasan({ judul: "Versi kedua" }) });
  const daftar = await listUlasanTerbit(t.db, { prodiSlug: prodi[0].slug }, 10);
  expect(daftar.map((u) => u.judul)).toEqual(["Versi pertama"]);
});

test("summary averages Bintang and Aspek and gives the Tingkat Rekomendasi; Kampus aggregates its Prodi", async () => {
  const { prodi, kampus } = await buatKatalog(t.db);
  await tulis(prodi[0].id, { bintang: 5, aspekDosen: 4, rekomendasi: true });
  await tulis(prodi[0].id, { bintang: 4, aspekDosen: 3, rekomendasi: true });
  await tulis(prodi[1].id, { bintang: 1, aspekDosen: 2, rekomendasi: false });

  const p = await getRingkasanUlasan(t.db, { prodiSlug: prodi[0].slug });
  expect(p).toMatchObject({ jumlah: 2, bintang: 4.5, tingkatRekomendasi: 1 });
  expect(p!.aspek.aspekDosen).toBe(3.5);

  const k = await getRingkasanUlasan(t.db, { kampusSlug: kampus.slug });
  expect(k).toMatchObject({ jumlah: 3, bintang: 3.3 });
  expect(k!.tingkatRekomendasi).toBeCloseTo(2 / 3);
  expect((await listUlasanTerbit(t.db, { kampusSlug: kampus.slug }, 10)).map((u) => u.prodiSlug).sort()).toEqual(
    [prodi[0].slug, prodi[0].slug, prodi[1].slug].sort(),
  );
});

test("no summary without Terbit Ulasan", async () => {
  const { prodi } = await buatKatalog(t.db);
  await tulis(prodi[0].id, {}, "melanggar");
  expect(await getRingkasanUlasan(t.db, { prodiSlug: prodi[0].slug })).toBeNull();
  const [u] = await t.db.select().from(ulasan).where(eq(ulasan.prodiId, prodi[0].id));
  expect(u.revisiTerbitId).toBeNull();
});

test("the Terverifikasi date shows only for Ulasan at the verified Kampus", async () => {
  const a = await buatKatalog(t.db);
  const b = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  for (const p of [a.prodi[0], b.prodi[0]]) {
    const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: p.id, data: dataUlasan() });
    await prosesScreening(t.db, r.revisiId, model("rendah"), tanpaJeda);
  }
  const sejak = new Date("2026-10-06T03:00:00Z");
  await t.db.insert(verifikasiKampus).values({ userId: u.id, kampusId: a.kampus.id, domain: "a.ac.id", verifiedAt: sejak });
  const [diA] = await listUlasanTerbit(t.db, { prodiSlug: a.prodi[0].slug }, 10);
  const [diB] = await listUlasanTerbit(t.db, { prodiSlug: b.prodi[0].slug }, 10);
  expect(diA.terverifikasiSejak).toEqual(sejak);
  expect(diB.terverifikasiSejak).toBeNull();
  expect(JSON.stringify(diA)).not.toContain("a.ac.id");
});
