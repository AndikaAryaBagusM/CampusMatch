"use client";

import { Check, Plus } from "lucide-react";
import { hapus, MAKS_PRODI, tambah } from "@/lib/perbandingan/daftar";
import { cn } from "@/lib/utils";
import { simpanDaftar, useDaftarBandingkan } from "./simpanan";

// Adds a Prodi to, or removes it from, the Bandingkan list.
export function TombolBandingkan({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const daftar = useDaftarBandingkan();
  const dipilih = daftar.some((p) => p.slug === slug);
  const penuh = !dipilih && daftar.length >= MAKS_PRODI;

  return (
    <button
      type="button"
      aria-pressed={dipilih}
      disabled={penuh}
      title={penuh ? `Paling banyak ${MAKS_PRODI} Prodi; hapus satu dari daftar dulu.` : undefined}
      onClick={() => simpanDaftar(dipilih ? hapus(daftar, slug) : tambah(daftar, { slug, label }))}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        dipilih ? "bg-primary text-primary-foreground hover:bg-brand-deep" : "bg-white text-foreground ring-1 ring-input hover:bg-secondary",
        className,
      )}
    >
      {dipilih ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      {dipilih ? "Dibandingkan" : penuh ? `Maks. ${MAKS_PRODI} Prodi` : "Bandingkan"}
    </button>
  );
}
