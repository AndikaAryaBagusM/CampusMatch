import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { BookOpen, SearchX } from "lucide-react";
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
import { TombolBandingkan } from "@/components/perbandingan/tombol-bandingkan";
import { KotakPromosi } from "@/components/promosi/kotak-promosi";
import { BarisJadwal, DaftarJadwal, KepalaJadwal, Sel, SelJadwal } from "@/components/trayek/jadwal";
import { Plat } from "@/components/trayek/plat";
import { BintangTampil } from "@/components/ulasan/bintang-tampil";
import { formatRupiah } from "@/lib/fakta/label";
import { formatTahunAkademik } from "@/lib/fakta/tahun-akademik";
import { formatAngka } from "@/lib/format";
import { namaKota } from "@/lib/kota";
import { pilihPromosi } from "@/lib/promosi";
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
    if (!jurusan) return null;
    // Never inside the list: the slot sits above it and leaves its order alone (ADR 0009).
    const promosi = await pilihPromosi(db, { tempat: "jurusan", jurusanIds: [jurusan.id] });
    return { jurusan, perJenjang, perKota, semua, tersaring, prodi, info, promosi };
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

// Departure-board columns for the Prodi list: destination, the facts, then
// the Bandingkan control.
const KOLOM_PRODI = "minmax(0,1fr) 10rem 10rem 9rem 8.5rem";

function BarisProdi({ p }: { p: ProdiJurusan }) {
  return (
    <BarisJadwal kolom={KOLOM_PRODI}>
      <div className="flex min-w-0 items-start gap-3">
        <KampusLogo kampus={p.kampus} size="sm" />
        <div className="min-w-0">
          <Link
            href={`/prodi/${p.slug}`}
            className="flex flex-wrap items-center gap-x-2 font-bold decoration-jade decoration-2 underline-offset-4 hover:underline"
          >
            <Plat warna="var(--foreground)" ukuran="sm">
              {p.jenjang}
            </Plat>
            {p.nama}
          </Link>
          <p className="text-sm">
            <Link href={`/kampus/${p.kampus.slug}`} className="underline-offset-4 hover:underline">
              {p.kampus.nama}
            </Link>
            <span className="text-muted-foreground">
              {" · "}
              <Link href={`/kota/${p.kotaSlug}`} className="underline-offset-4 hover:underline">
                {p.kotaNama}
              </Link>
            </span>
          </p>
          {p.kampus.unggulan ? <UnggulanBadge className="mt-1.5 h-5" /> : null}
        </div>
      </div>
      <SelJadwal>
        <Sel label="UKT/SPP maks. per semester" kanan>
          {p.ukt !== null && p.uktTahun !== null ? (
            <>
              <span className="tabular font-plate text-base font-bold md:text-lg">{formatRupiah(p.ukt)}</span>
              <span className="block text-xs text-muted-foreground">
                TA {formatTahunAkademik(p.uktTahun)}
                {p.uktTingkat === "kampus" ? ", berlaku se-Kampus" : null}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Biaya belum tersedia</span>
          )}
        </Sel>
        <Sel label="Akreditasi Kampus">{labelAkreditasi(p.kampus.akreditasi)}</Sel>
        <Sel label="Ulasan">
          {p.bintang !== null ? (
            <span className="inline-flex items-center gap-1.5">
              <BintangTampil nilai={p.bintang} />
              <span className="tabular font-plate text-base font-bold">
                {p.bintang.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
              </span>
              <span className="text-muted-foreground">({formatAngka(p.jumlahUlasan)})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Belum ada ulasan</span>
          )}
        </Sel>
        <div className="md:text-right">
          <TombolBandingkan slug={p.slug} label={`${p.jenjang} ${p.nama}, ${p.kampus.nama}`} />
        </div>
      </SelJadwal>
    </BarisJadwal>
  );
}

export default async function JurusanPage(props: PageProps<"/jurusan/[slug]">) {
  const { slug, pilihan, data } = await resolve(props);
  if (!data) notFound();
  const { jurusan, perJenjang, perKota, semua, tersaring, prodi, info, promosi } = data;
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

      <div>
        <div className="rounded-md bg-jade p-5 text-on-jade sm:p-7">
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">{jurusan.nama}</h1>
          <p className="mt-2 text-on-jade-muted">
            <span className="tabular font-plate text-2xl font-bold text-on-jade">{formatAngka(semua.jumlahProdi)}</span> Prodi di{" "}
            <span className="tabular font-plate text-2xl font-bold text-on-jade">{formatAngka(semua.jumlahKampus)}</span> Kampus
          </p>
        </div>
        <div className="max-w-3xl px-1 pt-4 text-sm leading-relaxed">
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
          <h2 className="text-xl font-bold">Prodi {jurusan.nama} di setiap Kampus</h2>
          {promosi ? <KotakPromosi promosi={promosi} /> : null}
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
                className="h-8 max-w-full min-w-0 rounded-sm bg-white px-3 text-sm ring-1 ring-input"
              >
                <option value="">Semua Kota</option>
                {perKota.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    {namaKota(k)} ({formatAngka(k.jumlahProdi)})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-brand-deep"
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
              {kotaDipilih ? `, di ${namaKota(kotaDipilih)}` : null}
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
                <Link href={base} className="font-semibold text-primary hover:underline">
                  Atur ulang filter
                </Link>
              </EmptyState>
            </Panel>
          ) : (
            <div>
              <KepalaJadwal kolom={KOLOM_PRODI} judul={["Prodi", "UKT maks./semester", "Akreditasi Kampus", "Ulasan", ""]} kanan={[1]} />
              <DaftarJadwal>
                {prodi.map((p) => (
                  <BarisProdi key={p.slug} p={p} />
                ))}
              </DaftarJadwal>
            </div>
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
