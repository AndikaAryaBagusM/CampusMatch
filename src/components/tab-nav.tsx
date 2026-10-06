import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tab = { href: string; label: string; active: boolean };

// Tabs as links (each tab is its own URL), set as platform signs: the current
// one is the ink plate, the others are outlined plates.
export function TabNav({ tabs, label, className }: { tabs: Tab[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("flex gap-2 overflow-x-auto py-3", className)}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-sm px-4 text-sm font-bold whitespace-nowrap transition-colors sm:text-base",
            t.active
              ? "bg-foreground text-background"
              : "text-foreground ring-1 ring-foreground/40 ring-inset hover:bg-secondary hover:ring-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
