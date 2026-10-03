import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import { riwayatModerasi, ulasan, ulasanRevisi } from "@/db/schema";
import type { ScreeningModel } from "@/lib/screening";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { editUlasan, hapusUlasan, tulisUlasan } from "./layanan";
import { prosesScreening, revisiMenungguLama } from "./proses-screening";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const tanpaJeda = { tidur: async () => {} };
const model = (j: unknown): ScreeningModel & { klasifikasi: ReturnType<typeof vi.fn> } => ({
  id: "model-uji",
  klasifikasi: vi.fn(async () => {
    if (j instanceof Error) throw j;
    return j;
  }),
});
const rendah = () => model({ tingkatRisiko: "rendah", alasan: "Tidak ada masalah." });
const gagal = () => model(new Error("Overloaded"));

async function ulasanBaru() {
  const { prodi } = await buatKatalog(t.db);
  const u = await buatPengguna(t.db);
  const baru = await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
  return { ...baru, pengulasId: u.id, prodi: prodi[0] };
}
const revisi = async (id: string) => (await t.db.select().from(ulasanRevisi).where(eq(ulasanRevisi.id, id)))[0];
const induk = async (id: string) => (await t.db.select().from(ulasan).where(eq(ulasan.id, id)))[0];

describe("Screening results", () => {
  test("rendah publishes: status terbit, live pointer set, result stored", async () => {
    const { ulasanId, revisiId, prodi } = await ulasanBaru();
    const hasil = await prosesScreening(t.db, revisiId, rendah(), tanpaJeda);
    expect(hasil).toMatchObject({ diproses: true, status: "terbit", liveBerubah: true, target: { prodiSlug: prodi.slug } });
    expect(await revisi(revisiId)).toMatchObject({
      status: "terbit",
      tingkatRisiko: "rendah",
      alasanScreening: "Tidak ada masalah.",
      modelScreening: "model-uji",
      percobaanScreening: 0,
    });
    expect((await revisi(revisiId)).discreeningAt).toBeInstanceOf(Date);
    expect((await induk(ulasanId)).revisiTerbitId).toBe(revisiId);
  });

  test.each(["perlu_dicek", "melanggar"] as const)("%s goes to the Antrean (ditinjau) and stays hidden", async (tingkat) => {
    const { ulasanId, revisiId } = await ulasanBaru();
    const hasil = await prosesScreening(t.db, revisiId, model({ tingkatRisiko: tingkat, alasan: "Perlu dicek." }), tanpaJeda);
    expect(hasil).toMatchObject({ status: "ditinjau", liveBerubah: false });
    expect(await revisi(revisiId)).toMatchObject({ status: "ditinjau", tingkatRisiko: tingkat, modelScreening: "model-uji" });
    expect((await induk(ulasanId)).revisiTerbitId).toBeNull();
    const log = await t.db.select().from(riwayatModerasi).where(eq(riwayatModerasi.revisiId, revisiId));
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ aksi: "screening", oleh: null });
  });
});

