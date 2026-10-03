import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { createTestDb, type TestDb } from "./db";

let t: TestDb;
beforeAll(async () => {
  t = await createTestDb();
});
afterAll(() => t.close());

test("migrations apply and pg_trgm is available", async () => {
  const { rows } = await t.db.execute<{ similarity: number }>(sql`SELECT similarity('informatika', 'informatka') AS similarity`);
  expect(rows[0].similarity).toBeGreaterThan(0.5);
});
