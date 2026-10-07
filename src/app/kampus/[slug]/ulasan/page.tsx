import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KampusHeader } from "@/components/kampus/kampus-header";
import { kontainer, Panel } from "@/components/panel";
import { RingkasanUlasan } from "@/components/ulasan/ringkasan-ulasan";
import { RuteUlasanPertama } from "@/components/ulasan/rute-ulasan-pertama";
import { TombolTulis } from "@/components/ulasan/tombol-tulis";
import { DaftarUlasan } from "@/components/ulasan/ulasan-card";
import { formatAngka } from "@/lib/format";
import { loadKampus } from "../data";

// Render on first visit, cache for a day; Ulasan changes revalidate it.
export const revalidate = 86400;
// Newest first. Paging would make the page dynamic, so it waits until a
// Kampus has this many Ulasan.
const ULASAN_TAMPIL = 50;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/kampus/[slug]/ulasan">): Promise<Metadata> {
  const data = await loadKampus((await params).slug, ULASAN_TAMPIL);
  if (!data) return {};
  return {
    title: `Ulasan ${data.kampus.nama}`,
    alternates: { canonical: `/kampus/${data.kampus.slug}/ulasan` },
    // Hidden from search engines until there is something to read.
    robots: { index: data.jumlahUlasan > 0, follow: true },
  };
}

export default async function KampusUlasanPage({ params }: PageProps<"/kampus/[slug]/ulasan">) {
  const data = await loadKampus((await params).slug, ULASAN_TAMPIL);
  if (!data) notFound();
  const { kampus, prodiPerJenjang, jumlahUlasan, qs, ringkasan, ulasan } = data;

  return (
    <div className={kontainer}>
      <KampusHeader kampus={kampus} prodiPerJenjang={prodiPerJenjang} jumlahUlasan={jumlahUlasan} qs={qs} tab="ulasan" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Ulasan" action={<TombolTulis href={`/kampus/${kampus.slug}/tulis`} />}>
          {ulasan.length === 0 ? (
            <RuteUlasanPertama dari="kampus" hrefTulis={`/kampus/${kampus.slug}/tulis`} />
          ) : (
            <>
              <DaftarUlasan ulasan={ulasan} tampilkanProdi />
              {jumlahUlasan > ulasan.length ? (
                <p className="mt-5 text-sm text-muted-foreground">
                  Menampilkan {formatAngka(ulasan.length)} ulasan terbaru dari {formatAngka(jumlahUlasan)}. Lihat
                  ulasan lain di halaman tiap Prodi.
                </p>
              ) : null}
            </>
          )}
        </Panel>
        {ringkasan ? (
          <div>
            <RingkasanUlasan ringkasan={ringkasan} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
