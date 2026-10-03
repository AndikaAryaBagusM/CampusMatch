import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { laporan, riwayatModerasi, ulasan, ulasanRevisi } from "@/db/schema";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { buatLaporan } from "./laporan";
import { editUlasan, tulisUlasan } from "./layanan";
import {
  getRiwayatUlasan,
  hitungAntrean,
  KeputusanTidakBerlaku,
  listAntrean,
  listLaporanTerbuka,
  setujuiRevisi,
  tolakRevisi,
  turunkanUlasan,
  tutupLaporan,
} from "./moderasi";
import { prosesScreening } from "./proses-screening";

let t: TestDb;
let moderatorId: string;
beforeAll(async () => {
  t = await createTestDb();
  moderatorId = (await buatPengguna(t.db, "mod@campusmatch.id")).id;
});
afterAll(() => t.close());

const tanpaJeda = { tidur: async () => {} };
const model = (tingkatRisiko: string): ScreeningModel => ({
  id: "model-uji",
  klasifikasi: async () => ({ tingkatRisiko, alasan: `Hasil ${tingkatRisiko}.` }),
});

async function ulasanDengan(tingkatRisiko: "rendah" | "perlu_dicek" | "melanggar") {
  const { prodi } = await buatKatalog(t.db);
  const penulis = await buatPengguna(t.db);
  const baru = await tulisUlasan(t.db, { pengulasId: penulis.id, prodiId: prodi[0].id, data: dataUlasan() });
  await prosesScreening(t.db, baru.revisiId, model(tingkatRisiko), tanpaJeda);
  return { ...baru, penulis, prodi: prodi[0] };
}
const revisi = async (id: string) => (await t.db.select().from(ulasanRevisi).where(eq(ulasanRevisi.id, id)))[0];
const induk = async (id: string) => (await t.db.select().from(ulasan).where(eq(ulasan.id, id)))[0];

describe("Ditinjau revisions", () => {
  test("Setujui publishes and records who decided", async () => {
    const { ulasanId, revisiId, prodi } = await ulasanDengan("perlu_dicek");
    const hasil = await setujuiRevisi(t.db, { revisiId, moderatorId });
    expect(hasil).toEqual({ liveBerubah: true, target: expect.objectContaining({ prodiSlug: prodi.slug }) });
    expect(await revisi(revisiId)).toMatchObject({ status: "terbit", diputuskanOleh: moderatorId });
    expect((await induk(ulasanId)).revisiTerbitId).toBe(revisiId);
  });

  test("Tolak needs a reason, stores it, and keeps an older live revision", async () => {
    const { ulasanId, revisiId: r1, penulis } = await ulasanDengan("rendah");
    const { revisiId: r2 } = await editUlasan(t.db, { pengulasId: penulis.id, ulasanId, data: dataUlasan({ judul: "Edit berisiko" }) });
    await prosesScreening(t.db, r2, model("melanggar"), tanpaJeda);

    await expect(tolakRevisi(t.db, { revisiId: r2, moderatorId, alasan: "  " })).rejects.toThrow(KeputusanTidakBerlaku);
    const hasil = await tolakRevisi(t.db, { revisiId: r2, moderatorId, alasan: "Menyebut nama dosen." });
    expect(hasil.liveBerubah).toBe(false);
    expect(await revisi(r2)).toMatchObject({ status: "ditolak", alasanModerator: "Menyebut nama dosen." });
    expect((await induk(ulasanId)).revisiTerbitId).toBe(r1);
  });

  test("a decided revision can't be decided again", async () => {
    const { revisiId } = await ulasanDengan("perlu_dicek");
    await setujuiRevisi(t.db, { revisiId, moderatorId });
    await expect(setujuiRevisi(t.db, { revisiId, moderatorId })).rejects.toThrow(KeputusanTidakBerlaku);
    await expect(tolakRevisi(t.db, { revisiId, moderatorId, alasan: "x" })).rejects.toThrow(KeputusanTidakBerlaku);
  });

  test("the Antrean lists melanggar before perlu dicek", async () => {
    const dicek = await ulasanDengan("perlu_dicek");
    const langgar = await ulasanDengan("melanggar");
    const ids = (await listAntrean(t.db)).map((r) => r.revisiId);
    expect(ids.indexOf(langgar.revisiId)).toBeLessThan(ids.indexOf(dicek.revisiId));
    expect((await listAntrean(t.db)).find((r) => r.revisiId === langgar.revisiId)).toMatchObject({
      tingkatRisiko: "melanggar",
      alasanScreening: "Hasil melanggar.",
      modelScreening: "model-uji",
    });
  });
});

