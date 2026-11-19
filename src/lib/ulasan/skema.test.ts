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

test("ratings alone are a valid Ulasan: no title and no text become null", () => {
  for (const kosong of [{ judul: "", isi: "" }, { judul: "   ", isi: "  " }]) {
    const r = skemaUlasan(2026).safeParse(bacaIsian(form(kosong)));
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ bintang: 4, judul: null, isi: null });
  }
  const fd = form();
  fd.delete("judul");
  fd.delete("isi");
  expect(skemaUlasan(2026).safeParse(bacaIsian(fd)).data).toMatchObject({ judul: null, isi: null });
});

test("a title without text, or text without a title, is rejected", () => {
  const tanpaIsi = skemaUlasan(2026).safeParse(bacaIsian(form({ isi: "" })));
  expect(tanpaIsi.error?.issues.map((i) => i.path[0])).toEqual(["isi"]);
  const tanpaJudul = skemaUlasan(2026).safeParse(bacaIsian(form({ judul: "" })));
  expect(tanpaJudul.error?.issues.map((i) => i.path[0])).toEqual(["judul"]);
});

test("counts the text length after trimming", () => {
  const r = skemaUlasan(2026).safeParse(bacaIsian(form({ isi: "   " + "a".repeat(149) + "   " })));
  expect(r.success).toBe(false);
});
