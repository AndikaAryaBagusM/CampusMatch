import { afterAll, beforeAll, expect, test } from "vitest";
import { kunjunganHarian } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { BOT, catatKunjungan, jalurTercatat, kelompokAsal, ringkasanKunjungan } from "./kunjungan";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

test("only public pages are counted, without query strings or made-up paths", () => {
  expect(jalurTercatat("/")).toBe("/");
  expect(jalurTercatat("/prodi/ugm-s1-informatika")).toBe("/prodi/ugm-s1-informatika");
  expect(jalurTercatat("/prodi/ugm-s1-informatika/")).toBe("/prodi/ugm-s1-informatika");
  expect(jalurTercatat("/kampus/ugm/ulasan")).toBe("/kampus/ugm/ulasan");
  expect(jalurTercatat("/tes-minat/hasil")).toBe("/tes-minat/hasil");
  for (const tidak of ["/akun", "/moderasi/fakta", "/api/kunjungan", "/prodi/Bad Slug", "/prodi/a/b/c", "/tes-minat/hasil?p=1-2-3-4-5-6", 7, null, "/x".repeat(200)])
    expect(jalurTercatat(tidak)).toBeNull();
});

test("a referrer is reduced to one of five groups", () => {
  const host = "www.campusmatch.site";
  expect(kelompokAsal("", host)).toBe("langsung");
  expect(kelompokAsal(undefined, host)).toBe("langsung");
  expect(kelompokAsal("https://www.campusmatch.site/cari?q=x", host)).toBe("internal");
  expect(kelompokAsal("https://www.google.co.id/", host)).toBe("pencarian");
  expect(kelompokAsal("https://l.instagram.com/?u=x", host)).toBe("sosial");
  expect(kelompokAsal("https://api.whatsapp.com/", host)).toBe("sosial");
  expect(kelompokAsal("https://contoh.sch.id/bk", host)).toBe("lain");
  expect(kelompokAsal("bukan url", host)).toBe("lain");
});

test("crawlers are recognised by their user agent", () => {
  expect(BOT.test("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
  expect(BOT.test("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36")).toBe(false);
});

test("views add up per day, page and referrer group, and the summary totals them", async () => {
  const kemarin = new Date("2026-11-15T05:00:00Z");
  const hariIni = new Date("2026-11-16T05:00:00Z");
  await catatKunjungan(t.db, { jalur: "/", asal: "pencarian" }, kemarin);
  await catatKunjungan(t.db, { jalur: "/prodi/a", asal: "sosial" }, hariIni);
  await catatKunjungan(t.db, { jalur: "/prodi/a", asal: "sosial" }, hariIni);
  await catatKunjungan(t.db, { jalur: "/prodi/a", asal: "internal" }, hariIni);

  const baris = await t.db.select().from(kunjunganHarian);
  expect(baris).toHaveLength(3);
  expect(baris.find((b) => b.jalur === "/prodi/a" && b.asal === "sosial")).toMatchObject({ tanggal: "2026-11-16", jumlah: 2 });

  const r = await ringkasanKunjungan(t.db, 30, hariIni);
  expect(r.total).toBe(4);
  expect(r.perHari).toEqual([
    { tanggal: "2026-11-16", jumlah: 3 },
    { tanggal: "2026-11-15", jumlah: 1 },
  ]);
  expect(r.teratas[0]).toEqual({ jalur: "/prodi/a", jumlah: 3 });
  expect(r.perBagian).toEqual(expect.arrayContaining([{ bagian: "Prodi", jumlah: 3 }, { bagian: "Beranda", jumlah: 1 }]));
  expect(r.perAsal.find((a) => a.asal === "sosial")?.jumlah).toBe(2);

  // Only today.
  expect((await ringkasanKunjungan(t.db, 1, hariIni)).total).toBe(3);
});
