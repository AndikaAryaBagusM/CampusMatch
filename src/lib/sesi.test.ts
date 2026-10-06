import { beforeEach, describe, expect, test, vi } from "vitest";

// The 18+ gate on every account action (ADR 0008).
vi.mock("@/auth", () => ({ auth: vi.fn() }));
const { auth } = await import("@/auth");
const { requirePengulas, requireSesi } = await import("./sesi");
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

const sesi = (user: Record<string, unknown>) => ({ user: { id: "u1", email: "a@b.id", ...user } });
const tujuan = (p: Promise<unknown>) =>
  p.then(
    () => "lolos",
    (e: { digest?: string }) => e.digest?.split(";").find((x) => x.startsWith("/")) ?? String(e),
  );

beforeEach(() => mockAuth.mockReset());

describe("requirePengulas", () => {
  test("signed out: to /masuk, back here afterwards", async () => {
    mockAuth.mockResolvedValue(null);
    expect(await tujuan(requirePengulas("/akun"))).toBe("/masuk?callbackUrl=%2Fakun");
  });

  test("no declaration yet: to /akun/usia, back here afterwards", async () => {
    mockAuth.mockResolvedValue(sesi({ usia18At: null, dikunciAt: null }));
    expect(await tujuan(requirePengulas("/tes-minat/hasil?p=1-2-3-4-5-6"))).toBe(
      "/akun/usia?callbackUrl=%2Ftes-minat%2Fhasil%3Fp%3D1-2-3-4-5-6",
    );
  });

  test("locked: to /akun/dikunci, even with a declaration", async () => {
    mockAuth.mockResolvedValue(sesi({ usia18At: new Date(), dikunciAt: new Date() }));
    expect(await tujuan(requirePengulas("/akun"))).toBe("/akun/dikunci");
  });

  test("declared 18+: through", async () => {
    mockAuth.mockResolvedValue(sesi({ usia18At: new Date(), dikunciAt: null }));
    await expect(requirePengulas("/akun")).resolves.toEqual({ id: "u1", email: "a@b.id", name: null });
  });

  test("requireSesi lets an undeclared account reach the declaration page", async () => {
    mockAuth.mockResolvedValue(sesi({ usia18At: null, dikunciAt: null }));
    await expect(requireSesi("/akun/usia")).resolves.toMatchObject({ id: "u1", usia18At: null });
  });
});
