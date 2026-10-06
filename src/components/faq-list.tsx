import { Plus } from "lucide-react";

// FAQ with native <details>: no client JS.
export function FaqList({ items }: { items: { tanya: string; jawab: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((it) => (
        <details key={it.tanya} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {it.tanya}
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground bg-white transition-colors group-open:border-jade group-open:bg-jade group-open:text-on-jade">
              <Plus className="size-3.5 transition-transform group-open:rotate-45" strokeWidth={3} aria-hidden />
            </span>
          </summary>
          <div className="max-w-[68ch] pb-4 text-sm leading-relaxed text-muted-foreground">{it.jawab}</div>
        </details>
      ))}
    </div>
  );
}
