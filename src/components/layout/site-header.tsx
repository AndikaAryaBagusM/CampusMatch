import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { Wordmark } from "@/components/layout/wordmark";

const NAV = [
  { href: "/#bidang", label: "Bidang" },
  { href: "/#unggulan", label: "Kampus Unggulan" },
  { href: "/kota", label: "Kota" },
  { href: "/tes-minat", label: "Tes Minat" },
];

// Static on purpose: reading the session here would make every catalogue page
// dynamic. /akun signs the visitor in when needed.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="CampusMatch, ke beranda" className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <SearchForm size="sm" className="ml-auto hidden max-w-sm sm:flex" />
        <Link
          href="/cari"
          aria-label="Cari"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full text-primary hover:bg-secondary sm:hidden"
        >
          <Search className="size-5" aria-hidden />
        </Link>
        <Link
          href="/akun"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary hover:bg-secondary"
        >
          <UserRound className="size-5" aria-hidden />
          <span className="hidden sm:inline">Akun</span>
        </Link>
      </div>
    </header>
  );
}
