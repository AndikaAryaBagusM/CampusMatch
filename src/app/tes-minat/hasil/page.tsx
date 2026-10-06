import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ListChecks } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { AtribusiOnet } from "@/components/tes-minat/atribusi-onet";
import { formatAngka } from "@/lib/format";
import { DESKRIPSI_TIPE, LABEL_TIPE, type Tipe } from "@/lib/riasec/item";
import { listRekomendasiJurusan } from "@/lib/riasec/profil";
import { bacaProfil, hitungProfil, kodekanProfil, SKOR_MAKS, totalProfil, urutkanTipe } from "@/lib/riasec/skor";
import { cn } from "@/lib/utils";
import { simpanProfil } from "../actions";

export const metadata: Metadata = {
  title: "Hasil Tes Minat",
  // Every result is its own URL; none should be indexed.
  robots: { index: false, follow: true },
};

export default async function HasilTesMinatPage(props: PageProps<"/tes-minat/hasil">) {
  const sp = await props.searchParams;
  // From the test form: ticked items (?i=3&i=17…). Move the scores into the
  // shareable link (?p=…) so the answers themselves never appear in it.
  if (sp.i !== undefined) {
    const dicentang = (Array.isArray(sp.i) ? sp.i : [sp.i]).map(Number).filter(Number.isInteger);
    redirect(`/tes-minat/hasil?p=${kodekanProfil(hitungProfil(dicentang))}`);
  }
  const raw = Array.isArray(sp.p) ? sp.p[0] : sp.p;
  const profil = bacaProfil(raw);
  if (raw !== undefined && !profil) redirect("/tes-minat");

  if (!profil || totalProfil(profil) === 0)
    return (
      <div className={`${kontainer} max-w-3xl py-10`}>
        <Panel>
          <EmptyState icon={ListChecks} title="Belum ada kegiatan yang dicentang">
            Centang kegiatan kerja yang ingin kamu lakukan untuk melihat hasilnya.{" "}
            <Link href="/tes-minat" className="font-semibold text-primary hover:underline">
              Mulai Tes Minat
            </Link>
          </EmptyState>
        </Panel>
      </div>
    );

  const urutan = urutkanTipe(profil);
  const teratas = urutan.slice(0, 3);
  const adaSeri = teratas.some((t) => t.seri);
  const rekomendasi = await withDb((db) => listRekomendasiJurusan(db, profil, 10));
  const kodeTeratas = new Set<Tipe>(teratas.map((t) => t.tipe));
  const tautan = `/tes-minat/hasil?p=${kodekanProfil(profil)}`;

  return (
    <div className={`${kontainer} max-w-4xl space-y-6 py-10`}>
      <div className="space-y-2">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">Hasil Tes Minat</h1>
        <p className="text-muted-foreground">
          Minat terkuatmu:{" "}
          <span className="font-semibold text-foreground">{teratas.map((t) => LABEL_TIPE[t.tipe]).join(", ")}</span> (
          {teratas.map((t) => t.tipe).join("")}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Profil RIASEC">
          <ul className="space-y-3">
            {urutan.map(({ tipe, skor }) => (
              <li key={tipe}>
                <div className="flex justify-between text-sm">
                  <span className={cn(kodeTeratas.has(tipe) && "font-semibold")}>
                    {LABEL_TIPE[tipe]} ({tipe})
                  </span>
                  <span className="text-muted-foreground">
                    {skor} dari {SKOR_MAKS}
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-sm bg-secondary" aria-hidden>
                  <div
                    className={cn("h-full rounded-sm", kodeTeratas.has(tipe) ? "bg-primary" : "bg-primary/40")}
                    style={{ width: `${(skor / SKOR_MAKS) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          {adaSeri ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Ada minat dengan skor sama. Pilih yang kegiatannya paling cocok denganmu; urutan di atas hanya mengikuti
              urutan RIASEC.
            </p>
          ) : null}
        </Panel>

        <Panel title="Arti minat terkuatmu">
          <dl className="space-y-3 text-sm">
            {teratas.map(({ tipe }) => (
              <div key={tipe}>
                <dt className="font-semibold">
                  {LABEL_TIPE[tipe]} ({tipe})
                </dt>
                <dd className="text-muted-foreground">{DESKRIPSI_TIPE[tipe]}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel title="Rekomendasi Jurusan">
        <p className="mb-4 text-sm text-muted-foreground">
          Jurusan yang Kode RIASEC-nya paling cocok dengan minatmu. Ini gambaran minat, bukan ukuran bakat atau peluang
          diterima. Buka Jurusan untuk melihat Prodi-nya di setiap Kampus.
        </p>
        {rekomendasi.length === 0 ? (
          <p className="text-sm text-muted-foreground">Kode RIASEC Jurusan belum tersedia.</p>
        ) : (
          <ol className="divide-y divide-border">
            {rekomendasi.map((j, i) => (
              <li key={j.slug}>
                <Link
                  href={`/jurusan/${j.slug}`}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-secondary/60 sm:px-2"
                >
                  <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{j.nama}</span>
                    <span className="text-sm text-muted-foreground">{formatAngka(j.jumlahProdi)} Prodi</span>
                  </span>
                  <span className="flex shrink-0 gap-1" aria-label={`Kode RIASEC ${j.kode.join("")}`}>
                    {j.kode.map((t) => (
                      <span
                        key={t}
                        title={LABEL_TIPE[t]}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-md text-xs font-semibold",
                          kodeTeratas.has(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <Panel title="Simpan atau bagikan">
        <div className="grid gap-6 md:grid-cols-2">
          <form action={simpanProfil} className="space-y-2">
            <input type="hidden" name="p" value={kodekanProfil(profil)} />
            <button type="submit" className="h-10 rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Simpan ke akun
            </button>
            <p className="text-xs text-muted-foreground">
              Hanya untuk usia 18 tahun ke atas. Yang disimpan hanya enam skor di atas dan tanggalnya, bukan jawabanmu.
            </p>
          </form>
          <div className="space-y-2">
            <label htmlFor="tautan" className="text-sm font-semibold">
              Tautan hasil
            </label>
            <input
              id="tautan"
              readOnly
              value={tautan}
              className="h-10 w-full rounded-sm border border-input bg-secondary/50 px-3 text-sm"
            />
            <p className="text-xs text-muted-foreground">Tautan ini memuat skormu saja; kami tidak menyimpannya.</p>
          </div>
        </div>
      </Panel>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tes ini terjemahan dan adaptasi CampusMatch atas O*NET® Interest Profiler Short Form dan belum divalidasi untuk
          pelajar Indonesia. Gunakan hasilnya sebagai bahan diskusi, misalnya dengan guru BK, bukan sebagai keputusan.
        </p>
        <AtribusiOnet />
      </div>
    </div>
  );
}