describe("Screening failure (fail-closed)", () => {
  test("if every quick retry fails in round 1, the revision stays Menunggu with attempts = 1", async () => {
    const { ulasanId, revisiId } = await ulasanBaru();
    const m = gagal();
    const hasil = await prosesScreening(t.db, revisiId, m, tanpaJeda);
    expect(m.klasifikasi).toHaveBeenCalledTimes(3);
    expect(hasil).toMatchObject({ diproses: true, status: "menunggu", percobaan: 1, liveBerubah: false });
    expect(await revisi(revisiId)).toMatchObject({ status: "menunggu", percobaanScreening: 1, tingkatRisiko: null });
    expect((await induk(ulasanId)).revisiTerbitId).toBeNull();
  });

  test("the 3rd failed round sends it to a Moderator with 'Screening gagal', never Terbit", async () => {
    const { ulasanId, revisiId } = await ulasanBaru();
    await prosesScreening(t.db, revisiId, gagal(), tanpaJeda);
    await prosesScreening(t.db, revisiId, gagal(), tanpaJeda);
    const hasil = await prosesScreening(t.db, revisiId, gagal(), tanpaJeda);
    expect(hasil).toMatchObject({ status: "ditinjau", percobaan: 3, liveBerubah: false });
    const r = await revisi(revisiId);
    expect(r).toMatchObject({ status: "ditinjau", percobaanScreening: 3, tingkatRisiko: null });
    expect(r.alasanScreening).toMatch(/^Screening gagal/);
    expect((await induk(ulasanId)).revisiTerbitId).toBeNull();
  });

  test("a later successful round still publishes normally", async () => {
    const { revisiId } = await ulasanBaru();
    await prosesScreening(t.db, revisiId, gagal(), tanpaJeda);
    expect(await prosesScreening(t.db, revisiId, rendah(), tanpaJeda)).toMatchObject({ status: "terbit", percobaan: 1 });
  });

  test("a decided revision is skipped, so it can't be screened twice", async () => {
    const { revisiId } = await ulasanBaru();
    await prosesScreening(t.db, revisiId, rendah(), tanpaJeda);
    const m = rendah();
    expect(await prosesScreening(t.db, revisiId, m, tanpaJeda)).toEqual({ diproses: false });
    expect(m.klasifikasi).not.toHaveBeenCalled();
  });

  test("a deleted Ulasan is not screened or published", async () => {
    const { ulasanId, revisiId, pengulasId } = await ulasanBaru();
    await hapusUlasan(t.db, { pengulasId, ulasanId });
    expect(await prosesScreening(t.db, revisiId, rendah(), tanpaJeda)).toEqual({ diproses: false });
  });
});

describe("edits", () => {
  test("the previous revision stays live until the edit passes Screening", async () => {
    const { ulasanId, revisiId: r1, pengulasId } = await ulasanBaru();
    await prosesScreening(t.db, r1, rendah(), tanpaJeda);

    const { revisiId: r2 } = await editUlasan(t.db, { pengulasId, ulasanId, data: dataUlasan({ judul: "Judul baru" }) });
    expect((await induk(ulasanId)).revisiTerbitId).toBe(r1);

    await prosesScreening(t.db, r2, gagal(), tanpaJeda);
    expect((await induk(ulasanId)).revisiTerbitId).toBe(r1);

    await prosesScreening(t.db, r2, model({ tingkatRisiko: "perlu_dicek", alasan: "Cek." }), tanpaJeda);
    expect((await induk(ulasanId)).revisiTerbitId).toBe(r1);
  });

  test("a passing edit replaces the live revision", async () => {
    const { ulasanId, revisiId: r1, pengulasId } = await ulasanBaru();
    await prosesScreening(t.db, r1, rendah(), tanpaJeda);
    const { revisiId: r2 } = await editUlasan(t.db, { pengulasId, ulasanId, data: dataUlasan({ judul: "Judul baru" }) });
    await prosesScreening(t.db, r2, rendah(), tanpaJeda);
    expect((await induk(ulasanId)).revisiTerbitId).toBe(r2);
  });
});

describe("cron selection", () => {
  test("picks only Menunggu revisions older than 10 minutes on live Ulasan", async () => {
    const lama = await ulasanBaru();
    const baru = await ulasanBaru();
    const selesai = await ulasanBaru();
    const dihapus = await ulasanBaru();
    const mundur = (id: string) =>
      t.db.update(ulasanRevisi).set({ createdAt: sql`now() - interval '11 minutes'` }).where(eq(ulasanRevisi.id, id));
    await mundur(lama.revisiId);
    await mundur(selesai.revisiId);
    await mundur(dihapus.revisiId);
    await prosesScreening(t.db, selesai.revisiId, rendah(), tanpaJeda);
    await hapusUlasan(t.db, { pengulasId: dihapus.pengulasId, ulasanId: dihapus.ulasanId });

    const ids = await revisiMenungguLama(t.db);
    expect(ids).toContain(lama.revisiId);
    expect(ids).not.toContain(baru.revisiId);
    expect(ids).not.toContain(selesai.revisiId);
    expect(ids).not.toContain(dihapus.revisiId);
  });
});
