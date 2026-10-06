import type { LucideIcon } from "lucide-react";

export type Fact = { icon: LucideIcon; label: string; value: React.ReactNode };

// Timetable rows: icon, label, then the value.
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="tabular divide-y divide-border">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="grid grid-cols-[1.25rem_minmax(0,9rem)_1fr] items-start gap-x-3 py-3 text-sm">
          <Icon className="mt-0.5 size-5 text-jade" aria-hidden />
          <dt className="font-semibold">{label}</dt>
          <dd className="min-w-0 text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
