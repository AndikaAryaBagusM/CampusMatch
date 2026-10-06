import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { kampus, tokenVerifikasiKampus, verifikasiKampus } from "@/db/schema";
import { createTestDb, type TestDb } from "../../../test/db";
import { buatKatalog, buatPengguna } from "../../../test/fixtures";
import { bacaDomain, cocokDomain, domainEmail } from "./domain-kampus";
import {
  cariKampusDomain,
  getTokenVerifikasi,
  hapusVerifikasi,
  konfirmasiVerifikasi,
  listVerifikasiSaya,
  mintaVerifikasi,
  VerifikasiDitolak,
} from "./verifikasi-kampus";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const SEKARANG = new Date("2026-10-06T03:00:00Z");
let n = 0;
let ip = 0;

async function kampusDengan(domain: string) {
  const kat = await buatKatalog(t.db);
  await t.db.update(kampus).set({ domainEmail: domain }).where(eq(kampus.id, kat.kampus.id));
  return kat.kampus;
}

// A sender that remembers the last link instead of emailing it.
function kotakSurat() {
  const terkirim: { ke: string; tautan: string }[] = [];
  return { terkirim, kirim: async (ke: string, tautan: string) => void terkirim.push({ ke, tautan }) };
}
const tokenDari = (tautan: string) => new URL(tautan).searchParams.get("token")!;
const minta = (userId: string, email: string, kirim: ReturnType<typeof kotakSurat>["kirim"], sekarang = SEKARANG) =>
  mintaVerifikasi(t.db, { userId, email, ipHash: `ip-${++ip}`, asal: "https://campusmatch.test" }, kirim, sekarang);

describe("domains", () => {
  test("domainEmail and cocokDomain", () => {
    expect(domainEmail(" Nama@Mail.UGM.ac.id ")).toBe("mail.ugm.ac.id");
    expect(domainEmail("a@upi.edu")).toBe("upi.edu");
    expect(domainEmail("a@gmail.com")).toBeNull();
    expect(domainEmail("bukan email")).toBeNull();
    expect(cocokDomain("mail.ugm.ac.id", "ugm.ac.id")).toBe(true);
    expect(cocokDomain("ugm.ac.id", "ugm.ac.id")).toBe(true);
    expect(cocokDomain("notugm.ac.id", "ugm.ac.id")).toBe(false);
  });

  test("bacaDomain uses the checked column, the proposal only when asked, and refuses bad or repeated domains", () => {
    const rows = [
      { npsn: "1", domain_usulan: "a.ac.id", domain: "" },
      { npsn: "2", domain_usulan: "x.ac.id", domain: "B.ac.id" },
      { npsn: "3", domain_usulan: "", domain: "" },
    ];
    expect(bacaDomain(rows, false)).toEqual({ baris: [{ npsn: "2", domain: "b.ac.id" }], galat: [] });
    expect(bacaDomain(rows, true).baris).toEqual([
      { npsn: "1", domain: "a.ac.id" },
      { npsn: "2", domain: "b.ac.id" },
    ]);
    expect(bacaDomain([{ npsn: "1", domain: "kampus.com" }], false).galat).toHaveLength(1);
    expect(bacaDomain([{ npsn: "1", domain: "a.ac.id" }, { npsn: "2", domain: "a.ac.id" }], false).galat).toHaveLength(1);
  });

  test("the most specific Kampus domain wins", async () => {
    const induk = `induk${++n}.ac.id`;
    const a = await kampusDengan(induk);
    const b = await kampusDengan(`cabang.${induk}`);
    expect((await cariKampusDomain(t.db, `mail.cabang.${induk}`))?.id).toBe(b.id);
    expect((await cariKampusDomain(t.db, `mail.${induk}`))?.id).toBe(a.id);
    expect(await cariKampusDomain(t.db, "lain.ac.id")).toBeNull();
  });
});

