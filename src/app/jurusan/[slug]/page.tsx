import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { BookOpen, SearchX } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { FilterBar, FilterChips } from "@/components/filter-bar";
import { AkreditasiBadge } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge, UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Paging } from "@/components/paging";
import { kontainer, Panel } from "@/components/panel";
import { formatAngka } from "@/lib/format";
import {
  countJurusanPerJenjang,
  countJurusanTotal,
  getInfoKatalog,
  getJurusan,
  listKampusJurusan,
  parseJenjang,
  type Jenjang,
} from "@/lib/katalog";
import { hrefWith, jumlahHalaman, param, parseHalaman } from "@/lib/url";

const PER_HALAMAN = 20;

const load = cache((slug: string, jenjang: Jenjang | null, unggulanOnly: boolean, halaman: number) =>
  withDb(async (db) => {
    const filter = { jenjang, unggulanOnly };
    const [jurusan, perJenjang, semua, tersaring, kampus, info] = await Promise.all([
      getJurusan(db, slug),
      countJurusanPerJenjang(db, slug),
      countJurusanTotal(db, slug, { jenjang: null, unggulanOnly: false }),
      countJurusanTotal(db, slug, filter),
      listKampusJurusan(db, slug, { ...filter, limit: PER_HALAMAN, offset: (halaman - 1) * PER_HALAMAN }),
      getInfoKatalog(db),
    ]);
    return jurusan ? { jurusan, perJenjang, semua, tersaring, kampus, info } : null;
  }),
);

async function resolve(props: PageProps<"/jurusan/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const rawJenjang = param(sp.jenjang);
  const jenjang = parseJenjang(rawJenjang);
  const unggulanOnly = param(sp.unggulan) === "1";
  const halaman = parseHalaman(param(sp.hal));
  const varian = Boolean(rawJenjang) || unggulanOnly || halaman > 1;
  return { slug, jenjang, unggulanOnly, halaman, varian, data: await load(slug, jenjang, unggulanOnly, halaman) };
}

export async function generateMetadata(props: PageProps<"/jurusan/[slug]">): Promise<Metadata> {
  const { slug, varian, data } = await resolve(props);
  if (!data) return {};
  const { jurusan, semua } = data;
  return {
    title: `Jurusan ${jurusan.nama}`,
    description: `${formatAngka(semua.jumlahProdi)} Prodi ${jurusan.nama} di ${formatAngka(semua.jumlahKampus)} Kampus di Indonesia.`,
    alternates: { canonical: `/jurusan/${slug}` },
    robots: varian ? { index: false, follow: true } : undefined,
  };
}

export default async function JurusanPage(props: PageProps<"/jurusan/[slug]">) {
  const { slug, jenjang, unggulanOnly, halaman, data } = await resolve(props);
  if (!data) notFound();
  const { jurusan, perJenjang, semua, tersaring, kampus, info } = data;

  const base = `/jurusan/${slug}`;
  const halamanTotal = jumlahHalaman(tersaring.jumlahKampus, PER_HALAMAN);
  if (halaman > halamanTotal) {
    redirect(hrefWith(base, { jenjang, unggulan: unggulanOnly && "1", hal: halamanTotal > 1 ? halamanTotal : null }));
  }

  return (
    <div className={kontainer}>
      <PageBreadcrumb items={[{ label: "Jurusan" }, { label: jurusan.nama }]} />

      <div className="rounded-xl bg-white p-5 ring-1 ring-border sm:p-7">
        <p className="text-sm font-medium text-primary">Jurusan</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl">{jurusan.nama}</h1>
        <p className="mt-2 text-muted-foreground">
          {formatAngka(semua.jumlahProdi)} Prodi di {formatAngka(semua.jumlahKampus)} Kampus
        </p>
        <div className="mt-4 max-w-3xl text-sm leading-relaxed">
          {jurusan.deskripsi ? (
            <p>{jurusan.deskripsi}</p>
          ) : (
            <p className="text-muted-foreground italic">Deskripsi Jurusan ini belum tersedia.</p>
          )}
        </div>
      </div>

      {semua.jumlahProdi === 0 ? (
        <Panel className="mt-6">
          <EmptyState icon={BookOpen} title="Belum ada Prodi yang dipetakan ke Jurusan ini.">
            Prodi akan muncul di sini setelah tim CampusMatch memetakannya ke Jurusan {jurusan.nama}.
          </EmptyState>
        </Panel>
      ) : (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-medium">Kampus yang menawarkan {jurusan.nama}</h2>
          <FilterBar>
            <FilterChips
              label="Jenjang"
              chips={[
                { href: hrefWith(base, { unggulan: unggulanOnly && "1" }), label: "Semua", active: !jenjang },
                ...perJenjang.map((j) => ({
                  href: hrefWith(base, { jenjang: j.jenjang, unggulan: unggulanOnly && "1" }),
                  label: `${j.jenjang} (${formatAngka(j.jumlahProdi)})`,
                  active: jenjang === j.jenjang,
                })),
              ]}
            />
            <FilterChips
              label="Kampus"
              chips={[
                { href: hrefWith(base, { jenjang }), label: "Semua Kampus", active: !unggulanOnly },
                { href: hrefWith(base, { jenjang, unggulan: "1" }), label: "Daftar Kampus Unggulan", active: unggulanOnly },
              ]}
            />
          </FilterBar>

          <p className="text-sm text-muted-foreground">
            {formatAngka(tersaring.jumlahKampus)} Kampus · {formatAngka(tersaring.jumlahProdi)} Prodi, urut abjad
          </p>

          {kampus.length === 0 ? (
            <Panel>
              <EmptyState icon={SearchX} title="Tidak ada Kampus yang cocok dengan filter ini.">
                <Link href={base} className="font-medium text-primary hover:underline">
                  Atur ulang filter
                </Link>
              </EmptyState>
            </Panel>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl bg-white ring-1 ring-border">
              {kampus.map((k) => (
                <li key={k.slug} className="flex gap-4 p-4 sm:p-5">
                  <KampusLogo kampus={k} size="sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <Link href={`/kampus/${k.slug}`} className="font-medium text-primary hover:underline">
                        {k.nama}
                      </Link>
                      <p className="text-sm text-muted-foreground">{k.kotaNama}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AkreditasiBadge akreditasi={k.akreditasi} />
                      {k.unggulan ? <UnggulanBadge /> : null}
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {k.prodi.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/prodi/${p.slug}`}
                            className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground hover:underline"
                          >
                            {p.jenjang} {p.nama}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Paging
            halaman={halaman}
            total={halamanTotal}
            href={(n) => hrefWith(base, { jenjang, unggulan: unggulanOnly && "1", hal: n > 1 ? n : null })}
          />
          <div className="space-y-2 px-1">
            <UnggulanFootnote info={info} />
            <KatalogAsOf info={info} />
          </div>
        </div>
      )}
    </div>
  );
}
