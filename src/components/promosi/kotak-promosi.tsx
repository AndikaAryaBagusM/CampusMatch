import Link from "next/link";
import { AkreditasiBadge } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { domainTautan, type PromosiTampil } from "@/lib/promosi";
import { cn } from "@/lib/utils";

// A paid placement (ADR 0009, 0012), always labelled and set apart from the
// organic list. A Kampus's shows only catalogue data and its checked text; a
// bimbel's shows its name, text and the domain it leads to. Never Bintang or
// Ulasan. Set as a poster in a different paper from the routes. The link is a
// plain <a> through /promosi/[id] so a click is counted (a daily total) and
// prefetching never is.
export function KotakPromosi({ promosi, className }: { promosi: PromosiTampil; className?: string }) {
  const dari = promosi.jenis === "bimbel" ? promosi.nama : "Kampus";
  return (
    <aside aria-label="Promosi" className={cn("rounded-md border-2 border-dashed border-[#6b4a00]/60 bg-[#f5ecd7] p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex h-6 items-center rounded-sm bg-[#6b4a00] px-2 font-plate text-sm font-bold tracking-wide text-white uppercase">Promosi</span>
        <p className="text-xs text-[#4f4430]">
          Promosi berbayar dari {dari}. Tidak memengaruhi ulasan, Bintang, atau urutan hasil.{" "}
          <Link href="/ketentuan#promosi" className="font-semibold text-foreground underline">
            Selengkapnya
          </Link>
        </p>
      </div>
      {promosi.jenis === "bimbel" ? (
        <a href={`/promosi/${promosi.id}`} rel="sponsored nofollow noopener" className="group mt-3 block space-y-1.5">
          <span className="block font-bold decoration-2 underline-offset-4 group-hover:underline">{promosi.nama}</span>
          {promosi.teks ? <span className="block text-sm">{promosi.teks}</span> : null}
          <span className="block text-sm text-[#4f4430]">Ke situs {domainTautan(promosi.tautan)}</span>
        </a>
      ) : (
        <a href={`/promosi/${promosi.id}`} rel="sponsored nofollow" className="group mt-3 flex gap-4">
          <KampusLogo kampus={promosi.kampus} size="sm" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="block font-bold decoration-2 underline-offset-4 group-hover:underline">{promosi.kampus.nama}</span>
            <span className="block text-sm text-[#4f4430]">{promosi.kampus.kotaNama}</span>
            <AkreditasiBadge akreditasi={promosi.kampus.akreditasi} />
            {promosi.teks ? <span className="block text-sm">{promosi.teks}</span> : null}
          </span>
        </a>
      )}
    </aside>
  );
}
