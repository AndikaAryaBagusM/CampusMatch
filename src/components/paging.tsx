import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Page numbers around the current one, with gaps: 1 … 4 5 6 … 51.
function nomorHalaman(sekarang: number, total: number): (number | "…")[] {
  const set = new Set([1, total, sekarang - 1, sekarang, sekarang + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (const n of sorted) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n - prev > 1) out.push("…");
    out.push(n);
  }
  return out;
}

const kotak =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors";

// Numbered pagination as links. `href(n)` builds the URL of page n.
export function Paging({
  halaman,
  total,
  href,
  className,
}: {
  halaman: number;
  total: number;
  href: (n: number) => string;
  className?: string;
}) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Halaman" className={cn("flex flex-col items-center gap-2", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {halaman > 1 ? (
            <Link href={href(halaman - 1)} className={cn(kotak, "text-primary hover:bg-secondary")} aria-label="Halaman sebelumnya">
              <ChevronLeft className="size-4" aria-hidden />
            </Link>
          ) : (
            <span className={cn(kotak, "text-muted-foreground/50")} aria-hidden>
              <ChevronLeft className="size-4" />
            </span>
          )}
        </li>
        {nomorHalaman(halaman, total).map((n, i) =>
          n === "…" ? (
            <li key={`gap-${i}`} className={cn(kotak, "text-muted-foreground")} aria-hidden>
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === halaman ? "page" : undefined}
                className={cn(kotak, n === halaman ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary")}
              >
                {n}
              </Link>
            </li>
          ),
        )}
        <li>
          {halaman < total ? (
            <Link href={href(halaman + 1)} className={cn(kotak, "text-primary hover:bg-secondary")} aria-label="Halaman berikutnya">
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span className={cn(kotak, "text-muted-foreground/50")} aria-hidden>
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
      <p className="text-xs text-muted-foreground">
        Halaman {halaman} dari {total}
      </p>
    </nav>
  );
}
