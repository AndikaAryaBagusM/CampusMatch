"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { lepasProdi, MAKS_TERSIMPAN, simpanProdi } from "@/lib/simpanan/daftar";
import { cn } from "@/lib/utils";
import { tulisTersimpan, useTersimpan } from "./toko";

// Saves a Prodi to, or removes it from, the visitor's list in this browser.
export function TombolSimpan({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const daftar = useTersimpan();
  const disimpan = daftar.some((p) => p.slug === slug);
  const penuh = !disimpan && daftar.length >= MAKS_TERSIMPAN;

  return (
    <button
      type="button"
      aria-pressed={disimpan}
      disabled={penuh}
      title={penuh ? `Paling banyak ${MAKS_TERSIMPAN} Prodi; hapus satu dari daftar dulu.` : undefined}
      onClick={() => tulisTersimpan(disimpan ? lepasProdi(daftar, slug) : simpanProdi(daftar, { slug, label }))}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        disimpan ? "bg-foreground text-background hover:bg-foreground/85" : "bg-card text-foreground ring-1 ring-foreground/60 hover:bg-secondary",
        className,
      )}
    >
      {disimpan ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
      {disimpan ? "Tersimpan" : "Simpan"}
    </button>
  );
}
