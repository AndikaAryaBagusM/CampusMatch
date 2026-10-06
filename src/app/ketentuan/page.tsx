import type { Metadata } from "next";
import Link from "next/link";
import { Bagian, HalamanHukum, TautanKontak } from "@/components/halaman-hukum";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: "Aturan memakai CampusMatch, menulis dan melaporkan ulasan, serta cara kami memoderasi dan menurunkan ulasan.",
  alternates: { canonical: "/ketentuan" },
};

// Describes how moderation actually works (ADR 0002, decisions.md 6–10).
// Draft until a lawyer reviews it (docs/legal-todo.md).
export default function KetentuanPage() {
  return (
    <HalamanHukum
      judul="Ketentuan Layanan"
      diperbarui="6 Oktober 2026"
      ringkas="Ketentuan ini berlaku saat kamu memakai CampusMatch, termasuk saat membaca, menulis, atau melaporkan ulasan. Dengan masuk atau mengirim ulasan, kamu menyetujui ketentuan ini dan Kebijakan Privasi."
    >
      <Bagian id="layanan" judul="1. Tentang CampusMatch">
        <p>
          CampusMatch membantu memilih Jurusan dan Kampus dengan data katalog dari ekspor resmi Kemenristekdikti dan
          ulasan dari mahasiswa dan alumni. Membaca tidak perlu akun. Untuk menulis atau melaporkan ulasan, kamu perlu
          masuk dengan Google atau tautan email.
        </p>
      </Bagian>

      <Bagian id="akun" judul="2. Akun">
        <ul>
          <li>Pakai alamat email yang kamu kendalikan dan jaga akses ke email atau akun Google-mu.</li>
          <li>Satu orang memakai satu akun. Jangan membuat akun lain untuk menghindari batasan atau keputusan Moderator.</li>
          <li>Kamu bertanggung jawab atas ulasan dan laporan yang dikirim dari akunmu.</li>
          <li>
            Tanda Terverifikasi hanya berarti kamu pernah membuktikan akses ke alamat email dengan domain Kampus itu. Tanda
            ini tidak menilai isi ulasanmu.
          </li>
        </ul>
      </Bagian>

      <Bagian id="ulasan" judul="3. Menulis ulasan">
        <p>Ulasan adalah ceritamu tentang kuliah di satu Prodi. Saat menulis ulasan, kamu menyatakan bahwa:</p>
        <ul>
          <li>kamu sedang atau pernah kuliah di Prodi itu, dan status serta tahun masuk yang kamu isi benar;</li>
          <li>ulasan ditulis berdasarkan pengalamanmu sendiri dan dengan jujur;</li>
          <li>kamu tidak dibayar atau diminta pihak mana pun untuk menulisnya.</li>
        </ul>
        <p>Satu akun hanya bisa menulis satu ulasan untuk setiap Prodi. Kamu bisa mengubah atau menghapusnya kapan saja.</p>
        <p>Ulasan tidak boleh berisi:</p>
        <ul>
          <li>SARA, ujaran kebencian, atau konten yang merendahkan kelompok tertentu;</li>
          <li>hinaan, ancaman, atau serangan pribadi;</li>
          <li>nama atau ciri yang mengenali dosen, staf, atau mahasiswa tertentu;</li>
          <li>informasi pribadi seperti nomor HP, email, alamat, atau akun media sosial;</li>
          <li>tuduhan serius terhadap orang atau lembaga tanpa dasar yang bisa dipertanggungjawabkan;</li>
          <li>promosi, tautan, jasa joki, atau spam;</li>
          <li>konten yang tidak berhubungan dengan Prodi yang diulas;</li>
          <li>konten seksual atau yang melanggar hukum.</li>
        </ul>
        <p>
          Kritik yang jujur tetap boleh, termasuk penilaian rendah, selama disampaikan tanpa melanggar aturan di atas.
        </p>
      </Bagian>

      <Bagian id="lisensi" judul="4. Hak atas ulasanmu">
        <p>
          Ulasan tetap milikmu. Dengan mengirimkannya, kamu memberi CampusMatch izin yang tidak eksklusif dan tanpa
          bayaran untuk menyimpan, menampilkan, dan meringkas ulasan itu (misalnya dalam nilai rata-rata) di
          CampusMatch selama ulasan itu tidak kamu hapus. Ulasan selalu ditampilkan tanpa namamu.
        </p>
      </Bagian>

      <Bagian id="moderasi" judul="5. Pemeriksaan dan moderasi">
        <ol>
          <li>
            Setiap ulasan baru atau yang diubah diperiksa otomatis (Screening) dengan Claude API dari Anthropic. Ulasan
            berisiko rendah langsung terbit.
          </li>
          <li>
            Ulasan yang perlu dicek atau tampak melanggar masuk Antrean Moderasi dan baru tampil setelah disetujui
            Moderator.
          </li>
          <li>
            Hanya Moderator yang bisa menolak ulasan, dan setiap penolakan disertai alasan yang bisa kamu lihat di
            halaman <Link href="/akun">Akun</Link>. Kamu bisa memperbaiki ulasan lalu mengirimkannya lagi.
          </li>
          <li>
            Jika kamu mengubah ulasan yang sudah tampil, versi lama tetap tampil sampai perubahan lolos pemeriksaan.
          </li>
          <li>Jika pemeriksaan otomatis gagal, ulasan menunggu dan tidak terbit tanpa diperiksa.</li>
        </ol>
        <p>
          Kami bisa membatasi jumlah ulasan atau laporan yang dikirim dalam waktu tertentu, dan menonaktifkan akun yang
          berulang kali melanggar ketentuan atau menyalahgunakan layanan.
        </p>
      </Bagian>

      <Bagian id="laporan" judul="6. Melaporkan ulasan">
        <p>
          Siapa pun yang masuk bisa menekan <strong>Laporkan</strong> pada ulasan yang tampil, dengan memilih alasan dan
          menambahkan catatan. Ulasan yang dilaporkan tetap tampil sampai Moderator memeriksanya. Moderator lalu bisa
          menutup laporan jika ulasan tidak melanggar, atau menurunkan ulasan jika melanggar. Identitas pelapor tidak
          ditunjukkan kepada penulis ulasan. Jangan menyalahgunakan laporan, misalnya untuk menurunkan kritik yang sah.
        </p>
      </Bagian>

      <Bagian id="penurunan" judul="7. Permintaan penurunan dari Kampus atau orang yang disebut">
        <p>
          Jika kamu mewakili Kampus, atau kamu orang yang disebut atau dikenali dalam sebuah ulasan, kirim email ke{" "}
          <TautanKontak /> dengan:
        </p>
        <ul>
          <li>tautan ke halaman ulasan dan judul ulasannya;</li>
          <li>bagian mana yang menurutmu melanggar, dan alasannya;</li>
          <li>hubunganmu dengan Kampus atau dengan orang yang disebut.</li>
        </ul>
        <p>
          Moderator memeriksa permintaan berdasarkan aturan di bagian 3. Ulasan yang melanggar akan diturunkan. Ulasan
          tidak diturunkan hanya karena berisi kritik atau penilaian rendah. Setiap keputusan Moderator dicatat beserta
          alasannya.
        </p>
      </Bagian>

      <Bagian id="data-katalog" judul="8. Data katalog dan batasan tanggung jawab">
        <ul>
          <li>
            Data Kampus, Prodi, dan akreditasi Kampus berasal dari ekspor resmi Kemenristekdikti per tanggal yang
            tertera di setiap halaman, dan bisa sudah berubah. Pastikan kembali ke sumber resmi atau ke Kampus sebelum
            mengambil keputusan.
          </li>
          <li>
            Ulasan adalah pendapat pribadi penulisnya, bukan pendapat CampusMatch. Kami memeriksa ulasan untuk aturan
            konten, tetapi tidak bisa memastikan kebenaran setiap pengalaman yang diceritakan.
          </li>
          <li>
            Daftar Kampus Unggulan diambil dari peringkat publik (Webometrics) yang mengukur kehadiran web dan keluaran
            riset, bukan kualitas pengajaran, dan tidak memengaruhi urutan hasil pencarian.
          </li>
          <li>
            CampusMatch disediakan sebagaimana adanya. Kami berusaha menjaga layanan tetap tersedia dan akurat, tetapi
            tidak menjamin layanan selalu bebas gangguan atau kesalahan.
          </li>
        </ul>
      </Bagian>

      <Bagian id="biaya-masuk" judul="9. Biaya, jalur masuk, dan beasiswa">
        <ul>
          <li>
            Biaya kuliah, jalur masuk, dan beasiswa dicatat dari dokumen atau halaman resmi Kampus (atau penyelenggara
            beasiswa) pada tanggal akses yang tertera, dan berlaku untuk tahun akademik yang tertera. Setiap angka
            menyebut sumbernya, dan sebisa mungkin salinan arsipnya.
          </li>
          <li>
            Setiap data diperiksa oleh dua orang tim CampusMatch: satu yang mencatat dan satu lagi yang mencocokkannya
            dengan sumber sebelum ditampilkan. Meski begitu, angka bisa sudah berubah atau keliru dicatat. Pastikan
            kembali ke Kampus sebelum mendaftar atau membayar.
          </li>
          <li>Data dari tahun akademik sebelumnya tetap ditampilkan dengan tanda bahwa data itu mungkin sudah berubah.</li>
          <li>
            CampusMatch tidak berafiliasi dengan Kampus mana pun dan tidak memberi penilaian atau peringkat atas biaya,
            jalur masuk, atau beasiswa.
          </li>
          <li>
            Jika kamu mewakili Kampus dan menemukan data yang keliru, kirim email ke <TautanKontak /> dengan tautan ke
            dokumen resmi yang benar.
          </li>
        </ul>
      </Bagian>

      <Bagian id="promosi" judul="10. Promosi">
        <ul>
          <li>
            Kampus bisa membayar untuk tampil di tempat berlabel <strong>Promosi</strong> di Beranda, di halaman Jurusan yang
            dibelinya, dan di hasil pencarian yang cocok dengan Jurusan itu. Promosi selalu terpisah dari daftar biasa.
          </li>
          <li>
            Promosi tidak pernah mengubah ulasan, Bintang, Tingkat Rekomendasi, atau urutan daftar dan hasil pencarian.
            Promosi tidak tampil di hasil Tes Minat, Perbandingan, halaman Prodi dan Kampus, maupun di bagian ulasan.
          </li>
          <li>
            Promosi hanya memuat data katalog Kampus dan teks singkat dari Kampus, yang diperiksa dua orang tim CampusMatch
            sebelum tampil. Tautannya mengarah ke halaman Kampus itu di CampusMatch.
          </li>
          <li>Promosi bukan rekomendasi atau penilaian dari CampusMatch atas Kampus tersebut.</li>
        </ul>
      </Bagian>

      <Bagian id="perubahan" judul="11. Perubahan ketentuan dan hukum yang berlaku">
        <p>
          Jika ketentuan ini berubah, tanggal di atas akan diperbarui. Untuk perubahan penting, kami akan memberi tahu
          lewat situs ini sebelum perubahan berlaku. Ketentuan ini tunduk pada hukum Republik Indonesia.
        </p>
        <p>
          Lihat juga <Link href="/privasi">Kebijakan Privasi</Link>. Pertanyaan tentang ketentuan ini bisa dikirim ke{" "}
          <TautanKontak />.
        </p>
      </Bagian>
    </HalamanHukum>
  );
}
