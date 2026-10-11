import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { beasiswa, beasiswaKampus, prodi, sumber } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog } from "../../test/fixtures";
import { halamanKampus, halamanKodeProdi, halamanSumberFakta } from "./halaman-cache";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

let n = 0;
async function buatSumber(kampusId: number | null) {
  const [s] = await t.db
    .insert(sumber)
    .values({ kode: `uji-${++n}`, kampusId, url: "https://contoh.ac.id", judul: "Uji", penerbit: "Uji", diaksesPada: "2026-10-07" })
    .returning();
  return s.id;
}

describe("cached pages a change touches", () => {
  test("a Kampus: its page, optionally its Ulasan tab and every Prodi page there", async () => {
    const { kampus, prodi: [a, b] } = await buatKatalog(t.db);
    expect(await halamanKampus(t.db, [kampus.id], { prodi: false })).toEqual([`/kampus/${kampus.slug}`]);
    expect(await halamanKampus(t.db, [kampus.id], { prodi: true, ulasan: true })).toEqual(
      [`/kampus/${kampus.slug}`, `/kampus/${kampus.slug}/ulasan`, ...[a.slug, b.slug].sort().map((s) => `/prodi/${s}`)],
    );
    expect(await halamanKampus(t.db, [], { prodi: true })).toEqual([]);
  });

  test("a Kampus Sumber refreshes that Kampus and its Prodi, nothing else", async () => {
    const satu = await buatKatalog(t.db);
    await buatKatalog(t.db);
    const paths = await halamanSumberFakta(t.db, await buatSumber(satu.kampus.id));
    expect(paths).toHaveLength(3);
    expect(paths).toContain(`/kampus/${satu.kampus.slug}`);
    expect(paths.every((p) => p === `/kampus/${satu.kampus.slug}` || satu.prodi.some((x) => p === `/prodi/${x.slug}`))).toBe(true);
  });

  test("a national Sumber refreshes the Kampus pages of the Kampus taking part, not their Prodi", async () => {
    const ikut = await buatKatalog(t.db);
    const tidak = await buatKatalog(t.db);
    const nasional = await buatSumber(null);
    const [b] = await t.db
      .insert(beasiswa)
      .values({ nama: "KIP Kuliah", penyelenggara: "Uji", sasaran: "Uji", cakupan: "Uji", sumberId: nasional, tahunAkademik: 2026 })
      .returning();
    await t.db
      .insert(beasiswaKampus)
      .values({ beasiswaId: b.id, kampusId: ikut.kampus.id, sumberId: await buatSumber(ikut.kampus.id), tahunAkademik: 2026 });
    expect(await halamanSumberFakta(t.db, nasional)).toEqual([`/kampus/${ikut.kampus.slug}`]);
    expect(await halamanSumberFakta(t.db, nasional)).not.toContain(`/kampus/${tidak.kampus.slug}`);
    expect(await halamanSumberFakta(t.db, 999_999)).toEqual([]);
  });

  test("a Kode Prodi refreshes its Prodi pages and the home page", async () => {
    const { kampus } = await buatKatalog(t.db);
    await t.db.insert(prodi).values({ kampusId: kampus.id, kodeProdi: "99999", nama: "Ilmu Uji", jenjang: "S1", slug: "ilmu-uji-99999" });
    expect(await halamanKodeProdi(t.db, "99999")).toEqual(["/", "/prodi/ilmu-uji-99999"]);
  });
});
