import type { Metadata } from "next";
import Form from "next/form";
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
import { TombolBandingkan } from "@/components/perbandingan/tombol-bandingkan";
import { BintangTampil } from "@/components/ulasan/bintang-tampil";
import { formatRupiah } from "@/lib/fakta/label";
import { formatTahunAkademik } from "@/lib/fakta/tahun-akademik";
import { formatAngka } from "@/lib/format";
import { countJurusanPerJenjang, getInfoKatalog, getJurusan, parseJenjang } from "@/lib/katalog";
import {
  countJurusanPerKota,
  countProdiJurusan,
  listProdiJurusan,
  MIN_ULASAN_URUT,
  parseUktMaksJuta,
  parseUrut,
  TANPA_FILTER,
  UKT_MAKS_JUTA,
  type FilterProdiJurusan,
  type ProdiJurusan,
  type Urut,
} from "@/lib/prodi-jurusan";
import { hrefWith, jumlahHalaman, param, parseHalaman } from "@/lib/url";

const PER_HALAMAN = 20;

const LABEL_URUT: Record<Urut, string> = { nama: "Nama Kampus", ukt: "UKT terendah", bintang: "Bintang" };

type Pilihan = FilterProdiJurusan & { uktJuta: number | null; urut: Urut; halaman: number };

const load = cache((slug: string, kunci: string) =>
  withDb(async (db) => {
    const p = JSON.parse(kunci) as Pilihan;
    const [jurusan, perJenjang, perKota, semua, tersaring, prodi, info] = await Promise.all([
      getJurusan(db, slug),
      countJurusanPerJenjang(db, slug),
      countJurusanPerKota(db, slug),
      countProdiJurusan(db, slug, TANPA_FILTER),
      countProdiJurusan(db, slug, p),
      listProdiJurusan(db, slug, { ...p, limit: PER_HALAMAN, offset: (p.halaman - 1) * PER_HALAMAN }),
      getInfoKatalog(db),
    ]);
    return jurusan ? { jurusan, perJenjang, perKota, semua, tersaring, prodi, info } : null;
  }),
);

