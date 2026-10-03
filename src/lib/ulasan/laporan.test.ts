import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { laporan, ulasan, ulasanRevisi } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { buatLaporan, LaporanSudahAda, skemaLaporan, TidakBisaDilaporkan } from "./laporan";
import { hapusUlasan, tulisUlasan } from "./layanan";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

async function ulasanTerbit() {
  const { prodi } = await buatKatalog(t.db);
  const penulis = await buatPengguna(t.db);
  const { ulasanId, revisiId } = await tulisUlasan(t.db, { pengulasId: penulis.id, prodiId: prodi[0].id, data: dataUlasan() });
  await t.db.update(ulasanRevisi).set({ status: "terbit" }).where(eq(ulasanRevisi.id, revisiId));
  await t.db.update(ulasan).set({ revisiTerbitId: revisiId }).where(eq(ulasan.id, ulasanId));
  return { ulasanId, revisiId, penulis };
}

const lapor = (ulasanId: string, pelaporId: string) =>
  buatLaporan(t.db, { ulasanId, pelaporId, ipHash: "a".repeat(64), alasan: "hinaan", catatan: null });

test("a Laporan points at the live revision and leaves the Ulasan Terbit", async () => {
  const { ulasanId, revisiId } = await ulasanTerbit();
  const pelapor = await buatPengguna(t.db);
  const { id } = await lapor(ulasanId, pelapor.id);
  const [row] = await t.db.select().from(laporan).where(eq(laporan.id, id));
  expect(row).toMatchObject({ revisiId, status: "baru", pelaporId: pelapor.id, alasan: "hinaan" });
  const [u] = await t.db.select().from(ulasan).where(eq(ulasan.id, ulasanId));
  expect(u.revisiTerbitId).toBe(revisiId);
});

test("one open Laporan per reporter per Ulasan; others can still report", async () => {
  const { ulasanId } = await ulasanTerbit();
  const a = await buatPengguna(t.db);
  const b = await buatPengguna(t.db);
  await lapor(ulasanId, a.id);
  await expect(lapor(ulasanId, a.id)).rejects.toThrow(LaporanSudahAda);
  await lapor(ulasanId, b.id);
});

test("only Terbit, not-deleted Ulasan by someone else can be reported", async () => {
  const { prodi } = await buatKatalog(t.db);
  const penulis = await buatPengguna(t.db);
  const pelapor = await buatPengguna(t.db);
  const belum = await tulisUlasan(t.db, { pengulasId: penulis.id, prodiId: prodi[0].id, data: dataUlasan() });
  await expect(lapor(belum.ulasanId, pelapor.id)).rejects.toThrow(TidakBisaDilaporkan);

  const terbit = await ulasanTerbit();
  await expect(lapor(terbit.ulasanId, terbit.penulis.id)).rejects.toThrow(/sendiri/);
  await hapusUlasan(t.db, { pengulasId: terbit.penulis.id, ulasanId: terbit.ulasanId });
  await expect(lapor(terbit.ulasanId, pelapor.id)).rejects.toThrow(TidakBisaDilaporkan);
});

test("the form schema requires a known reason and caps the note", () => {
  expect(skemaLaporan.safeParse({ alasan: "hinaan", catatan: "  " }).data).toEqual({ alasan: "hinaan", catatan: null });
  expect(skemaLaporan.safeParse({ alasan: "lain", catatan: "" }).success).toBe(false);
  expect(skemaLaporan.safeParse({ alasan: "lainnya", catatan: "x".repeat(1001) }).success).toBe(false);
});
