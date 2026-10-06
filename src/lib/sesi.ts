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

export function hrefUsia(kembaliKe: string) {
  return `/akun/usia?callbackUrl=${encodeURIComponent(kembaliKe)}`;
}

// The signed-in user, whatever their age declaration: only for /akun/usia,
// where they make it, and /akun/dikunci.
export async function requireSesi(kembaliKe: string): Promise<Pengulas & { usia18At: Date | null; dikunciAt: Date | null }> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect(hrefMasuk(kembaliKe));
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    usia18At: user.usia18At ?? null,
    dikunciAt: user.dikunciAt ?? null,
  };
}

// The signed-in user, or a redirect to /masuk that returns here afterwards.
// An account works only after its holder declared they are 18 or older, and
// never once locked (ADR 0008).
export async function requirePengulas(kembaliKe: string): Promise<Pengulas> {
  const user = await requireSesi(kembaliKe);
  if (user.dikunciAt) redirect("/akun/dikunci");
  if (!user.usia18At) redirect(hrefUsia(kembaliKe));
  return { id: user.id, email: user.email, name: user.name };
}