async function resolve(props: PageProps<"/jurusan/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const uktJuta = parseUktMaksJuta(param(sp.ukt));
  const pilihan: Pilihan = {
    jenjang: parseJenjang(param(sp.jenjang)),
    unggulanOnly: param(sp.unggulan) === "1",
    kotaSlug: param(sp.kota) || null,
    uktJuta,
    uktMaks: uktJuta === null ? null : uktJuta * 1_000_000,
    urut: parseUrut(param(sp.urut)),
    halaman: parseHalaman(param(sp.hal)),
  };
  const varian = ["jenjang", "unggulan", "kota", "ukt", "urut", "hal"].some((k) => param(sp[k]));
  return { slug, pilihan, varian, data: await load(slug, JSON.stringify(pilihan)) };
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

function BarisProdi({ p }: { p: ProdiJurusan }) {
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <KampusLogo kampus={p.kampus} size="sm" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <Link href={`/prodi/${p.slug}`} className="font-medium text-primary hover:underline">
              {p.jenjang} {p.nama}
            </Link>
            <p className="text-sm">
              <Link href={`/kampus/${p.kampus.slug}`} className="hover:underline">
                {p.kampus.nama}
              </Link>
              <span className="text-muted-foreground"> · {p.kotaNama}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AkreditasiBadge akreditasi={p.kampus.akreditasi} />
            {p.kampus.unggulan ? <UnggulanBadge /> : null}
          </div>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="sr-only">UKT</dt>
              <dd>
                {p.ukt !== null && p.uktTahun !== null ? (
                  <>
                    UKT/SPP s.d. <span className="font-medium">{formatRupiah(p.ukt)}</span> per semester
                    <span className="block text-xs text-muted-foreground">
                      TA {formatTahunAkademik(p.uktTahun)}
                      {p.uktTingkat === "kampus" ? ", berlaku se-Kampus" : null}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Biaya belum tersedia</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Ulasan</dt>
              <dd className="flex flex-wrap items-center gap-2">
                {p.bintang !== null ? (
                  <>
                    <BintangTampil nilai={p.bintang} />
                    <span>
                      {p.bintang.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
                      <span className="text-muted-foreground"> · {formatAngka(p.jumlahUlasan)} ulasan</span>
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Belum ada ulasan</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <TombolBandingkan slug={p.slug} label={`${p.jenjang} ${p.nama}, ${p.kampus.nama}`} className="self-start" />
    </li>
  );
}

export default async function JurusanPage(props: PageProps<"/jurusan/[slug]">) {
  const { slug, pilihan, data } = await resolve(props);
  if (!data) notFound();
  const { jurusan, perJenjang, perKota, semua, tersaring, prodi, info } = data;
  const { jenjang, unggulanOnly, kotaSlug, uktJuta, urut, halaman } = pilihan;

  const base = `/jurusan/${slug}`;
  // The current choices with some changed; any change returns to page 1.
  const href = (ubah: Record<string, string | number | null | false> = {}) =>
    hrefWith(base, {
      jenjang,
      unggulan: unggulanOnly && "1",
      kota: kotaSlug,
      ukt: uktJuta,
      urut: urut === "nama" ? null : urut,
      ...ubah,
    });
  const halamanTotal = jumlahHalaman(tersaring.jumlahProdi, PER_HALAMAN);
  if (halaman > halamanTotal) redirect(href({ hal: halamanTotal > 1 ? halamanTotal : null }));
  const kotaDipilih = perKota.find((k) => k.slug === kotaSlug);

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
          <h2 className="text-xl font-medium">Prodi {jurusan.nama} di setiap Kampus</h2>
          <FilterBar>
            <FilterChips
              label="Jenjang"
              chips={[
                { href: href({ jenjang: null }), label: "Semua", active: !jenjang },
                ...perJenjang.map((j) => ({
                  href: href({ jenjang: j.jenjang }),
                  label: `${j.jenjang} (${formatAngka(j.jumlahProdi)})`,
                  active: jenjang === j.jenjang,
                })),
              ]}
            />
            <FilterChips
              label="Kampus"
              chips={[
                { href: href({ unggulan: null }), label: "Semua Kampus", active: !unggulanOnly },
                { href: href({ unggulan: "1" }), label: "Daftar Kampus Unggulan", active: unggulanOnly },
              ]}
            />
            <FilterChips
              label="UKT maks."
              chips={[
                { href: href({ ukt: null }), label: "Semua", active: uktJuta === null },
                ...UKT_MAKS_JUTA.map((n) => ({ href: href({ ukt: n }), label: `≤ Rp ${n} jt`, active: uktJuta === n })),
              ]}
            />
            <Form action={base} className="flex flex-wrap items-center gap-2" aria-label="Kota">
              {jenjang ? <input type="hidden" name="jenjang" value={jenjang} /> : null}
              {unggulanOnly ? <input type="hidden" name="unggulan" value="1" /> : null}
              {uktJuta !== null ? <input type="hidden" name="ukt" value={uktJuta} /> : null}
              {urut !== "nama" ? <input type="hidden" name="urut" value={urut} /> : null}
              <label htmlFor="filter-kota" className="mr-1 text-sm text-muted-foreground">
                Kota
              </label>
              <select
                id="filter-kota"
                name="kota"
                defaultValue={kotaDipilih?.slug ?? ""}
                className="h-8 max-w-full min-w-0 rounded-full bg-white px-3 text-sm ring-1 ring-input"
              >
                <option value="">Semua Kota</option>
                {perKota.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    {k.nama} ({formatAngka(k.jumlahProdi)})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-brand-deep"
              >
                Terapkan
              </button>
            </Form>
            <FilterChips
              label="Urutkan"
              chips={(["nama", "ukt", "bintang"] as const).map((u) => ({
                href: href({ urut: u === "nama" ? null : u }),
                label: LABEL_URUT[u],
                active: urut === u,
              }))}
            />
          </FilterBar>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              {formatAngka(tersaring.jumlahProdi)} Prodi di {formatAngka(tersaring.jumlahKampus)} Kampus, urut{" "}
              {LABEL_URUT[urut].toLowerCase()}
              {kotaDipilih ? `, di ${kotaDipilih.nama}` : null}
            </p>
            {uktJuta !== null || urut === "ukt" ? (
              <p>
                UKT di sini adalah UKT/SPP tertinggi per semester dari data biaya yang sudah diperiksa.
                {uktJuta !== null ? " Prodi yang biayanya belum tersedia tidak ikut ditampilkan." : " Prodi yang biayanya belum tersedia ada di akhir."} Data
                biaya baru dikumpulkan untuk Daftar Kampus Unggulan.
              </p>
            ) : null}
            {urut === "bintang" ? (
              <p>
                Hanya Prodi dengan minimal {MIN_ULASAN_URUT} ulasan yang diurutkan menurut Bintang; sisanya menyusul
                menurut nama Kampus.
              </p>
            ) : null}
          </div>

          {prodi.length === 0 ? (
            <Panel>
              <EmptyState icon={SearchX} title="Tidak ada Prodi yang cocok dengan filter ini.">
                <Link href={base} className="font-medium text-primary hover:underline">
                  Atur ulang filter
                </Link>
              </EmptyState>
            </Panel>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl bg-white ring-1 ring-border">
              {prodi.map((p) => (
                <BarisProdi key={p.slug} p={p} />
              ))}
            </ul>
          )}

          <Paging halaman={halaman} total={halamanTotal} href={(n) => href({ hal: n > 1 ? n : null })} />
          <div className="space-y-2 px-1">
            <UnggulanFootnote info={info} />
            <KatalogAsOf info={info} />
          </div>
        </div>
      )}
    </div>
  );
}
