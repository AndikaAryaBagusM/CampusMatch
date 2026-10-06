import { TiketSumber } from "@/components/trayek/tiket-sumber";
import { formatTanggal } from "@/lib/format";
import type { InfoKatalog } from "@/lib/katalog";

export function KatalogAsOf({ info, className }: { info: InfoKatalog | null; className?: string }) {
  if (!info) return null;
  return (
    <TiketSumber className={className}>
      Ekspor resmi Kemenristekdikti · data katalog per {formatTanggal(info.tanggalData)}
    </TiketSumber>
  );
}
