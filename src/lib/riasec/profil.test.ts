import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { jurusan, kodeProdiJurusan, kodeRiasec, laporan, prodi, profilMinat, sessions, users } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna, dataUlasan } from "../../../test/fixtures";
import { nyatakanBelumDewasa, nyatakanDewasa } from "../akun/usia";
import { tulisUlasan } from "../ulasan/layanan";
import type { Tipe } from "./item";
import { hapusProfilMinat, listProfilMinat, listRekomendasiJurusan, simpanProfilMinat } from "./profil";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
  // Three Jurusan, each with Prodi, and one without a Kode RIASEC.
  const { prodi } = await buatKatalog(t.db);
  const buat = async (nama: string, kodeProdi: string, kode: Tipe[]) => {
    const [j] = await t.db.insert(jurusan).values({ nama, slug: nama.toLowerCase().replace(/ /g, "-") }).returning();
    await t.db.insert(kodeProdiJurusan).values({ kodeProdi, jurusanId: j.id });
    if (kode.length) await t.db.insert(kodeRiasec).values(kode.map((tipe, i) => ({ jurusanId: j.id, urutan: i + 1, tipe })));
    return j;
  };
  await buat("Teknik Informatika", prodi[0].kodeProdi, ["I", "C", "R"]);
  await buat("Manajemen", prodi[1].kodeProdi, ["E", "C", "I"]);
  await buat("Tanpa Kode", "99999", []);
});
afterAll(() => t.close());

describe("Rekomendasi Jurusan", () => {
  test("ranks Jurusan by how well their Kode RIASEC match", async () => {
    const investigatif = await listRekomendasiJurusan(t.db, { R: 3, I: 9, A: 1, S: 2, E: 1, C: 6 });
    expect(investigatif.map((j) => j.nama)).toEqual(["Teknik Informatika", "Manajemen"]);
    expect(investigatif[0]).toMatchObject({ slug: "teknik-informatika", kode: ["I", "C", "R"], jumlahProdi: 1 });

    const enterprising = await listRekomendasiJurusan(t.db, { R: 0, I: 2, A: 1, S: 4, E: 9, C: 5 });
    expect(enterprising[0].nama).toBe("Manajemen");
  });

  test("equal matches: the Jurusan more Prodi offer comes first", async () => {
    // A second catalogue gives Teknik Informatika (55201) two Prodi; "Aaa
    // Komputasi" has the same Kode RIASEC and one Prodi, and would win on name.
    const { kampus } = await buatKatalog(t.db);
    const [j] = await t.db.insert(jurusan).values({ nama: "Aaa Komputasi", slug: "aaa-komputasi" }).returning();
    await t.db.insert(kodeProdiJurusan).values({ kodeProdi: "55299", jurusanId: j.id });
    await t.db.insert(kodeRiasec).values((["I", "C", "R"] as const).map((tipe, i) => ({ jurusanId: j.id, urutan: i + 1, tipe })));
    await t.db.insert(prodi).values({ kampusId: kampus.id, kodeProdi: "55299", nama: "Komputasi", jenjang: "S1", slug: `komputasi-${kampus.id}` });
    const hasil = await listRekomendasiJurusan(t.db, { R: 3, I: 9, A: 1, S: 2, E: 1, C: 6 });
    expect(hasil.slice(0, 2).map((x) => [x.nama, x.jumlahProdi])).toEqual([
      ["Teknik Informatika", 2],
      ["Aaa Komputasi", 1],
    ]);
  });

  test("a Prodi moved by an override counts in its new Jurusan", async () => {
    const [komputasi] = await t.db.select().from(jurusan).where(eq(jurusan.slug, "aaa-komputasi"));
    const [ti] = await t.db.select().from(prodi).where(eq(prodi.kodeProdi, "55201")).limit(1);
    await t.db.update(prodi).set({ jurusanOverrideId: komputasi.id }).where(eq(prodi.id, ti.id));
    const hasil = await listRekomendasiJurusan(t.db, { R: 3, I: 9, A: 1, S: 2, E: 1, C: 6 });
    expect(hasil.slice(0, 2).map((x) => [x.nama, x.jumlahProdi])).toEqual([
      ["Aaa Komputasi", 2],
      ["Teknik Informatika", 1],
    ]);
    await t.db.update(prodi).set({ jurusanOverrideId: null }).where(eq(prodi.id, ti.id));
  });

  test("leaves out Jurusan without a Kode RIASEC and respects the limit", async () => {
    const semua = await listRekomendasiJurusan(t.db, { R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 }, 1);
    expect(semua).toHaveLength(1);
    expect(semua[0].nama).not.toBe("Tanpa Kode");
  });
});

