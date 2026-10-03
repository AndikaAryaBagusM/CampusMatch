import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
const { auth } = await import("@/auth");
const { daftarModerator, isModerator, requireModerator } = await import("./moderator");
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

describe("MODERATOR_EMAILS", () => {
  test("parses a comma list, ignoring case, spaces and empty entries", () => {
    expect([...daftarModerator(" A@Kampus.id, b@x.com ,, ")]).toEqual(["a@kampus.id", "b@x.com"]);
  });

  test("matches emails case-insensitively", () => {
    expect(isModerator("a@kampus.ID", "a@kampus.id")).toBe(true);
    expect(isModerator("c@x.com", "a@kampus.id")).toBe(false);
  });

  test("nobody is a Moderator when the list is unset or empty", () => {
    expect(isModerator("a@kampus.id", "")).toBe(false);
    expect(isModerator("a@kampus.id", undefined)).toBe(false);
    expect(isModerator(null, "a@kampus.id")).toBe(false);
  });
});

describe("requireModerator", () => {
  beforeEach(() => {
    vi.stubEnv("MODERATOR_EMAILS", "mod@campusmatch.id");
  });

  test("returns the Moderator", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "Mod@campusmatch.id" } });
    await expect(requireModerator()).resolves.toEqual({ id: "u1", email: "Mod@campusmatch.id" });
  });

  test("rejects a signed-out caller with a 404", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireModerator()).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  test("rejects a signed-in non-Moderator with a 404", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u2", email: "pengulas@gmail.com" } });
    await expect(requireModerator()).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });
});
