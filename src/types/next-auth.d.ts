import type { DefaultSession } from "next-auth";

// The account fields the app reads from the session (src/auth.ts).
declare module "next-auth" {
  interface User {
    usia18At?: Date | null;
    dikunciAt?: Date | null;
  }
  interface Session {
    user: {
      id: string;
      // ADR 0008: NULL until the person declares they are 18 or older.
      usia18At: Date | null;
      dikunciAt: Date | null;
    } & DefaultSession["user"];
  }
}
