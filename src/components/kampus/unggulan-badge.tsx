import { cn } from "@/lib/utils";
import { formatTanggal } from "@/lib/format";
import type { InfoKatalog } from "@/lib/katalog";
import { TiketSumber } from "@/components/trayek/tiket-sumber";

// An outlined plate, so it reads as a list membership rather than a grade.
export function UnggulanBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-sm bg-card px-2 text-xs font-semibold whitespace-nowrap text-foreground ring-1 ring-foreground",
        className,
      )}
    >
      <span aria-hidden className="size-2 rounded-full bg-foreground" />
      Daftar Kampus Unggulan
    </span>
  );
}

// Where the Daftar Kampus Unggulan comes from, and what it does not measure,
// so the badge doesn't read as a quality stamp.
export function UnggulanFootnote({ info, className }: { info: InfoKatalog | null; className?: string }) {
  const sumber = info?.unggulanSumber;
  return (
    <TiketSumber stub="Unggulan" className={className}>
      {sumber ? (
        <>
          Sumber: {sumber}
          {info?.unggulanTanggalAmbil ? `, diambil ${formatTanggal(info.unggulanTanggalAmbil)}` : ""}.{" "}
        </>
      ) : null}
      Webometrics mengukur kehadiran web dan keluaran riset, bukan kualitas pengajaran.
    </TiketSumber>
  );
}
