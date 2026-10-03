import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { KampusLogo } from "@/components/kampus/kampus-logo";

type Item = { npsn: string; nama: string; slug: string; kotaNama: string };

const TERLIHAT = 12;

function Kartu({ k }: { k: Item }) {
  return (
    <li>
      <Link href={`/kampus/${k.slug}`} className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-border transition-colors hover:bg-secondary">
        <KampusLogo kampus={k} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{k.nama}</span>
          <span className="block truncate text-xs text-muted-foreground">{k.kotaNama}</span>
        </span>
      </Link>
    </li>
  );
}

// Alphabetical, not ranked. The rest sits in a native <details>.
export function KampusUnggulanList({ items }: { items: Item[] }) {
  const grid = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className="space-y-3">
      <ul className={grid}>
        {items.slice(0, TERLIHAT).map((k) => (
          <Kartu key={k.slug} k={k} />
        ))}
      </ul>
      {items.length > TERLIHAT ? (
        <details className="group">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary hover:bg-secondary [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Tampilkan semua {items.length}</span>
            <span className="hidden group-open:inline">Tampilkan lebih sedikit</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <ul className={`${grid} mt-3`}>
            {items.slice(TERLIHAT).map((k) => (
              <Kartu key={k.slug} k={k} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
