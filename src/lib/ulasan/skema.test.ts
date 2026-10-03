import { expect, test } from "vitest";
import { dataUlasan } from "../../../test/fixtures";
import { bacaIsian, skemaUlasan } from "./skema";

const form = (ubah: Record<string, string> = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...dataUlasan(), rekomendasi: "ya", ...ubah })) fd.set(k, String(v));
  return fd;
};

test("accepts a complete form and coerces numbers and Rekomendasi", () => {
  const r = skemaUlasan(2026).safeParse(bacaIsian(form()));
  expect(r.success).toBe(true);
  expect(r.data).toMatchObject({ bintang: 4, rekomendasi: true, tahunMasuk: 2023 });
});

test.each([
  ["bintang", "0"],
  ["bintang", "6"],
  ["aspekDosen", "2.5"],
  ["rekomendasi", "mungkin"],
  ["judul", "abc"],
  ["isi", "Terlalu pendek."],
  ["statusPengulas", "dosen"],
  ["tahunMasuk", "2027"],
  ["tahunMasuk", "1900"],
])("rejects %s = %s", (kolom, nilai) => {
  const r = skemaUlasan(2026).safeParse(bacaIsian(form({ [kolom]: nilai })));
  expect(r.success).toBe(false);
  expect(r.error?.issues[0].path[0]).toBe(kolom);
});

test("counts the text length after trimming", () => {
  const r = skemaUlasan(2026).safeParse(bacaIsian(form({ isi: "   " + "a".repeat(149) + "   " })));
  expect(r.success).toBe(false);
});
