import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BookOpen, GraduationCap, Hash, Landmark, Layers, MapPin, MessageSquareText, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PanelBiayaProdi } from "@/components/fakta/biaya-masuk";
import { listBiayaKampus, listBiayaProdi } from "@/lib/fakta/kueri";
import { withDb } from "@/db";
import { FactList } from "@/components/fact-list";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge, UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { RatingSummaryPlaceholder } from "@/components/prodi/rating-summary-placeholder";
import { RingkasanUlasan } from "@/components/ulasan/ringkasan-ulasan";
import { TombolTulis } from "@/components/ulasan/tombol-tulis";
import { DaftarUlasan } from "@/components/ulasan/ulasan-card";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { countUlasanProdi, getInfoKatalog, getProdi, getRingkasanUlasan, listUlasanTerbit } from "@/lib/katalog";

// Render on first visit, cache for a day; Ulasan changes revalidate it
// (src/lib/ulasan/revalidasi.ts). No session is read here, so it stays static.
export const revalidate = 86400;
// Newest first. Paging would make the page dynamic, so it waits until a Prodi
// has this many Ulasan.
const ULASAN_TAMPIL = 50;

export function generateStaticParams() {
  return [];
}

const load = cache((slug: string) =>
  withDb(async (db) => {
    const [prodi, jumlahUlasan, info, ringkasan, ulasan] = await Promise.all([
      getProdi(db, slug),
      countUlasanProdi(db, slug),
      getInfoKatalog(db),
      getRingkasanUlasan(db, { prodiSlug: slug }),
      listUlasanTerbit(db, { prodiSlug: slug }, ULASAN_TAMPIL),
    ]);
    if (!prodi) return null;
    const [biayaProdi, biayaKampus] = await Promise.all([listBiayaProdi(db, prodi.id), listBiayaKampus(db, prodi.kampus.id)]);
    return { prodi, jumlahUlasan, info, ringkasan, ulasan, biayaProdi, biayaKampus };
  }),
);

export async function generateMetadata({ params }: PageProps<"/prodi/[slug]">): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  const { prodi } = data;
  return {
    title: `${prodi.jenjang} ${prodi.nama}, ${prodi.kampus.nama}`,
    description: `${prodi.jenjang} ${prodi.nama} di ${prodi.kampus.nama}, ${prodi.kotaNama}.`,
    alternates: { canonical: `/prodi/${prodi.slug}` },
    // Hidden from search engines until it has Ulasan.
    robots: { index: data.jumlahUlasan > 0, follow: true },
  };
}

