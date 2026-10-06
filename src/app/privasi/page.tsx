import type { Metadata } from "next";
import Link from "next/link";
import { Bagian, HalamanHukum, TautanKontak } from "@/components/halaman-hukum";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Data apa yang dikumpulkan CampusMatch, untuk apa, siapa yang memprosesnya, dan hakmu atas datamu.",
  alternates: { canonical: "/privasi" },
};

// Describes what the code actually does; update it with any change to what we
// collect or who processes it. Draft until a lawyer reviews it (docs/legal-todo.md).
export default function PrivasiPage() {
  return (
    <HalamanHukum
      judul="Kebijakan Privasi"
      diperbarui="6 Oktober 2026"
      ringkas="Kebijakan ini menjelaskan data apa yang dikumpulkan CampusMatch, untuk apa, siapa yang ikut memprosesnya, berapa lama disimpan, dan hakmu sebagai subjek data pribadi menurut Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)."
    >
      <Bagian id="ringkasan" judul="Ringkasnya">
        <ul>
          <li>Membaca CampusMatch tidak perlu akun dan tidak memakai cookie pelacak atau alat analitik.</li>
          <li>Kami hanya meminta data saat kamu masuk untuk menulis atau melaporkan ulasan, atau menyimpan hasil Tes Minat.</li>
          <li>Akun hanya untuk usia 18 tahun ke atas. Tes Minat bisa dikerjakan tanpa akun, dan hasilnya tidak kami simpan.</li>
          <li>Daftar Prodi yang kamu pilih untuk dibandingkan hanya tersimpan di browsermu, tidak dikirim ke kami.</li>
          <li>Ulasan tampil tanpa nama: hanya status (mahasiswa aktif atau alumni) dan tahun masuk.</li>
          <li>Teks ulasan diperiksa otomatis dengan Claude API dari Anthropic sebelum tampil.</li>
          <li>
            Kamu bisa meminta salinan, perbaikan, atau penghapusan datamu lewat <TautanKontak />.
          </li>
        </ul>
      </Bagian>

      <Bagian id="data" judul="1. Data yang kami kumpulkan">
        <p>
          <strong>Saat kamu masuk.</strong> Masuk dengan Google atau tautan email (magic link) membuat akun berisi:
        </p>
        <ul>
          <li>alamat email;</li>
          <li>nama, jika diberikan oleh Google;</li>
          <li>alamat foto profil Google (kami simpan, tetapi tidak menampilkannya di mana pun);</li>
          <li>
            untuk masuk dengan Google: ID akun Google dan token masuk yang diberikan Google, yang dibutuhkan sistem
            masuk kami;
          </li>
          <li>sesi masuk, disimpan di basis data kami dan dikenali lewat cookie sesi di browsermu;</li>
          <li>
            pernyataanmu bahwa kamu berusia 18 tahun atau lebih, dan kapan kamu menyatakannya. Kami tidak meminta tanggal
            lahir.
          </li>
        </ul>
        <p>Kami tidak meminta dan tidak menyimpan kata sandi.</p>
        <p>
          <strong>Saat kamu menulis ulasan.</strong> Kami menyimpan judul dan teks ulasan, Bintang dan nilai per aspek,
          jawaban rekomendasi, Prodi yang diulas, status (mahasiswa aktif atau alumni), dan tahun masuk yang kamu isi
          sendiri. Setiap perubahan disimpan sebagai revisi baru beserta hasil pemeriksaannya.
        </p>
        <p>
          <strong>Saat kamu melaporkan ulasan.</strong> Kami menyimpan ulasan yang dilaporkan, alasan, catatan yang kamu
          tulis, dan akunmu sebagai pelapor. Identitas pelapor tidak ditunjukkan kepada penulis ulasan.
        </p>
        <p>
          <strong>Saat kamu mengerjakan Tes Minat.</strong> Jawabanmu tidak dikirim atau disimpan sebagai jawaban. Hasilnya
          berupa enam skor yang dimuat di tautan hasil; tanpa akun, kami tidak menyimpannya. Jika kamu menekan Simpan ke
          akun, kami menyimpan enam skor itu dan tanggalnya sebagai Profil Minat di akunmu. Profil Minat hanya bisa
          kamu lihat, bisa kamu hapus kapan saja di halaman Akun, dan tidak dipakai untuk Promosi atau iklan.
        </p>
        <p>
          <strong>Saat kamu membandingkan Prodi.</strong> Prodi yang kamu pilih untuk dibandingkan disimpan di penyimpanan
          lokal browsermu (localStorage), bukan di server kami, dan bisa kamu kosongkan kapan saja. Halaman Perbandingan
          memuat Prodi itu lewat alamat tautannya, sama seperti halaman lain, tanpa dikaitkan dengan akunmu.
        </p>
        <p>
          <strong>Alamat IP dalam bentuk hash.</strong> Saat kamu menulis ulasan, melaporkan ulasan, atau meminta
          tautan masuk lewat email, kami mengubah alamat IP-mu menjadi kode hash (HMAC-SHA256 dengan kunci rahasia) yang
          tidak bisa dikembalikan menjadi alamat IP. Kode ini hanya dipakai untuk membatasi jumlah permintaan dan
          mencegah penyalahgunaan. Alamat IP aslinya tidak kami simpan.
        </p>
        <p>
          <strong>Yang tidak kami kumpulkan.</strong> Tidak ada foto, unggahan berkas, data lokasi, atau alat analitik
          dan iklan pihak ketiga.
        </p>
      </Bagian>

      <Bagian id="tujuan" judul="2. Untuk apa data dipakai">
        <ul>
          <li>Mengenali akunmu dan menjaga sesi masukmu.</li>
          <li>Menampilkan ulasanmu secara anonim di halaman Prodi dan Kampus.</li>
          <li>Menampilkan Profil Minat yang kamu simpan beserta Rekomendasi Jurusan-nya, hanya untukmu.</li>
          <li>Memastikan akun hanya dipakai oleh orang berusia 18 tahun ke atas.</li>
          <li>Memeriksa ulasan sebelum tampil (Screening) dan menangani laporan.</li>
          <li>Membatasi jumlah permintaan dan mencegah spam serta penyalahgunaan.</li>
          <li>Membalas permintaanmu tentang data pribadi.</li>
        </ul>
        <p>
          Dasar pemrosesannya adalah persetujuanmu saat masuk dan mengirim ulasan, pelaksanaan layanan yang kamu minta,
          serta kepentingan yang sah untuk menjaga keamanan dan mencegah penyalahgunaan layanan.
        </p>
      </Bagian>

      <Bagian id="anonim" judul="3. Bagaimana ulasan ditampilkan">
        <p>
          Ulasan tampil tanpa nama, email, foto, atau ID akun. Yang terlihat publik hanya isi ulasan, nilai, jawaban
          rekomendasi, status (mahasiswa aktif atau alumni), tahun masuk, dan tanggal terbit.
        </p>
        <p>
          Perlu diingat: isi ulasan, status dan tahun masuk dibaca siapa saja. Jika kamu menceritakan detail yang sangat
          khas, orang yang mengenalmu mungkin bisa menebak penulisnya. Tulislah hanya yang nyaman kamu bagikan.
        </p>
      </Bagian>

      <Bagian id="screening" judul="4. Pemeriksaan otomatis dengan Claude API">
        <p>
          Setiap ulasan baru atau yang diubah dikirim ke Claude API milik Anthropic untuk diperiksa otomatis (Screening).
          Yang dikirim hanya judul dan teks ulasan beserta nama Prodi dan Kampus, tanpa nama, email, atau ID akunmu.
          Hasilnya berupa tingkat risiko dan alasan singkat, yang kami simpan bersama ulasan.
        </p>
        <p>
          Screening tidak pernah menolak ulasan sendirian. Ulasan berisiko rendah langsung terbit; yang lain diperiksa
          Moderator, dan hanya Moderator yang bisa menolak ulasan, selalu dengan alasan. Jika Screening gagal, ulasan
          menunggu dan tidak terbit tanpa diperiksa.
        </p>
      </Bagian>

      <Bagian id="pihak" judul="5. Pihak yang ikut memproses data">
        <p>Kami memakai penyedia layanan berikut. Mereka memproses data atas nama kami untuk menjalankan CampusMatch:</p>
        <ul>
          <li>
            <strong>Vercel</strong>: menjalankan situs dan server aplikasi.
          </li>
          <li>
            <strong>Neon</strong>: basis data Postgres tempat akun, ulasan, laporan, dan riwayat moderasi disimpan.
          </li>
          <li>
            <strong>Resend</strong>: mengirim email tautan masuk ke alamat email-mu.
          </li>
          <li>
            <strong>Google</strong>: jika kamu memilih masuk dengan Google, Google memverifikasi akunmu dan memberi kami
            email, nama, dan foto profilmu.
          </li>
          <li>
            <strong>Anthropic</strong>: Claude API memeriksa teks ulasan, seperti dijelaskan di bagian 4.
          </li>
        </ul>
        <p>
          Sebagian penyedia ini menyimpan atau memproses data di server di luar Indonesia. Kami tidak menjual data
          pribadi dan tidak membagikannya untuk iklan.
        </p>
      </Bagian>

      <Bagian id="simpan" judul="6. Berapa lama data disimpan">
        <ul>
          <li>Akun dan ulasan disimpan selama akunmu ada, kecuali kamu meminta penghapusan.</li>
          <li>Profil Minat disimpan sampai kamu menghapusnya atau akunmu dihapus.</li>
          <li>
            Jika kamu menyatakan belum 18 tahun, akun yang belum pernah menulis ulasan langsung dihapus beserta datanya.
            Akun yang sudah punya ulasan dikunci, dan ulasannya tetap tampil tanpa nama sampai kamu meminta penghapusan.
          </li>
          <li>Sesi masuk berakhir setelah 30 hari. Tautan masuk lewat email berlaku 24 jam dan hanya sekali pakai.</li>
          <li>Penghitung batas permintaan (dengan IP dalam bentuk hash) dihapus otomatis setelah sekitar dua hari.</li>
          <li>
            Saat kamu menghapus ulasan dari halaman <Link href="/akun">Akun</Link>, ulasan langsung hilang dari tampilan
            publik. Catatannya masih kami simpan untuk menangani sengketa dan penyalahgunaan, sampai kamu meminta
            penghapusan permanen.
          </li>
          <li>Laporan dan riwayat keputusan Moderator disimpan untuk menjaga konsistensi moderasi.</li>
        </ul>
      </Bagian>

      <Bagian id="hak" judul="7. Hakmu menurut UU PDP">
        <p>Sebagai subjek data pribadi, kamu berhak untuk:</p>
        <ul>
          <li>mendapat informasi tentang data yang kami proses dan tujuannya;</li>
          <li>mengakses dan meminta salinan data pribadimu;</li>
          <li>memperbaiki data yang keliru atau tidak lengkap;</li>
          <li>meminta penghapusan atau pemusnahan data pribadimu;</li>
          <li>menarik persetujuan yang pernah kamu berikan;</li>
          <li>meminta penundaan atau pembatasan pemrosesan;</li>
          <li>
            mengajukan keberatan atas keputusan yang hanya didasarkan pada pemrosesan otomatis (penolakan ulasan selalu
            diputuskan oleh Moderator);
          </li>
          <li>mendapatkan datamu dalam format yang umum dipakai; dan</li>
          <li>menggugat dan menerima ganti rugi atas pelanggaran pemrosesan data pribadimu.</li>
        </ul>
      </Bagian>

      <Bagian id="permintaan" judul="8. Cara meminta salinan, perbaikan, atau penghapusan">
        <p>
          Kirim email ke <TautanKontak /> dari alamat email akunmu, lalu sebutkan apa yang kamu minta. Kami bisa meminta
          konfirmasi untuk memastikan permintaan datang dari pemilik akun.
        </p>
        <p>
          Kamu juga bisa langsung mengubah atau menghapus ulasan sendiri di halaman <Link href="/akun">Akun</Link>.
          Penghapusan akun beserta semua datanya saat ini dilakukan lewat email.
        </p>
      </Bagian>

      <Bagian id="keamanan" judul="9. Keamanan">
        <p>
          Koneksi ke CampusMatch dienkripsi (HTTPS). Akses ke basis data dan kunci rahasia dibatasi untuk tim yang
          mengelola layanan. Jika terjadi kegagalan pelindungan data pribadi, kami akan memberi tahu pihak yang
          terdampak dan otoritas yang berwenang sesuai UU PDP.
        </p>
      </Bagian>

      <Bagian id="perubahan" judul="10. Perubahan kebijakan">
        <p>
          Jika kebijakan ini berubah, tanggal di atas akan diperbarui. Untuk perubahan penting, kami akan memberi tahu
          lewat situs ini sebelum perubahan berlaku.
        </p>
        <p>
          Lihat juga <Link href="/ketentuan">Ketentuan Layanan</Link>. Pertanyaan tentang privasi bisa dikirim ke{" "}
          <TautanKontak />.
        </p>
      </Bagian>
    </HalamanHukum>
  );
}
