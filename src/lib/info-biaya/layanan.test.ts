import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { infoBiaya, users } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna } from "../../../test/fixtures";
import {
  getInfoBiayaSaya,
  hapusInfoBiaya,
  hapusInfoBiayaLama,
  InfoBiayaDitolak,
  kesampingkanInfoBiaya,
  listInfoBiayaProdiModerasi,
  listInfoBiayaSaya,
  pulihkanInfoBiaya,
  simpanInfoBiaya,
} from "./layanan";
import { adaJawaban, skemaInfoBiaya, type DataInfoBiaya } from "./skema";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const SEKARANG = new Date("2026-10-06T03:00:00Z");
let ip = 0;

const data = (ubah: Partial<DataInfoBiaya> = {}): DataInfoBiaya => ({
  statusPengulas: "alumni",
  tahunMasuk: 2023,
  jalur: "snbt",
  tes: ["utbk"],
  biayaSemester: 5_000_000,
  kelompokUkt: 4,
  uangPangkal: 0,
  biayaLainMasuk: null,
  beasiswa: null,
  ...ubah,
});
const simpan = (userId: string, prodiId: number, d = data(), sekarang = SEKARANG) =>
  simpanInfoBiaya(t.db, { userId, prodiId, ipHash: `ip-${++ip}`, data: d }, sekarang);

describe("skemaInfoBiaya", () => {
  const sah = { statusPengulas: "alumni", tahunMasuk: "2023", setuju: "1" };
  const parse = (isian: Record<string, unknown>) => skemaInfoBiaya(2026).safeParse({ ...sah, ...isian });

  test("reads rupiah, the tes list and 'tidak ada'", () => {
    const r = parse({ biayaSemester: "Rp 7.500.000", tes: ["utbk", "utbk", "rapor"], tanpaUangPangkal: "1", uangPangkal: "9", jalur: "", beasiswa: "kip_kuliah" });
    expect(r.data).toEqual({
      statusPengulas: "alumni",
      tahunMasuk: 2023,
      jalur: null,
      tes: ["utbk", "rapor"],
      biayaSemester: 7_500_000,
      kelompokUkt: null,
      uangPangkal: 0,
      biayaLainMasuk: null,
      beasiswa: "kip_kuliah",
    });
  });

  test.each([
    [{ biayaSemester: "60.000.000" }, "biayaSemester"],
    [{ biayaSemester: "5,5 juta" }, "biayaSemester"],
    [{ uangPangkal: "2.000.000.000" }, "uangPangkal"],
    [{ kelompokUkt: "21", jalur: "snbp" }, "kelompokUkt"],
    [{ jalur: "jalur-belakang" }, "jalur"],
    [{ kelompokUkt: "3" }, "jalur"],
    [{ jalur: "snbp", setuju: undefined }, "setuju"],
    [{ jalur: "snbp", tahunMasuk: "2027" }, "tahunMasuk"],
  ])("refuses %o", (isian, kolom) => {
    const r = parse(isian);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toContain(kolom);
  });

  test("adaJawaban ignores the shared fields", () => {
    expect(adaJawaban({ statusPengulas: "alumni", tahunMasuk: "2020", tes: [] })).toBe(false);
    expect(adaJawaban({ tes: ["utbk"] })).toBe(true);
    expect(adaJawaban({ biayaSemester: " 5000000 " })).toBe(true);
  });
});

describe("simpanInfoBiaya", () => {
  test("one per Pengulas per Prodi: a second save replaces the first and renews consent", async () => {
    const kat = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    await simpan(u.id, kat.prodi[0].id);
    const nanti = new Date(SEKARANG.getTime() + 3_600_000);
    await simpan(u.id, kat.prodi[0].id, data({ biayaSemester: 6_000_000, tes: null }), nanti);
    const rows = await t.db.select().from(infoBiaya).where(eq(infoBiaya.userId, u.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ biayaSemester: 6_000_000, tes: null, disetujuiAt: nanti, kelompokUkt: 4 });
    expect(await getInfoBiayaSaya(t.db, u.id, kat.prodi[0].id)).toMatchObject({ id: rows[0].id });
    expect(await listInfoBiayaSaya(t.db, u.id)).toMatchObject([{ prodiSlug: kat.prodi[0].slug, prodiNama: "S1 Informatika" }]);
  });

  test("the database refuses an empty entry and impossible amounts", async () => {
    const kat = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    const kosong = { jalur: null, tes: null, biayaSemester: null, uangPangkal: null, beasiswa: null };
    await expect(simpan(u.id, kat.prodi[0].id, data(kosong))).rejects.toThrow();
    await expect(simpan(u.id, kat.prodi[0].id, data({ biayaSemester: 60_000_000 }))).rejects.toThrow();
  });

  test("is rate-limited per Pengulas", async () => {
    const kat = await buatKatalog(t.db);
    const u = await buatPengguna(t.db);
    for (let i = 0; i < 10; i++) await simpan(u.id, kat.prodi[0].id);
    await expect(simpan(u.id, kat.prodi[0].id)).rejects.toBeInstanceOf(InfoBiayaDitolak);
  });
});

