import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createHttpDb } from "@/db/http";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

// Which sign-in methods are configured. A missing key turns that method off
// instead of breaking sign-in (e.g. no Resend key on a Preview deployment).
export function caraMasuk() {
  return {
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    email: !!process.env.AUTH_RESEND_KEY,
  };
}

function providers(): Provider[] {
  const aktif = caraMasuk();
  return [
    ...(aktif.google ? [Google] : []),
    ...(aktif.email ? [Resend({ from: process.env.AUTH_EMAIL_FROM || "CampusMatch <onboarding@resend.dev>" })] : []),
  ];
}

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
  providers: providers(),
  pages: { signIn: "/masuk", verifyRequest: "/masuk/cek-email", error: "/masuk" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
}));
