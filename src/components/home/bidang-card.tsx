import Link from "next/link";
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
import { formatAngka } from "@/lib/format";
import type { BidangSorotan } from "@/lib/katalog";

// Icon and colour per bidang (the values in the exports' nm_kel_bidang).
export const GAYA_BIDANG: Record<string, { icon: LucideIcon; warna: string }> = {
  Pendidikan: { icon: School, warna: "#e8a400" },
  Teknik: { icon: Wrench, warna: "#1f4e9c" },
  Sosial: { icon: Users, warna: "#7a5af5" },
  Ekonomi: { icon: Banknote, warna: "#16a06a" },
  Kesehatan: { icon: HeartPulse, warna: "#d7263d" },
  Pertanian: { icon: Sprout, warna: "#5b8c12" },
  Agama: { icon: BookOpen, warna: "#0f8b8d" },
  MIPA: { icon: FlaskConical, warna: "#2a7de1" },
  Humaniora: { icon: Languages, warna: "#e36414" },
  Seni: { icon: Palette, warna: "#c2185b" },
};
const BAWAAN = { icon: Layers, warna: "#5f6b7a" };

export function gayaBidang(bidang: string) {
  return GAYA_BIDANG[bidang] ?? BAWAAN;
}

export function idBidang(bidang: string) {
  return `bidang-${bidang.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

// Frame B's subject card: icon, title, count, then a numbered top-5 list.
export function BidangCard({ data }: { data: BidangSorotan }) {
  const { icon: Icon, warna } = gayaBidang(data.bidang);
  return (
    <article id={idBidang(data.bidang)} className="flex scroll-mt-24 flex-col rounded-xl bg-white p-5 ring-1 ring-border">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">{data.bidang}</h3>
          <p className="text-sm text-muted-foreground">{formatAngka(data.jumlahProdi)} Prodi</p>
        </div>
        <span
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: warna }}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">Jurusan dengan Prodi terbanyak</p>
      <ol className="divide-y divide-border">
        {data.jurusan.map((j, i) => (
          <li key={j.slug}>
            <Link href={`/jurusan/${j.slug}`} className="group flex items-center gap-3 py-2 text-sm">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs text-muted-foreground ring-1 ring-border">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 group-hover:text-primary group-hover:underline">{j.nama}</span>
              <span className="text-xs text-muted-foreground">{formatAngka(j.jumlahProdi)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
