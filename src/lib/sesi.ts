import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Only same-site paths, so ?callbackUrl= can't become an open redirect.
export function jalurAman(path: unknown, cadangan = "/"): string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\")
    ? path
    : cadangan;
}

export function hrefMasuk(kembaliKe: string) {
  return `/masuk?callbackUrl=${encodeURIComponent(kembaliKe)}`;
}

export type Pengulas = { id: string; email: string | null; name: string | null };

// The signed-in user, or a redirect to /masuk that returns here afterwards.
export async function requirePengulas(kembaliKe: string): Promise<Pengulas> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect(hrefMasuk(kembaliKe));
  return { id: user.id, email: user.email ?? null, name: user.name ?? null };
}
