import { beforeEach, expect, test, vi } from "vitest";

// Sharing Info Biaya needs a signed-in 18+ account; the page and the action
// both send everyone else away before touching the database.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/db", () => ({ withDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));

const { auth } = await import("@/auth");
const { withDb } = await import("@/db");
const { kirimInfoBiaya } = await import("./actions");
const { default: InfoBiayaPage } = await import("./page");
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

const tujuan = (p: Promise<unknown>) =>
  p.then(
    () => "lolos",
    (e: { digest?: string }) => e.digest?.split(";").find((x) => x.startsWith("/")) ?? String(e),
  );
const form = () => {
  const fd = new FormData();
  fd.set("prodiSlug", "s1-informatika");
  fd.set("jalur", "snbt");
  return fd;
};
const kembali = "/masuk?callbackUrl=%2Fprodi%2Fs1-informatika%2Finfo-biaya";

beforeEach(() => {
  vi.mocked(withDb).mockReset();
});

test("signed out: the page and the action go to sign-in", async () => {
  mockAuth.mockResolvedValue(null);
  expect(await tujuan(kirimInfoBiaya(null, form()))).toBe(kembali);
  expect(await tujuan(InfoBiayaPage({ params: Promise.resolve({ slug: "s1-informatika" }) } as never))).toBe(kembali);
  expect(withDb).not.toHaveBeenCalled();
});

test("no 18+ declaration yet: sent to /akun/usia first", async () => {
  mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.id", usia18At: null, dikunciAt: null } });
  expect(await tujuan(kirimInfoBiaya(null, form()))).toBe("/akun/usia?callbackUrl=%2Fprodi%2Fs1-informatika%2Finfo-biaya");
  expect(withDb).not.toHaveBeenCalled();
});

test("an invalid form is refused before the database", async () => {
  mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.id", usia18At: new Date(), dikunciAt: null } });
  const hasil = await kirimInfoBiaya(null, form());
  expect(hasil?.galat).toMatchObject({ setuju: expect.any(String), statusPengulas: expect.any(String) });
  expect(withDb).not.toHaveBeenCalled();
});
