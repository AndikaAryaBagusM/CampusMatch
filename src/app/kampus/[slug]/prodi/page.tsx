import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { withDb } from "@/db";
import { FilterBar, FilterChips } from "@/components/filter-bar";
import { KampusHeader } from "@/components/kampus/kampus-header";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { Paging } from "@/components/paging";
import { kontainer } from "@/components/panel";
import { ProdiTable } from "@/components/prodi/prodi-table";
import { formatAngka } from "@/lib/format";
import {
  countProdiPerJenjang,
  countUlasanKampus,
  getInfoKatalog,
  getKampus,
  listProdiKampus,
  parseJenjang,
  type Jenjang,
} from "@/lib/katalog";
import { hrefWith, jumlahHalaman, param, parseHalaman } from "@/lib/url";

const PER_HALAMAN = 25;

const load = cache((slug: string, jenjang: Jenjang | null, halaman: number) =>
  withDb(async (db) => {
    const [kampus, prodiPerJenjang, jumlahUlasan, info, prodi] = await Promise.all([
      getKampus(db, slug),
      countProdiPerJenjang(db, slug),
      countUlasanKampus(db, slug),
      getInfoKatalog(db),
      listProdiKampus(db, slug, { jenjang, limit: PER_HALAMAN, offset: (halaman - 1) * PER_HALAMAN }),
    ]);
    return kampus ? { kampus, prodiPerJenjang, jumlahUlasan, info, prodi } : null;
  }),
);

async function resolve(props: PageProps<"/kampus/[slug]/prodi">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const rawJenjang = param(sp.jenjang);
  const jenjang = parseJenjang(rawJenjang);
  const halaman = parseHalaman(param(sp.hal));
  // Any filter or page beyond the first is a variant of the base list.
  const varian = Boolean(rawJenjang) || halaman > 1;
  return { slug, jenjang, halaman, varian, data: await load(slug, jenjang, halaman) };
}

export async function generateMetadata(props: PageProps<"/kampus/[slug]/prodi">): Promise<Metadata> {
  const { slug, varian, data } = await resolve(props);
  if (!data) return {};
  return {
    title: `Prodi di ${data.kampus.nama}`,
    description: `Daftar Prodi D3, D4 dan S1 di ${data.kampus.nama}, ${data.kampus.kotaNama}.`,
    alternates: { canonical: `/kampus/${slug}/prodi` },
    robots: varian ? { index: false, follow: true } : undefined,
  };
}

export default async function KampusProdiPage(props: PageProps<"/kampus/[slug]/prodi">) {
  const { slug, jenjang, halaman, data } = await resolve(props);
  if (!data) notFound();
  const { kampus, prodiPerJenjang, jumlahUlasan, info, prodi } = data;

  const base = `/kampus/${slug}/prodi`;
  const total = jenjang
    ? (prodiPerJenjang.find((j) => j.jenjang === jenjang)?.jumlah ?? 0)
    : prodiPerJenjang.reduce((s, j) => s + j.jumlah, 0);
  const halamanTotal = jumlahHalaman(total, PER_HALAMAN);
  if (halaman > halamanTotal) redirect(hrefWith(base, { jenjang, hal: halamanTotal > 1 ? halamanTotal : null }));

  return (
    <div className={kontainer}>
      <KampusHeader kampus={kampus} prodiPerJenjang={prodiPerJenjang} jumlahUlasan={jumlahUlasan} info={info} tab="prodi" />

      <div className="mt-6 space-y-4">
        <h2 className="text-xl font-bold">
          {formatAngka(total)} Prodi{jenjang ? ` ${jenjang}` : ""} di {kampus.nama}
        </h2>
        <FilterBar>
          <FilterChips
            label="Jenjang"
            chips={[
              { href: base, label: "Semua", active: !jenjang },
              ...prodiPerJenjang.map((j) => ({
                href: hrefWith(base, { jenjang: j.jenjang }),
                label: `${j.jenjang} (${formatAngka(j.jumlah)})`,
                active: jenjang === j.jenjang,
              })),
            ]}
          />
        </FilterBar>
        <ProdiTable rows={prodi} />
        <Paging
          halaman={halaman}
          total={halamanTotal}
          href={(n) => hrefWith(base, { jenjang, hal: n > 1 ? n : null })}
        />
        <KatalogAsOf info={info} className="px-1" />
      </div>
    </div>
  );
}
