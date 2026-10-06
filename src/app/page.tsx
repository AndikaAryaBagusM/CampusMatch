import Link from "next/link";
import { withDb } from "@/db";
import { FaqList } from "@/components/faq-list";
import { GarisBidang, gayaBidang, idBidang } from "@/components/home/garis-bidang";
import { KampusUnggulanList } from "@/components/home/kampus-unggulan-list";
import { UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { kontainer } from "@/components/panel";
import { KotakPromosi } from "@/components/promosi/kotak-promosi";
import { SearchForm } from "@/components/search-form";
import { GarisRute } from "@/components/trayek/garis-rute";
import { Plat } from "@/components/trayek/plat";
import { formatAngka } from "@/lib/format";
import { getBidangSorotan, getInfoKatalog, listKampusUnggulan } from "@/lib/katalog";
import { pilihPromosi } from "@/lib/promosi";
import { cn } from "@/lib/utils";

// Catalogue data only changes on import; regenerate at most hourly.
export const revalidate = 3600;

// The Pengulas route: the real steps from finding a Prodi to a published,
// anonymous Ulasan (decisions.md 6–10).
const RUTE_PENGULAS = [
  {
    label: (
      <label htmlFor="q-besar" className="cursor-pointer decoration-2 underline-offset-4 hover:underline">
        Cari Prodi-mu
      </label>
    ),
    keterangan: "Ketik nama Prodi atau Kampus di kolom pencarian, lalu buka halaman Prodi.",
  },
  { label: "Masuk", keterangan: "Dengan Google atau tautan email. Akun hanya untuk usia 18 tahun ke atas." },
  { label: "Tulis ulasan", keterangan: "Bintang, enam Aspek, Rekomendasi, dan ceritamu sendiri." },
  { label: "Diperiksa", keterangan: "Diperiksa otomatis, lalu ditinjau tim kami bila perlu." },
  { label: "Terbit tanpa nama", keterangan: "Hanya status (mahasiswa aktif atau alumni) dan tahun masuk yang tampil." },
];

export default async function Beranda() {
  const [info, bidang, unggulan, promosi] = await withDb((db) =>
    Promise.all([getInfoKatalog(db), getBidangSorotan(db), listKampusUnggulan(db), pilihPromosi(db, { tempat: "beranda" })]),
  );

  // Jurusan that sit on more than one Bidang line, for the interchange marks.
  const pindah: Record<string, string[]> = {};
  for (const b of bidang) for (const j of b.jurusan) (pindah[j.slug] ??= []).push(b.bidang);

  return (
    <>
      <section className="bg-jade text-on-jade">
        <div className={cn(kontainer, "grid gap-10 pt-10 pb-12 sm:pt-14 lg:grid-cols-12 lg:gap-12 lg:pt-16 lg:pb-16")}>
          <div className="lg:col-span-7 lg:pt-4">
            <h1 className="max-w-[16ch] text-4xl leading-[1.04] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]">
              Temukan Jurusan dan Kampus yang tepat
            </h1>
            {info ? (
              <p className="mt-4 text-lg text-on-jade-muted sm:text-xl">
                <span className="tabular font-plate text-2xl font-bold text-on-jade sm:text-3xl">{formatAngka(info.jumlahProdi)}</span>{" "}
                Prodi di{" "}
                <span className="tabular font-plate text-2xl font-bold text-on-jade sm:text-3xl">{formatAngka(info.jumlahKampus)}</span>{" "}
                Kampus di seluruh Indonesia
              </p>
            ) : null}
            <SearchForm className="mt-8" />
            <nav aria-label="Lompat ke bidang" className="mt-6 flex flex-wrap gap-2">
              {bidang.map((b) => {
                const { warna, kode } = gayaBidang(b.bidang);
                return (
                  <Link
                    key={b.bidang}
                    href={`#${idBidang(b.bidang)}`}
                    className="inline-flex h-9 items-center gap-2 rounded-sm bg-jade-deep pr-3 pl-1 text-sm font-semibold transition-colors hover:bg-foreground"
                  >
                    <Plat warna={warna} ukuran="sm" aria-hidden>
                      {kode}
                    </Plat>
                    {b.bidang}
                  </Link>
                );
              })}
            </nav>
          </div>

          <aside
            id="rute-pengulas"
            aria-labelledby="rute-pengulas-judul"
            className="scroll-mt-24 self-start overflow-hidden rounded-md bg-card text-foreground shadow-[0_18px_40px_-20px_rgb(8_40_30/0.7)] lg:col-span-5"
          >
            <div className="flex items-center gap-2 bg-pengulas px-5 py-3 text-pengulas-foreground sm:px-6">
              <Plat warna="var(--foreground)" ukuran="sm" aria-hidden>
                P
              </Plat>
              <h2 id="rute-pengulas-judul" className="text-lg font-extrabold">
                Rute Pengulas
              </h2>
            </div>
            <div className="p-5 sm:p-6">
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Sedang atau pernah kuliah? Ceritakan Prodi-mu untuk calon mahasiswa angkatan berikutnya.
              </p>
              <GarisRute label="Langkah menulis ulasan" animasi halte={RUTE_PENGULAS} />
            </div>
          </aside>
        </div>
      </section>

      {/* One line runs down the page from the band above, with each section a station on it. */}
      <div className={kontainer}>
        <div className="relative pl-10 sm:pl-14">
          <span aria-hidden className="absolute top-0 bottom-10 left-[9px] w-(--garis) rounded-b-full bg-jade sm:left-[13px]" />

          <Stasiun id="bidang" judul="Jelajahi berdasarkan bidang">
            <p className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
              Bidang mengikuti pengelompokan dalam data Kemenristekdikti. Setiap garis menunjukkan lima Jurusan dengan Prodi
              terbanyak di bidang itu. Angka adalah jumlah Prodi.
            </p>
            <div className="mt-2 divide-y divide-border">
              {bidang.map((b) => (
                <GarisBidang key={b.bidang} data={b} pindah={pindah} />
              ))}
            </div>
          </Stasiun>

          {promosi ? (
            <div className="pt-4">
              <KotakPromosi promosi={promosi} />
            </div>
          ) : null}

          {unggulan.length > 0 ? (
            <Stasiun id="unggulan" judul="Daftar Kampus Unggulan">
              <p className="mb-5 text-sm text-muted-foreground">Urut abjad. Daftar ini tidak memengaruhi urutan hasil pencarian.</p>
              <KampusUnggulanList items={unggulan} />
              <UnggulanFootnote info={info} className="mt-4" />
            </Stasiun>
          ) : null}

          <Stasiun id="pertanyaan" judul="Pertanyaan umum">
            <div className="rounded-md bg-card px-5 py-2 ring-1 ring-foreground/10 sm:px-6">
              <FaqList
                items={[
                  {
                    tanya: "Apa bedanya Jurusan dan Prodi?",
                    jawab:
                      "Prodi adalah satu program studi di satu Kampus pada satu jenjang, misalnya S1 Informatika di Universitas Gadjah Mada. Jurusan mengelompokkan Prodi yang setara di banyak Kampus, misalnya Teknik Informatika.",
                  },
                  {
                    tanya: "Dari mana data Kampus dan Prodi berasal?",
                    jawab:
                      "Dari ekspor resmi Kemenristekdikti: data Program Studi dan data Perguruan Tinggi terakreditasi. CampusMatch memuat Prodi jenjang D3, D4 dan S1. Tanggal data tertera di halaman Kampus, Jurusan dan Prodi.",
                  },
                  {
                    tanya: "Apa arti akreditasi yang ditampilkan?",
                    jawab:
                      "Akreditasi resmi Kampus dari data pemerintah. Akreditasi per Prodi belum ditampilkan karena tidak ada di data ekspor. Jika tertulis “Akreditasi belum tersedia”, data akreditasi Kampus itu tidak ada di ekspor; itu tidak berarti Kampus tidak terakreditasi.",
                  },
                  {
                    tanya: "Apa itu Daftar Kampus Unggulan?",
                    jawab: (
                      <>
                        Daftar pilihan Kampus yang kami sorot{info?.unggulanSumber ? `, diambil dari ${info.unggulanSumber}` : ""}.
                        Webometrics mengukur kehadiran web dan keluaran riset, bukan kualitas pengajaran. Daftar ini tidak
                        memengaruhi urutan hasil pencarian.
                      </>
                    ),
                  },
                  {
                    tanya: "Bagaimana ulasan diperiksa?",
                    jawab:
                      "Setiap ulasan diperiksa otomatis dan ditinjau tim kami bila perlu. Ulasan tampil tanpa nama, hanya dengan status (mahasiswa aktif atau alumni) dan tahun masuk. Pembaca yang masuk bisa melaporkan ulasan yang melanggar aturan.",
                  },
                ]}
              />
            </div>
            <KatalogAsOf info={info} className="mt-6" />
          </Stasiun>
        </div>
      </div>
    </>
  );
}

// A section as a station on the page's line: an interchange marker on the
// rail beside its heading.
function Stasiun({ id, judul, children }: { id: string; judul: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-judul`} className="relative scroll-mt-28 pt-14">
      <span
        aria-hidden
        className="absolute top-[3.6rem] -left-[44px] size-8 rounded-full border-[6px] border-jade bg-white sm:-left-14 sm:top-[3.7rem]"
      />
      <h2 id={`${id}-judul`} className="mb-3 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
        {judul}
      </h2>
      {children}
    </section>
  );
}
