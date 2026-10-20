import type { Metadata } from "next";
import Link from "next/link";
import { Bagian, HalamanHukum } from "@/components/halaman-hukum";
import { kontakEmail } from "@/lib/kontak";
import { TEKS_MAKS } from "@/lib/promosi";

export const metadata: Metadata = {
  title: "Pasang Promosi",
  description: "Cara Kampus dan bimbel memasang Promosi berbayar di CampusMatch: tempat tampil, isi, aturan, dan laporan klik.",
  alternates: { canonical: "/pasang-promosi" },
};

// For Kampus and bimbel who want to buy a Promosi (ADR 0009, 0012; decisions.md
// 17r). No prices: those are agreed per contract.
export default function PasangPromosiPage() {
  const email = kontakEmail();
  return (
    <HalamanHukum
      judul="Pasang Promosi"
      diperbarui="20 Oktober 2026"
      ringkas="Kampus dan bimbel bisa membayar untuk tampil di CampusMatch. Promosi selalu berlabel, terpisah dari daftar biasa, dan tidak pernah mengubah ulasan, Bintang, atau urutan hasil. Itu sebabnya pembaca bisa memercayai keduanya."
    >
      <Bagian id="siapa" judul="Siapa yang bisa memasang">
        <ul>
          <li>Kampus yang ada di katalog CampusMatch.</li>
          <li>Bimbel dan platform persiapan masuk perguruan tinggi, mis. kelas persiapan SNBT atau ujian mandiri.</li>
        </ul>
      </Bagian>

      <Bagian id="tempat" judul="Di mana Promosi tampil">
        <ul>
          <li>Beranda.</li>
          <li>Halaman Jurusan yang kamu pilih, dan hasil pencarian yang cocok dengan Jurusan itu.</li>
          <li>Satu Promosi per halaman. Jika beberapa Promosi membeli tempat yang sama, mereka bergantian setiap jam.</li>
          <li>Promosi tidak pernah tampil di hasil Tes Minat, Perbandingan, halaman Prodi dan Kampus, maupun di bagian ulasan.</li>
        </ul>
      </Bagian>

      <Bagian id="isi" judul="Isi Promosi">
        <ul>
          <li>
            <strong>Kampus:</strong> nama, Kota, dan akreditasi dari katalog, ditambah teks hingga {TEKS_MAKS} karakter. Tautannya mengarah ke halaman
            Kampus itu di CampusMatch.
          </li>
          <li>
            <strong>Bimbel:</strong> nama bimbel, teks hingga {TEKS_MAKS} karakter, dan satu tautan https ke situs bimbel itu. Parameter utm_ boleh
            dipakai untuk mengukur kunjungan dari CampusMatch.
          </li>
          <li>Tanpa gambar, video, skrip, atau pelacak.</li>
        </ul>
      </Bagian>

      <Bagian id="aturan" judul="Aturan teks">
        <ul>
          <li>Tidak menjanjikan lolos atau diterima di Kampus mana pun.</li>
          <li>Tidak memberi kesan didukung Kampus lain atau CampusMatch.</li>
          <li>Tanpa klaim &ldquo;terbaik&rdquo;, peringkat buatan sendiri, atau perbandingan dengan pihak lain.</li>
          <li>
            Dua orang tim CampusMatch memeriksa setiap Promosi sebelum tampil. Promosi yang sudah tampil tidak diubah; untuk mengganti teks atau
            tempat, Promosi dihentikan dan dibuat yang baru.
          </li>
        </ul>
        <p>
          Aturan lengkapnya ada di <Link href="/ketentuan#promosi">Ketentuan Layanan, bagian Promosi</Link>.
        </p>
      </Bagian>

      <Bagian id="laporan" judul="Laporan">
        <p>
          Kami menghitung jumlah klik per hari untuk setiap Promosi dan mengirimkannya tiap bulan dalam bentuk CSV. Kami tidak mencatat siapa yang
          mengeklik dan tidak memasang pelacak, jadi tidak ada data pengunjung yang bisa dibagikan.
        </p>
      </Bagian>

      <Bagian id="kontak" judul="Harga dan kontak">
        <p>
          Harga dihitung per tempat (Beranda atau satu Jurusan) per bulan dan disepakati dalam kontrak. Tulis ke{" "}
          {email ? <a href={`mailto:${email}?subject=${encodeURIComponent("Promosi")}`}>{email}</a> : <span>email kontak CampusMatch</span>} dengan
          nama lembaga, Jurusan yang diminati, dan periode tayang.
        </p>
      </Bagian>
    </HalamanHukum>
  );
}
