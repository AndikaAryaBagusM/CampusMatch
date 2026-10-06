import { describe, expect, test } from "vitest";
import { bacaPaket, parseRupiah, type Baris } from "./baca";
import { formatTahunAkademik, parseTahunAkademik, tahunAkademikBerjalan, tahunAkademikLama } from "./tahun-akademik";

const meta = {
  npsn: "001001",
  url: "https://um.ugm.ac.id/biaya",
  judul: "SK Rektor tentang UKT 2026",
  penerbit: "Universitas Gadjah Mada",
  diakses_pada: "2026-10-06",
  arsip_url: "https://web.archive.org/web/20261006/https://um.ugm.ac.id/biaya",
};

const biayaUkt = (ubah: Baris = {}): Baris => ({
  tahun_akademik: "2026/2027",
  jenis: "ukt",
  prodi: "Teknik Informatika",
  jenjang: "S1",
  prodi_slug: "",
  jalur: "",
  label: "Kelompok III",
  jumlah: "Rp 7.500.000",
  batas: "",
  periode: "",
  ...ubah,
});

describe("Tahun Akademik", () => {
  test("parses and formats 2026/2027 as 2026", () => {
    expect(parseTahunAkademik("2026/2027")).toBe(2026);
    expect(parseTahunAkademik(" 2026 / 2027 ")).toBe(2026);
    expect(formatTahunAkademik(2026)).toBe("2026/2027");
  });
  test("refuses years that don't follow on", () => {
    expect(parseTahunAkademik("2026/2028")).toBeNull();
    expect(parseTahunAkademik("2026")).toBeNull();
  });
  test("a new Tahun Akademik starts in August", () => {
    expect(tahunAkademikBerjalan(new Date("2026-07-31T12:00:00Z"))).toBe(2025);
    expect(tahunAkademikBerjalan(new Date("2026-08-01T00:00:00Z"))).toBe(2026);
    expect(tahunAkademikLama(2025, new Date("2026-10-06T00:00:00Z"))).toBe(true);
    expect(tahunAkademikLama(2026, new Date("2026-10-06T00:00:00Z"))).toBe(false);
  });
});

describe("parseRupiah", () => {
  test.each([
    ["7500000", 7500000],
    ["7.500.000", 7500000],
    ["Rp 7.500.000", 7500000],
    ["Rp. 0", 0],
  ])("%s", (v, n) => expect(parseRupiah(v)).toBe(n));
  test.each(["7,5 juta", "7.500.000,50", "", "abc"])("refuses %s", (v) => expect(parseRupiah(v)).toBeNull());
});

