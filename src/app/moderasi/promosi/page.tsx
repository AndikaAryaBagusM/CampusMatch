import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { kontainer, Panel } from "@/components/panel";
import { formatAngka, formatTanggal } from "@/lib/format";
import { hitungTabModerasi } from "@/lib/moderasi-tab";
import { requireModerator } from "@/lib/moderator";
import { LABEL_KEADAAN, listPromosiModerasi, type Keadaan } from "@/lib/promosi";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Promosi",
  robots: { index: false, follow: false },
};

const GRUP: { judul: string; keadaan: Keadaan[]; kosong: string }[] = [
  { judul: "Draf (menunggu Moderator lain)", keadaan: ["draf"], kosong: "Tidak ada Draf." },
  { judul: "Tayang dan terjadwal", keadaan: ["tayang", "terjadwal"], kosong: "Tidak ada Promosi yang tayang." },
  { judul: "Selesai dan dihentikan", keadaan: ["selesai", "dihentikan"], kosong: "Belum ada." },
];

export default async function PromosiPage() {
  await requireModerator();
  const [jumlah, daftar] = await withDb((db) => Promise.all([hitungTabModerasi(db), listPromosiModerasi(db)]));

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Promosi</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Tempat berbayar untuk Kampus di Beranda, halaman Jurusan, dan pencarian, selalu berlabel Promosi. Satu Moderator
            memasukkan Draf, Moderator lain memeriksa teks dan pengaturannya lalu mengaktifkannya. Klik dihitung per hari,
            tanpa data pengunjung.
          </p>
        </div>
        <Link
          href="/moderasi/promosi/baru"
          className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-deep"
        >
          Buat Promosi
        </Link>
      </div>
      <TabModerasiNav jumlah={jumlah} aktif="promosi" />

      {GRUP.map((g) => {
        const isi = daftar.filter((p) => g.keadaan.includes(p.keadaan));
        return (
          <Panel lembar key={g.judul} title={g.judul}>
            {isi.length === 0 ? (
              <p className="text-sm text-muted-foreground">{g.kosong}</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {isi.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/moderasi/promosi/${p.id}`} className="font-semibold hover:underline">
                        {p.kampusNama}
                      </Link>
                      <span
                        className={cn(
                          "ml-2 rounded-sm px-2 py-0.5 text-xs",
                          p.keadaan === "tayang" ? "bg-emerald-100 text-emerald-900" : "bg-secondary",
                        )}
                      >
                        {LABEL_KEADAAN[p.keadaan]}
                      </span>
                      <p className="text-muted-foreground">
                        {[p.diBeranda ? "Beranda" : null, p.jurusan].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-muted-foreground sm:text-right">
                      {formatTanggal(p.mulai)} – {formatTanggal(p.selesai)}
                      <span className="block">
                        {formatAngka(p.klikTotal)} klik ({formatAngka(p.klik14)} dalam 14 hari)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
