import { describe, expect, test } from "vitest";
import { ITEM, TIPE } from "./item";
import { bacaProfil, hitungProfil, kecocokan, kodekanProfil, kodeProfil, totalProfil, urutkanTipe } from "./skor";
import { parseKode, usulkanKode } from "./usulan";

const idTipe = (tipe: string) => ITEM.filter((i) => i.tipe === tipe).map((i) => i.id);

describe("items", () => {
  test("60 items, 10 per type, interleaved and all different", () => {
    expect(ITEM).toHaveLength(60);
    for (const t of TIPE) expect(idTipe(t)).toHaveLength(10);
    expect(ITEM.slice(0, 6).map((i) => i.tipe).join("")).toBe("RIASEC");
    expect(new Set(ITEM.map((i) => i.teks)).size).toBe(60);
    expect(ITEM.map((i) => i.id)).toEqual(Array.from({ length: 60 }, (_, k) => k + 1));
  });
});

describe("scoring", () => {
  test("one point per ticked activity of a type", () => {
    const p = hitungProfil([...idTipe("S").slice(0, 7), ...idTipe("I").slice(0, 9), idTipe("A")[0]]);
    expect(p).toEqual({ R: 0, I: 9, A: 1, S: 7, E: 0, C: 0 });
    expect(totalProfil(p)).toBe(17);
    expect(kodeProfil(p)).toBe("ISA");
  });

  test("duplicates and unknown ids are ignored", () => {
    expect(hitungProfil([1, 1, 61, 0, -3])).toEqual({ R: 1, I: 0, A: 0, S: 0, E: 0, C: 0 });
  });

  test("ties keep RIASEC order and are marked", () => {
    const urut = urutkanTipe({ R: 2, I: 5, A: 5, S: 1, E: 0, C: 0 });
    expect(urut.slice(0, 3)).toEqual([
      { tipe: "I", skor: 5, seri: true },
      { tipe: "A", skor: 5, seri: true },
      { tipe: "R", skor: 2, seri: false },
    ]);
  });

  test("the shareable link round-trips and refuses anything else", () => {
    const p = { R: 4, I: 9, A: 2, S: 5, E: 3, C: 10 };
    expect(kodekanProfil(p)).toBe("4-9-2-5-3-10");
    expect(bacaProfil("4-9-2-5-3-10")).toEqual(p);
    for (const salah of ["4-9-2-5-3", "4-9-2-5-3-11", "a-9-2-5-3-1", "", undefined, "4-9-2-5-3-1-0"]) expect(bacaProfil(salah)).toBeNull();
  });

  test("a Jurusan whose first type is the strongest interest ranks highest", () => {
    const p = { R: 1, I: 9, A: 2, S: 7, E: 0, C: 3 };
    expect(kecocokan(p, ["I", "S"])).toBeGreaterThan(kecocokan(p, ["S", "I"]));
    expect(kecocokan(p, ["S", "I"])).toBeGreaterThan(kecocokan(p, ["E", "C", "R"]));
    expect(kecocokan({ R: 10, I: 10, A: 10, S: 10, E: 10, C: 10 }, ["R", "I", "A"])).toBe(1);
  });
});

describe("Kode RIASEC proposals", () => {
  test("the three highest average O*NET ratings", () => {
    const { kode, rataRata } = usulkanKode([
      { R: 2, I: 6, A: 1, S: 5, E: 3, C: 4 },
      { R: 2, I: 4, A: 1, S: 6, E: 3, C: 4.5 },
    ]);
    expect(rataRata).toEqual({ R: 2, I: 5, A: 1, S: 5.5, E: 3, C: 4.25 });
    expect(kode).toEqual(["S", "I", "C"]);
  });

  test.each([
    ["sia", ["S", "I", "A"]],
    ["RI", ["R", "I"]],
    ["R", null],
    ["RIAS", null],
    ["RRI", null],
    ["RXA", null],
  ])("parseKode(%s)", (v, hasil) => expect(parseKode(v)).toEqual(hasil));
});
