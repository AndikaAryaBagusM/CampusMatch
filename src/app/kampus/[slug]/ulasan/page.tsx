import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { KampusHeader } from "@/components/kampus/kampus-header";
import { kontainer, Panel } from "@/components/panel";
import { TombolTulis } from "@/components/ulasan/tombol-tulis";
import { formatAngka } from "@/lib/format";
import { loadKampus } from "../data";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/kampus/[slug]/ulasan">): Promise<Metadata> {
  const data = await loadKampus((await params).slug);
  if (!data) return {};
  return {
    title: `Ulasan ${data.kampus.nama}`,
    alternates: { canonical: `/kampus/${data.kampus.slug}/ulasan` },
    // Hidden from search engines until there is something to read.
    robots: { index: data.jumlahUlasan > 0, follow: true },
  };
}

export default async function KampusUlasanPage({ params }: PageProps<"/kampus/[slug]/ulasan">) {
  const data = await loadKampus((await params).slug);
  if (!data) notFound();
  const { kampus, prodiPerJenjang, jumlahUlasan, info } = data;

  return (
    <div className={kontainer}>
      <KampusHeader kampus={kampus} prodiPerJenjang={prodiPerJenjang} jumlahUlasan={jumlahUlasan} info={info} tab="ulasan" />
      <Panel title="Ulasan" className="mt-6" action={<TombolTulis href={`/kampus/${kampus.slug}/tulis`} />}>
        {jumlahUlasan === 0 ? (
          <EmptyState icon={MessageSquareText} title="Belum ada ulasan">
            Ulasan dari mahasiswa dan alumni untuk Prodi di {kampus.nama} akan muncul di sini. Setiap ulasan diperiksa
            sebelum ditampilkan.
          </EmptyState>
        ) : (
          <p className="text-sm text-muted-foreground">{formatAngka(jumlahUlasan)} ulasan terbit.</p>
        )}
      </Panel>
    </div>
  );
}