describe("deleting", () => {
  test("only the owner deletes; the cron deletes entries out of the window; the account takes them along", async () => {
    const kat = await buatKatalog(t.db);
    const [u, lain] = [await buatPengguna(t.db), await buatPengguna(t.db)];
    await simpan(u.id, kat.prodi[0].id);
    await simpan(u.id, kat.prodi[1].id, data({ tahunMasuk: 2021 }));
    const [satu] = await listInfoBiayaSaya(t.db, u.id).then((r) => r.filter((x) => x.tahunMasuk === 2023));
    expect(await hapusInfoBiaya(t.db, lain.id, satu.id)).toBeNull();
    expect(await hapusInfoBiaya(t.db, u.id, satu.id)).toEqual({ prodiSlug: kat.prodi[0].slug });

    expect(await hapusInfoBiayaLama(t.db, SEKARANG)).toBeGreaterThanOrEqual(1);
    expect(await listInfoBiayaSaya(t.db, u.id)).toEqual([]);

    await simpan(lain.id, kat.prodi[0].id);
    await t.db.delete(users).where(eq(users.id, lain.id));
    expect(await t.db.select().from(infoBiaya).where(eq(infoBiaya.userId, lain.id))).toEqual([]);
  });
});

describe("Moderators", () => {
  test("Kesampingkan one entry or a whole account, needs a reason, survives an edit, and can be undone", async () => {
    const kat = await buatKatalog(t.db);
    const [m, a, b] = [await buatPengguna(t.db), await buatPengguna(t.db), await buatPengguna(t.db)];
    await simpan(a.id, kat.prodi[0].id);
    await simpan(a.id, kat.prodi[1].id);
    await simpan(b.id, kat.prodi[0].id, data({ biayaSemester: 45_000_000 }));
    for (let i = 0; i < 5; i++) await simpan((await buatPengguna(t.db)).id, kat.prodi[0].id);

    const awal = await listInfoBiayaProdiModerasi(t.db, kat.prodi[0].slug, SEKARANG);
    const entriB = awal!.entri.find((e) => e.userId === b.id)!;
    expect(entriB).toMatchObject({ email: b.email, pencilan: true, terverifikasi: false, kelompokUkt: 4 });
    expect(awal!.entri.filter((e) => e.pencilan)).toHaveLength(1);

    await expect(kesampingkanInfoBiaya(t.db, { id: entriB.id }, m.id, " ")).rejects.toBeInstanceOf(InfoBiayaDitolak);
    expect(await kesampingkanInfoBiaya(t.db, { id: entriB.id }, m.id, "Tidak masuk akal", SEKARANG)).toEqual([kat.prodi[0].slug]);
    expect((await kesampingkanInfoBiaya(t.db, { userId: a.id }, m.id, "Akun palsu", SEKARANG)).sort()).toEqual(
      [kat.prodi[0].slug, kat.prodi[1].slug].sort(),
    );

    await simpan(b.id, kat.prodi[0].id);
    const setelah = await listInfoBiayaProdiModerasi(t.db, kat.prodi[0].slug, SEKARANG);
    expect(setelah!.entri.find((e) => e.userId === b.id)).toMatchObject({ alasanDikesampingkan: "Tidak masuk akal", dikesampingkanEmail: m.email });

    await pulihkanInfoBiaya(t.db, entriB.id);
    expect((await getInfoBiayaSaya(t.db, b.id, kat.prodi[0].id))!.dikesampingkanAt).toBeNull();
    expect(await listInfoBiayaProdiModerasi(t.db, "tidak-ada", SEKARANG)).toBeNull();
  });
});
