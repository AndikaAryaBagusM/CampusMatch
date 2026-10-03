import { cn } from "@/lib/utils";
import { formatTanggal } from "@/lib/format";
import type { InfoKatalog } from "@/lib/katalog";

export function KatalogAsOf({ info, className }: { info: InfoKatalog | null; className?: string }) {
  if (!info) return null;
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Data katalog per {formatTanggal(info.tanggalData)} · sumber: ekspor resmi Kemenristekdikti
    </p>
  );
}
