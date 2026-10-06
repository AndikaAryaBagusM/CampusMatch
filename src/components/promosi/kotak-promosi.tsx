import Link from "next/link";
import { AkreditasiBadge } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import type { PromosiTampil } from "@/lib/promosi";
import { cn } from "@/lib/utils";

// A paid Kampus placement (ADR 0009), always labelled and set apart from the
// organic list. Only catalogue data and the Kampus's checked text; never
// Bintang or Ulasan. The link is a plain <a> through /promosi/[id] so a click
// is counted (a daily total) and prefetching never is.
export function KotakPromosi({ promosi, className }: { promosi: PromosiTampil; className?: string }) {
  const { kampus } = promosi;
  return (
    <aside aria-label="Promosi" className={cn("rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex h-6 items-center rounded-full bg-amber-200 px-2.5 text-xs font-semibold text-amber-950">Promosi</span>
        <p className="text-xs text-muted-foreground">
          Promosi berbayar dari Kampus. Tidak memengaruhi ulasan, Bintang, atau urutan hasil.{" "}
          <Link href="/ketentuan#promosi" className="text-primary hover:underline">
            Selengkapnya
          </Link>
        </p>
      </div>
      <a href={`/promosi/${promosi.id}`} rel="sponsored nofollow" className="group mt-3 flex gap-4">
        <KampusLogo kampus={kampus} size="sm" />
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="block font-medium text-primary group-hover:underline">{kampus.nama}</span>
          <span className="block text-sm text-muted-foreground">{kampus.kotaNama}</span>
          <AkreditasiBadge akreditasi={kampus.akreditasi} />
          {promosi.teks ? <span className="block text-sm">{promosi.teks}</span> : null}
        </span>
      </a>
    </aside>
  );
}
