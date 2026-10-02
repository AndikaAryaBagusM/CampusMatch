// Refuses to write unless DB_ENV is "development" or --allow-production is
// given, and always prints which database host is targeted.
export function guardDatabase(args: string[]) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (see .env.example).");
    process.exit(1);
  }
  const host = new URL(url).host;
  const env = process.env.DB_ENV ?? "(unset)";
  console.log(`Target database: ${host} (DB_ENV=${env})`);
  if (env !== "development" && !args.includes("--allow-production")) {
    console.error(
      "Refusing to write: DB_ENV is not 'development'. Pass --allow-production to import into this database.",
    );
    process.exit(1);
  }
}