describe("Laporan", () => {
  async function dilaporkan(jumlah = 1) {
    const u = await ulasanDengan("rendah");
    const ids = [];
    for (let i = 0; i < jumlah; i++) {
      const pelapor = await buatPengguna(t.db);
      ids.push((await buatLaporan(t.db, { ulasanId: u.ulasanId, pelaporId: pelapor.id, ipHash: "x", alasan: "hinaan", catatan: null })).id);
    }
    return { ...u, laporanIds: ids };
  }

  test("Turunkan unpublishes, rejects the live revision and closes every open Laporan", async () => {
    const { ulasanId, revisiId, laporanIds } = await dilaporkan(2);
    const hasil = await turunkanUlasan(t.db, { laporanId: laporanIds[0], moderatorId, alasan: "Serangan pribadi." });
    expect(hasil.liveBerubah).toBe(true);
    expect((await induk(ulasanId)).revisiTerbitId).toBeNull();
    expect(await revisi(revisiId)).toMatchObject({ status: "ditolak", alasanModerator: "Serangan pribadi." });
    const rows = await t.db.select().from(laporan).where(eq(laporan.ulasanId, ulasanId));
    expect(rows.every((l) => l.status === "ditangani" && l.ditanganiOleh === moderatorId)).toBe(true);
    expect((await listLaporanTerbuka(t.db)).some((l) => l.ulasanId === ulasanId)).toBe(false);
  });

  test("Tutup laporan keeps the Ulasan live", async () => {
    const { ulasanId, revisiId, laporanIds } = await dilaporkan();
    const hasil = await tutupLaporan(t.db, { laporanId: laporanIds[0], moderatorId });
    expect(hasil.liveBerubah).toBe(false);
    expect((await induk(ulasanId)).revisiTerbitId).toBe(revisiId);
    await expect(tutupLaporan(t.db, { laporanId: laporanIds[0], moderatorId })).rejects.toThrow(KeputusanTidakBerlaku);
  });

  test("Turunkan needs a reason", async () => {
    const { laporanIds } = await dilaporkan();
    await expect(turunkanUlasan(t.db, { laporanId: laporanIds[0], moderatorId, alasan: "" })).rejects.toThrow(
      KeputusanTidakBerlaku,
    );
  });
});

test("history shows Screening and every decision, with the Moderator", async () => {
  const { ulasanId, revisiId } = await ulasanDengan("perlu_dicek");
  await setujuiRevisi(t.db, { revisiId, moderatorId });
  const r = await getRiwayatUlasan(t.db, ulasanId);
  expect(r?.revisi).toHaveLength(1);
  expect(r?.riwayat.map((h) => h.aksi).sort()).toEqual(["disetujui", "screening"]);
  expect(r?.riwayat.find((h) => h.aksi === "disetujui")?.olehEmail).toBe("mod@campusmatch.id");
  expect(await t.db.select().from(riwayatModerasi).where(eq(riwayatModerasi.ulasanId, ulasanId))).toHaveLength(2);
});

test("queue counts", async () => {
  const c = await hitungAntrean(t.db);
  expect(c).toEqual({ ditinjau: expect.any(Number), laporan: expect.any(Number), menunggu: expect.any(Number) });
});
