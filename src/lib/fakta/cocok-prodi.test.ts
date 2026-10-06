import { describe, expect, test } from "vitest";
import { cocokkanProdi, normalisasiNama, type ProdiKampus } from "./cocok-prodi";

const daftar: ProdiKampus[] = [
  { id: 1, nama: "Teknik Informatika", jenjang: "S1", slug: "s1-teknik-informatika-ugm" },
  { id: 2, nama: "Teknik Informatika", jenjang: "D3", slug: "d3-teknik-informatika-ugm" },
  { id: 3, nama: "Manajemen", jenjang: "S1", slug: "s1-manajemen-ugm" },
  { id: 4, nama: "Manajemen (Kampus Jakarta)", jenjang: "S1", slug: "s1-manajemen-kampus-jakarta-ugm" },
  { id: 5, nama: "Akuntansi", jenjang: "S1", slug: "s1-akuntansi-ugm" },
  { id: 6, nama: "Akuntansi", jenjang: "S1", slug: "s1-akuntansi-ugm-2" },
];

describe("normalisasiNama", () => {
  test.each([
    ["Program Studi S1 Teknik Informatika", "teknik informatika"],
    ["S-1 Teknik  Informatika", "teknik informatika"],
    ["Prodi D-III Teknik Informatika", "teknik informatika"],
    ["Sarjana Terapan Teknologi Rekayasa Perangkat Lunak", "teknologi rekayasa perangkat lunak"],
    ["Manajemen (Kampus Jakarta)", "manajemen (kampus jakarta)"],
    ["Pendidikan Bahasa Indonesia, Sastra", "pendidikan bahasa indonesia sastra"],
  ])("%s", (nama, hasil) => expect(normalisasiNama(nama)).toBe(hasil));
});

describe("cocokkanProdi", () => {
  test("matches by name and Jenjang", () => {
    expect(cocokkanProdi({ nama: "Program Studi Teknik Informatika", jenjang: "D3", slug: null }, daftar)).toEqual({ ok: true, prodi: daftar[1] });
  });

  test("a branch campus is a different Prodi", () => {
    expect(cocokkanProdi({ nama: "Manajemen", jenjang: "S1", slug: null }, daftar)).toEqual({ ok: true, prodi: daftar[2] });
  });

  test("several matches ask for prodi_slug", () => {
    const hasil = cocokkanProdi({ nama: "Akuntansi", jenjang: "S1", slug: null }, daftar);
    expect(hasil).toEqual({ ok: false, pesan: expect.stringContaining("s1-akuntansi-ugm-2") });
  });

  test("prodi_slug wins and must belong to the Kampus", () => {
    expect(cocokkanProdi({ nama: "", jenjang: null, slug: "s1-akuntansi-ugm-2" }, daftar)).toEqual({ ok: true, prodi: daftar[5] });
    expect(cocokkanProdi({ nama: "", jenjang: null, slug: "lain" }, daftar)).toMatchObject({ ok: false });
  });

  test("no match suggests the closest names", () => {
    const hasil = cocokkanProdi({ nama: "Teknik Informatik", jenjang: "S1", slug: null }, daftar);
    expect(hasil).toEqual({ ok: false, pesan: expect.stringContaining("closest: S1 Teknik Informatika (prodi_slug s1-teknik-informatika-ugm)") });
  });
});
