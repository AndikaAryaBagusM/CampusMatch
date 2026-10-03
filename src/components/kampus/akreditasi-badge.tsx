import { cn } from "@/lib/utils";

// Text for a Kampus akreditasi. NULL means the accreditation export has no
// entry for this Kampus: it is unknown, never "not accredited".
export function labelAkreditasi(akreditasi: string | null): string {
  if (!akreditasi) return "Akreditasi belum tersedia";
  if (akreditasi.startsWith("Terakreditasi")) return akreditasi;
  return `Akreditasi ${akreditasi}`;
}

export function AkreditasiBadge({ akreditasi, className }: { akreditasi: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        akreditasi ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {labelAkreditasi(akreditasi)}
    </span>
  );
}
