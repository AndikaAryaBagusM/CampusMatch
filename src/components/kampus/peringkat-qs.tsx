import { cn } from "@/lib/utils";
import { formatTanggal } from "@/lib/format";
import type { InfoQs } from "@/lib/peringkat-qs/kueri";
import { TiketSumber } from "@/components/trayek/tiket-sumber";

// QS World University Rankings (ADR 0011): a third-party rank, shown exactly as
// QS publishes it and always with its source. Never called "terbaik".

export const judulQs = (edisi: number) => `QS World University Rankings ${edisi}`;

// An outlined plate with the rank as published ("=191", "851-900"). Plain text,
// since it often sits inside a row link; the page's QsFootnote carries the link.
export function PeringkatQsBadge({ peringkat, edisi, className }: { peringkat: string; edisi: number; className?: string }) {
  return (
    <span
      title={`${judulQs(edisi)}: ${peringkat}`}
      className={cn(
        "tabular inline-flex h-6 items-center gap-1.5 rounded-sm bg-card px-2 text-xs font-semibold whitespace-nowrap text-foreground ring-1 ring-foreground",
        className,
      )}
    >
      <span aria-hidden className="size-2 rounded-full bg-foreground" />
      <span className="sr-only">{judulQs(edisi)}: peringkat </span>
      <span aria-hidden>QS WUR {edisi} ·</span> {peringkat}
    </span>
  );
}

// The source and what QS measures, so the rank doesn't read as a verdict on a
// Prodi or on teaching.
export function QsFootnote({ qs, className }: { qs: InfoQs | null; className?: string }) {
  if (!qs) return null;
  return (
    <TiketSumber stub="QS" className={className}>
      Peringkat dari{" "}
      <a href={qs.sumberUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
        {judulQs(qs.edisi)}
      </a>
      , diambil {formatTanggal(qs.tanggalAmbil)}, ditulis seperti yang diterbitkan QS: tanda = berarti peringkat bersama, dan
      rentang seperti 851-900 adalah kelompok peringkat. QS menilai universitas secara keseluruhan, terutama dari survei
      reputasi di kalangan akademisi dan pemberi kerja, sitasi riset, dan rasio dosen terhadap mahasiswa. Peringkat ini bukan
      penilaian atas Prodi tertentu dan tidak dihitung dari ulasan di CampusMatch.
    </TiketSumber>
  );
}
