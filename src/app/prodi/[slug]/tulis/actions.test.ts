import { beforeEach, expect, test, vi } from "vitest";
import { dataUlasan } from "../../../../../test/fixtures";

// The Ulasan form's optional Info Biaya section (ADR 0010): untouched, it is
// ignored; invalid, it blocks nothing until fixed; failing to save, it never
// undoes the Ulasan.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/db", () => ({ withDb: vi.fn(async (fn: (db: object) => unknown) => fn({})) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/ip", () => ({ hashIpPemanggil: vi.fn(async () => "ip") }));
vi.mock("@/lib/batas-laju", async (asli) => ({ ...(await asli()), pakaiSemuaBatas: vi.fn(async () => true) }));
vi.mock("@/lib/ulasan/jalankan-screening", () => ({ screeningSetelahRespons: vi.fn() }));
vi.mock("@/lib/ulasan/kueri", () => ({
  getProdiTujuan: vi.fn(async () => ({ id: 7, slug: "s1-informatika" })),
  getUlasanSaya: vi.fn(async () => undefined),
}));
vi.mock("@/lib/ulasan/layanan", async (asli) => ({ ...(await asli()), tulisUlasan: vi.fn(async () => ({ ulasanId: "u", revisiId: "r" })) }));
vi.mock("@/lib/info-biaya/layanan", () => ({ simpanInfoBiaya: vi.fn(async () => undefined) }));

const { auth } = await import("@/auth");
const { tulisUlasan } = await import("@/lib/ulasan/layanan");
const { simpanInfoBiaya } = await import("@/lib/info-biaya/layanan");
const { kirimUlasan } = await import("./actions");

const tujuan = (p: Promise<unknown>) =>
  p.then(
    (v) => v,
    (e: { digest?: string }) => e.digest?.split(";").find((x) => x.startsWith("/")) ?? String(e),
  );

function form(tambahan: Record<string, string | string[]> = {}) {
  const fd = new FormData();
  const d = dataUlasan();
  fd.set("prodiSlug", "s1-informatika");
  for (const [k, v] of Object.entries(d)) fd.set(k, k === "rekomendasi" ? (v ? "ya" : "tidak") : String(v));
  for (const [k, v] of Object.entries(tambahan)) for (const x of [v].flat()) fd.append(k, x);
  return fd;
}

beforeEach(() => {
  vi.mocked(auth as unknown as () => Promise<unknown>).mockResolvedValue({ user: { id: "p1", email: "a@b.id", usia18At: new Date(), dikunciAt: null } });
  vi.mocked(tulisUlasan).mockClear();
  vi.mocked(simpanInfoBiaya).mockReset();
});

test("an untouched section is ignored", async () => {
  expect(await tujuan(kirimUlasan(null, form()))).toBe("/akun?terkirim=s1-informatika");
  expect(tulisUlasan).toHaveBeenCalledTimes(1);
  expect(simpanInfoBiaya).not.toHaveBeenCalled();
});

test("a filled section is saved with the Ulasan's status and tahun masuk", async () => {
  expect(await tujuan(kirimUlasan(null, form({ jalur: "snbt", tes: ["utbk"], biayaSemester: "5.000.000", setuju: "1" })))).toBe(
    "/akun?terkirim=s1-informatika&infoBiaya=tersimpan",
  );
  expect(vi.mocked(simpanInfoBiaya).mock.calls[0][1]).toMatchObject({
    userId: "p1",
    prodiId: 7,
    data: { statusPengulas: "mahasiswa_aktif", tahunMasuk: 2023, jalur: "snbt", tes: ["utbk"], biayaSemester: 5_000_000 },
  });
});

test("an invalid section blocks the submit until fixed, without saving anything", async () => {
  const hasil = (await kirimUlasan(null, form({ biayaSemester: "5.000.000" }))) as { galatInfoBiaya?: object };
  expect(hasil.galatInfoBiaya).toMatchObject({ setuju: expect.any(String) });
  expect(tulisUlasan).not.toHaveBeenCalled();
});

test("Info Biaya failing to save never undoes the Ulasan", async () => {
  vi.mocked(simpanInfoBiaya).mockRejectedValue(new Error("batas"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(await tujuan(kirimUlasan(null, form({ beasiswa: "kip_kuliah", setuju: "1" })))).toBe("/akun?terkirim=s1-informatika&infoBiaya=gagal");
  expect(tulisUlasan).toHaveBeenCalledTimes(1);
});
