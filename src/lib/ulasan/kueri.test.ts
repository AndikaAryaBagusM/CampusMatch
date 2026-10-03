import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { ulasanRevisi } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { getProdiTujuan, getUlasanSaya, listUlasanSaya, targetHalamanProdi } from "./kueri";
import { editUlasan, hapusUlasan, tulisUlasan } from "./layanan";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

test("getUlasanSaya returns the newest revision and whether a revision is live", async () => {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  expect(await getUlasanSaya(t.db, u.id, prodi[0].id)).toBeUndefined();

  const { ulasanId, revisiId } = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
  await t.db.update(ulasanRevisi).set({ status: "ditolak", alasanModerator: "Menyebut nama." }).where(eq(ulasanRevisi.id, revisiId));
  await editUlasan(t.db, { pengulasId: u.id, ulasanId, data: dataUlasan({ judul: "Versi kedua", bintang: 2 }) });

  const saya = await getUlasanSaya(t.db, u.id, prodi[0].id);
  expect(saya).toMatchObject({ id: ulasanId, terbit: false, statusPengulas: "mahasiswa_aktif", tahunMasuk: 2023 });
  expect(saya!.revisi).toMatchObject({ nomor: 2, status: "menunggu", judul: "Versi kedua", bintang: 2, rekomendasi: true });
});

test("listUlasanSaya leaves out deleted Ulasan and names the Prodi", async () => {
  const { prodi, kampus } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  const a = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
  await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[1].id, data: dataUlasan() });
  await hapusUlasan(t.db, { pengulasId: u.id, ulasanId: a.ulasanId });

  const daftar = await listUlasanSaya(t.db, u.id);
  expect(daftar).toHaveLength(1);
  expect(daftar[0]).toMatchObject({ prodiNama: "S1 Manajemen", kampusNama: kampus.nama, prodiSlug: prodi[1].slug });
});

test("Prodi lookups by slug and by id", async () => {
  const { prodi, kampus } = await buatKatalog(t.db);
  expect(await getProdiTujuan(t.db, prodi[0].slug)).toMatchObject({ id: prodi[0].id, kampusSlug: kampus.slug });
  expect(await targetHalamanProdi(t.db, prodi[0].id)).toEqual({ prodiSlug: prodi[0].slug, kampusSlug: kampus.slug });
});