describe("bacaPaket", () => {
  test("reads a Biaya with defaults", () => {
    const { paket, galat } = bacaPaket("ugm-ukt-2026", meta, { biaya: [biayaUkt()] });
    expect(galat).toEqual([]);
    expect(paket?.meta.npsn).toBe("001001");
    expect(paket?.biaya[0]).toEqual({
      baris: 2,
      tahunAkademik: 2026,
      jenis: "ukt",
      prodi: { nama: "Teknik Informatika", jenjang: "S1", slug: null },
      jalur: null,
      label: "Kelompok III",
      jumlah: 7500000,
      batas: null,
      periode: "per_semester",
    });
  });

  test("a Kampus-wide amount has no Prodi", () => {
    const { paket } = bacaPaket("ugm-ukt-2026", meta, {
      biaya: [biayaUkt({ jenis: "uang_pangkal", prodi: "", jenjang: "", jalur: "UM UGM", batas: "minimal" })],
    });
    expect(paket?.biaya[0]).toMatchObject({ prodi: null, jalur: "UM UGM", batas: "minimal", periode: "sekali" });
  });

  test("collects every row error with its line", () => {
    const { paket, galat } = bacaPaket("ugm-ukt-2026", meta, {
      biaya: [
        biayaUkt(),
        biayaUkt({ tahun_akademik: "2026", jumlah: "7,5 juta" }),
        biayaUkt({ jenis: "lain" }),
        biayaUkt({ jenis: "ukt", periode: "sekali" }),
        biayaUkt({ jenjang: "" }),
      ],
    });
    expect(paket).toBeNull();
    expect(galat).toEqual([
      expect.stringMatching(/^biaya\.csv row 3: tahun_akademik/),
      expect.stringMatching(/^biaya\.csv row 3: jumlah/),
      expect.stringMatching(/^biaya\.csv row 4: periode is needed/),
      expect.stringMatching(/^biaya\.csv row 5: jenis ukt is always per_semester/),
      expect.stringMatching(/^biaya\.csv row 6: jenjang is needed/),
    ]);
  });

  test("reads Jalur Masuk with several tests", () => {
    const { paket, galat } = bacaPaket("ugm-jalur-2026", meta, {
      jalur: [
        { tahun_akademik: "2026/2027", nama: "UM UGM", kategori: "Mandiri", tes: "tes_kampus; wawancara", pendaftaran_buka: "2026-05-01", pendaftaran_tutup: "2026-05-20" },
      ],
    });
    expect(galat).toEqual([]);
    expect(paket?.jalur[0]).toMatchObject({ kategori: "mandiri", tes: ["tes_kampus", "wawancara"], pendaftaranTutup: "2026-05-20" });
  });

  test("refuses unknown tests, bad dates and duplicate Jalur", () => {
    const jalur = { tahun_akademik: "2026/2027", nama: "UM UGM", kategori: "mandiri", tes: "utbk", pendaftaran_buka: "", pendaftaran_tutup: "" };
    const { galat } = bacaPaket("ugm-jalur-2026", meta, {
      jalur: [jalur, { ...jalur, tes: "psikotes", pendaftaran_buka: "2026-02-30" }],
    });
    expect(galat).toEqual([
      expect.stringMatching(/row 3: tes must be/),
      expect.stringMatching(/row 3: pendaftaran_buka/),
      expect.stringMatching(/row 3: "UM UGM" appears twice/),
    ]);
  });

  test("sumber.json needs a Wayback link or none at all", () => {
    expect(bacaPaket("x", { ...meta, arsip_url: "https://example.com/copy" }, { biaya: [biayaUkt()] }).galat).toEqual([
      expect.stringMatching(/^sumber\.json arsip_url: must be a Wayback Machine link/),
    ]);
    expect(bacaPaket("x", { ...meta, arsip_url: null }, { biaya: [biayaUkt()] }).galat).toEqual([]);
    expect(bacaPaket("x", { ...meta, extra: 1 }, { biaya: [biayaUkt()] }).galat).toHaveLength(1);
  });

  test("a national Sumber holds only national Beasiswa", () => {
    const kip = { tahun_akademik: "2026/2027", nama: "KIP Kuliah", ikut_skema_nasional: "", penyelenggara: "Kemdiktisaintek", sasaran: "Calon mahasiswa kurang mampu", cakupan: "Biaya kuliah dan biaya hidup", url: "" };
    const nasional = { ...meta, npsn: null };
    expect(bacaPaket("kip-kuliah-2026", nasional, { beasiswa: [kip] }).galat).toEqual([]);
    expect(bacaPaket("kip-kuliah-2026", nasional, { biaya: [biayaUkt()], beasiswa: [{ ...kip, nama: "B", ikut_skema_nasional: "ya" }] }).galat).toEqual([
      "A national Sumber (no npsn) can only hold beasiswa.csv.",
      expect.stringMatching(/ikut_skema_nasional needs a Kampus Sumber/),
    ]);
  });

  test("taking part in a national Beasiswa needs only its name", () => {
    const { paket, galat } = bacaPaket("ugm-beasiswa-2026", meta, {
      beasiswa: [{ tahun_akademik: "2026/2027", nama: "KIP Kuliah", ikut_skema_nasional: "ya", penyelenggara: "", sasaran: "", cakupan: "", url: "" }],
    });
    expect(galat).toEqual([]);
    expect(paket?.beasiswa[0]).toMatchObject({ nama: "KIP Kuliah", ikutNasional: true });
  });

  test("needs at least one fact and a clean folder name", () => {
    expect(bacaPaket("UGM UKT", meta, {}).galat).toEqual([
      expect.stringMatching(/Folder name/),
      expect.stringMatching(/No facts/),
    ]);
  });
});
