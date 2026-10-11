# Catatan untuk pemeriksa

- Halaman SMB "Biaya Pendidikan", bagian "Biaya Pendidikan Tahun Akademik 2026/2027". Ada empat tab kampus: Kampus Utama (Bandung, tabel per fakultas: FTE, FRI, FIF, FEB, FKS, FIK, FIT, FK), Kampus Jakarta, Kampus Surabaya dan Kampus Purwokerto. Prodi di Jakarta, Surabaya dan Purwokerto dicocokkan ke Prodi katalog "(Kampus Jakarta)", "(Kampus Kota Surabaya)" dan "(Kampus Kabupaten Banyumas)".
- Kolom, dicatat apa adanya:
  - UP3: `uang_pangkal` sekali, label "UP3".
  - SDP2: `uang_pangkal` sekali, satu baris per kolom. Di Kampus Utama ada dua kolom: label "SDP2 (Jalur Umum)" dan "SDP2 (Jalur USM)" (halaman: "SDP2 Jalur USM hanya berlaku pada Jalur USM saja"). Di kampus lain hanya satu kolom, label "SDP2". Jalur USM tidak dicatat sebagai Jalur Masuk, jadi labelnya tidak ditautkan ke jalur.
  - BPP/Semester: `spp` per semester, label "BPP".
- S1 Informatika PJJ (Online Learning): BPP "Rp 560.000/ SKS*" ("*Total 144 SKS hingga lulus"), jadi `spp` dengan `periode` per_sks. Kolom UP3 dan SDP2 kosong ("–").
- Endowment Fund hanya untuk S1 Kedokteran, dan Kedokteran tidak ada di katalog (Prodi baru), jadi tidak dicatat.
- Tidak dicatat:
  - International Class;
  - "(Lanjutan)" (alih jenjang dari D3);
  - S2/S3 (termasuk S2 Terapan);
  - S1 Kedokteran (tidak ada di katalog);
  - S1 Informatika Kampus Jakarta (katalog tidak punya S1 Informatika Kampus Jakarta).
- **Perlu dicek, nama program yang hanya cocok lewat sisa katalog.** Program berikut dilewati karena namanya bukan terjemahan langsung nama Prodi di katalog. Prodi katalog yang tersisa tanpa biaya kebetulan tujuh, sama banyaknya dengan program ini, jadi kemungkinan besar pasangannya seperti di bawah. Kalau pemeriksa bisa memastikan, tambahkan barisnya pada impor berikutnya.
  - S1 Smart Science & Technology → kemungkinan S1 Teknik Fisika
  - S1 Electrical Energy Engineering → kemungkinan S1 Teknik Sistem Energi
  - S1 Artpreneurship → kemungkinan S1 Seni Rupa
  - D3 Teknik Informatika → kemungkinan D3 Rekayasa Perangkat Lunak Aplikasi
  - D3 Digital Marketing → kemungkinan D3 Manajemen Pemasaran
  - D3 Hospitality & Culinary Art → kemungkinan D3 Perhotelan
  - S1 Terapan Digital Creative Multimedia → kemungkinan D4 Teknologi Rekayasa Multimedia
- Jalur Masuk tidak dicatat. Halaman Jalur Seleksi memuat daftar jalur lewat skrip dan saat diakses (2026-10-11) sudah untuk penerimaan berikutnya.
- Padanan nama program dan Prodi katalog yang dipakai:

| Kampus | Program (tertulis) | Prodi katalog |
|---|---|---|
| Kampus Utama | S1 Digital Supply Chain | S1 Teknik Logistik |
| Kampus Utama | S1 Manajemen Rekayasa Industri | S1 Manajemen Rekayasa |
| Kampus Utama | S1 Informatika PJJ (Online Learning) S1 Informatika PJJ (Online Learning) – Lanjutan | S1 PJJ Informatika |
| Kampus Utama | S1 Teknologi Informasi (Cyber Security & Digital Innovation) | S1 Teknologi Informasi |
| Kampus Utama | S1 Manajemen Bisnis Telekomunikasi & Informatika (MBTI) | S1 Manajemen |
| Kampus Utama | S1 Leisure Management | S1 Manajemen Bisnis Rekreasi |
| Kampus Utama | S1 Bisnis Digital (Digital Business) | S1 Bisnis Digital |
| Kampus Utama | S1 Digital Public Relation | S1 Hubungan Masyarakat |
| Kampus Utama | S1 Digital Content Broadcasting | S1 Penyiaran Konten Digital |
| Kampus Utama | S1 Psikologi (Digital Psychology) | S1 Psikologi |
| Kampus Utama | S1 Desain Produk & Inovasi | S1 Desain Produk |
| Kampus Utama | S1 Kriya (Fashion & Textile Design) | S1 Kriya |
| Kampus Utama | S1 Film dan Animasi | S1 Film |
| Kampus Utama | D3 Teknik Komputer | D3 Teknologi Komputer |
| Kampus Utama | D3 Digital Accounting (Sistem Informasi Akuntansi) | D3 Sistem Informasi Akuntansi |
| Kampus Surabaya | S1 Digital Business | S1 Bisnis Digital (Kampus Kota Surabaya) |
| Kampus Surabaya | S1 Digital Supply Chain | S1 Teknik Logistik (Kampus Kota Surabaya) |
| Kampus Purwokerto | D3 Teknologi Telekomunikasi | D3 Teknik Telekomunikasi (Kampus Kabupaten Banyumas) |
| Kampus Purwokerto | S1 Digital Supply Chain | S1 Teknik Logistik (Kampus Kabupaten Banyumas) |
| Kampus Purwokerto | S1 Informatika | S1 Teknik Informatika (Kampus Kabupaten Banyumas) |
| Kampus Purwokerto | S1 Desain Produk & Inovasi | S1 Desain Produk (Kampus Kabupaten Banyumas) |

Program lain cocok persis dengan nama Prodi di katalog.

- Draf: 212 baris biaya, 61 Prodi.
