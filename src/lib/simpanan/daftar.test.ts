import { expect, test } from "vitest";
import { bacaTersimpan, lepasProdi, MAKS_TERSIMPAN, pesanTersimpan, simpanProdi } from "./daftar";

test("malformed storage is an empty list; invalid and repeated entries are dropped", () => {
  expect(bacaTersimpan(null)).toEqual([]);
  expect(bacaTersimpan("{oops")).toEqual([]);
  expect(
    bacaTersimpan(JSON.stringify([{ slug: "a", label: "S1 A" }, { slug: "a" }, { slug: "Bad Slug!" }, { slug: "b" }, 7, null])),
  ).toEqual([
    { slug: "a", label: "S1 A" },
    { slug: "b", label: "b" },
  ]);
});

test("saving adds once, up to the limit; removing takes one out", () => {
  let daftar = simpanProdi([], { slug: "a", label: "A" });
  expect(simpanProdi(daftar, { slug: "a", label: "A lagi" })).toBe(daftar);
  for (let i = 0; i < MAKS_TERSIMPAN + 5; i++) daftar = simpanProdi(daftar, { slug: `p-${i}`, label: `P ${i}` });
  expect(daftar).toHaveLength(MAKS_TERSIMPAN);
  expect(lepasProdi(daftar, "a").some((p) => p.slug === "a")).toBe(false);
});

test("the share message lists each Prodi with its link", () => {
  const pesan = pesanTersimpan([{ slug: "ugm-s1-informatika", label: "S1 Informatika, UGM" }], (j) => `https://contoh.id${j}`);
  expect(pesan).toContain("S1 Informatika, UGM");
  expect(pesan).toContain("https://contoh.id/prodi/ugm-s1-informatika");
});
