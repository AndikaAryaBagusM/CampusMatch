import Link from "next/link";
import { PenLine, Search, UserRound } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { Wordmark } from "@/components/layout/wordmark";

const NAV = [
  { href: "/#bidang", label: "Bidang" },
  { href: "/#unggulan", label: "Kampus Unggulan" },
  { href: "/kota", label: "Kota" },
  { href: "/tes-minat", label: "Tes Minat" },
];

const tautanNav =
  "rounded-sm px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-foreground decoration-2 underline-offset-[6px] transition-colors hover:text-jade hover:underline";

// Static on purpose: reading the session here would make every catalogue page
// dynamic. /akun signs the visitor in when needed.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="CampusMatch, ke beranda" className="shrink-0 rounded-sm">
          <Wordmark />
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={tautanNav}>
              {n.label}
            </Link>
          ))}
        </nav>
        <SearchForm size="sm" className="ml-auto hidden max-w-xs md:flex" />
        <Link
          href="/cari"
          aria-label="Cari"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-sm text-foreground hover:bg-secondary md:hidden"
        >
          <Search className="size-5" aria-hidden />
        </Link>
        <Link
          href="/cari?tulis=1"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm bg-pengulas px-3 text-sm font-semibold text-pengulas-foreground transition-colors hover:bg-pengulas-ink"
        >
          <PenLine className="size-4" aria-hidden />
          <span className="hidden sm:inline">Tulis ulasan</span>
          <span className="sr-only sm:hidden">Tulis ulasan</span>
        </Link>
        <Link
          href="/akun"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm px-2 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <UserRound className="size-5" aria-hidden />
          <span className="hidden sm:inline">Akun</span>
          <span className="sr-only sm:hidden">Akun</span>
        </Link>
      </div>
      <nav aria-label="Navigasi utama (ponsel)" className="-mt-1 flex overflow-x-auto px-2 pb-1.5 sm:px-4 lg:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={tautanNav}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