describe("Profil Minat", () => {
  test("saves scores only, newest first, and only the owner can delete", async () => {
    const pemilik = await buatPengguna(t.db);
    const lain = await buatPengguna(t.db);
    const lama = await simpanProfilMinat(t.db, pemilik.id, { R: 1, I: 2, A: 3, S: 4, E: 5, C: 6 });
    await new Promise((r) => setTimeout(r, 5));
    const baru = await simpanProfilMinat(t.db, pemilik.id, { R: 6, I: 5, A: 4, S: 3, E: 2, C: 1 });

    const daftar = await listProfilMinat(t.db, pemilik.id);
    expect(daftar.map((p) => p.id)).toEqual([baru, lama]);
    expect(daftar[0].profil).toEqual({ R: 6, I: 5, A: 4, S: 3, E: 2, C: 1 });

    expect(await hapusProfilMinat(t.db, lain.id, baru)).toBe(false);
    expect(await hapusProfilMinat(t.db, pemilik.id, baru)).toBe(true);
    expect((await listProfilMinat(t.db, pemilik.id)).map((p) => p.id)).toEqual([lama]);
  });

  test("the database refuses scores outside 0–10", async () => {
    const u = await buatPengguna(t.db);
    await expect(simpanProfilMinat(t.db, u.id, { R: 11, I: 0, A: 0, S: 0, E: 0, C: 0 })).rejects.toThrow();
  });
});

describe("age declaration (ADR 0008)", () => {
  const ambil = async (id: string) => (await t.db.select().from(users).where(eq(users.id, id)))[0];

  test("declaring 18+ records when", async () => {
    const u = await buatPengguna(t.db);
    await nyatakanDewasa(t.db, u.id);
    expect((await ambil(u.id)).usia18At).toBeInstanceOf(Date);
  });

  test("under 18 without Ulasan: the account and its data are deleted", async () => {
    const u = await buatPengguna(t.db);
    await simpanProfilMinat(t.db, u.id, { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 });
    await t.db.insert(sessions).values({ sessionToken: `s-${u.id}`, userId: u.id, expires: new Date(Date.now() + 60_000) });
    expect(await nyatakanBelumDewasa(t.db, u.id)).toBe("dihapus");
    expect(await ambil(u.id)).toBeUndefined();
    expect(await t.db.select().from(profilMinat).where(eq(profilMinat.userId, u.id))).toEqual([]);
    expect(await t.db.select().from(sessions).where(eq(sessions.userId, u.id))).toEqual([]);
  });

  test("under 18 with an Ulasan: the account is locked and the Ulasan stays", async () => {
    const { prodi } = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    await tulisUlasan(t.db, { pengulasId: u.id, prodiId: prodi[0].id, data: dataUlasan() });
    expect(await nyatakanBelumDewasa(t.db, u.id)).toBe("dikunci");
    expect((await ambil(u.id)).dikunciAt).toBeInstanceOf(Date);
    // A locked account can't declare 18+ afterwards.
    await nyatakanDewasa(t.db, u.id);
    expect((await ambil(u.id)).usia18At).toBeNull();
  });

  test("a deleted reporter's Laporan stays, without the reporter", async () => {
    const { prodi } = await buatKatalog(t.db);
    const penulis = await buatPengguna(t.db);
    const { ulasanId, revisiId } = await tulisUlasan(t.db, { pengulasId: penulis.id, prodiId: prodi[0].id, data: dataUlasan() });
    const pelapor = await buatPengguna(t.db);
    const [l] = await t.db.insert(laporan).values({ ulasanId, revisiId, alasan: "hinaan", pelaporId: pelapor.id }).returning();
    expect(await nyatakanBelumDewasa(t.db, pelapor.id)).toBe("dihapus");
    expect((await t.db.select().from(laporan).where(eq(laporan.id, l.id)))[0].pelaporId).toBeNull();
  });
});
