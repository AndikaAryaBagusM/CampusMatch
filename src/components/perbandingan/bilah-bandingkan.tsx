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
        className="fixed inset-x-0 bottom-0 z-40 bg-foreground text-background shadow-[0_-8px_24px_-12px_rgb(19_32_26/0.5)]"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <p className="text-sm font-bold">Bandingkan</p>
            {/* One station per slot: filled when a Prodi is chosen, a hollow ring while free. */}
            <span className="flex items-center" aria-label={`${daftar.length} dari ${MAKS_PRODI} Prodi dipilih`} role="img">
              {Array.from({ length: MAKS_PRODI }, (_, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 ? <span className="h-1 w-3 bg-jade-tint/60" /> : null}
                  <span
                    className={i < daftar.length ? "size-4 rounded-full border-[3px] border-background bg-jade" : "size-4 rounded-full border-[3px] border-background/50"}
                  />
                </span>
              ))}
            </span>
          </div>
          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {daftar.map((p) => (
              <li key={p.slug} className="flex h-8 max-w-60 shrink-0 items-center gap-1 rounded-sm bg-background/10 pr-1 pl-3 text-sm font-semibold">
                <Link href={`/prodi/${p.slug}`} className="truncate hover:underline">
                  {p.label}
                </Link>
                <button
                  type="button"
                  onClick={() => simpanDaftar(hapus(daftar, p.slug))}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm hover:bg-background/20"
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
              className="inline-flex h-9 items-center rounded-sm px-3 text-sm font-semibold text-background/75 hover:bg-background/10 hover:text-background"
            >
              Kosongkan
            </button>
            {daftar.length >= 2 ? (
              <Link
                href={hrefBandingkan(daftar.map((p) => p.slug))}
                className="inline-flex h-9 items-center rounded-sm bg-jade px-4 text-sm font-bold text-on-jade hover:bg-jade-deep"
              >
                Bandingkan
              </Link>
            ) : (
              <span className="text-sm text-background/75">Pilih 1 Prodi lagi</span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
