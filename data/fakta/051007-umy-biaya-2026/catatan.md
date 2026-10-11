# Catatan untuk pemeriksa

- **Tidak ada arsip Wayback (`arsip_url` kosong).** admisi.umy.ac.id menolak unduhan non-peramban (403), dan Wayback Save Page Now gagal dengan HTTP 520 untuk PDF dan untuk halaman "Biaya Kuliah" (dicoba dua kali pada 2026-10-11). PDF ditautkan dari https://admisi.umy.ac.id/biaya-kuliah/ ("BIAYA KULIAH MAHASISWA BARU TA. 2026/2027"). Pemeriksa perlu membukanya di peramban.
- Isi PDF "Perkiraan Biaya Kuliah Mahasiswa Baru UMY Tahun Akademik 2026/2027":
  - Untuk tiap Prodi, biaya kuliah semester 1–8, masing-masing dibagi Termin 1 dan Termin 2 (D3: semester 1–6).
  - S1 Kedokteran, Keperawatan, Farmasi dan Kedokteran Gigi hanya punya satu nominal per semester (Kedokteran: semester 1–7).
  - Keterangan PDF: "Biaya kuliah semester 1 dan semester 2 berdasarkan ketentuan jumlah SKS yang telah ditetapkan oleh program studi. Mulai semester 3 dan seterusnya, biaya perkuliahan disesuaikan dengan jumlah SKS yang diambil mahasiswa."
- **Keputusan pengguna (2026-10-11): catat semua semester.** Setiap nominal satu baris `spp` per semester, dengan label "Perkiraan semester N, termin T" (atau "Perkiraan semester N"). Nominal tidak pernah dijumlahkan. Kata "Perkiraan" dipertahankan di label karena PDF menyebut semuanya perkiraan.
- PDF tidak memuat uang pangkal (DPP) atau biaya pendaftaran, jadi keduanya tidak dicatat.
- Teks PDF dibaca dengan posisi tiap kata (pdf.js), karena hasil `pdftotext -layout` menggeser baris (nominal S1 Teknik Sipil tampil di baris Kelas Internasional). Contoh untuk dicek: S1 Teknik Sipil semester 1 = Rp7.195.000 (termin 1) dan Rp7.400.000 (termin 2); S1 Kedokteran semester 1 = Rp108.266.000.
- Tidak dicatat:
  - Kelas Internasional (IMaBS, IPAcc, IPIEF, IPIREL, IGOV, IP-COS, IPOLS, IPICOM, Teknik Sipil Kelas Internasional);
  - Prodi yang tidak ada di katalog: S1 Kecerdasan Buatan, S1 Bisnis Digital, S1 Pendidikan Kepelatihan Olahraga.
- "Kelas Reguler" dihapus dari nama saat dicocokkan ke katalog.
- Nama lain yang berbeda dengan katalog:
- S1 Ekonomi Syariah = S1 Ekonomi Syari'ah
- Prodi katalog yang tidak ada di PDF: D3 Budidaya Perikanan Air Tawar, D3 Sekretari, D3 Teknik Lingkungan, D4 Akuntansi Lembaga Keuangan Syariah.
- Draf: 372 baris biaya, 26 Prodi.
