// Moderators are the emails in MODERATOR_EMAILS (comma-separated), checked on
// every request; there is no Moderator sign-up (decisions.md 10d). No Auth.js
// import here, so scripts can use it.
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
