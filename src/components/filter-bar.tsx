import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterChip = { href: string; label: string; active: boolean };

// A row of link chips (one filter group). Works without client JavaScript.
export function FilterChips({ label, chips, className }: { label: string; chips: FilterChip[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label={label}>
      <span className="mr-1 text-sm font-semibold text-muted-foreground">{label}</span>
      {chips.map((c) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          aria-current={c.active ? "true" : undefined}
          className={cn(
            "inline-flex h-8 items-center rounded-sm px-3 text-sm font-semibold transition-colors",
            c.active ? "bg-foreground text-background" : "bg-card text-foreground ring-1 ring-input hover:bg-secondary hover:ring-jade",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  // A ruled control strip on the ground, between the heading and the list.
  return <div className={cn("flex flex-col gap-3 border-y border-foreground/25 py-3", className)}>{children}</div>;
}
