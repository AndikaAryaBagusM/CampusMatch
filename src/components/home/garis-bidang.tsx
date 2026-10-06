import {
  Banknote,
  BookOpen,
  FlaskConical,
  HeartPulse,
  Languages,
  Layers,
  Palette,
  School,
  Sprout,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { GarisRute } from "@/components/trayek/garis-rute";
import { Plat } from "@/components/trayek/plat";
import { formatAngka } from "@/lib/format";
import type { BidangSorotan } from "@/lib/katalog";

// One line per bidang (the values in the exports' nm_kel_bidang): a route
// colour, a short route code for its plate, and an icon. Hues are spread so
// neighbouring lines never share a family (and none sits on the brand jade or
// the Pengulas pink); every colour keeps white text above 4.5:1 and stays
// above 3:1 against the page ground.
export const GAYA_BIDANG: Record<string, { icon: LucideIcon; warna: string; kode: string }> = {
  Pendidikan: { icon: School, warna: "#b45309", kode: "PD" },
  Teknik: { icon: Wrench, warna: "#1e3a8a", kode: "TK" },
  Sosial: { icon: Users, warna: "#86198f", kode: "SO" },
  Ekonomi: { icon: Banknote, warna: "#0e7490", kode: "EK" },
  Kesehatan: { icon: HeartPulse, warna: "#c62a36", kode: "KS" },
  Pertanian: { icon: Sprout, warna: "#4d7c0f", kode: "PT" },
  Agama: { icon: BookOpen, warna: "#9f1239", kode: "AG" },
  MIPA: { icon: FlaskConical, warna: "#4f46e5", kode: "MP" },
  Humaniora: { icon: Languages, warna: "#8a6a00", kode: "HU" },
  Seni: { icon: Palette, warna: "#7c2d12", kode: "SN" },
};
const BAWAAN = { icon: Layers, warna: "#58665f", kode: "LN" };

export function gayaBidang(bidang: string) {
  return GAYA_BIDANG[bidang] ?? BAWAAN;
}

export function idBidang(bidang: string) {
  return `bidang-${bidang.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

// A bidang as one line on the Peta Bidang: its plate and Prodi count, then
// the five Jurusan with the most Prodi as stops, in that order. A Jurusan on
// more than one line is an interchange: its stop names the other lines.
// Phones show the first three stops, with the rest behind a native <details>,
// so ten vertical lines don't bury the sections below.
export function GarisBidang({ data, pindah = {} }: { data: BidangSorotan; pindah?: Record<string, string[]> }) {
  const { warna, kode } = gayaBidang(data.bidang);
  const label = `Jurusan dengan Prodi terbanyak di bidang ${data.bidang}`;
  const halte = data.jurusan.map((j) => {
    const lain = (pindah[j.slug] ?? []).filter((b) => b !== data.bidang);
    return {
      label: j.nama,
      href: `/jurusan/${j.slug}`,
      keterangan: `${formatAngka(j.jumlahProdi)} Prodi`,
      sisipan: lain.length ? (
        <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          Juga di
          {lain.map((b) => (
            <Plat key={b} warna={gayaBidang(b).warna} ukuran="sm" title={b}>
              {gayaBidang(b).kode}
            </Plat>
          ))}
          <span className="sr-only">{lain.join(", ")}</span>
        </span>
      ) : undefined,
    };
  });
  const AWAL = 3;
  return (
    <article id={idBidang(data.bidang)} className="scroll-mt-28 py-5">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Plat warna={warna} aria-hidden>
          {kode}
        </Plat>
        <h3 className="text-xl leading-tight font-extrabold tracking-tight">{data.bidang}</h3>
        <span className="tabular font-plate text-lg font-semibold text-muted-foreground">
          {formatAngka(data.jumlahProdi)} Prodi
        </span>
      </header>
      <GarisRute arah="md" warna={warna} label={label} halte={halte} className="hidden text-sm md:flex" />
      <div className="md:hidden">
        <GarisRute warna={warna} label={label} halte={halte.slice(0, AWAL)} className="text-sm" />
        {halte.length > AWAL ? (
          <details className="group mt-4">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-sm py-1 text-sm font-bold text-jade [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{halte.length - AWAL} Jurusan lainnya</span>
              <span className="hidden group-open:inline">Sembunyikan</span>
            </summary>
            <GarisRute warna={warna} label={`${label}, lanjutan`} halte={halte.slice(AWAL)} className="mt-4 text-sm" />
          </details>
        ) : null}
      </div>
    </article>
  );
}
