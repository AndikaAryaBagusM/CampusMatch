import Link from "next/link";
import { BadgeCheck, Users } from "lucide-react";
import { Panel } from "@/components/panel";
import { formatRupiah, LABEL_KATEGORI_JALUR, LABEL_TES } from "@/lib/fakta/label";
import { formatAngka } from "@/lib/format";
import { K, type EstimasiPengulas, type RingkasanAngka, type RingkasanPilihan } from "@/lib/info-biaya/estimasi";
import { LABEL_BEASISWA } from "@/lib/info-biaya/label";

// The Estimasi Pengulas (ADR 0010): what Pengulas say they paid, combined.
// Always labelled as an estimate, always apart from the official facts, and
// never a single Pengulas's answer.

export function BelumCukup({ n }: { n: number }) {
  return (
    <span className="text-muted-foreground">
      Belum cukup data ({n}/{K})
    </span>
  );
}

export function TeksAngka({ r }: { r: RingkasanAngka }) {
  if (r.median === undefined) return <BelumCukup n={r.n} />;
  return (
    <>
      <span className="font-semibold whitespace-nowrap">sekitar {formatRupiah(r.median)}</span>
      <span className="block text-xs text-muted-foreground">
        sebagian besar <span className="whitespace-nowrap">{formatRupiah(r.p25!)}</span> –{" "}
        <span className="whitespace-nowrap">{formatRupiah(r.p75!)}</span>, dari {r.n} jawaban
      </span>
    </>
  );
}

export function TeksUangPangkal({ r }: { r: EstimasiPengulas["uangPangkal"] }) {
  if (r.nTidakAda === undefined) return <BelumCukup n={r.n} />;
  const bayar = r.n - r.nTidakAda;
  return (
    <>
      <span className="block">
        {r.nTidakAda} dari {r.n} tidak membayar
      </span>
      {bayar > 0 ? (
        <span className="block text-xs text-muted-foreground">
          Yang membayar: {r.bayar?.median !== undefined ? <TeksAngka r={r.bayar} /> : `${bayar} jawaban, belum cukup untuk angka`}
        </span>
      ) : null}
    </>
  );
}

export function TeksPilihan<T extends string>({ r, label }: { r: RingkasanPilihan<T>; label: Record<T, string> }) {
  if (!r.jumlah) return <BelumCukup n={r.n} />;
  return (
    <>
      <span className="block">{r.jumlah.map((j) => `${label[j.nilai]} ${j.jumlah}`).join(" · ")}</span>
      <span className="block text-xs text-muted-foreground">dari {r.n} jawaban</span>
    </>
  );
}

export function KeteranganEstimasi() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Bukan data resmi: gabungan jawaban Pengulas tentang yang mereka bayar dan jalani, dari angkatan lima tahun terakhir.
      Setiap angka baru muncul setelah dijawab minimal {K} Pengulas, dan jawaban yang jauh dari yang lain tidak dihitung.{" "}
      <Link href="/ketentuan#estimasi-pengulas" className="text-primary hover:underline">
        Selengkapnya
      </Link>
    </p>
  );
}

export function PanelEstimasiPengulas({ estimasi, prodiSlug }: { estimasi: EstimasiPengulas; prodiSlug: string }) {
  const e = estimasi;
  const baris: [string, React.ReactNode][] = [
    ["UKT / SPP per semester", <TeksAngka key="s" r={e.biayaSemester} />],
    ["Uang Pangkal", <TeksUangPangkal key="p" r={e.uangPangkal} />],
    ["Biaya lain saat masuk", <TeksAngka key="l" r={e.biayaLainMasuk} />],
    ["Jalur Masuk", <TeksPilihan key="j" r={e.jalur} label={LABEL_KATEGORI_JALUR} />],
    ["Seleksi", <TeksPilihan key="t" r={e.tes} label={LABEL_TES} />],
    ["Beasiswa", <TeksPilihan key="b" r={e.beasiswa} label={LABEL_BEASISWA} />],
  ];
  return (
    <Panel title="Estimasi Pengulas" id="estimasi-pengulas">
      <div className="space-y-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            {e.n === 0 ? "Belum ada info biaya dari Pengulas" : `Dari ${formatAngka(e.n)} Pengulas`}
          </span>
          {e.nTerverifikasi > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-jade" aria-hidden />
              {formatAngka(e.nTerverifikasi)} Terverifikasi
            </span>
          ) : null}
          {e.angkatan ? (
            <span className="text-muted-foreground">
              angkatan {e.angkatan.dari === e.angkatan.sampai ? e.angkatan.dari : `${e.angkatan.dari}–${e.angkatan.sampai}`}
            </span>
          ) : null}
        </p>
        {e.n > 0 ? (
          <dl className="divide-y divide-border text-sm">
            {baris.map(([label, isi]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{isi}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <KeteranganEstimasi />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/prodi/${prodiSlug}/info-biaya`}
            className="inline-flex h-9 items-center rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary"
          >
            Bagikan info biaya
          </Link>
          <span className="text-xs text-muted-foreground">Kuliah atau lulus dari Prodi ini? Jawabanmu hanya tampil sebagai gabungan.</span>
        </div>
      </div>
    </Panel>
  );
}
