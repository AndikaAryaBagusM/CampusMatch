// Drizzle wraps driver errors (DrizzleQueryError) with the Postgres error as
// `cause`; unwrap to read its code and constraint.
export function pelanggaranUnik(e: unknown, constraint: string): boolean {
  for (let err: unknown = e; err && typeof err === "object"; err = (err as { cause?: unknown }).cause) {
    const pg = err as { code?: string; constraint?: string; message?: string };
    if (pg.code === "23505" && (pg.constraint === constraint || pg.message?.includes(constraint))) return true;
  }
  return false;
}
