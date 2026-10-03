import { afterAll, beforeAll, expect, test } from "vitest";
import { batasLaju } from "@/db/schema";
import { createTestDb, type TestDb } from "../../test/db";
import { awalJendela, hapusBatasLama, kunciIp, kunciPengulas, pakaiBatas, pakaiSemuaBatas } from "./batas-laju";
import { hashIp } from "./ip";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

const batas = { maks: 3, jendelaDetik: 3600 };
const jam10 = new Date("2026-10-03T10:15:00Z");

test("allows up to the limit, then blocks within the same window", async () => {
  const kunci = kunciPengulas("u-limit", "ulasan");
  const hasil = [];
  for (let i = 0; i < 5; i++) hasil.push(await pakaiBatas(t.db, kunci, batas, jam10));
  expect(hasil).toEqual([true, true, true, false, false]);
});

test("a new window starts a fresh count", async () => {
  const kunci = kunciPengulas("u-window", "ulasan");
  for (let i = 0; i < 3; i++) await pakaiBatas(t.db, kunci, batas, jam10);
  expect(await pakaiBatas(t.db, kunci, batas, jam10)).toBe(false);
  expect(await pakaiBatas(t.db, kunci, batas, new Date("2026-10-03T11:00:00Z"))).toBe(true);
});

test("windows align to fixed boundaries", () => {
  expect(awalJendela(jam10, 3600).toISOString()).toBe("2026-10-03T10:00:00.000Z");
  expect(awalJendela(jam10, 86400).toISOString()).toBe("2026-10-03T00:00:00.000Z");
});

test("keys are separate per user and per IP", async () => {
  expect(await pakaiSemuaBatas(t.db, [[kunciPengulas("u-a", "x"), { maks: 1, jendelaDetik: 60 }]], jam10)).toBe(true);
  expect(await pakaiSemuaBatas(t.db, [[kunciPengulas("u-b", "x"), { maks: 1, jendelaDetik: 60 }]], jam10)).toBe(true);
  expect(await pakaiSemuaBatas(t.db, [[kunciPengulas("u-a", "x"), { maks: 1, jendelaDetik: 60 }]], jam10)).toBe(false);
});

test("stores only the HMAC of an IP, never the IP itself", async () => {
  const ip = "203.0.113.7";
  const hash = hashIp(ip, "rahasia-uji");
  expect(hash).toMatch(/^[0-9a-f]{64}$/);
  expect(hashIp(ip, "rahasia-lain")).not.toBe(hash);
  await pakaiBatas(t.db, kunciIp(hash, "ulasan"), batas, jam10);
  const rows = await t.db.select().from(batasLaju);
  expect(rows.some((r) => r.kunci.includes(ip))).toBe(false);
  expect(rows.some((r) => r.kunci === `ip:${hash}:ulasan`)).toBe(true);
});

test("hashIp refuses to run without a secret", () => {
  expect(() => hashIp("203.0.113.7", "")).toThrow(/IP_HASH_SECRET/);
});

test("old windows are cleared", async () => {
  await pakaiBatas(t.db, "lama", batas, new Date("2026-09-01T00:00:00Z"));
  await hapusBatasLama(t.db, jam10);
  const rows = await t.db.select().from(batasLaju);
  expect(rows.some((r) => r.kunci === "lama")).toBe(false);
});
