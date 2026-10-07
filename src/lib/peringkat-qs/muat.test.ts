import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { kampus, peringkatQs } from "@/db/schema";
import { getRingkasanUlasan } from "@/lib/katalog";
import type { ScreeningModel } from "@/lib/screening";
import { searchKatalog } from "@/lib/search";
import { tulisUlasan } from "@/lib/ulasan/layanan";
import { prosesScreening } from "@/lib/ulasan/proses-screening";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import type { EdisiQs } from "./baca";
import { getInfoQs, listKampusQs } from "./kueri";
import { muatPeringkatQs, PeringkatQsDitolak } from "./muat";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const edisi = (entri: EdisiQs["entri"], ubah: Partial<EdisiQs> = {}): EdisiQs => ({
  edisi: 2027,
  sumberUrl: "https://www.topuniversities.com/world-university-rankings?countries=id",
  tanggalAmbil: "2026-10-07",
  entri,
  ...ubah,
});
const entri = (npsn: string, peringkat: string, min: number, max: number | null) => ({ namaQs: `QS ${npsn}`, npsn, peringkat, min, max });

test("loading the same edition twice changes nothing; a dropped entry is removed, older editions kept", async () => {
  const [a, b, c] = [await buatKatalog(t.db), await buatKatalog(t.db), await buatKatalog(t.db)];
  const data = edisi([entri(a.kampus.npsn, "=191", 191, 191), entri(b.kampus.npsn, "851-900", 851, 900)]);

  expect(await muatPeringkatQs(t.db, data)).toEqual({ ditambah: 2, diubah: 0, tetap: 0, dihapus: 0 });
  expect(await muatPeringkatQs(t.db, data)).toEqual({ ditambah: 0, diubah: 0, tetap: 2, dihapus: 0 });

  await muatPeringkatQs(t.db, edisi([entri(c.kampus.npsn, "1", 1, 1)], { edisi: 2026 }));
  expect(
    await muatPeringkatQs(t.db, edisi([entri(a.kampus.npsn, "190", 190, 190)], { tanggalAmbil: "2026-10-08" })),
  ).toEqual({ ditambah: 0, diubah: 1, tetap: 0, dihapus: 1 });

  const rows = await t.db.select().from(peringkatQs);
  expect(rows.map((r) => [r.kampusId, r.edisi, r.peringkat]).sort()).toEqual(
    [
      [a.kampus.id, 2027, "190"],
      [c.kampus.id, 2026, "1"],
    ].sort(),
  );
  expect(await getInfoQs(t.db)).toMatchObject({ edisi: 2027, jumlahKampus: 1, tanggalAmbil: "2026-10-08" });
});

test("an NPSN without a Kampus rejects the whole load", async () => {
  const a = await buatKatalog(t.db);
  await expect(
    muatPeringkatQs(t.db, edisi([entri(a.kampus.npsn, "5", 5, 5), entri("9999999999", "6", 6, 6)], { edisi: 2030 })),
  ).rejects.toThrow(PeringkatQsDitolak);
  expect(await t.db.select().from(peringkatQs).where(eq(peringkatQs.edisi, 2030))).toEqual([]);
});

test("the home list follows QS's order; bands tie by Kampus name", async () => {
  const [x, y, z] = [await buatKatalog(t.db), await buatKatalog(t.db), await buatKatalog(t.db)];
  await t.db.update(kampus).set({ nama: "Universitas Zeta" }).where(eq(kampus.id, x.kampus.id));
  await t.db.update(kampus).set({ nama: "Universitas Alfa" }).where(eq(kampus.id, y.kampus.id));
  await t.db.update(kampus).set({ nama: "Universitas Mu" }).where(eq(kampus.id, z.kampus.id));
  await muatPeringkatQs(
    t.db,
    edisi(
      [entri(x.kampus.npsn, "1401+", 1401, null), entri(y.kampus.npsn, "1401+", 1401, null), entri(z.kampus.npsn, "=206", 206, 206)],
      { edisi: 2031 },
    ),
  );
  expect((await listKampusQs(t.db)).map((k) => [k.peringkat, k.nama])).toEqual([
    ["=206", "Universitas Mu"],
    ["1401+", "Universitas Alfa"],
    ["1401+", "Universitas Zeta"],
  ]);
});

const model: ScreeningModel = { id: "uji", klasifikasi: async () => ({ tingkatRisiko: "rendah", alasan: "x" }) };

test("a QS rank never changes a Kampus's Ulasan scores or search order", async () => {
  const unik = Date.now().toString(36);
  const [satu, dua] = [await buatKatalog(t.db), await buatKatalog(t.db)];
  await t.db.update(kampus).set({ nama: `Universitas Peringkat ${unik} A` }).where(eq(kampus.id, satu.kampus.id));
  await t.db.update(kampus).set({ nama: `Universitas Peringkat ${unik} B` }).where(eq(kampus.id, dua.kampus.id));
  for (const [prodiId, bintang] of [
    [satu.prodi[0].id, 2],
    [dua.prodi[0].id, 5],
  ] as const) {
    const u = await buatPengguna(t.db);
    const r = await tulisUlasan(t.db, { pengulasId: u.id, prodiId, data: dataUlasan({ bintang, rekomendasi: bintang > 3 }) });
    await prosesScreening(t.db, r.revisiId, model, { tidur: async () => {} });
  }

  const baca = async () => ({
    skor: await Promise.all([satu, dua].map((k) => getRingkasanUlasan(t.db, { kampusSlug: k.kampus.slug }))),
    urutan: (await searchKatalog(t.db, `Peringkat ${unik}`, { types: ["kampus"] })).kampus.map((k) => k.nama),
  });
  const sebelum = await baca();

  // B gets a far better rank than A in a new, latest edition.
  await muatPeringkatQs(
    t.db,
    edisi([entri(dua.kampus.npsn, "1", 1, 1), entri(satu.kampus.npsn, "1401+", 1401, null)], { edisi: 2040 }),
  );
  const sesudah = await baca();

  expect(sesudah.skor).toEqual(sebelum.skor);
  expect(sesudah.urutan).toEqual(sebelum.urutan);
  expect(sesudah.urutan).toEqual([`Universitas Peringkat ${unik} A`, `Universitas Peringkat ${unik} B`]);
  const hasil = await searchKatalog(t.db, `Peringkat ${unik}`, { types: ["kampus"] });
  expect(hasil.kampus.map((k) => k.peringkatQs)).toEqual(["1401+", "1"]);
  expect((await searchKatalog(t.db, `Peringkat ${unik}`, { types: ["kampus"], qsOnly: true })).kampus).toHaveLength(2);
});
