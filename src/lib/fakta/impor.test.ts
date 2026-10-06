import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq, sql } from "drizzle-orm";
import { biaya, jalurMasuk, sumber } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna } from "../../../test/fixtures";
import { bacaPaket, type Baris } from "./baca";
import { FaktaDitolak, imporSumber } from "./impor";
import { getFaktaKampus, listBeasiswa, listBiayaProdi } from "./kueri";
import {
  getSumber,
  hitungSumberDraf,
  kembalikanSumber,
  listSumberDiperiksa,
  listSumberDraf,
  PemeriksaanDitolak,
  tandaiDiperiksa,
  tarikFakta,
} from "./periksa";

let t: TestDb;
let pemasuk: string;
let pemeriksa: string;
beforeAll(async () => {
  t = await createTestDb();
  pemasuk = (await buatPengguna(t.db, "pemasuk@campusmatch.id")).id;
  pemeriksa = (await buatPengguna(t.db, "pemeriksa@campusmatch.id")).id;
});
afterAll(() => t.close());

let n = 0;
const meta = (npsn: string | null, ubah: Record<string, unknown> = {}) => ({
  npsn,
  url: "https://kampus.ac.id/biaya",
  judul: "SK Rektor tentang UKT",
  penerbit: "Universitas Uji",
  diakses_pada: "2026-10-06",
  arsip_url: "https://web.archive.org/web/2026/https://kampus.ac.id/biaya",
  ...ubah,
});
const ukt = (prodi: string, jumlah: string, ubah: Baris = {}): Baris => ({
  tahun_akademik: "2026/2027",
  jenis: "ukt",
  prodi,
  jenjang: "S1",
  prodi_slug: "",
  jalur: "",
  label: "Kelompok I",
  jumlah,
  batas: "",
  periode: "",
  ...ubah,
});
const jalur = (nama: string, ubah: Baris = {}): Baris => ({
  tahun_akademik: "2026/2027",
  nama,
  kategori: "mandiri",
  tes: "tes_kampus",
  pendaftaran_buka: "",
  pendaftaran_tutup: "",
  ...ubah,
});
function paket(kode: string, m: unknown, berkas: Parameters<typeof bacaPaket>[2]) {
  const { paket: p, galat } = bacaPaket(kode, m, berkas);
  if (!p) throw new Error(galat.join("\n"));
  return p;
}
const kode = () => `sumber-uji-${n++}`;
const jumlahBiaya = async (sumberId: number) =>
  (await t.db.select({ n: sql<number>`count(*)::int` }).from(biaya).where(eq(biaya.sumberId, sumberId)))[0].n;

