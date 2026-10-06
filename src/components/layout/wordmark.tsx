import { cn } from "@/lib/utils";

// The name on a jade route plate, led by a two-stop route mark. No stars: no
// ratings exist yet, and stars would read as a score.
export function Wordmark({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-sm px-2.5 text-lg leading-none font-extrabold tracking-tight",
        inverted ? "bg-on-jade text-jade" : "bg-jade text-on-jade",
        className,
      )}
    >
      <svg viewBox="0 0 28 16" aria-hidden className="h-4 w-7 shrink-0">
        <path d="M5 8h18" stroke="var(--pengulas)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="5" cy="8" r="4" fill="#fff" stroke="var(--foreground)" strokeWidth="2.5" />
        <circle cx="23" cy="8" r="4" fill="#fff" stroke="var(--foreground)" strokeWidth="2.5" />
      </svg>
      <span className="pt-0.5">CampusMatch</span>
    </span>
  );
}
