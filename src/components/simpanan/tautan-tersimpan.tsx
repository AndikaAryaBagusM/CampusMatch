"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useTersimpan } from "./toko";

// The header's link to the saved list, with how many Prodi it holds. Shown
// only once something is saved, so the header stays as it was for new visitors.
export function TautanTersimpan() {
  const jumlah = useTersimpan().length;
  if (jumlah === 0) return null;
  return (
    <Link
      href="/tersimpan"
      aria-label={`Prodi tersimpan (${jumlah})`}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm px-2 text-sm font-semibold text-foreground hover:bg-secondary"
    >
      <Bookmark className="size-5" aria-hidden />
      <span className="tabular font-plate text-base font-bold">{jumlah}</span>
    </Link>
  );
}
