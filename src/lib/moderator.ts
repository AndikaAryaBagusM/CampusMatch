import { notFound } from "next/navigation";
import { auth } from "@/auth";

// Moderators are the emails in MODERATOR_EMAILS (comma-separated), checked on
// every request; there is no Moderator sign-up (decisions.md 10d).
export function daftarModerator(raw = process.env.MODERATOR_EMAILS): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isModerator(email: string | null | undefined, raw?: string): boolean {
  return !!email && daftarModerator(raw).has(email.trim().toLowerCase());
}

export type Moderator = { id: string; email: string };

// For every /moderasi page and every moderation Server Action, not only the
// layout. Anyone else gets a 404, so the area's existence isn't confirmed.
export async function requireModerator(): Promise<Moderator> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email || !isModerator(user.email)) notFound();
  return { id: user.id, email: user.email };
}
