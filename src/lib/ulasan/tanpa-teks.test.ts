import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { eq } from "drizzle-orm";
import { ulasan, ulasanMembantu, ulasanRevisi } from "@/db/schema";
import { getRingkasanUlasan, listProdiTerbanyakUlasan, listSlugProdiTerindeks, listUlasanTerbaru, listUlasanTerbit } from "@/lib/katalog";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { isiKabarTerbit } from "./kabar-terbit";
import { editUlasan, tulisUlasan } from "./layanan";
import { tandaiMembantu } from "./membantu";
import { MODEL_TANPA_TEKS, prosesScreening } from "./proses-screening";

// Ulasan with ratings only, the first-publish signal and the Membantu marks
// (decisions.md 17s).

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const tanpaJeda = { tidur: async () => {} };
const model = (): ScreeningModel & { klasifikasi: ReturnType<typeof vi.fn> } => ({
  id: "model-uji",
  klasifikasi: vi.fn(async () => ({ tingkatRisiko: "rendah", alasan: "Tidak ada masalah." })),
});

const tanpaTeks = () => dataUlasan({ judul: null, isi: null, bintang: 2 });

test("ratings only go live at once without calling the model, and count in the scores", async () => {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  const baru = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: tanpaTeks() });
  const m = model();

  const hasil = await prosesScreening(t.db, baru.revisiId, m, tanpaJeda);
  expect(m.klasifikasi).not.toHaveBeenCalled();
  expect(hasil).toMatchObject({ diproses: true, status: "terbit", liveBerubah: true, pertamaTerbit: true, ulasanId: baru.ulasanId });
  const [r] = await t.db.select().from(ulasanRevisi).where(eq(ulasanRevisi.id, baru.revisiId));
  expect(r).toMatchObject({ status: "terbit", tingkatRisiko: "rendah", modelScreening: MODEL_TANPA_TEKS, judul: null, isi: null });

  expect(await getRingkasanUlasan(t.db, { prodiSlug: prodi[0].slug })).toMatchObject({ jumlah: 1, bintang: 2 });
  expect(await listSlugProdiTerindeks(t.db)).toContain(prodi[0].slug);
});

test("a title without text can't be stored", async () => {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  await expect(
    tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan({ isi: null }) }),
  ).rejects.toThrow();
});

test("adding the story later is a screened edit; only the first publish is announced", async () => {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  const baru = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: tanpaTeks() });
  await prosesScreening(t.db, baru.revisiId, model(), tanpaJeda);

  const edit = await editUlasan(t.db, { pengulasId: u.id, ulasanId: baru.ulasanId, data: dataUlasan({ judul: "Sekarang dengan cerita" }) });
  const m = model();
  const hasil = await prosesScreening(t.db, edit.revisiId, m, tanpaJeda);
  expect(m.klasifikasi).toHaveBeenCalledTimes(1);
  expect(hasil).toMatchObject({ status: "terbit", liveBerubah: true, pertamaTerbit: false });
  const [induk] = await t.db.select().from(ulasan).where(eq(ulasan.id, baru.ulasanId));
  expect(induk.revisiTerbitId).toBe(edit.revisiId);
});

test("lists put stories before ratings only; the home page lists show stories and counts", async () => {
  const { prodi } = await buatKatalog(t.db);
  const tulis = async (data = dataUlasan()) => {
    const u = await buatPengguna(t.db);
    const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data });
    await prosesScreening(t.db, r.revisiId, model(), tanpaJeda);
    return r;
  };
  const cerita = await tulis(dataUlasan({ judul: "Ada ceritanya" }));
  const angka = await tulis(tanpaTeks());

  const daftar = await listUlasanTerbit(t.db, { prodiSlug: prodi[0].slug }, 10);
  expect(daftar.map((u) => u.id)).toEqual([cerita.ulasanId, angka.ulasanId]);
  expect(daftar[1]).toMatchObject({ judul: null, isi: null, jumlahMembantu: 0 });

  const terbaru = await listUlasanTerbaru(t.db, 50);
  expect(terbaru.map((u) => u.id)).toContain(cerita.ulasanId);
  expect(terbaru.map((u) => u.id)).not.toContain(angka.ulasanId);
  expect(JSON.stringify(terbaru)).not.toContain("@contoh.id");

  const ramai = await listProdiTerbanyakUlasan(t.db, 50);
  expect(ramai.find((p) => p.slug === prodi[0].slug)).toMatchObject({ jumlahUlasan: 2 });
});

test("Membantu counts once per ip_hash, only on a shown Ulasan", async () => {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  const baru = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });

  // Not live yet.
  expect(await tandaiMembantu(t.db, { ulasanId: baru.ulasanId, ipHash: "a" })).toBeNull();

  await prosesScreening(t.db, baru.revisiId, model(), tanpaJeda);
  expect(await tandaiMembantu(t.db, { ulasanId: baru.ulasanId, ipHash: "a" })).toMatchObject({ jumlah: 1, baru: true, prodiSlug: prodi[0].slug });
  expect(await tandaiMembantu(t.db, { ulasanId: baru.ulasanId, ipHash: "a" })).toMatchObject({ jumlah: 1, baru: false });
  expect(await tandaiMembantu(t.db, { ulasanId: baru.ulasanId, ipHash: "b" })).toMatchObject({ jumlah: 2, baru: true });

  const [tampil] = await listUlasanTerbit(t.db, { prodiSlug: prodi[0].slug }, 10);
  expect(tampil.jumlahMembantu).toBe(2);
  expect(await t.db.select().from(ulasanMembantu).where(eq(ulasanMembantu.ulasanId, baru.ulasanId))).toHaveLength(2);
});

test("the publish email links to the Prodi page, and to the form only when there is no story", () => {
  const dasar = { prodiNama: "S1 Informatika", kampusNama: "Universitas Uji", prodiSlug: "uji-s1-informatika" };
  const denganCerita = isiKabarTerbit({ ...dasar, adaTeks: true });
  expect(denganCerita.isi).toContain("/prodi/uji-s1-informatika");
  expect(denganCerita.isi).not.toContain("/prodi/uji-s1-informatika/tulis");
  const hanyaAngka = isiKabarTerbit({ ...dasar, adaTeks: false });
  expect(hanyaAngka.isi).toContain("/prodi/uji-s1-informatika/tulis");
});
