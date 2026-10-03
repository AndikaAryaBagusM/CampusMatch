import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createHttpDb } from "@/db/http";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

// Auth.js with sessions in the database. Lazy config, so a build without
// DATABASE_URL doesn't fail at import time. Provider secrets are read from
// AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and AUTH_RESEND_KEY.
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(createHttpDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [Google, Resend({ from: process.env.AUTH_EMAIL_FROM })],
  pages: { signIn: "/masuk", verifyRequest: "/masuk/cek-email", error: "/masuk" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
}));
