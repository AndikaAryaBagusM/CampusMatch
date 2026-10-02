import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// WebSocket Pool driver, for interactive transactions (ADR 0005).
// A Pool must not outlive one request: create it per request and always end it.
// Needs a global WebSocket (Node 22+).

export function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool, schema });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];

export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const { db, pool } = createDb();
  try {
    return await fn(db);
  } finally {
    await pool.end();
  }
}
