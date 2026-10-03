import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-footer text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <Wordmark inverted />
          <p className="max-w-sm text-sm text-white/85">
            Bantu kamu memilih Jurusan dan Kampus, dengan data katalog resmi dan ulasan dari mahasiswa dan
            alumni.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Jelajahi</h2>
          <ul className="space-y-2 text-sm text-white/85">
            <li>
              <Link href="/" className="hover:text-white hover:underline">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/cari" className="hover:text-white hover:underline">
                Cari
              </Link>
            </li>
            <li>
              <Link href="/#bidang" className="hover:text-white hover:underline">
                Bidang
              </Link>
            </li>
            <li>
              <Link href="/#unggulan" className="hover:text-white hover:underline">
                Daftar Kampus Unggulan
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Tentang data</h2>
          <p className="text-sm text-white/85">
            Data Kampus, Prodi dan akreditasi Kampus berasal dari ekspor resmi Kemenristekdikti.
          </p>
        </div>
      </div>
      <div className="bg-brand-deep">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm sm:px-6">© 2026 CampusMatch</div>
      </div>
    </footer>
  );
}
