import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight } from "lucide-react";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { getKampus, JENJANG_URUTAN, listProdiKampus } from "@/lib/katalog";

// Catalogue data only: cached like the other Kampus pages.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

// Ulasan are about one Prodi (ADR 0001), so writing from a Kampus starts by
// picking the Prodi. Every Prodi of every Kampus can be reviewed (ADR 0003).
const load = cache((slug: string) =>
  withDb(async (db) => {
    const [kampus, prodi] = await Promise.all([
      getKampus(db, slug),
      listProdiKampus(db, slug, { jenjang: null, limit: 1000, offset: 0 }),
    ]);
    return kampus ? { kampus, prodi } : null;
  }),
);

export async function generateMetadata({ params }: PageProps<"/kampus/[slug]/tulis">): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  return { title: `Tulis ulasan, ${data.kampus.nama}`, robots: { index: false, follow: true } };
}

export default async function PilihProdiPage({ params }: PageProps<"/kampus/[slug]/tulis">) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { kampus, prodi } = data;

  return (
    <div className={`${kontainer} max-w-3xl pb-6`}>
      <PageBreadcrumb items={[{ label: kampus.nama, href: `/kampus/${kampus.slug}` }, { label: "Tulis ulasan" }]} />
      <Panel>
        <h1 className="text-2xl font-medium tracking-tight">Pilih Prodi kamu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ulasan ditulis untuk satu Prodi di {kampus.nama}. Pilih Prodi tempat kamu kuliah atau lulus.
        </p>
        <div className="mt-6 space-y-6">
          {JENJANG_URUTAN.map((j) => {
            const daftar = prodi.filter((p) => p.jenjang === j);
            return daftar.length ? (
              <section key={j}>
                <h2 className="mb-2 font-medium">{j}</h2>
                <ul className="divide-y divide-border rounded-lg ring-1 ring-border">
                  {daftar.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/prodi/${p.slug}/tulis`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary"
                      >
                        <span>
                          {p.jenjang} {p.nama}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null;
          })}
        </div>
      </Panel>
    </div>
  );
}
