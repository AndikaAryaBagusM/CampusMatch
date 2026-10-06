import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { GarisRute } from "@/components/trayek/garis-rute";

const JELAJAHI = [
  { href: "/", label: "Beranda" },
  { href: "/cari", label: "Cari" },
  { href: "/#bidang", label: "Bidang" },
  { href: "/#unggulan", label: "Daftar Kampus Unggulan" },
  { href: "/kota", label: "Kampus per Kota" },
  { href: "/tes-minat", label: "Tes Minat" },
];

// The close of every page: the jade field, with the site's sections laid out
// as one line.
export function SiteFooter() {
  return (
    <footer className="mt-20 bg-jade text-on-jade">
      <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div className="space-y-4">
            <Wordmark inverted />
            <p className="max-w-sm text-sm leading-relaxed text-on-jade-muted">
              Bantu kamu memilih Jurusan dan Kampus, dengan data katalog resmi dan ulasan dari mahasiswa dan alumni.
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-sm font-bold">Jelajahi</h2>
              <GarisRute
                label="Jelajahi CampusMatch"
                warna="var(--on-jade-muted)"
                diJade
                arah="md"
                halte={JELAJAHI.map((j) => ({ label: j.label, href: j.href }))}
                className="text-sm [&_a]:text-on-jade"
              />
            </div>
            <div>
              <h2 className="mb-2 text-sm font-bold">Tentang data</h2>
              <p className="max-w-xl text-sm leading-relaxed text-on-jade-muted">
                Data Kampus, Prodi dan akreditasi Kampus berasal dari ekspor resmi Kemenristekdikti.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-jade-deep">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-sm sm:px-6">
          <span>© 2026 CampusMatch</span>
          <nav aria-label="Informasi hukum" className="flex gap-4">
            <Link href="/privasi" className="hover:underline">
              Kebijakan Privasi
            </Link>
            <Link href="/ketentuan" className="hover:underline">
              Ketentuan Layanan
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
