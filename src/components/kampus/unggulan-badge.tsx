import { cn } from "@/lib/utils";
import { formatTanggal } from "@/lib/format";
import type { InfoKatalog } from "@/lib/katalog";

export function UnggulanBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full bg-cta px-2.5 text-xs font-medium whitespace-nowrap text-cta-foreground",
        className,
      )}
    >
      Daftar Kampus Unggulan
    </span>
  );
}

// Where the Daftar Kampus Unggulan comes from, and what it does not measure,
// so the badge doesn't read as a quality stamp.
export function UnggulanFootnote({ info, className }: { info: InfoKatalog | null; className?: string }) {
  const sumber = info?.unggulanSumber;
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      <span className="font-medium text-foreground">Daftar Kampus Unggulan.</span>{" "}
      {sumber ? (
        <>
          Sumber: {sumber}
          {info?.unggulanTanggalAmbil ? `, diambil ${formatTanggal(info.unggulanTanggalAmbil)}` : ""}.{" "}
        </>
      ) : null}
      Webometrics mengukur kehadiran web dan keluaran riset, bukan kualitas pengajaran.
    </p>
  );
}
