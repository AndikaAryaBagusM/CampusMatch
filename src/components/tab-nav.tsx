import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tab = { href: string; label: string; active: boolean };

// Tabs as links (each tab is its own URL), with the design's 2px underline.
export function TabNav({ tabs, label, className }: { tabs: Tab[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("-mb-px flex overflow-x-auto", className)}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:min-w-36 sm:text-center sm:text-base",
            t.active
              ? "border-primary text-primary"
              : "border-transparent text-foreground/80 hover:border-border hover:text-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
