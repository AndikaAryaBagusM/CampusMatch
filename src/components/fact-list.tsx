import type { LucideIcon } from "lucide-react";

export type Fact = { icon: LucideIcon; label: string; value: React.ReactNode };

// Icon + label + value rows, as in the design's programme facts list.
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="divide-y divide-border">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="grid grid-cols-[1.25rem_minmax(0,9rem)_1fr] items-start gap-x-3 py-3 text-sm">
          <Icon className="mt-0.5 size-5 text-primary" aria-hidden />
          <dt className="font-medium">{label}</dt>
          <dd className="min-w-0 text-foreground/90">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
