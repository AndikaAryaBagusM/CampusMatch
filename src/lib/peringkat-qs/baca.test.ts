import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { readRows } from "../../../scripts/catalogue/exports";
import { bacaQs, parsePeringkat, type Baris } from "./baca";

describe("parsePeringkat", () => {
  test("exact, shared, band and open-ended ranks keep QS's text", () => {
    expect(parsePeringkat("276")).toEqual({ peringkat: "276", min: 276, max: 276 });
    expect(parsePeringkat("=191")).toEqual({ peringkat: "=191", min: 191, max: 191 });
    expect(parsePeringkat("851-900")).toEqual({ peringkat: "851-900", min: 851, max: 900 });
    expect(parsePeringkat("1401+")).toEqual({ peringkat: "1401+", min: 1401, max: null });
  });

  test("anything else is rejected", () => {
    for (const s of ["", "0", "#191", "900-851", "100-100", "1,401+", "top 200", "=1401+"]) expect(parsePeringkat(s)).toBeNull();
  });
});

const file = (entri: { nama_qs: string; peringkat: string }[], ubah: Record<string, unknown> = {}) => ({
  judul: "QS World University Rankings 2027",
  edisi: 2027,
  sumber_url: "https://www.topuniversities.com/world-university-rankings?countries=id",
  tanggal_ambil: "2026-10-07",
  entri,
  ...ubah,
});
const cocok = (...pasangan: [string, string][]): Baris[] => pasangan.map(([nama_qs, npsn]) => ({ nama_qs, npsn, catatan: "" }));

describe("bacaQs", () => {
  test("reads the edition with one reviewed match per entry", () => {
    const { edisi, galat } = bacaQs(
      file([
        { nama_qs: "Universitas Indonesia", peringkat: "=191" },
        { nama_qs: "Gadjah Mada University", peringkat: "1201-1400" },
      ]),
      cocok(["Universitas Indonesia", "001002"], ["Gadjah Mada University", "001001"]),
    );
    expect(galat).toEqual([]);
    expect(edisi).toEqual({
      edisi: 2027,
      sumberUrl: "https://www.topuniversities.com/world-university-rankings?countries=id",
      tanggalAmbil: "2026-10-07",
      entri: [
        { namaQs: "Universitas Indonesia", npsn: "001002", peringkat: "=191", min: 191, max: 191 },
        { namaQs: "Gadjah Mada University", npsn: "001001", peringkat: "1201-1400", min: 1201, max: 1400 },
      ],
    });
  });

  test("never guesses: unmatched, doubly matched and shared Kampus block the load", () => {
    const { edisi, galat } = bacaQs(
      file([
        { nama_qs: "A", peringkat: "1" },
        { nama_qs: "B", peringkat: "2" },
        { nama_qs: "C", peringkat: "3" },
        { nama_qs: "D", peringkat: "4" },
      ]),
      cocok(["B", "000002"], ["B", "000003"], ["C", "000009"], ["D", "000009"], ["E", "000005"]),
    );
    expect(edisi).toBeNull();
    expect(galat).toEqual([
      '"E" is matched in the CSV but is not in the QS file',
      '"A" has no row in the match CSV; decide its Kampus first',
      '"B" has 2 rows in the match CSV; keep one',
      'npsn 000009 is matched to both "C" and "D"',
    ]);
  });

  test("rejects unknown rank formats, a wrong title, a non-https source and repeated names", () => {
    const { galat } = bacaQs(
      file(
        [
          { nama_qs: "A", peringkat: "top 10" },
          { nama_qs: "A", peringkat: "2" },
        ],
        { judul: "QS Asia University Rankings 2027" },
      ),
      cocok(["A", "000001"]),
    );
    expect(galat).toEqual([
      'judul must be "QS World University Rankings 2027", got "QS Asia University Rankings 2027"',
      '"A": unknown rank format "top 10" (expected 276, =191, 851-900 or 1401+)',
      '"A" is listed twice in the QS file',
    ]);
    expect(bacaQs(file([{ nama_qs: "A", peringkat: "1" }], { sumber_url: "http://qs.example" }), cocok(["A", "1"])).galat).toEqual([
      "sumber_url: Invalid URL",
    ]);
  });

  test("the committed QS 2027 file and its reviewed matches are complete", () => {
    const { edisi, galat } = bacaQs(
      JSON.parse(readFileSync("data/raw/qs-wur-2027-indonesia.json", "utf8")),
      readRows("data/qs-kampus.csv", ["nama_qs", "npsn"]),
    );
    expect(galat).toEqual([]);
    expect(edisi?.edisi).toBe(2027);
    expect(edisi?.entri).toHaveLength(20);
  });
});
