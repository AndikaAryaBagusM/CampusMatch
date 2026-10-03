"use server";

import { signOut } from "@/auth";

export async function keluar() {
  await signOut({ redirectTo: "/" });
}
