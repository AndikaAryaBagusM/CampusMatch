import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import type { KampusQs } from "@/lib/peringkat-qs/kueri";

const TERLIHAT = 12;

function Baris({ k }: { k: KampusQs }) {
  return (
    <li className="min-w-0">
      <Link
        href={`/kampus/${k.slug}`}
        className="group flex items-center gap-3 border-b border-on-jade/15 px-1 py-2.5 transition-colors hover:bg-on-jade/10"
      >
        {/* The rank exactly as QS publishes it ("=191", "851-900"). */}
        <span className="tabular w-14 shrink-0 font-plate text-xs font-bold text-on-jade sm:w-[4.5rem] sm:text-sm">{k.peringkat}</span>
        <KampusLogo kampus={k} size="sm" />
        {/* Phones: the Kota sits under the name, so no name is cut. From md: two columns, as on a board. */}
        <span className="min-w-0 flex-1 md:flex md:items-center md:gap-3">
          <span className="block font-semibold leading-snug decoration-2 underline-offset-4 group-hover:underline md:min-w-0 md:flex-1 md:truncate">
            {k.nama}
          </span>
          <span className="block text-sm text-on-jade-muted md:max-w-40 md:shrink-0 md:truncate md:text-right">{k.kotaNama}</span>
        </span>
      </Link>
    </li>
  );
}

// A departure board of the Kampus in the latest QS World University Rankings,
// in QS's order with QS's rank on each row (ADR 0011). The rest sits in a
// native <details>.
export function KampusQsList({ items }: { items: KampusQs[] }) {
  const kolom = "grid grid-cols-1 gap-x-8 md:grid-cols-2";
  const kepala = (
    <span className="flex gap-3 px-1">
      <span className="w-14 shrink-0 sm:w-[4.5rem]">QS</span>
      <span className="flex flex-1 justify-between">
        <span>Kampus</span>
        <span>Kota</span>
      </span>
    </span>
  );
  return (
    <div className="rounded-md bg-foreground p-4 text-on-jade sm:p-6">
      <div className="mb-1 hidden grid-cols-2 gap-x-8 border-b-2 border-on-jade/30 pb-2 font-plate text-sm font-semibold tracking-wide text-on-jade-muted uppercase md:grid">
        {kepala}
        {kepala}
      </div>
      <ol className={kolom}>
        {items.slice(0, TERLIHAT).map((k) => (
          <Baris key={k.slug} k={k} />
        ))}
      </ol>
      {items.length > TERLIHAT ? (
        <details className="group">
          <summary className="mx-auto mt-5 flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-sm bg-on-jade px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-jade-tint [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Tampilkan semua {items.length}</span>
            <span className="hidden group-open:inline">Tampilkan lebih sedikit</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <ol className={`${kolom} mt-3`}>
            {items.slice(TERLIHAT).map((k) => (
              <Baris key={k.slug} k={k} />
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
