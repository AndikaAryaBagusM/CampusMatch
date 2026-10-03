import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, GraduationCap, Hash, Landmark, MapPin, MessageSquareText, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FactList } from "@/components/fact-list";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusHeader } from "@/components/kampus/kampus-header";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { kontainer, Panel } from "@/components/panel";
import { TombolTulis } from "@/components/ulasan/tombol-tulis";
import { RingkasanUlasan } from "@/components/ulasan/ringkasan-ulasan";
import { DaftarUlasan } from "@/components/ulasan/ulasan-card";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { loadKampus } from "./data";

// Render on first visit, cache for a day; Ulasan changes revalidate it
// (src/lib/ulasan/revalidasi.ts).
export const revalidate = 86400;
const ULASAN_TAMPIL = 3;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/kampus/[slug]">): Promise<Metadata> {
  const data = await loadKampus((await params).slug, ULASAN_TAMPIL);
  if (!data) return {};
  const { kampus } = data;
  return {
    title: kampus.nama,
    description: `${kampus.nama} di ${kampus.kotaNama}: ${labelAkreditasi(kampus.akreditasi).toLowerCase()}, daftar Prodi D3, D4 dan S1.`,
    alternates: { canonical: `/kampus/${kampus.slug}` },
  };
}

export default async function KampusPage({ params }: PageProps<"/kampus/[slug]">) {
  const data = await loadKampus((await params).slug, ULASAN_TAMPIL);
  if (!data) notFound();
  const { kampus, prodiPerJenjang, jumlahUlasan, info, ringkasan, ulasan } = data;

  return (
    <div className={kontainer}>
      <KampusHeader kampus={kampus} prodiPerJenjang={prodiPerJenjang} jumlahUlasan={jumlahUlasan} info={info} tab="ringkasan" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Profil Kampus">
            <FactList
              facts={[
                { icon: Landmark, label: "Bentuk", value: kampus.bentuk },
                { icon: MapPin, label: "Kota", value: kampus.kotaNama },
                { icon: MapPin, label: "Provinsi", value: formatProvinsi(kampus.provinsi) },
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
                { icon: Hash, label: "NPSN", value: kampus.npsn },
                {
                  icon: BadgeCheck,
                  label: "Daftar Kampus Unggulan",
                  value: kampus.unggulan ? "Termasuk" : "Tidak termasuk",
                },
              ]}
            />
          </Panel>

          <Panel title="Prodi per Jenjang">
            <ul className="grid gap-3 sm:grid-cols-3">
              {prodiPerJenjang.map((j) => (
                <li key={j.jenjang}>
                  <Link
                    href={`/kampus/${kampus.slug}/prodi?jenjang=${j.jenjang}`}
                    className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-border transition-colors hover:bg-secondary"
                  >
                    <GraduationCap className="size-5 text-primary" aria-hidden />
                    <span>
                      <span className="block font-medium">{j.jenjang}</span>
                      <span className="text-sm text-muted-foreground">{formatAngka(j.jumlah)} Prodi</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <TombolTulis href={`/kampus/${kampus.slug}/tulis`} className="w-full justify-center" />
          {ringkasan ? <RingkasanUlasan ringkasan={ringkasan} /> : null}
          <Panel title="Ulasan terbaru">
            {ulasan.length === 0 ? (
              <EmptyState icon={MessageSquareText} title="Belum ada ulasan">
                Ulasan dari mahasiswa dan alumni untuk Prodi di Kampus ini akan muncul di sini.
              </EmptyState>
            ) : (
              <>
                <DaftarUlasan ulasan={ulasan} tampilkanProdi />
                <Link
                  href={`/kampus/${kampus.slug}/ulasan`}
                  className="mt-5 inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Lihat semua {formatAngka(jumlahUlasan)} ulasan
                </Link>
              </>
            )}
          </Panel>
          <KatalogAsOf info={info} className="px-1" />
        </div>
      </div>
    </div>
  );
}
