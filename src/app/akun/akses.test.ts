import { beforeEach, expect, test, vi } from "vitest";

// The campus-email actions: sending a link or removing a verification needs a
// signed-in 18+ account; confirming needs only a valid token.
vi.mock("@/auth", () => ({ auth: vi.fn(), signOut: vi.fn() }));
vi.mock("@/db", () => ({ withDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));

const { auth } = await import("@/auth");
const { withDb } = await import("@/db");
const aksi = await import("./actions");
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

const form = (isi: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(isi)) fd.set(k, v);
  return fd;
};
const tujuan = (p: Promise<unknown>) =>
  p.then(
    () => "lolos",
    (e: { digest?: string }) => e.digest?.split(";").find((x) => x.startsWith("/")) ?? String(e),
  );

beforeEach(() => {
  vi.mocked(withDb).mockReset();
  mockAuth.mockReset();
});

test("signed out: sending and removing go to sign-in without touching the database", async () => {
  mockAuth.mockResolvedValue(null);
  expect(await tujuan(aksi.kirimVerifikasiKampus(form({ email: "a@ugm.ac.id" })))).toBe("/masuk?callbackUrl=%2Fakun");
  expect(await tujuan(aksi.hapusVerifikasiKampus(form({ kampusId: "1" })))).toBe("/masuk?callbackUrl=%2Fakun");
  expect(withDb).not.toHaveBeenCalled();
});

test("no 18+ declaration yet: sent to /akun/usia first", async () => {
  mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.id", usia18At: null, dikunciAt: null } });
  expect(await tujuan(aksi.kirimVerifikasiKampus(form({ email: "a@ugm.ac.id" })))).toBe("/akun/usia?callbackUrl=%2Fakun");
  expect(withDb).not.toHaveBeenCalled();
});

test("Info Biaya: deleting needs a signed-in 18+ account", async () => {
  mockAuth.mockResolvedValue(null);
  expect(await tujuan(aksi.hapusInfoBiayaSaya(form({ infoBiayaId: "1" })))).toBe("/masuk?callbackUrl=%2Fakun");
  mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.id", usia18At: null, dikunciAt: null } });
  expect(await tujuan(aksi.hapusInfoBiayaSaya(form({ infoBiayaId: "1" })))).toBe("/akun/usia?callbackUrl=%2Fakun");
  expect(withDb).not.toHaveBeenCalled();
});