describe("verification", () => {
  test("a link proves the mailbox; only the domain and the date are kept", async () => {
    const k = await kampusDengan(`uji${++n}.ac.id`);
    const u = await buatPengguna(t.db);
    const surat = kotakSurat();
    await minta(u.id, `budi@mail.uji${n}.ac.id`, surat.kirim);
    expect(surat.terkirim[0].ke).toBe(`budi@mail.uji${n}.ac.id`);
    const token = tokenDari(surat.terkirim[0].tautan);
    expect(await getTokenVerifikasi(t.db, token, SEKARANG)).toEqual({ kampusNama: k.nama, berlaku: true });

    expect(await konfirmasiVerifikasi(t.db, token, SEKARANG)).toMatchObject({ slug: k.slug });
    const [v] = await t.db.select().from(verifikasiKampus).where(eq(verifikasiKampus.userId, u.id));
    expect(v).toEqual({ userId: u.id, kampusId: k.id, domain: `uji${n}.ac.id`, verifiedAt: SEKARANG, createdAt: expect.any(Date) });
    expect(JSON.stringify(v)).not.toContain("budi");
    expect(await t.db.select().from(tokenVerifikasiKampus).where(eq(tokenVerifikasiKampus.userId, u.id))).toEqual([]);

    // Used up, and a second request for the same Kampus is refused.
    await expect(konfirmasiVerifikasi(t.db, token, SEKARANG)).rejects.toBeInstanceOf(VerifikasiDitolak);
    await expect(minta(u.id, `budi@uji${n}.ac.id`, surat.kirim)).rejects.toThrow(/sudah Terverifikasi/);
    expect(await listVerifikasiSaya(t.db, u.id)).toMatchObject([{ kampusId: k.id, domain: `uji${n}.ac.id` }]);
  });

  test("expired links, unknown domains and other email providers are refused", async () => {
    await kampusDengan(`lama${++n}.ac.id`);
    const u = await buatPengguna(t.db);
    const surat = kotakSurat();
    await expect(minta(u.id, "budi@gmail.com", surat.kirim)).rejects.toThrow(/alamat email kampus/);
    await expect(minta(u.id, "budi@belumada.ac.id", surat.kirim)).rejects.toThrow(/belum terdaftar/);
    await minta(u.id, `budi@lama${n}.ac.id`, surat.kirim);
    const token = tokenDari(surat.terkirim[0].tautan);
    const besok = new Date(SEKARANG.getTime() + 25 * 3_600_000);
    expect(await getTokenVerifikasi(t.db, token, besok)).toMatchObject({ berlaku: false });
    await expect(konfirmasiVerifikasi(t.db, token, besok)).rejects.toBeInstanceOf(VerifikasiDitolak);
    expect(await getTokenVerifikasi(t.db, "salah", SEKARANG)).toBeNull();
  });

  test("a new request replaces the old link; requests are rate-limited", async () => {
    await kampusDengan(`batas${++n}.ac.id`);
    const u = await buatPengguna(t.db);
    const surat = kotakSurat();
    await minta(u.id, `a@batas${n}.ac.id`, surat.kirim);
    await minta(u.id, `a@batas${n}.ac.id`, surat.kirim);
    await expect(konfirmasiVerifikasi(t.db, tokenDari(surat.terkirim[0].tautan), SEKARANG)).rejects.toBeInstanceOf(VerifikasiDitolak);
    for (let i = 0; i < 3; i++) await minta(u.id, `a@batas${n}.ac.id`, surat.kirim);
    await expect(minta(u.id, `a@batas${n}.ac.id`, surat.kirim)).rejects.toThrow(/Terlalu banyak/);
  });

  test("a Pengulas can remove only their own verification", async () => {
    const k = await kampusDengan(`hapus${++n}.ac.id`);
    const [u, lain] = [await buatPengguna(t.db), await buatPengguna(t.db)];
    await t.db.insert(verifikasiKampus).values({ userId: u.id, kampusId: k.id, domain: `hapus${n}.ac.id`, verifiedAt: SEKARANG });
    expect(await hapusVerifikasi(t.db, lain.id, k.id)).toBeNull();
    expect(await hapusVerifikasi(t.db, u.id, k.id)).toEqual({ kampusId: k.id });
    expect(await listVerifikasiSaya(t.db, u.id)).toEqual([]);
  });
});