export default async function ProdiPage({ params }: PageProps<"/prodi/[slug]">) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { prodi, jumlahUlasan, info, ringkasan, ulasan, biayaProdi, biayaKampus } = data;
  const { kampus } = prodi;

  return (
    <div className={kontainer}>
      <PageBreadcrumb
        items={[
          ...(prodi.jurusanSlug ? [{ label: prodi.jurusanNama!, href: `/jurusan/${prodi.jurusanSlug}` }] : []),
          { label: kampus.nama, href: `/kampus/${kampus.slug}` },
          { label: `${prodi.jenjang} ${prodi.nama}` },
        ]}
      />

      {/* Frame L: blue title box and data tiles, without the photo. */}
      <div className="grid gap-2 overflow-hidden rounded-xl lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-between gap-6 bg-gradient-to-br from-primary to-brand-deep p-5 text-white sm:p-7">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            {prodi.jenjang} {prodi.nama}
          </h1>
          <div className="flex items-center gap-3">
            <KampusLogo kampus={kampus} size="sm" className="ring-2 ring-white/70" />
            <div className="min-w-0">
              <Link href={`/kampus/${kampus.slug}`} className="font-medium underline-offset-4 hover:underline">
                {kampus.nama}
              </Link>
              <p className="text-sm text-white/85">
                {prodi.kotaNama}, {formatProvinsi(prodi.provinsi)}
              </p>
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <li className="flex min-h-24 flex-col justify-center rounded-lg bg-white p-4 ring-1 ring-border">
            <span className="text-xs text-muted-foreground">Akreditasi Kampus</span>
            <span className="font-medium">{kampus.akreditasi ?? labelAkreditasi(null)}</span>
          </li>
          <li className="flex min-h-24 flex-col justify-center rounded-lg bg-white p-4 ring-1 ring-border">
            <span className="text-xs text-muted-foreground">Ulasan</span>
            <span className="font-medium">{jumlahUlasan === 0 ? "Belum ada ulasan" : `${formatAngka(jumlahUlasan)} ulasan`}</span>
          </li>
        </ul>
      </div>
      {kampus.unggulan ? (
        <div className="mt-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-start">
          <UnggulanBadge className="shrink-0 self-start" />
          <UnggulanFootnote info={info} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title={`${prodi.jenjang} ${prodi.nama}`}>
            <FactList
              facts={[
                { icon: GraduationCap, label: "Jenjang", value: prodi.jenjang },
                {
                  icon: Landmark,
                  label: "Kampus",
                  value: (
                    <Link href={`/kampus/${kampus.slug}`} className="text-primary hover:underline">
                      {kampus.nama}
                    </Link>
                  ),
                },
                {
                  icon: BookOpen,
                  label: "Jurusan",
                  value: prodi.jurusanSlug ? (
                    <Link href={`/jurusan/${prodi.jurusanSlug}`} className="text-primary hover:underline">
                      {prodi.jurusanNama}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground italic">Belum dipetakan ke Jurusan</span>
                  ),
                },
                { icon: Layers, label: "Bidang", value: prodi.bidang ?? <span className="text-muted-foreground">Tidak tercantum</span> },
                { icon: Hash, label: "Kode Prodi", value: prodi.kodeProdi },
                { icon: MapPin, label: "Kota", value: `${prodi.kotaNama}, ${formatProvinsi(prodi.provinsi)}` },
                {
                  icon: ShieldCheck,
                  label: "Akreditasi Kampus",
                  value: (
                    <>
                      {labelAkreditasi(kampus.akreditasi)}
                      <span className="mt-0.5 block text-xs text-muted-foreground">Akreditasi Prodi tidak ditampilkan.</span>
                    </>
                  ),
                },
              ]}
            />
          </Panel>
          {prodi.jurusanSlug ? (
            <Link
              href={`/jurusan/${prodi.jurusanSlug}`}
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Lihat Prodi {prodi.jurusanNama} di Kampus lain
            </Link>
          ) : null}
          <PanelBiayaProdi biayaProdi={biayaProdi} biayaKampus={biayaKampus} kampus={kampus} />
          <Panel title={jumlahUlasan > 0 ? `Ulasan (${formatAngka(jumlahUlasan)})` : "Ulasan"} id="ulasan">
            {ulasan.length === 0 ? (
              <EmptyState icon={MessageSquareText} title="Belum ada ulasan">
                Kuliah atau lulus dari Prodi ini? Jadilah yang pertama menulis ulasan. Setiap ulasan diperiksa otomatis
                dan ditinjau tim kami bila perlu.
              </EmptyState>
            ) : (
              <>
                <DaftarUlasan ulasan={ulasan} />
                {jumlahUlasan > ulasan.length ? (
                  <p className="mt-5 text-sm text-muted-foreground">
                    Menampilkan {formatAngka(ulasan.length)} ulasan terbaru dari {formatAngka(jumlahUlasan)}.
                  </p>
                ) : null}
              </>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <TombolTulis href={`/prodi/${prodi.slug}/tulis`} className="w-full justify-center" />
          {ringkasan ? <RingkasanUlasan ringkasan={ringkasan} /> : <RatingSummaryPlaceholder />}
          <KatalogAsOf info={info} className="px-1" />
        </div>
      </div>
    </div>
  );
}