describe("import", () => {
  test("writes Draf facts that pages don't show yet", async () => {
    const { kampus, prodi } = await buatKatalog(t.db);
    const k = kode();
    const hasil = await imporSumber(
      t.db,
      paket(k, meta(kampus.npsn), {
        jalur: [jalur("Seleksi Mandiri")],
        biaya: [
          ukt("Program Studi Informatika", "500.000"),
          ukt("Informatika", "7.500.000", { label: "Kelompok III" }),
          ukt("", "250000", { jenis: "pendaftaran", prodi: "", jenjang: "", jalur: "Seleksi Mandiri", label: "" }),
        ],
      }),
      pemasuk,
    );
    expect(hasil).toMatchObject({ baru: true, jumlah: { jalur: 1, biaya: 3 } });

    const rows = await t.db.select().from(biaya).where(eq(biaya.sumberId, hasil.sumberId));
    expect(rows.every((r) => r.status === "draf" && r.dimasukkanOleh === pemasuk)).toBe(true);
    expect(rows.filter((r) => r.prodiId === prodi[0].id)).toHaveLength(2);
    expect(await getFaktaKampus(t.db, kampus.id)).toBeNull();
    expect(await listBiayaProdi(t.db, prodi[0].id)).toBeNull();
    expect(await hitungSumberDraf(t.db)).toBeGreaterThan(0);
  });

  test("re-importing replaces the Draf facts", async () => {
    const { kampus } = await buatKatalog(t.db);
    const k = kode();
    const pertama = await imporSumber(t.db, paket(k, meta(kampus.npsn), { biaya: [ukt("Informatika", "1"), ukt("Manajemen", "2")] }), pemasuk);
    const kedua = await imporSumber(t.db, paket(k, meta(kampus.npsn), { biaya: [ukt("Informatika", "3")] }), pemasuk);
    expect(kedua).toMatchObject({ sumberId: pertama.sumberId, baru: false });
    expect(await jumlahBiaya(pertama.sumberId)).toBe(1);
  });

  test("an unmatched Prodi blocks the whole import", async () => {
    const { kampus } = await buatKatalog(t.db);
    const k = kode();
    const impor = imporSumber(t.db, paket(k, meta(kampus.npsn), { biaya: [ukt("Informatika", "1"), ukt("Kedokteran", "2")] }), pemasuk);
    await expect(impor).rejects.toThrow(/biaya\.csv row 3: no S1 Prodi named "Kedokteran"/);
    expect(await t.db.select().from(sumber).where(eq(sumber.kode, k))).toEqual([]);
  });

  test("a Biaya can point at a Jalur Masuk of an earlier Sumber, not an unknown one", async () => {
    const { kampus } = await buatKatalog(t.db);
    await imporSumber(t.db, paket(kode(), meta(kampus.npsn), { jalur: [jalur("Seleksi Mandiri")] }), pemasuk);
    const pendaftaran = (nama: string) => ukt("", "300000", { jenis: "pendaftaran", prodi: "", jenjang: "", jalur: nama });
    await expect(imporSumber(t.db, paket(kode(), meta(kampus.npsn), { biaya: [pendaftaran("Seleksi Mandiri")] }), pemasuk)).resolves.toBeTruthy();
    await expect(imporSumber(t.db, paket(kode(), meta(kampus.npsn), { biaya: [pendaftaran("Jalur Lain")] }), pemasuk)).rejects.toThrow(
      /no Jalur Masuk "Jalur Lain"/,
    );
  });

  test("the same Jalur Masuk can't be recorded by two Sumber", async () => {
    const { kampus } = await buatKatalog(t.db);
    const pertama = kode();
    await imporSumber(t.db, paket(pertama, meta(kampus.npsn), { jalur: [jalur("Seleksi Mandiri")] }), pemasuk);
    await expect(imporSumber(t.db, paket(kode(), meta(kampus.npsn), { jalur: [jalur("seleksi mandiri")] }), pemasuk)).rejects.toThrow(
      `already recorded by Sumber "${pertama}"`,
    );
  });

  test("an unknown NPSN is refused", async () => {
    await expect(imporSumber(t.db, paket(kode(), meta("9999999999"), { biaya: [ukt("Informatika", "1")] }), pemasuk)).rejects.toBeInstanceOf(
      FaktaDitolak,
    );
  });
});

