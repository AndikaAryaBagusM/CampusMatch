import { createHmac } from "node:crypto";
import { headers } from "next/headers";

// HMAC-SHA256 of an IP with IP_HASH_SECRET, in hex. Never a plain hash: the
// IPv4 space is small enough to reverse one.
export function hashIp(ip: string, secret = process.env.IP_HASH_SECRET): string {
  if (!secret) throw new Error("IP_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(ip).digest("hex");
}

// The caller's IP as Vercel reports it: the first x-forwarded-for entry.
export async function ipPemanggil(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function hashIpPemanggil(): Promise<string> {
  return hashIp(await ipPemanggil());
}
