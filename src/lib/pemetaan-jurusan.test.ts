import { afterAll, beforeAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { jurusan, kodeProdiJurusan, prodi, riwayatJurusan } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { buatKatalog, buatPengguna } from "../../test/fixtures";
import { getKodePemetaan, listIsiJurusan, PemetaanDitolak, setOverrideProdi, ubahJurusanKode } from "./pemetaan-jurusan";
import { listProdiJurusan, TANPA_FILTER } from "./prodi-jurusan";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

let n = 0;
async function buatJurusan(nama: string) {
  const [j] = await t.db.insert(jurusan).values({ nama: `${nama} ${++n}`, slug: `j-${n}` }).returning();
  return j;
}

// A Kode with three Prodi at two Kampus, two of one name, mapped to Jurusan A.
async function siapkan() {
  const kode = `7${String(++n).padStart(4, "0")}`;
  const [a, b] = [await buatJurusan("PG-PAUD"), await buatJurusan("PIAUD")];
  await t.db.insert(kodeProdiJurusan).values({ kodeProdi: kode, jurusanId: a.id });
  const [k1, k2] = [await buatKatalog(t.db), await buatKatalog(t.db)];
  const p = await t.db
    .insert(prodi)
    .values(
      ["Pendidikan Islam Anak Usia Dini", "Pendidikan Islam Anak Usia Dini", "PG PAUD"].map((nama, i) => ({
        kampusId: (i === 1 ? k2 : k1).kampus.id,
        kodeProdi: kode,
        nama,
        jenjang: "S1" as const,
        slug: `p-${kode}-${i}`,
      })),
    )
    .returning();
  const mod = await buatPengguna(t.db);
  return { kode, a, b, p, mod };
}

const daftarDi = async (slug: string) =>
  (await listProdiJurusan(t.db, slug, { ...TANPA_FILTER, urut: "nama", limit: 50, offset: 0 })).map((r) => r.slug).sort();

test("moving Prodi with an override, then back; each change logged", async () => {
  const { kode, a, b, p, mod } = await siapkan();
  const piaud = [p[0].id, p[1].id];

  const slugs = await setOverrideProdi(t.db, { prodiIds: [...piaud, piaud[0]], jurusanId: b.id, alasan: "Nama PIAUD", moderatorId: mod.id });
  expect(slugs.sort()).toEqual([p[0].slug, p[1].slug].sort());
  expect(await daftarDi(b.slug)).toEqual([p[0].slug, p[1].slug].sort());
  expect(await daftarDi(a.slug)).toEqual([p[2].slug]);

  const peta = await getKodePemetaan(t.db, kode);
  expect(peta!.grup.map((g) => [g.nama, g.prodi.length, g.prodi.every((x) => x.override)])).toEqual([
    ["Pendidikan Islam Anak Usia Dini", 2, true],
    ["PG PAUD", 1, false],
  ]);
  expect(peta!.riwayat).toHaveLength(2);
  expect(peta!.riwayat[0]).toMatchObject({ jenis: "prodi", lama: a.nama, baru: b.nama, alasan: "Nama PIAUD", olehEmail: mod.email });
  expect((await listIsiJurusan(t.db, b.slug))!.override).toEqual([{ kode, jumlah: 2 }]);

  // Back to the Kode's Jurusan: by null, or by naming it (stored as no override).
  await setOverrideProdi(t.db, { prodiIds: [piaud[0]], jurusanId: null, alasan: "Salah pilih", moderatorId: mod.id });
  await setOverrideProdi(t.db, { prodiIds: [piaud[1]], jurusanId: a.id, alasan: "Salah pilih", moderatorId: mod.id });
  const sisa = await t.db.select({ o: prodi.jurusanOverrideId }).from(prodi).where(eq(prodi.kodeProdi, kode));
  expect(sisa.every((r) => r.o === null)).toBe(true);
  expect(await t.db.select().from(riwayatJurusan).where(eq(riwayatJurusan.kodeProdi, kode))).toHaveLength(4);
});

test("overrides are refused without a reason, across Kode, or when nothing changes", async () => {
  const x = await siapkan();
  const y = await siapkan();
  const tolak = (p: Promise<unknown>) => expect(p).rejects.toBeInstanceOf(PemetaanDitolak);
  await tolak(setOverrideProdi(t.db, { prodiIds: [x.p[0].id], jurusanId: x.b.id, alasan: "  ", moderatorId: x.mod.id }));
  await tolak(setOverrideProdi(t.db, { prodiIds: [x.p[0].id, y.p[0].id], jurusanId: x.b.id, alasan: "a", moderatorId: x.mod.id }));
  await tolak(setOverrideProdi(t.db, { prodiIds: [x.p[0].id], jurusanId: x.a.id, alasan: "a", moderatorId: x.mod.id }));
  await tolak(setOverrideProdi(t.db, { prodiIds: [x.p[0].id], jurusanId: 999999, alasan: "a", moderatorId: x.mod.id }));
  await tolak(setOverrideProdi(t.db, { prodiIds: [], jurusanId: x.b.id, alasan: "a", moderatorId: x.mod.id }));
  expect(await t.db.select().from(riwayatJurusan).where(eq(riwayatJurusan.kodeProdi, x.kode))).toHaveLength(0);
});

test("remapping a Kode marks it changed by a Moderator and logs it", async () => {
  const { kode, a, b, p, mod } = await siapkan();
  await expect(ubahJurusanKode(t.db, { kode, jurusanId: a.id, alasan: "x", moderatorId: mod.id })).rejects.toBeInstanceOf(PemetaanDitolak);
  await expect(ubahJurusanKode(t.db, { kode: "00000", jurusanId: b.id, alasan: "x", moderatorId: mod.id })).rejects.toBeInstanceOf(PemetaanDitolak);

  await ubahJurusanKode(t.db, { kode, jurusanId: b.id, alasan: "Seluruh Kode ini PIAUD", moderatorId: mod.id });
  const [m] = await t.db.select().from(kodeProdiJurusan).where(eq(kodeProdiJurusan.kodeProdi, kode));
  expect(m).toMatchObject({ jurusanId: b.id, diubahOleh: mod.id });
  expect(await daftarDi(b.slug)).toEqual(p.map((x) => x.slug).sort());

  const peta = await getKodePemetaan(t.db, kode);
  expect(peta!.jurusan).toMatchObject({ id: b.id, olehModerator: true });
  expect(peta!.riwayat[0]).toMatchObject({ jenis: "kode", lama: a.nama, baru: b.nama, prodiNama: null });
  expect(await getKodePemetaan(t.db, "00000")).toBeNull();
});
