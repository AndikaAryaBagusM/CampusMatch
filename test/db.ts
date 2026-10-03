import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "@/db";
import * as schema from "@/db/schema";

// An in-memory Postgres with every migration in ./drizzle applied, so tests
// that need real constraints and transactions never touch Neon.
// The pglite and neon-serverless Drizzle databases share the query builder,
// transactions and execute().rows, so the app's Db type is reused here.
export async function createTestDb() {
  const client = await PGlite.create({ extensions: { pg_trgm } });
  const pglite = drizzle({ client, schema });
  await migrate(pglite, { migrationsFolder: "./drizzle" });
  return { db: pglite as unknown as Db, close: () => client.close() };
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;
