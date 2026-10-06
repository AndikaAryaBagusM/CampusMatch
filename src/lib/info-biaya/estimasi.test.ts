import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { infoBiaya, verifikasiKampus } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna } from "../../../test/fixtures";
import { awalJendela, batasPencilan, estimasiProdi, hitungPilihan, K, ringkasAngka } from "./estimasi";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

// 2026-10-06: the running Tahun Akademik is 2026, so the window starts at 2022.
const SEKARANG = new Date("2026-10-06T03:00:00Z");

describe("pure", () => {
  test("the window covers the last five angkatan", () => {
    expect(awalJendela(SEKARANG)).toBe(2022);
    expect(awalJendela(new Date("2027-03-01T00:00:00Z"))).toBe(2022);
    expect(awalJendela(new Date("2027-08-01T00:00:00Z"))).toBe(2023);
  });

  test("ringkasAngka shows nothing below K and the median with the middle range from K", () => {
    expect(K).toBe(5);
    expect(ringkasAngka([1, 2, 3, 4])).toEqual({ n: 4 });
    expect(ringkasAngka([5_000_000, 4_000_000, 6_000_000, 5_000_000, 7_000_000])).toEqual({
      n: 5,
      median: 5_000_000,
      p25: 5_000_000,
      p75: 6_000_000,
    });
  });

  test("an implausible value is left out; equal amounts don't push others out", () => {
    const biasa = [4_000_000, 4_500_000, 5_000_000, 5_000_000, 5_500_000, 6_000_000];
    expect(ringkasAngka([...biasa, 45_000_000])).toMatchObject({ n: 6, median: 5_000_000 });
    expect(ringkasAngka([...biasa, 100_000])).toMatchObject({ n: 6 });
    expect(batasPencilan([1, 2, 3])).toBeNull();
    // Most paid the same; a neighbouring Kelompok still counts.
    expect(ringkasAngka([5_000_000, 5_000_000, 5_000_000, 5_000_000, 6_500_000])).toMatchObject({ n: 5 });
  });

  test("hitungPilihan counts each option once per Pengulas, in order, only from K", () => {
    expect(hitungPilihan([["a"], ["b"]], ["a", "b"])).toEqual({ n: 2 });
    expect(hitungPilihan([["b", "b"], ["a"], ["b"], ["a", "b"], ["b"]], ["a", "b", "c"])).toEqual({
      n: 5,
      jumlah: [
        { nilai: "a", jumlah: 2 },
        { nilai: "b", jumlah: 4 },
      ],
    });
  });
});

describe("estimasiProdi", () => {
  test("counts entries in the window, not set aside, with the Terverifikasi count, and no ids", async () => {
    const kat = await buatKatalog(t.db);
    const [p, lain] = kat.prodi;
    const isi = async (tahunMasuk: number, ubah: Partial<typeof infoBiaya.$inferInsert> = {}) => {
      const u = await buatPengguna(t.db);
      await t.db.insert(infoBiaya).values({
        userId: u.id,
        prodiId: p.id,
        statusPengulas: "mahasiswa_aktif",
        tahunMasuk,
        kategoriJalur: "snbt",
        tes: ["utbk"],
        biayaSemester: 5_000_000,
        uangPangkal: 0,
        beasiswa: "tidak_ada",
        disetujuiAt: SEKARANG,
        ...ubah,
      });
      return u;
    };
    const ver = await isi(2023);
    await t.db.insert(verifikasiKampus).values({ userId: ver.id, kampusId: kat.kampus.id, domain: "uji.ac.id", verifiedAt: SEKARANG });
    await isi(2024, { kategoriJalur: "mandiri", tes: ["tes_kampus"], uangPangkal: 25_000_000, biayaSemester: 7_000_000 });
    await isi(2025);
    await isi(2026, { beasiswa: "kip_kuliah", biayaSemester: 4_500_000 });
    // Out of the window, and set aside: neither counts.
    await isi(2019);
    await isi(2025, { dikesampingkanAt: SEKARANG, alasanDikesampingkan: "Uji" });

    let e = (await estimasiProdi(t.db, [p.id, lain.id], SEKARANG)).get(p.id)!;
    expect(e).toMatchObject({ n: 4, nTerverifikasi: 1, angkatan: null, biayaSemester: { n: 4 }, jalur: { n: 4 } });
    expect(e.biayaSemester.median).toBeUndefined();

    await isi(2022, { beasiswa: "kampus" });
    e = (await estimasiProdi(t.db, [p.id], SEKARANG)).get(p.id)!;
    expect(e).toMatchObject({
      n: 5,
      nTerverifikasi: 1,
      angkatan: { dari: 2022, sampai: 2026 },
      biayaSemester: { n: 5, median: 5_000_000 },
      uangPangkal: { n: 5, nTidakAda: 4, bayar: { n: 1 } },
      biayaLainMasuk: { n: 0 },
      jalur: { n: 5, jumlah: [{ nilai: "snbt", jumlah: 4 }, { nilai: "mandiri", jumlah: 1 }] },
      beasiswa: { n: 5, jumlah: [{ nilai: "tidak_ada", jumlah: 3 }, { nilai: "kip_kuliah", jumlah: 1 }, { nilai: "kampus", jumlah: 1 }] },
    });
    const teks = JSON.stringify(e);
    expect(teks).not.toContain(ver.id);
    expect(teks).not.toContain("25000000");

    expect((await estimasiProdi(t.db, [lain.id], SEKARANG)).get(lain.id)).toMatchObject({ n: 0, nTerverifikasi: 0 });
    expect((await estimasiProdi(t.db, [], SEKARANG)).size).toBe(0);
  });
});
