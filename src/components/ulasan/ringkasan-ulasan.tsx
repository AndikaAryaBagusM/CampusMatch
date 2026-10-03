import { Panel } from "@/components/panel";
import { formatAngka } from "@/lib/format";
import type { RingkasanUlasan as Ringkasan } from "@/lib/katalog";
import { ASPEK } from "@/lib/ulasan/skema";
import { BintangTampil } from "./bintang-tampil";

const satuDesimal = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Average Bintang, Aspek averages and Tingkat Rekomendasi over Terbit Ulasan
// (design frame P). Kampus scores aggregate their Prodi's Ulasan (ADR 0001).
export function RingkasanUlasan({ ringkasan, className }: { ringkasan: Ringkasan; className?: string }) {
  return (
    <Panel title="Ringkasan penilaian" className={className}>
      <div className="flex items-center gap-4">
        <span className="text-4xl font-semibold">{satuDesimal(ringkasan.bintang)}</span>
        <div>
          <BintangTampil nilai={ringkasan.bintang} />
          <p className="mt-1 text-sm text-muted-foreground">dari {formatAngka(ringkasan.jumlah)} ulasan</p>
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm">
        <span className="font-semibold">{Math.round(ringkasan.tingkatRekomendasi * 100)}%</span> merekomendasikan
      </p>
      <dl className="mt-4 space-y-2">
        {ASPEK.map((a) => {
          const nilai = ringkasan.aspek[a.kolom];
          return (
            <div key={a.kolom} className="grid grid-cols-[minmax(0,1fr)_6rem_2rem] items-center gap-2 text-sm">
              <dt>{a.label}</dt>
              <dd className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden>
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(nilai / 5) * 100}%` }} />
              </dd>
              <dd className="text-right tabular-nums">{satuDesimal(nilai)}</dd>
            </div>
          );
        })}
      </dl>
    </Panel>
  );
}
