import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "./moderator-email";

export { daftarModerator, isModerator } from "./moderator-email";

export type Moderator = { id: string; email: string };

// For every /moderasi page and every moderation Server Action, not only the
// layout. Anyone else gets a 404, so the area's existence isn't confirmed.
export async function requireModerator(): Promise<Moderator> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email || !isModerator(user.email)) notFound();
  return { id: user.id, email: user.email };
}
