import { cn } from "@/lib/utils";

// The ticket every official figure carries: a stub naming the source type,
// then the source and its date. One component, so provenance always looks the
// same wherever it appears.
export function TiketSumber({
  stub = "Sumber",
  children,
  className,
}: {
  stub?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex w-fit max-w-full items-stretch rounded-sm bg-card text-xs ring-1 ring-border", className)}>
      <span className="flex shrink-0 items-center border-r border-dashed border-input px-2 font-plate text-[0.8rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {stub}
      </span>
      <span className="min-w-0 px-2.5 py-1.5 leading-relaxed text-muted-foreground">{children}</span>
    </p>
  );
}
