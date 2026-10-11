import { timingSafeEqual } from "node:crypto";

// True when the request carries "Authorization: Bearer <CRON_SECRET>": Vercel
// Cron sends it, and so does `npm run cache:segarkan`. False without a secret.
export function berwenangCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