describe("checking", () => {
  async function sumberDraf(m = {}) {
    const { kampus, prodi } = await buatKatalog(t.db);
    const k = kode();
    const { sumberId } = await imporSumber(
      t.db,
      paket(k, meta(kampus.npsn, m), {
        jalur: [jalur("Seleksi Mandiri")],
        biaya: [ukt("Informatika", "7500000"), ukt("", "5000000", { jenis: "uang_pangkal", prodi: "", jenjang: "", batas: "minimal" })],
      }),
      pemasuk,
    );
    return { kampus, prodi, sumberId, kode: k };
  }

  test("the Moderator who entered the facts can't check them", async () => {
    const { sumberId } = await sumberDraf();
    await expect(tandaiDiperiksa(t.db, { sumberId, moderatorId: pemasuk })).rejects.toThrow("Moderator lain");
  });

  test("the database also refuses a checker who entered the fact", async () => {
    const { sumberId } = await sumberDraf();
    await expect(
      t.db.update(biaya).set({ status: "diperiksa", diperiksaOleh: pemasuk, diperiksaAt: new Date() }).where(eq(biaya.sumberId, sumberId)),
    ).rejects.toThrow();
  });

  test("Diperiksa facts appear on the pages and the Sumber can't be re-imported", async () => {
    const { kampus, prodi, sumberId, kode: k } = await sumberDraf();
    const detail = await getSumber(t.db, sumberId);
    expect(detail).toMatchObject({ jalur: [{ nama: "Seleksi Mandiri" }], biaya: [expect.anything(), expect.anything()] });

    await tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa });
    const fakta = await getFaktaKampus(t.db, kampus.id);
    expect(fakta?.jalur?.daftar).toMatchObject([{ nama: "Seleksi Mandiri", tes: ["tes_kampus"], sumber: { judul: "SK Rektor tentang UKT" } }]);
    expect(fakta?.biaya?.daftar).toMatchObject([{ jenis: "uang_pangkal", jumlah: 5000000, batas: "minimal" }]);
    expect((await listBiayaProdi(t.db, prodi[0].id))?.daftar).toMatchObject([{ jenis: "ukt", jumlah: 7500000, label: "Kelompok I" }]);

    await expect(imporSumber(t.db, paket(k, meta(kampus.npsn), { biaya: [ukt("Informatika", "1")] }), pemasuk)).rejects.toThrow(
      /already has 3 Diperiksa or Ditarik fact/,
    );
    await expect(tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa })).rejects.toThrow("tidak punya fakta Draf");
  });

  test("a Sumber without a Wayback copy needs the checker's reason", async () => {
    const { sumberId } = await sumberDraf({ arsip_url: null });
    await expect(tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa, alasanTanpaArsip: "  " })).rejects.toBeInstanceOf(PemeriksaanDitolak);
    await tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa, alasanTanpaArsip: "PDF di Google Drive, tidak bisa diarsipkan" });
    const [s] = await t.db.select().from(sumber).where(eq(sumber.id, sumberId));
    expect(s.alasanTanpaArsip).toBe("PDF di Google Drive, tidak bisa diarsipkan");
  });

  test("sending back deletes the Draf facts and keeps the note for the importer", async () => {
    const { sumberId, kode: k } = await sumberDraf();
    await expect(kembalikanSumber(t.db, { sumberId, catatan: "" })).rejects.toThrow("perlu diperbaiki");
    await kembalikanSumber(t.db, { sumberId, catatan: "Kelompok I seharusnya Rp 500.000" });
    expect(await jumlahBiaya(sumberId)).toBe(0);
    expect(await t.db.select().from(jalurMasuk).where(eq(jalurMasuk.sumberId, sumberId))).toEqual([]);
    const { draf, dikembalikan } = await listSumberDraf(t.db);
    expect(draf.find((s) => s.id === sumberId)).toBeUndefined();
    expect(dikembalikan.find((s) => s.id === sumberId)).toMatchObject({ kode: k, catatan_pemeriksa: "Kelompok I seharusnya Rp 500.000" });
  });
});

