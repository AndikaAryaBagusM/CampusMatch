import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { SearchX } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { FilterBar, FilterChips } from "@/components/filter-bar";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge, UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Paging } from "@/components/paging";
import { kontainer, Panel } from "@/components/panel";
import { BarisJadwal, DaftarJadwal, KepalaJadwal, Sel, SelJadwal } from "@/components/trayek/jadwal";
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

// Departure-board columns for the Kampus list: destination, then the facts.
const KOLOM_KAMPUS = "minmax(0,1fr) 11rem 5rem 11rem";

function BarisKampus({ k }: { k: KampusKota }) {
  return (
    <BarisJadwal kolom={KOLOM_KAMPUS}>
      <div className="flex min-w-0 items-center gap-3">
        <KampusLogo kampus={k} size="sm" />
        <div className="min-w-0">
          <Link
            href={`/kampus/${k.slug}`}
            className="font-bold decoration-jade decoration-2 underline-offset-4 hover:underline"
          >
            {k.nama}
          </Link>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {k.bentuk}
            {k.unggulan ? <UnggulanBadge className="h-5" /> : null}
          </p>
        </div>
      </div>
      <SelJadwal>
        <Sel label="Akreditasi">{labelAkreditasi(k.akreditasi)}</Sel>
        <Sel label="Prodi" angka>
          {formatAngka(k.jumlahProdi)}
        </Sel>
        <Sel label="Ulasan" className="md:pl-6">
          {k.bintang !== null ? (
            <span className="inline-flex items-center gap-1.5">
              <BintangTampil nilai={k.bintang} />
              <span className="tabular font-plate text-base font-bold">
                {k.bintang.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
              </span>
              <span className="text-muted-foreground">({formatAngka(k.jumlahUlasan)})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Belum ada ulasan</span>
          )}
        </Sel>
      </SelJadwal>
    </BarisJadwal>
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

      <div className="rounded-md bg-jade p-5 text-on-jade sm:p-7">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">Kampus di {nama}</h1>
        <p className="mt-2 text-on-jade-muted">
          {provinsi} ·{" "}
          <span className="tabular font-plate text-2xl font-bold text-on-jade">{formatAngka(kota.jumlahKampus)}</span> Kampus ·{" "}
          <span className="tabular font-plate text-2xl font-bold text-on-jade">{formatAngka(kota.jumlahProdi)}</span> Prodi
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
              <Link href={base} className="font-semibold text-primary hover:underline">
                Atur ulang filter
              </Link>
            </EmptyState>
          </Panel>
        ) : (
          <div>
            <KepalaJadwal kolom={KOLOM_KAMPUS} judul={["Kampus", "Akreditasi", "Prodi", <span key="u" className="md:pl-6">Ulasan</span>]} kanan={[2]} />
            <DaftarJadwal>
              {kampus.map((k) => (
                <BarisKampus key={k.slug} k={k} />
              ))}
            </DaftarJadwal>
          </div>
        )}

        <Paging halaman={halaman} total={halamanTotal} href={(n) => href({ hal: n > 1 ? n : null })} />

        {lain.length ? (
          <section className="pt-4" aria-labelledby="kota-lain">
            <h2 id="kota-lain" className="text-lg font-semibold">
              Kota lain di {provinsi}
            </h2>
            {/* Departure rows: each Kota a stop, with its Kampus count. */}
            <ul className="tabular mt-3 grid grid-cols-1 gap-x-8 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {lain.map((k) => (
                <li key={k.slug} className="min-w-0 border-b border-border">
                  <Link href={`/kota/${k.slug}`} className="group flex items-center gap-2.5 py-2.5 text-sm hover:bg-secondary/60">
                    <span aria-hidden className="size-3.5 shrink-0 rounded-full border-[3px] border-jade bg-white" />
                    <span className="min-w-0 flex-1 font-semibold decoration-2 underline-offset-4 group-hover:underline">{namaKota(k)}</span>
                    <span className="font-plate text-base font-bold text-muted-foreground">{formatAngka(k.jumlahKampus)}</span>
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
