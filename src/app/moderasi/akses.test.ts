import { beforeEach, describe, expect, test, vi } from "vitest";

// Moderator-only access: every /moderasi Server Action and page must refuse
// signed-out and non-Moderator callers before touching the database.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/db", () => ({ withDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { auth } = await import("@/auth");
const { withDb } = await import("@/db");
const actions = await import("./actions");
const { default: ModerasiPage } = await import("./page");
const { default: RiwayatPage } = await import("./ulasan/[id]/page");
const aksiFakta = await import("./fakta/actions");
const { default: FaktaPage } = await import("./fakta/page");
const { default: PeriksaSumberPage } = await import("./fakta/[id]/page");
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>);

const form = () => {
  const fd = new FormData();
  fd.set("revisiId", "00000000-0000-0000-0000-000000000000");
  fd.set("laporanId", "00000000-0000-0000-0000-000000000000");
  fd.set("alasan", "alasan");
  fd.set("sumberId", "1");
  fd.set("catatan", "catatan");
  return fd;
};

const pemanggil = {
  "signed out": null,
  "a signed-in Pengulas": { user: { id: "u1", email: "pengulas@gmail.com" } },
  "a user without email": { user: { id: "u2" } },
};

beforeEach(() => {
  vi.stubEnv("MODERATOR_EMAILS", "mod@campusmatch.id");
  vi.mocked(withDb).mockReset();
});

describe.each(Object.entries(pemanggil))("%s", (_, sesi) => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(sesi);
  });

  test.each(["setujui", "tolak", "turunkan", "tutup"] as const)("is refused by the %s action", async (nama) => {
    await expect(actions[nama](form())).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(withDb).not.toHaveBeenCalled();
  });

  test.each(["periksa", "kembalikan", "tarik"] as const)("is refused by the fact %s action", async (nama) => {
    await expect(aksiFakta[nama](form())).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(withDb).not.toHaveBeenCalled();
  });

  test("is refused by the fact pages", async () => {
    await expect(FaktaPage({ params: Promise.resolve({}), searchParams: Promise.resolve({}) } as never)).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    const props = { params: Promise.resolve({ id: "1" }), searchParams: Promise.resolve({}) };
    await expect(PeriksaSumberPage(props as never)).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(withDb).not.toHaveBeenCalled();
  });

  test("is refused by the /moderasi page", async () => {
    const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };
    await expect(ModerasiPage(props as never)).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(withDb).not.toHaveBeenCalled();
  });

  test("is refused by the history page", async () => {
    const props = { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }) };
    await expect(RiwayatPage(props as never)).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    expect(withDb).not.toHaveBeenCalled();
  });
});

test("a Moderator gets through to the database", async () => {
  mockAuth.mockResolvedValue({ user: { id: "m1", email: "MOD@campusmatch.id" } });
  vi.mocked(withDb).mockResolvedValue({ liveBerubah: false, target: { prodiSlug: "p", kampusSlug: "k" } });
  await actions.setujui(form());
  expect(withDb).toHaveBeenCalledTimes(1);
});