describe("pages", () => {
  test("only the newest Tahun Akademik is shown", async () => {
    const { kampus, prodi } = await buatKatalog(t.db);
    for (const [ta, jumlah] of [["2025/2026", "6000000"], ["2026/2027", "7000000"]]) {
      const { sumberId } = await imporSumber(
        t.db,
        paket(kode(), meta(kampus.npsn), { biaya: [ukt("Informatika", jumlah, { tahun_akademik: ta })] }),
        pemasuk,
      );
      await tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa });
    }
    expect(await listBiayaProdi(t.db, prodi[0].id)).toMatchObject({ tahunAkademik: 2026, daftar: [{ jumlah: 7000000 }] });
  });

  test("a national Beasiswa shows once both it and the Kampus link are Diperiksa", async () => {
    const { kampus } = await buatKatalog(t.db);
    const nama = `KIP Kuliah ${n++}`;
    const nasional = await imporSumber(
      t.db,
      paket(kode(), meta(null, { penerbit: "Kemdiktisaintek" }), {
        beasiswa: [
          { tahun_akademik: "2026/2027", nama, ikut_skema_nasional: "", penyelenggara: "Kemdiktisaintek", sasaran: "Calon mahasiswa kurang mampu", cakupan: "UKT dan biaya hidup", url: "" },
        ],
      }),
      pemasuk,
    );
    const ikut = await imporSumber(
      t.db,
      paket(kode(), meta(kampus.npsn), {
        beasiswa: [{ tahun_akademik: "2026/2027", nama, ikut_skema_nasional: "ya", penyelenggara: "", sasaran: "", cakupan: "", url: "" }],
      }),
      pemasuk,
    );
    await tandaiDiperiksa(t.db, { sumberId: ikut.sumberId, moderatorId: pemeriksa });
    expect(await listBeasiswa(t.db, kampus.id)).toBeNull();

    await tandaiDiperiksa(t.db, { sumberId: nasional.sumberId, moderatorId: pemeriksa });
    expect((await listBeasiswa(t.db, kampus.id))?.daftar).toMatchObject([
      { nama, nasional: true, sumber: { penerbit: "Kemdiktisaintek" }, sumberIkut: { penerbit: "Universitas Uji" } },
    ]);
  });
});

