import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { ulasan, ulasanRevisi } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { editUlasan, hapusUlasan, RevisiMasihDiperiksa, tulisUlasan, UlasanSudahAda, UlasanTidakDitemukan } from "./layanan";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

describe("one Ulasan per Pengulas per Prodi", () => {
  test("a second Ulasan for the same Prodi is rejected", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    await expect(tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() })).rejects.toThrow(
      UlasanSudahAda,
    );
  });

  test("concurrent submits still produce only one Ulasan", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const hasil = await Promise.allSettled(
      [1, 2, 3].map(() => tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() })),
    );
    expect(hasil.filter((h) => h.status === "fulfilled")).toHaveLength(1);
    const rows = await t.db.select().from(ulasan).where(eq(ulasan.pengulasId, u.id));
    expect(rows).toHaveLength(1);
  });

  test("the same Pengulas can review another Prodi, and others can review the same one", async () => {
    const { prodi } = await buatKatalog(t.db);
    const a = await buatPengguna(t.db);
    const b = await buatPengguna(t.db);
    await tulisUlasan(t.db, { pengulasId: a.id, prodiId: prodi[0].id, data: dataUlasan() });
    await tulisUlasan(t.db, { pengulasId: a.id, prodiId: prodi[1].id, data: dataUlasan() });
    await tulisUlasan(t.db, { pengulasId: b.id, prodiId: prodi[0].id, data: dataUlasan() });
  });

  test("deleting an Ulasan allows a new one for that Prodi", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const pertama = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    await hapusUlasan(t.db, { pengulasId: u.id, ulasanId: pertama.ulasanId });
    const kedua = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    expect(kedua.ulasanId).not.toBe(pertama.ulasanId);
  });
});

describe("revisions", () => {
  test("a new Ulasan starts as revision 1, Menunggu, not live", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const { ulasanId, revisiId } = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    const [r] = await t.db.select().from(ulasanRevisi).where(eq(ulasanRevisi.id, revisiId));
    expect(r).toMatchObject({ nomor: 1, status: "menunggu", percobaanScreening: 0 });
    const [row] = await t.db.select().from(ulasan).where(eq(ulasan.id, ulasanId));
    expect(row.revisiTerbitId).toBeNull();
  });

  test("an edit is blocked while the previous revision is still being checked", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const { ulasanId } = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    await expect(editUlasan(t.db, { pengulasId: u.id, ulasanId, data: dataUlasan() })).rejects.toThrow(RevisiMasihDiperiksa);
  });

  test("an edit after a decision adds revision 2 and leaves the live pointer alone", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const { ulasanId, revisiId } = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    await t.db.update(ulasanRevisi).set({ status: "terbit" }).where(eq(ulasanRevisi.id, revisiId));
    await t.db.update(ulasan).set({ revisiTerbitId: revisiId }).where(eq(ulasan.id, ulasanId));

    const baru = await editUlasan(t.db, { pengulasId: u.id, ulasanId, data: dataUlasan({ judul: "Judul yang diubah" }) });
    const [r2] = await t.db.select().from(ulasanRevisi).where(eq(ulasanRevisi.id, baru.revisiId));
    expect(r2).toMatchObject({ nomor: 2, status: "menunggu", judul: "Judul yang diubah" });
    const [row] = await t.db.select().from(ulasan).where(eq(ulasan.id, ulasanId));
    expect(row.revisiTerbitId).toBe(revisiId);
  });

  test("only the author can edit or delete", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const lain = await buatPengguna(t.db);
    const { ulasanId } = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    await expect(editUlasan(t.db, { pengulasId: lain.id, ulasanId, data: dataUlasan() })).rejects.toThrow(UlasanTidakDitemukan);
    await expect(hapusUlasan(t.db, { pengulasId: lain.id, ulasanId })).rejects.toThrow(UlasanTidakDitemukan);
  });
});
