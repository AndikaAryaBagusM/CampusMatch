import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { SearchX } from "lucide-react";
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
import { BintangTampil } from "@/components/ulasan/bintang-tampil";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { getInfoKatalog } from "@/lib/katalog";
import {
  countBentukKota,
  countKampusKota,
  getKota,
  listKampusKota,
  listKotaSeprovinsi,
  namaKota,
  parseBentuk,
  slugProvinsi,
  type Bentuk,
  type KampusKota,
} from "@/lib/kota";
import { hrefWith, jumlahHalaman, param, parseHalaman } from "@/lib/url";

const PER_HALAMAN = 20;

const load = cache((slug: string, unggulanOnly: boolean, bentuk: Bentuk | null, halaman: number) =>
  withDb(async (db) => {
    const filter = { unggulanOnly, bentuk };
    const [kota, perBentuk, tersaring, kampus, info] = await Promise.all([
      getKota(db, slug),
      countBentukKota(db, slug),
      countKampusKota(db, slug, filter),
      listKampusKota(db, slug, { ...filter, limit: PER_HALAMAN, offset: (halaman - 1) * PER_HALAMAN }),
      getInfoKatalog(db),
    ]);
    if (!kota) return null;
    const lain = await listKotaSeprovinsi(db, kota.provinsi, slug);
    return { kota, perBentuk, tersaring, kampus, info, lain };
  }),
);

async function resolve(props: PageProps<"/kota/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const unggulanOnly = param(sp.unggulan) === "1";
  const bentuk = parseBentuk(param(sp.bentuk));
  const halaman = parseHalaman(param(sp.hal));
  const varian = ["unggulan", "bentuk", "hal"].some((k) => param(sp[k]));
  return { slug, unggulanOnly, bentuk, halaman, varian, data: await load(slug, unggulanOnly, bentuk, halaman) };
}

export async function generateMetadata(props: PageProps<"/kota/[slug]">): Promise<Metadata> {
  const { slug, varian, data } = await resolve(props);
  if (!data) return {};
  const nama = namaKota(data.kota);
  return {
    title: `Kampus di ${nama}`,
    description: `${formatAngka(data.kota.jumlahKampus)} Kampus dan ${formatAngka(data.kota.jumlahProdi)} Prodi di ${nama}, ${formatProvinsi(data.kota.provinsi)}.`,
    alternates: { canonical: `/kota/${slug}` },
    robots: varian ? { index: false, follow: true } : undefined,
  };
}

function BarisKampus({ k }: { k: KampusKota }) {
  return (
    <li className="flex gap-4 p-4 sm:p-5">
      <KampusLogo kampus={k} size="sm" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <Link href={`/kampus/${k.slug}`} className="font-medium text-primary hover:underline">
            {k.nama}
          </Link>
          <p className="text-sm text-muted-foreground">
            {k.bentuk} · {formatAngka(k.jumlahProdi)} Prodi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AkreditasiBadge akreditasi={k.akreditasi} />
          {k.unggulan ? <UnggulanBadge /> : null}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          {k.bintang !== null ? (
            <>
              <BintangTampil nilai={k.bintang} />
              <span>
                {k.bintang.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
                <span className="text-muted-foreground"> · {formatAngka(k.jumlahUlasan)} ulasan</span>
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Belum ada ulasan</span>
          )}
        </p>
      </div>
    </li>
  );
}

export default async function KotaPage(props: PageProps<"/kota/[slug]">) {
  const { slug, unggulanOnly, bentuk, halaman, data } = await resolve(props);
  if (!data) notFound();
  const { kota, perBentuk, tersaring, kampus, info, lain } = data;
  const nama = namaKota(kota);
  const provinsi = formatProvinsi(kota.provinsi);

  const base = `/kota/${slug}`;
  const href = (ubah: Record<string, string | number | null | false> = {}) =>
    hrefWith(base, { unggulan: unggulanOnly && "1", bentuk, ...ubah });
  const halamanTotal = jumlahHalaman(tersaring, PER_HALAMAN);
  if (halaman > halamanTotal) redirect(href({ hal: halamanTotal > 1 ? halamanTotal : null }));

  return (
    <div className={kontainer}>
      <PageBreadcrumb
        items={[{ label: "Kota", href: "/kota" }, { label: provinsi, href: `/kota#provinsi-${slugProvinsi(kota.provinsi)}` }, { label: nama }]}
      />

      <div className="rounded-xl bg-white p-5 ring-1 ring-border sm:p-7">
        <p className="text-sm font-medium text-primary">{provinsi}</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl">Kampus di {nama}</h1>
        <p className="mt-2 text-muted-foreground">
          {formatAngka(kota.jumlahKampus)} Kampus · {formatAngka(kota.jumlahProdi)} Prodi
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <FilterBar>
          <FilterChips
            label="Kampus"
            chips={[
              { href: href({ unggulan: null }), label: "Semua Kampus", active: !unggulanOnly },
              { href: href({ unggulan: "1" }), label: "Daftar Kampus Unggulan", active: unggulanOnly },
            ]}
          />
          {perBentuk.length > 1 ? (
            <FilterChips
              label="Bentuk"
              chips={[
                { href: href({ bentuk: null }), label: "Semua", active: !bentuk },
                ...perBentuk.map((b) => ({
                  href: href({ bentuk: b.bentuk }),
                  label: `${b.bentuk} (${formatAngka(b.jumlah)})`,
                  active: bentuk === b.bentuk,
                })),
              ]}
            />
          ) : null}
        </FilterBar>

        <p className="text-sm text-muted-foreground">{formatAngka(tersaring)} Kampus, urut abjad</p>

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
              <BarisKampus key={k.slug} k={k} />
            ))}
          </ul>
        )}

        <Paging halaman={halaman} total={halamanTotal} href={(n) => href({ hal: n > 1 ? n : null })} />

        {lain.length ? (
          <section className="pt-4" aria-labelledby="kota-lain">
            <h2 id="kota-lain" className="text-lg font-medium">
              Kota lain di {provinsi}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lain.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={`/kota/${k.slug}`}
                    className="inline-flex h-8 items-center rounded-full bg-white px-3 text-sm ring-1 ring-input hover:bg-secondary"
                  >
                    {namaKota(k)}
                    <span className="ml-1.5 text-muted-foreground">{formatAngka(k.jumlahKampus)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="space-y-2 px-1">
          <UnggulanFootnote info={info} />
          <KatalogAsOf info={info} />
        </div>
      </div>
    </div>
  );
}
