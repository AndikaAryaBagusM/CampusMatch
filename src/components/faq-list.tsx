import { Plus } from "lucide-react";

// The design's FAQ accordion (frames A/B) with native <details>: no client JS.
export function FaqList({ items }: { items: { tanya: string; jawab: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((it) => (
        <details key={it.tanya} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {it.tanya}
            <Plus className="size-4 shrink-0 text-primary transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{it.jawab}</div>
        </details>
      ))}
    </div>
  );
}
