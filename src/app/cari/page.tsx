import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { FilterBar, FilterChips } from "@/components/filter-bar";
import { UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { kontainer, Panel } from "@/components/panel";
import { SearchForm } from "@/components/search-form";
import { JurusanResult, KampusResult, KepalaJurusan, KepalaKampus, KepalaProdi, ProdiResult } from "@/components/search/result-row";
import { TabNav } from "@/components/tab-nav";
import { GarisRute } from "@/components/trayek/garis-rute";
import { KotakPromosi } from "@/components/promosi/kotak-promosi";
import { getInfoKatalog } from "@/lib/katalog";
import { pilihPromosi } from "@/lib/promosi";
import { MIN_QUERY_LENGTH, normalizeQuery, searchKatalog, SEARCH_TYPES, type SearchType } from "@/lib/search";
import { hrefWith, param, parseHalaman } from "@/lib/url";

const PER_HALAMAN = 20;
const PRATINJAU = 5;

type Tipe = "semua" | SearchType;
const LABEL: Record<Tipe, string> = { semua: "Semua", jurusan: "Jurusan", kampus: "Kampus", prodi: "Prodi" };

export const metadata: Metadata = {
  title: "Cari",
  robots: { index: false, follow: true },
};

export default async function CariPage(props: PageProps<"/cari">) {
  const sp = await props.searchParams;
  const q = normalizeQuery(param(sp.q) ?? "");
  // Writing mode (?tulis=1): pick the Prodi to review. Prodi results only,
  // each opening that Prodi's Ulasan form (which asks for login).
  const tulis = param(sp.tulis) === "1";
  const rawTipe = tulis ? "prodi" : param(sp.tipe);
  const tipe: Tipe = (SEARCH_TYPES as readonly string[]).includes(rawTipe ?? "") ? (rawTipe as SearchType) : "semua";
  const unggulanOnly = param(sp.unggulan) === "1";
  const halaman = tipe === "semua" ? 1 : parseHalaman(param(sp.hal));

  const href = (over: { tipe?: Tipe; unggulan?: boolean; hal?: number }) =>
    hrefWith("/cari", {
      q,
      tipe: (over.tipe ?? tipe) === "semua" ? null : (over.tipe ?? tipe),
      unggulan: (over.unggulan ?? unggulanOnly) && "1",
      tulis: tulis ? "1" : null,
      hal: over.hal && over.hal > 1 ? over.hal : null,
    });

  const cukup = q.length >= MIN_QUERY_LENGTH;
  // One extra row tells whether there is a next page, without a count query.
  const limit = tipe === "semua" ? PRATINJAU + 1 : PER_HALAMAN + 1;
  const [hasil, info] = cukup
    ? await withDb((db) =>
        Promise.all([
          searchKatalog(db, q, {
            limit,
            offset: (halaman - 1) * PER_HALAMAN,
            types: tipe === "semua" ? SEARCH_TYPES : [tipe],
            unggulanOnly,
          }),
          getInfoKatalog(db),
        ]),
      )
    : [null, null];

  // A Promosi for a Jurusan the query matches, shown above the results and
  // never among them (ADR 0009).
  const promosi = hasil?.jurusan.length
    ? await withDb((db) => pilihPromosi(db, { tempat: "jurusan", jurusanIds: hasil.jurusan.map((j) => j.id) }))
    : null;

  const tampil = tipe === "semua" ? PRATINJAU : PER_HALAMAN;
  const kosong = hasil && hasil.jurusan.length + hasil.kampus.length + hasil.prodi.length === 0;

  return (
    <div className={kontainer}>
      <div className="py-6 sm:py-8">
        <h1 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
          {tulis
            ? "Tulis ulasan: pilih Prodi-mu"
            : cukup
              ? <>Hasil untuk &ldquo;{q}&rdquo;</>
              : "Cari Jurusan, Kampus atau Prodi"}
        </h1>
        {tulis ? (
          <p className="mb-4 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
            Setiap ulasan tentang satu Prodi. Cari Prodi tempat kamu kuliah atau lulus, lalu pilih untuk mengisi
            formulirnya.
          </p>
        ) : null}
        <SearchForm
          defaultValue={q}
          autoFocus={!q}
          tersembunyi={tulis ? { tulis: "1" } : undefined}
          placeholder={tulis ? "Nama Prodi atau Kampus" : undefined}
        />
        {tulis ? (
          <GarisRute
            arah="md"
            label="Rute Pengulas"
            className="mt-6 text-sm"
            halte={[
              { label: "Cari Prodi-mu", keterangan: "Kamu di sini", keadaan: "kini" },
              { label: "Masuk", keterangan: "Berikutnya, bila belum masuk", keadaan: "nanti" },
              { label: "Tulis ulasan", keadaan: "nanti" },
              { label: "Diperiksa", keadaan: "nanti" },
              { label: "Terbit tanpa nama", keadaan: "nanti" },
            ]}
          />
        ) : null}
      </div>

      {!cukup ? (
        <Panel>
          <EmptyState icon={Search} title={q ? `Ketik minimal ${MIN_QUERY_LENGTH} huruf` : "Mulai dengan kata kunci"}>
            {tulis
              ? "Misalnya nama Prodi (Informatika, Kedokteran) atau Kampus (Universitas Gadjah Mada)."
              : "Misalnya nama Jurusan (Teknik Informatika), Kampus (Universitas Gadjah Mada) atau Prodi (Kedokteran)."}
          </EmptyState>
        </Panel>
      ) : (
        <div className="space-y-4">
          <div className={tulis ? "hidden" : undefined}>
            <TabNav
              label="Jenis hasil"
              tabs={(["semua", ...SEARCH_TYPES] as Tipe[]).map((t) => ({
                href: href({ tipe: t, hal: 1 }),
                label: LABEL[t],
                active: t === tipe,
              }))}
            />
          </div>
          <FilterBar>
            <FilterChips
              label="Kampus"
              chips={[
                { href: href({ unggulan: false, hal: 1 }), label: "Semua Kampus", active: !unggulanOnly },
                { href: href({ unggulan: true, hal: 1 }), label: "Daftar Kampus Unggulan", active: unggulanOnly },
              ]}
            />
            {unggulanOnly ? (
              <p className="text-xs text-muted-foreground">Filter ini berlaku untuk hasil Kampus dan Prodi.</p>
            ) : null}
          </FilterBar>

          {kosong && halaman > 1 ? (
            <Panel>
              <EmptyState icon={SearchX} title="Tidak ada hasil lagi di halaman ini">
                <Link href={href({ hal: 1 })} className="font-semibold text-primary hover:underline">
                  Kembali ke halaman 1
                </Link>
              </EmptyState>
            </Panel>
          ) : kosong ? (
            <Panel>
              <EmptyState icon={SearchX} title={`Tidak ada hasil untuk “${q}”`}>
                Periksa ejaan, coba kata yang lebih umum
                {unggulanOnly ? (
                  <>
                    , atau{" "}
                    <Link href={href({ unggulan: false, hal: 1 })} className="font-semibold text-primary hover:underline">
                      cari di semua Kampus
                    </Link>
                  </>
                ) : null}
                .
              </EmptyState>
            </Panel>
          ) : hasil ? (
            <>
              {promosi ? <KotakPromosi promosi={promosi} /> : null}
              <Bagian
                judul="Jurusan"
                tampil={tipe === "semua" || tipe === "jurusan"}
                jumlah={hasil.jurusan.length}
                batas={tampil}
                lihatSemua={tipe === "semua" ? href({ tipe: "jurusan", hal: 1 }) : null}
                kepala={<KepalaJurusan />}
              >
                {hasil.jurusan.slice(0, tampil).map((j) => (
                  <JurusanResult key={j.id} j={j} />
                ))}
              </Bagian>
              <Bagian
                judul="Kampus"
                tampil={tipe === "semua" || tipe === "kampus"}
                jumlah={hasil.kampus.length}
                batas={tampil}
                lihatSemua={tipe === "semua" ? href({ tipe: "kampus", hal: 1 }) : null}
                kepala={<KepalaKampus />}
              >
                {hasil.kampus.slice(0, tampil).map((k) => (
                  <KampusResult key={k.id} k={k} />
                ))}
              </Bagian>
              <Bagian
                judul="Prodi"
                tampil={tipe === "semua" || tipe === "prodi"}
                jumlah={hasil.prodi.length}
                batas={tampil}
                lihatSemua={tipe === "semua" ? href({ tipe: "prodi", hal: 1 }) : null}
                kepala={<KepalaProdi tulis={tulis} />}
              >
                {hasil.prodi.slice(0, tampil).map((p) => (
                  <ProdiResult key={p.id} p={p} tulis={tulis} />
                ))}
              </Bagian>

              {tipe !== "semua" ? (
                <SebelumBerikut
                  sebelum={halaman > 1 ? href({ hal: halaman - 1 }) : null}
                  berikut={hasil[tipe].length > PER_HALAMAN ? href({ hal: halaman + 1 }) : null}
                  halaman={halaman}
                />
              ) : null}
            </>
          ) : null}

          {unggulanOnly || hasil?.kampus.some((k) => k.unggulan) || hasil?.prodi.some((p) => p.unggulan) ? (
            <UnggulanFootnote info={info} className="px-1" />
          ) : null}
        </div>
      )}
    </div>
  );
}

function Bagian({
  judul,
  tampil,
  jumlah,
  batas,
  lihatSemua,
  kepala,
  children,
}: {
  judul: string;
  tampil: boolean;
  jumlah: number;
  batas: number;
  lihatSemua: string | null;
  kepala?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!tampil || jumlah === 0) return null;
  return (
    <section aria-label={judul} className="border-t-[3px] border-foreground">
      <h2 className="flex items-center gap-2 py-3 text-lg font-bold">
        {judul}
        <span className="tabular font-plate text-base font-bold text-muted-foreground">{jumlah}</span>
      </h2>
      {kepala}
      <ul className="divide-y divide-border border-y border-border">{children}</ul>
      {lihatSemua && jumlah > batas ? (
        <Link href={lihatSemua} className="inline-flex items-center gap-1 py-3 text-sm font-bold text-jade underline-offset-4 hover:underline">
          Lihat semua hasil {judul}
        </Link>
      ) : null}
    </section>
  );
}

function SebelumBerikut({ sebelum, berikut, halaman }: { sebelum: string | null; berikut: string | null; halaman: number }) {
  if (!sebelum && !berikut) return null;
  const tombol = "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-semibold";
  return (
    <nav aria-label="Halaman" className="flex items-center justify-between">
      {sebelum ? (
        <Link href={sebelum} className={`${tombol} text-primary hover:bg-secondary`}>
          <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <span className="text-xs text-muted-foreground">Halaman {halaman}</span>
      {berikut ? (
        <Link href={berikut} className={`${tombol} text-primary hover:bg-secondary`}>
          Berikutnya <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
