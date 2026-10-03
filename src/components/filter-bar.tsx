import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterChip = { href: string; label: string; active: boolean };

// A row of link chips (one filter group). Works without client JavaScript.
export function FilterChips({ label, chips, className }: { label: string; chips: FilterChip[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label={label}>
      <span className="mr-1 text-sm text-muted-foreground">{label}</span>
      {chips.map((c) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          aria-current={c.active ? "true" : undefined}
          className={cn(
            "inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors",
            c.active ? "bg-primary text-primary-foreground" : "bg-white text-foreground ring-1 ring-input hover:bg-secondary",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-border", className)}>{children}</div>;
}
