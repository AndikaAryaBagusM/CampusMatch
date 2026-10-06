import Link from "next/link";
import { withDb } from "@/db";
import { FaqList } from "@/components/faq-list";
import { BidangCard, gayaBidang, idBidang } from "@/components/home/bidang-card";
import { HeroGraphic } from "@/components/home/hero-graphic";
import { KampusUnggulanList } from "@/components/home/kampus-unggulan-list";
import { UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { kontainer, Panel } from "@/components/panel";
import { KotakPromosi } from "@/components/promosi/kotak-promosi";
import { SearchForm } from "@/components/search-form";
import { formatAngka } from "@/lib/format";
import { getBidangSorotan, getInfoKatalog, listKampusUnggulan } from "@/lib/katalog";
import { pilihPromosi } from "@/lib/promosi";

// Catalogue data only changes on import; regenerate at most hourly.
export const revalidate = 3600;

export default async function Beranda() {
  const [info, bidang, unggulan, promosi] = await withDb((db) =>
    Promise.all([getInfoKatalog(db), getBidangSorotan(db), listKampusUnggulan(db), pilihPromosi(db, { tempat: "beranda" })]),
  );

  return (
    <div className={kontainer}>
      {/* Frame B hero, with an original graphic instead of the photo. */}
      <section className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-brand-deep px-5 py-10 text-white sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Temukan Jurusan dan Kampus yang tepat</h1>
          {info ? (
            <p className="mt-3 text-white/90 sm:text-lg">
              {formatAngka(info.jumlahProdi)} Prodi di {formatAngka(info.jumlahKampus)} Kampus di seluruh Indonesia
            </p>
          ) : null}
          <SearchForm className="mt-6" />
          <nav aria-label="Lompat ke bidang" className="mt-5 flex flex-wrap gap-2">
            {bidang.map((b) => {
              const { icon: Icon } = gayaBidang(b.bidang);
              return (
                <Link
                  key={b.bidang}
                  href={`#${idBidang(b.bidang)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-medium transition-colors hover:bg-white/25"
                >
                  <Icon className="size-4" aria-hidden />
                  {b.bidang}
                </Link>
              );
            })}
          </nav>
        </div>
        <HeroGraphic className="pointer-events-none absolute -right-6 bottom-0 hidden w-80 opacity-90 lg:block xl:w-96" />
      </section>

      <section id="bidang" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-medium tracking-tight">Jelajahi berdasarkan bidang</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bidang mengikuti pengelompokan dalam data Kemenristekdikti. Angka adalah jumlah Prodi.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bidang.map((b) => (
            <BidangCard key={b.bidang} data={b} />
          ))}
        </div>
      </section>

      {promosi ? <KotakPromosi promosi={promosi} className="mt-12" /> : null}

      {unggulan.length > 0 ? (
        <section id="unggulan" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-medium tracking-tight">Daftar Kampus Unggulan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Urut abjad. Daftar ini tidak memengaruhi urutan hasil pencarian.</p>
          <div className="mt-5">
            <KampusUnggulanList items={unggulan} />
          </div>
          <UnggulanFootnote info={info} className="mt-4" />
        </section>
      ) : null}

      <Panel title="Pertanyaan umum" className="mt-12">
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
      </Panel>

      <KatalogAsOf info={info} className="mt-6 px-1" />
    </div>
  );
}
