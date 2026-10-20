import { describe, expect, test } from "vitest";
import type { BeasiswaBaru, BiayaBaru, JalurBaru, PaketSumber } from "./baca";
import { urutkanPaket } from "./urutan";

const paket = (
  kode: string,
  npsn: string | null,
  isi: { jalur?: string[]; biayaJalur?: string[]; beasiswa?: string[]; ikut?: string[] } = {},
): PaketSumber => ({
  kode,
  meta: { npsn, url: "https://contoh.ac.id", judul: kode, penerbit: "Contoh", diaksesPada: "2026-10-20", arsipUrl: null },
  jalur: (isi.jalur ?? []).map(
    (nama, i): JalurBaru => ({ baris: i + 2, tahunAkademik: 2026, nama, kategori: "mandiri", tes: [], pendaftaranBuka: null, pendaftaranTutup: null }),
  ),
  biaya: (isi.biayaJalur ?? []).map(
    (jalur, i): BiayaBaru => ({ baris: i + 2, tahunAkademik: 2026, jenis: "ukt", prodi: null, jalur, label: null, jumlah: 1, batas: null, periode: "per_semester" }),
  ),
  beasiswa: [
    ...(isi.beasiswa ?? []).map((nama) => ({ nama, ikutNasional: false })),
    ...(isi.ikut ?? []).map((nama) => ({ nama, ikutNasional: true })),
  ].map(
    (b, i): BeasiswaBaru => ({ baris: i + 2, tahunAkademik: 2026, ...b, penyelenggara: "", sasaran: "", cakupan: "", url: null }),
  ),
});

const kode = (p: PaketSumber[]) => p.map((x) => x.kode);

describe("urutkanPaket", () => {
  test("national Sumber first, then by kode", () => {
    expect(kode(urutkanPaket([paket("002-b", "002"), paket("001-a", "001"), paket("kip", null)]))).toEqual([
      "kip",
      "001-a",
      "002-b",
    ]);
  });

  test("a folder comes after the folder defining the Jalur Masuk its Biaya use", () => {
    const urut = urutkanPaket([
      paket("001-a-biaya", "001", { biayaJalur: ["SIMA Ujian Tulis"] }),
      paket("001-b-sima", "001", { jalur: ["sima ujian tulis"] }),
    ]);
    expect(kode(urut)).toEqual(["001-b-sima", "001-a-biaya"]);
  });

  test("the same Jalur Masuk name at another Kampus is not a dependency", () => {
    const urut = urutkanPaket([paket("001-a", "001", { biayaJalur: ["Mandiri"] }), paket("002-b", "002", { jalur: ["Mandiri"] })]);
    expect(kode(urut)).toEqual(["001-a", "002-b"]);
  });

  test("taking part in a national Beasiswa follows its national Sumber", () => {
    const urut = urutkanPaket([paket("001-a", "001", { ikut: ["KIP Kuliah"] }), paket("zz-nasional", null, { beasiswa: ["KIP Kuliah"] })]);
    expect(kode(urut)).toEqual(["zz-nasional", "001-a"]);
  });

  test("names no folder defines are left to the import", () => {
    expect(kode(urutkanPaket([paket("001-a", "001", { biayaJalur: ["SNBT"] })]))).toEqual(["001-a"]);
  });

  test("refuses a cycle", () => {
    expect(() =>
      urutkanPaket([
        paket("001-a", "001", { jalur: ["A"], biayaJalur: ["B"] }),
        paket("001-b", "001", { jalur: ["B"], biayaJalur: ["A"] }),
      ]),
    ).toThrow(/001-a, 001-b/);
  });
});
