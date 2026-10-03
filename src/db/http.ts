import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Stateless HTTP driver for the Auth.js adapter only (ADR 0005): the adapter is
// configured outside a request, so it can't own a per-request Pool. App code
// uses withDb().
export function createHttpDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return drizzle({ client: neon(connectionString), schema });
}
