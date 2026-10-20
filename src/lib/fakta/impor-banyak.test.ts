import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { inArray } from "drizzle-orm";
import { sumber } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna } from "../../../test/fixtures";
import { bacaPaket, type Baris } from "./baca";
import { ImporBerhenti, imporBanyak, type LangkahImpor } from "./impor-banyak";

let t: TestDb;
let pemasuk: string;
beforeAll(async () => {
  t = await createTestDb();
  pemasuk = (await buatPengguna(t.db, "pemasuk@campusmatch.id")).id;
});
afterAll(() => t.close());

const meta = (npsn: string) => ({
  npsn,
  url: "https://kampus.ac.id/biaya",
  judul: "SK Rektor tentang UKT",
  penerbit: "Universitas Uji",
  diakses_pada: "2026-10-20",
  arsip_url: "https://web.archive.org/web/2026/https://kampus.ac.id/biaya",
});
const jalur = (nama: string): Baris => ({
  tahun_akademik: "2026/2027",
  nama,
  kategori: "mandiri",
  tes: "tes_kampus",
  pendaftaran_buka: "",
  pendaftaran_tutup: "",
});
const ukt = (jalurNama: string, jumlah = "7.500.000"): Baris => ({
  tahun_akademik: "2026/2027",
  jenis: "ukt",
  prodi: "Informatika",
  jenjang: "S1",
  prodi_slug: "",
  jalur: jalurNama,
  label: "",
  jumlah,
  batas: "",
  periode: "",
});
function paket(kode: string, npsn: string, berkas: Parameters<typeof bacaPaket>[2]) {
  const { paket: p, galat } = bacaPaket(kode, meta(npsn), berkas);
  if (!p) throw new Error(galat.join("\n"));
  return p;
}
const adaDiDb = async (kode: string[]) =>
  (await t.db.select({ kode: sumber.kode }).from(sumber).where(inArray(sumber.kode, kode))).map((s) => s.kode).sort();

describe("imporBanyak", () => {
  test("imports a folder after the one defining its Jalur Masuk, whatever order they are given in", async () => {
    const { kampus } = await buatKatalog(t.db);
    const biaya = paket("a-biaya", kampus.npsn, { biaya: [ukt("Ujian Tulis")] });
    const sima = paket("b-sima", kampus.npsn, { jalur: [jalur("Ujian Tulis")] });
    const langkah: LangkahImpor[] = [];

    expect(await imporBanyak(t.db, [biaya, sima], pemasuk, (l) => langkah.push(l))).toBe(2);
    expect(langkah.map((l) => l.paket.kode)).toEqual(["b-sima", "a-biaya"]);
    expect(await adaDiDb(["a-biaya", "b-sima"])).toEqual(["a-biaya", "b-sima"]);
  });

  test("skips Sumber already in the database, so a second run imports nothing", async () => {
    const { kampus } = await buatKatalog(t.db);
    const satu = paket("c-satu", kampus.npsn, { jalur: [jalur("Mandiri")] });
    const dua = paket("c-dua", kampus.npsn, { biaya: [ukt("Mandiri")] });
    await imporBanyak(t.db, [satu, dua], pemasuk);

    const langkah: LangkahImpor[] = [];
    expect(await imporBanyak(t.db, [satu, dua], pemasuk, (l) => langkah.push(l))).toBe(0);
    expect(langkah.every((l) => l.dilewati)).toBe(true);
  });

  test("stops at the first folder the import refuses and keeps the ones before it", async () => {
    const { kampus } = await buatKatalog(t.db);
    const baik = paket("d-1-baik", kampus.npsn, { jalur: [jalur("Gelombang 1")] });
    const salah = paket("d-2-salah", kampus.npsn, { biaya: [ukt("Tidak Ada")] });
    const sesudah = paket("d-3-sesudah", kampus.npsn, { jalur: [jalur("Gelombang 2")] });

    const galat = await imporBanyak(t.db, [baik, salah, sesudah], pemasuk).catch((e) => e);
    expect(galat).toBeInstanceOf(ImporBerhenti);
    expect(galat).toMatchObject({ kode: "d-2-salah", diimpor: 1 });
    expect(galat.galat.join()).toMatch(/no Jalur Masuk "Tidak Ada"/);
    expect(await adaDiDb(["d-1-baik", "d-2-salah", "d-3-sesudah"])).toEqual(["d-1-baik"]);
  });
});
