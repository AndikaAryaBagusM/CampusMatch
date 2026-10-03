import { cn } from "@/lib/utils";

// Text wordmark. The design's logo has rating stars above it; we leave them out,
// since no ratings exist yet and stars would read as a score.
export function Wordmark({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("text-xl font-semibold tracking-tight", inverted ? "text-white" : "text-primary", className)}>
      Campus<span className={inverted ? "text-white/80" : "text-foreground"}>Match</span>
    </span>
  );
}
