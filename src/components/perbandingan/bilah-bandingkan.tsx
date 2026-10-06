"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { hapus, hrefBandingkan, MAKS_PRODI } from "@/lib/perbandingan/daftar";
import { simpanDaftar, useDaftarBandingkan } from "./simpanan";

// The bar along the bottom of every page while the Bandingkan list has a Prodi.
export function BilahBandingkan() {
  const daftar = useDaftarBandingkan();
  const pathname = usePathname();
  if (daftar.length === 0 || pathname === "/bandingkan") return null;

  return (
    <>
      {/* Room under the footer so the bar never covers it. */}
      <div aria-hidden className="h-28 sm:h-20" />
      <section
        aria-label="Daftar perbandingan"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <p className="shrink-0 text-sm font-medium">
            Bandingkan ({daftar.length}/{MAKS_PRODI})
          </p>
          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {daftar.map((p) => (
              <li key={p.slug} className="flex h-8 max-w-60 shrink-0 items-center gap-1 rounded-full bg-secondary pl-3 pr-1 text-sm">
                <Link href={`/prodi/${p.slug}`} className="truncate hover:underline">
                  {p.label}
                </Link>
                <button
                  type="button"
                  onClick={() => simpanDaftar(hapus(daftar, p.slug))}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-white"
                  aria-label={`Hapus ${p.label} dari perbandingan`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => simpanDaftar([])}
              className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Kosongkan
            </button>
            {daftar.length >= 2 ? (
              <Link
                href={hrefBandingkan(daftar.map((p) => p.slug))}
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-deep"
              >
                Bandingkan
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Pilih 1 Prodi lagi</span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
