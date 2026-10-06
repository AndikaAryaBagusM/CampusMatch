import { describe, expect, test } from "vitest";
import { bacaDaftar, bacaSlugs, hapus, hrefBandingkan, tambah } from "./daftar";

describe("the Bandingkan list", () => {
  test("malformed storage is an empty list", () => {
    expect(bacaDaftar(null)).toEqual([]);
    expect(bacaDaftar("{oops")).toEqual([]);
    expect(bacaDaftar('{"slug":"a"}')).toEqual([]);
  });

  test("keeps valid, distinct entries, at most three", () => {
    const json = JSON.stringify([
      { slug: "a", label: "S1 A" },
      { slug: "a", label: "again" },
      { slug: "Bad Slug!", label: "x" },
      { slug: "b" },
      { slug: "c", label: "S1 C" },
      { slug: "d", label: "S1 D" },
    ]);
    expect(bacaDaftar(json)).toEqual([
      { slug: "a", label: "S1 A" },
      { slug: "b", label: "b" },
      { slug: "c", label: "S1 C" },
    ]);
  });

  test("adding refuses repeats and a fourth Prodi; removing", () => {
    let d = tambah([], { slug: "a", label: "A" });
    d = tambah(d, { slug: "a", label: "A" });
    d = tambah(tambah(d, { slug: "b", label: "B" }), { slug: "c", label: "C" });
    expect(tambah(d, { slug: "d", label: "D" })).toBe(d);
    expect(hapus(d, "b").map((p) => p.slug)).toEqual(["a", "c"]);
  });

  test("the compare link round-trips", () => {
    const href = hrefBandingkan(["a", "b-2"]);
    expect(href).toBe("/bandingkan?p=a&p=b-2");
    expect(bacaSlugs(new URLSearchParams(href.split("?")[1]).getAll("p"))).toEqual(["a", "b-2"]);
    expect(bacaSlugs(["a", "a", "../x", "b", "c", "d"])).toEqual(["a", "b", "c"]);
    expect(bacaSlugs(undefined)).toEqual([]);
  });
});
