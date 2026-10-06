import { kontainer } from "@/components/panel";

// Skeleton shown while a catalogue page streams in (loading.tsx).
export function LoadingKatalog() {
  return (
    <div className={`${kontainer} animate-pulse py-4`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <div className="h-4 w-48 rounded-sm bg-muted" />
      <div className="mt-4 h-40 rounded-md bg-card ring-1 ring-foreground/10" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-72 rounded-md bg-card ring-1 ring-foreground/10" />
        <div className="h-48 rounded-md bg-card ring-1 ring-foreground/10" />
      </div>
    </div>
  );
}