describe("withdrawing (Tarik)", () => {
  const tanpaPilihan = { jalur: [], biaya: [], beasiswa: [], beasiswaKampus: [] };
  const pendaftaran = (jalurNama: string, jumlah = "300000") =>
    ukt("", jumlah, { jenis: "pendaftaran", prodi: "", jenjang: "", jalur: jalurNama, label: "" });

  async function diperiksa(kampusNpsn: string, berkas: Parameters<typeof bacaPaket>[2], k = kode()) {
    const { sumberId } = await imporSumber(t.db, paket(k, meta(kampusNpsn), berkas), pemasuk);
    await tandaiDiperiksa(t.db, { sumberId, moderatorId: pemeriksa });
    return { sumberId, kode: k };
  }

  test("one wrong fact is taken down, and the older Tahun Akademik shows again", async () => {
    const { kampus, prodi } = await buatKatalog(t.db);
    await diperiksa(kampus.npsn, { biaya: [ukt("Informatika", "6000000", { tahun_akademik: "2025/2026" })] });
    const baru = await diperiksa(kampus.npsn, { biaya: [ukt("Informatika", "70000000"), ukt("Manajemen", "7000000")] });
    const salah = (await getSumber(t.db, baru.sumberId))!.biaya.find((b) => b.jumlah === 70000000)!;

    await expect(tarikFakta(t.db, { sumberId: baru.sumberId, moderatorId: pemasuk, alasan: " ", pilihan: { ...tanpaPilihan, biaya: [salah.id] } })).rejects.toThrow(
      "alasan",
    );
    // The Moderator who entered it may withdraw it: one Moderator is enough.
    const hasil = await tarikFakta(t.db, {
      sumberId: baru.sumberId,
      moderatorId: pemasuk,
      alasan: "Salah ketik: seharusnya Rp 7.000.000",
      pilihan: { ...tanpaPilihan, biaya: [salah.id] },
    });
    expect(hasil).toMatchObject({ biaya: 1, jalur: 0 });
    expect(await listBiayaProdi(t.db, prodi[0].id)).toMatchObject({ tahunAkademik: 2025, daftar: [{ jumlah: 6000000 }] });
    expect((await listBiayaProdi(t.db, prodi[1].id))?.daftar).toHaveLength(1);

    const [row] = await t.db.select().from(biaya).where(eq(biaya.id, salah.id));
    expect(row).toMatchObject({ status: "ditarik", ditarikOleh: pemasuk, alasanDitarik: "Salah ketik: seharusnya Rp 7.000.000" });
    expect((await getSumber(t.db, baru.sumberId))!.biaya.find((b) => b.id === salah.id)).toMatchObject({ status: "ditarik" });
    await expect(imporSumber(t.db, paket(baru.kode, meta(kampus.npsn), { biaya: [ukt("Informatika", "1")] }), pemasuk)).rejects.toThrow(
      /Diperiksa or Ditarik/,
    );
  });

  test("a stale selection is refused as a whole", async () => {
    const { kampus } = await buatKatalog(t.db);
    const { sumberId } = await diperiksa(kampus.npsn, { biaya: [ukt("Informatika", "1"), ukt("Manajemen", "2")] });
    const [a, b] = (await getSumber(t.db, sumberId))!.biaya;
    await tarikFakta(t.db, { sumberId, moderatorId: pemeriksa, alasan: "x", pilihan: { ...tanpaPilihan, biaya: [a.id] } });
    await expect(tarikFakta(t.db, { sumberId, moderatorId: pemeriksa, alasan: "x", pilihan: { ...tanpaPilihan, biaya: [a.id, b.id] } })).rejects.toThrow(
      "Muat ulang",
    );
    expect((await getSumber(t.db, sumberId))!.biaya.find((x) => x.id === b.id)).toMatchObject({ status: "diperiksa" });
  });

  test("withdrawing a Jalur Masuk takes its fees down and lets a correction reuse the name", async () => {
    const { kampus } = await buatKatalog(t.db);
    const jalurSumber = await diperiksa(kampus.npsn, { jalur: [jalur("Seleksi Mandiri")] });
    await diperiksa(kampus.npsn, { biaya: [pendaftaran("Seleksi Mandiri")] });
    // A Draf fee of a third Sumber also points at it.
    const draf = await imporSumber(t.db, paket(kode(), meta(kampus.npsn), { biaya: [pendaftaran("Seleksi Mandiri", "400000")] }), pemasuk);

    const hasil = await tarikFakta(t.db, { sumberId: jalurSumber.sumberId, moderatorId: pemeriksa, alasan: "Jalur tidak dibuka tahun ini", pilihan: "semua" });
    expect(hasil).toMatchObject({ jalur: 1, biayaIkut: 1 });
    expect(await getFaktaKampus(t.db, kampus.id)).toBeNull();
    await expect(tandaiDiperiksa(t.db, { sumberId: draf.sumberId, moderatorId: pemeriksa })).rejects.toThrow("sudah ditarik");

    await expect(diperiksa(kampus.npsn, { jalur: [jalur("Seleksi Mandiri", { tes: "utbk" })] })).resolves.toBeTruthy();
    expect((await getFaktaKampus(t.db, kampus.id))?.jalur?.daftar).toMatchObject([{ nama: "Seleksi Mandiri", tes: ["utbk"] }]);
  });

  test("the database needs a reason for every withdrawn fact", async () => {
    const { kampus } = await buatKatalog(t.db);
    const { sumberId } = await diperiksa(kampus.npsn, { biaya: [ukt("Informatika", "1")] });
    await expect(t.db.update(biaya).set({ status: "ditarik", ditarikAt: new Date() }).where(eq(biaya.sumberId, sumberId))).rejects.toThrow();
  });

  test("checked Sumber can be found by Kampus name", async () => {
    const { kampus } = await buatKatalog(t.db);
    const { sumberId } = await diperiksa(kampus.npsn, { biaya: [ukt("Informatika", "1")] });
    expect((await listSumberDiperiksa(t.db, kampus.nama.slice(0, 12))).map((s) => s.id)).toContain(sumberId);
    expect(await listSumberDiperiksa(t.db, "tidak-ada-yang-cocok-%")).toEqual([]);
    // LIKE wildcards in the search are literal: no Sumber has "_" anywhere.
    expect(await listSumberDiperiksa(t.db, "_")).toEqual([]);
  });
});
