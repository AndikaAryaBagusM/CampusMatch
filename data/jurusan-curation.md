# Jurusan curation of `data/jurusan-mapping.csv`

Only the `jurusan` column was changed; `jurusan_usulan` still holds the original proposal, and `perlu_cek` marks are kept.

- Distinct Jurusan: **974 → 373**
- Rows (Kode Prodi) whose Jurusan changed: **782** of 1479
- Kode left untouched because their Prodi names mix different fields: **44** (listed below)
- Principles: merge spelling/format variants, branch-campus/PJJ/PSKGJ/Tadris names, true synonyms, and narrow D3/D4 variants into the field a student would search for. Large, established faith-based programmes (PGMI, PIAUD, Pendidikan Agama Islam, Manajemen Pendidikan Islam, Ekonomi/Perbankan/Akuntansi Syariah, the Islamic law programmes) stay separate. Single-Prodi programmes with no obvious home also stay.

## Merges

### 1. Teologi

Christian theology and ministry programmes from Sekolah Tinggi Teologi; '(Akademik)' only distinguishes the academic track. Misiologi, Biblika, pastoral and ministry studies are sub-fields students find under Teologi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teologi (Akademik) | 340 | 77201 |
| Filsafat Keilahian | 4 | 76132, 75203 |
| Biblika | 1 | 86224 |
| Misiologi | 9 | 77202 |
| Pastoral | 1 | 86248 |
| Terapan Ministri Kristen | 1 | 77205 |
| Kepemimpinan Kristen | 8 | 95206 |

### 2. Bimbingan dan Konseling Kristen

Pastoral counselling is the Christian counselling programme under another name.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Konseling Pastoral | 3 | 86223 |

### 3. Studi Agama Hindu

Small Hindu religious-studies programmes (2–5 Prodi each); one Jurusan is more useful to a student than three.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Filsafat Agama Hindu | 5 | 76239 |
| Teologi Hindu | 2 | 76238 |
| Hukum Agama Hindu | 5 | 74232 |

### 4. Studi Agama Buddha

Kepanditaan is Buddhist clergy training (its names are Kepanditaan and Kepanditaan Buddha); grouped with Agama Buddha.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Agama Buddha | 1 | 86244 |
| Kepanditaan | 4 | 70436, 70236 |

### 5. Ilmu Al-Qur'an dan Tafsir

Same programme. The export uses a backtick (`) in place of the apostrophe.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Al-Qur`an dan Tafsir | 165 | 76131, 76231 |

### 6. Hukum Keluarga Islam (Ahwal Syakhshiyyah)

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Jarak Jauh Hukum Keluarga Islam (Ahwal Syakhshiyyah) | 1 | 74241 |

### 7. Sejarah Peradaban Islam

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Jarak Jauh Sejarah Peradaban Islam | 1 | 80232 |

### 8. Tasawuf dan Psikoterapi

Ilmu Tasawuf already appears among this programme's names; it is the same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Tasawuf | 1 | 76242 |

### 9. Studi Islam

Interdisciplinary Islamic studies is a single-Prodi variant of Studi Islam.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Studi Islam Interdisipliner | 1 | 70237 |

### 10. Psikologi

Psychology. Psikologi Islam and Psikologi Kristen are psychology degrees with a faith perspective, and a student looking for psychology should see them.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Psikologi | 2 | 73202 |
| Psikologi Islam | 21 | 73206, 73204 |

### 11. Bimbingan dan Konseling Islam

The same Islamic counselling field taught in dakwah (BKI) or tarbiyah (BKPI) faculties; the export already mixes these names under one Kode.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bimbingan dan Konseling Pendidikan Islam | 8 | 70240 |
| Bimbingan Penyuluhan Islam | 2 | 70210 |

### 12. Jurnalistik

Jurnalistik Islam already makes up 5 of the 13 Prodi under the Jurnalistik Kode.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Jurnalistik Islam | 1 | 76205 |

### 13. Ekonomi Syariah

Ekonomi Islam/Syariah: same field, different wording.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ekonomi dan Keuangan Islam | 4 | 60230 |

### 14. Manajemen Syariah

Kode 61211 already mixes Manajemen Keuangan Syariah and Manajemen Bisnis Syariah. These are Islamic management programmes split by concentration.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Bisnis Syariah | 88 | 61218, 60203, 61205 |
| Manajemen Keuangan Syariah | 34 | 61211 |
| Manajemen Keuangan Mikro Syariah | 1 | 60404 |

### 15. Akuntansi Syariah

Accounting for Islamic financial institutions is Islamic accounting.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Akuntansi Lembaga Keuangan Syariah | 7 | 60304, 62313 |

### 16. Manajemen Industri Halal

Both are halal-industry management; 1–3 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Mutu Halal | 1 | 80206 |

### 17. Pendidikan Guru Madrasah Ibtidaiyah

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Jarak Jauh Pendidikan Guru Madrasah Ibtidaiyah | 1 | 86249 |

### 18. Pendidikan Agama Kristen

Christian religious-teacher education; same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Guru Keagamaan Kristen | 1 | 86258 |

### 19. Pendidikan Agama Katolik

Renamed to match the other 'Pendidikan Agama …' Jurusan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Keagamaan Katolik | 1 | 86226 |

### 20. Pendidikan Agama Buddha

Renamed to match the other 'Pendidikan Agama …' Jurusan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Keagamaan Buddha | 12 | 86215 |

### 21. Pariwisata

Tourism. Destination, travel-business, religious/halal tourism and MICE programmes are concentrations of one field. The export already mixes these names across the Kode (e.g. 93301, 93310, 93202).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pariwisata Budaya dan Keagamaan | 10 | 76202 |
| Destinasi Pariwisata | 24 | 93311, 93304, 93384 |
| Usaha Perjalanan Wisata | 63 | 94415, 93301, 93310, 93381, 93401 |
| Perjalanan Wisata | 8 | 93406, 93409 |
| Industri Perjalanan | 3 | 93201 |
| Industri Pariwisata | 1 | 93272 |
| Kepariwisataan | 2 | 93303 |
| Hospitality dan Pariwisata | 3 | 93205 |
| Pengelolaan Usaha Rekreasi | 1 | 94416 |
| Manajemen Perencanaan dan Pemasaran Pariwisata | 1 | 93405 |
| Pengelolaan Konvensi dan Acara | 14 | 93306, 93314, 93319, 93386 |

### 22. Akuntansi

Accounting. Public-sector, tax and digital accounting are D4 concentrations, and Kode 62301/62306 already mix these names. Kept apart: Akuntansi Syariah, and the IT-flavoured Komputerisasi/Sistem Informasi Akuntansi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Akuntansi | 5 | 62203 |
| Akuntansi Bisnis Digital | 6 | 62309 |
| Akuntansi Keuangan Publik | 1 | 62205 |
| Akuntansi Sektor Publik | 35 | 62303, 62307, 62308, 62311 |
| Akuntansi Perpajakan | 43 | 62302, 62306, 62310 |
| Bsc (Hons) Accounting and Finance | 1 | 62212 |

### 23. Perpajakan

Manajemen Pajak, Administrasi Perpajakan and Perpajakan are the same tax programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Perpajakan | 17 | 61403 |

### 24. Keuangan dan Perbankan

Finance and banking programmes. These names are swapped freely across Kode (61406, 61306, 61314). Also fixes the capital 'Dan'.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Keuangan Dan Perbankan | 72 | 61406 |
| Perbankan dan Keuangan | 6 | 61417 |
| Perbankan dan Keuangan Digital | 7 | 61318 |
| Perbankan | 2 | 61314 |
| Keuangan | 12 | 61306, 61315 |
| Ekonomi Keuangan dan Perbankan | 2 | 87222 |
| Manajemen Keuangan | 1 | 61414 |
| Analisis Keuangan | 5 | 61310 |

### 25. Keuangan Negara

State finance programmes (treasury, customs, public assets, government procurement), mostly offered by PKN STAN; 1–10 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Keuangan Sektor Publik | 10 | 61312 |
| Kebendaharaan Negara | 2 | 61409 |
| Kepabeanan dan Cukai | 1 | 63422 |
| Manajemen Aset | 3 | 61307, 61412 |
| Manajemen Kontrak Pemerintah | 2 | 63303 |

### 26. Manajemen

Management, including branch campuses and D3 concentrations (company, HR, marketing, retail, trade). Retail and Retail are one spelling apart, and the export already mixes these names under the Manajemen Kode.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Manajemen | 5 | 61207 |
| Manajemen Kampus Kab Rembang | 2 | 61413 |
| Manajemen Kampus Kab. Tojo Una-una | 1 | 61272 |
| Manajemen Perusahaan | 41 | 61405 |
| Manajemen Bisnis | 7 | 61301, 93317, 54537 |
| Manajemen Sumber Daya Manusia | 1 | 61410 |
| Manajemen Pemasaran | 35 | 61404, 61418 |
| Manajemen Ritel | 17 | 61216, 61701 |
| Manajemen Retail | 5 | 61210 |
| Bisnis dan Manajemen Ritel | 6 | 61317 |
| Manajemen Perdagangan | 9 | 61402 |

### 27. Bisnis Internasional

International business and trade. Kode 93308 already mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Administrasi Bisnis Internasional | 28 | 63321, 63311 |
| Manajemen Bisnis Internasional | 11 | 61225, 93308 |
| Perdagangan Internasional | 17 | 94205, 94210 |
| Manajemen Perdagangan Internasional | 1 | 94306 |

### 28. Administrasi Bisnis

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Administrasi Bisnis K. Pangandaran | 1 | 63213 |

### 29. Kewirausahaan

Entrepreneurship; Kode 94201's names are Bio Kewirausahaan, Bisnis and Entrepreneurship.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bio Kewirausahaan | 4 | 94201 |

### 30. Ekonomi Pembangunan

Economics. Ilmu Ekonomi and Ekonomi Pembangunan are the same S1 under different names. Kode 87220 (Ekonomi mixed with IPS teaching) is excluded and left untouched.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Ekonomi | 1 | 60207 |
| Ekonomi | 1 | 87221 |
| Pembangunan Pedesaan dan Ekonomi Masyarakat | 4 | 60301 |

### 31. Pendidikan Ekonomi

Business/commerce teacher education (Pendidikan Bisnis, Tata Niaga) is the economics teacher-education field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Bisnis | 5 | 87207, 87211 |

### 32. Administrasi Perkantoran

Office administration. Sekretari/Kesekretariatan is the same D3 field, and Kode 63412 already contains Administrasi Perkantoran. Kode 61305 (mixed with Manajemen Perusahaan) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Administrasi Perkantoran Digital | 3 | 61303, 61422 |
| Sekretari | 45 | 63412 |
| Administrasi | 2 | 63401 |

### 33. Tata Boga

Culinary arts. Seni Kuliner, patisserie and catering are names for the same vocational field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Seni Kuliner | 20 | 62405, 94406 |
| Bisnis Jasa Makanan | 5 | 93312 |
| Manajemen Kuliner | 1 | 93206 |
| Manajemen Industri Katering | 1 | 93203 |
| Seni Pengolahan Patiseri | 2 | 94411 |
| Tata Boga Kampus Payakumbuh | 1 | 94413 |

### 34. Manajemen Bencana

Disaster management; same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Penanggulangan Bencana | 1 | 22306 |

### 35. Sistem Informasi

Information systems, including branch campuses ('Kampus Kota …' names that the cleaner missed) and applied business/government IS concentrations.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Sistem Informasi | 6 | 57203 |
| Sistem Informasi Bisnis | 5 | 57307, 57303 |
| Sistem Informasi Kota Cerdas | 3 | 56211, 57309 |
| Teknologi Rekayasa Informasi Pemerintahan | 1 | 55303 |
| Sistem Informasi Kampus Kabupaten Banyumas | 1 | 57483 |
| Sistem Informasi Kampus Kabupaten Karawang | 1 | 57489 |
| Sistem Informasi Kampus Kota Bogor | 2 | 57218, 57488 |
| Sistem Informasi Kampus Kota Pontianak | 1 | 57205 |
| Sistem Informasi Kampus Kota Sukabumi | 1 | 57281 |
| Sistem Informasi Kampus Kota Surakarta | 1 | 57486 |
| Sistem Informasi Kampus Kota Tegal | 1 | 57484 |
| Sistem Informasi Kampus Kota Yogyakarta | 1 | 57485 |

### 36. Sistem Informasi Akuntansi

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sistem Informasi Akuntansi Kampus Kabupaten Karawang | 1 | 57492 |
| Sistem Informasi Akuntansi Kampus Kota Bogor | 1 | 57491 |
| Sistem Informasi Akuntansi Kampus Kota Pontianak | 1 | 57496 |
| Sistem Informasi Akuntansi Kampus Kota Sukabumi | 1 | 57493 |
| Sistem Informasi Akuntansi Kampus Kota Surakarta | 1 | 57495 |
| Sistem Informasi Akuntansi Kampus Kota Tegal | 1 | 57494 |

### 37. Transportasi

Land, inland-water and air transport management programmes from Kemenhub schools; 1–8 Prodi each. Rail and shipping have their own Jurusan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Transportasi Darat | 1 | 39302 |
| Manajemen Transportasi Udara | 6 | 61408, 62408 |
| Manajemen Transportasi Perairan Daratan | 1 | 614011 |
| Manajemen Transportasi Jalan | 1 | 39401 |
| Lalu Lintas Sungai Danau dan Penyeberangan | 1 | 39403 |
| Rekayasa Sistem Transportasi Jalan | 3 | 39301 |
| Pengujian Kendaraan Bermotor | 1 | 39402 |

### 38. Manajemen Pelabuhan dan Pelayaran

Port and shipping management. Kode 92304 already mixes Manajemen Pelabuhan with Ketatalaksanaan Angkutan Laut dan Kepelabuhanan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ketatalaksanaan Pelayaran Niaga Dan Kepelabuhan | 26 | 92301, 92401 |
| Manajemen Pelabuhan | 5 | 92404 |
| Manajemen Kepelabuhan dan Pelayaran | 2 | 92201 |
| Manajemen Pelabuhan dan Logistik Maritim | 9 | 63317, 92304 |
| Manajemen Transportasi Laut | 7 | 61407 |
| Transportasi Laut | 8 | 39303 |

### 39. Perkeretaapian

Railway programmes (1–2 Prodi each).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Perkeretaapian | 2 | 23301 |
| Manajemen Transportasi Perkeretaapian | 1 | 22407 |

### 40. Logistik

Logistics. Kode 63215 mixes Logistik and Teknik Logistik, and Kode 63314 mixes management and business logistics. Students search for one field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Logistik | 13 | 63315, 63318, 63319 |
| Manajemen Logistik | 21 | 63314, 63414 |
| Logistik Niaga-El | 5 | 40306 |
| Analitika Logistik Terapan | 1 | 63320 |
| Teknologi Rekayasa Logistik | 5 | 63316 |
| Rekayasa Logistik | 1 | 63216 |

### 41. Sastra Inggris

English language and literature (non-teaching). The D3/D4 applied-English variants are the vocational track of the same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bahasa dan Kebudayaan Inggris | 9 | 79217 |
| Bahasa Inggris | 38 | 79402 |
| Bahasa Inggris Untuk Industri Pariwisata | 1 | 79304 |
| Bahasa Inggris Untuk Komunikasi Bisnis | 1 | 79306 |
| Bahasa Inggris untuk Komunikasi Bisnis dan Profesional | 18 | 79302, 79308 |

### 42. Bahasa dan Sastra Arab

Arabic language and literature; Kode 79203 already mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sastra Arab | 1 | 79223 |
| Bahasa Arab | 1 | 79403 |

### 43. Sastra Jepang

Japanese language and literature, academic and applied.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bahasa dan Sastra Jepang | 1 | 88228 |
| Bahasa Jepang | 15 | 79404 |
| Bahasa Jepang untuk Komunikasi Bisnis dan Profesional | 1 | 79305 |

### 44. Sastra Jerman

German language and literature.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bahasa Jerman | 1 | 79406 |

### 45. Bahasa dan Kebudayaan Korea

Korean language; Kode 79210 already mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bahasa Korea | 2 | 79410 |

### 46. Bahasa Mandarin

Chinese language and literature; Kode 79209 and 79214 already mix Sastra Cina and Bahasa Mandarin.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sastra Cina | 8 | 79209 |
| Bahasa Mandarin untuk Komunikasi Bisnis dan Profesional | 4 | 79307, 79309 |

### 47. Sastra Daerah

Regional-language literature (Jawa, Bali, Batak, Melayu, Aceh). Each has 1–8 Prodi, and Kode 79211 already uses 'Sastra Daerah' as the umbrella.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sastra Bali | 2 | 79212 |
| Sastra Jawa Kuno | 1 | 79222 |
| Sastra Daerah untuk Sastra Jawa | 1 | 79216 |
| Bahasa Aceh | 1 | 79218 |

### 48. Pendidikan Bahasa dan Sastra Daerah

Regional-language teacher education; Kode 88202 already groups Jawa, Bali and others under this name.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Bahasa Bali | 1 | 88283 |
| Pendidikan Bahasa Bugis | 1 | 88231 |
| Pendidikan Bahasa Makassar | 1 | 88230 |
| Pendidikan Bahasa Melayu | 1 | 88215 |
| Pendidikan Bahasa Jawa | 1 | 88282 |
| Pendidikan Bahasa dan Sastra Aceh | 2 | 79219 |

### 49. Sastra Indonesia

Indonesian linguistics is studied within Sastra Indonesia; it is a single Prodi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Linguistik Indonesia | 1 | 79215 |

### 50. Ilmu Sejarah

History; same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sejarah | 3 | 80204 |

### 51. Ilmu Perpustakaan

Library and information science; Kode 71201/71202 already mix all of these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Perpustakaan | 10 | 71401 |
| Perpustakaan dan Sains Informasi | 24 | 71202, 71203 |
| Perpustakaan Digital | 1 | 71301 |
| Ilmu Perpustakaan dan Informasi Islam | 2 | 75202 |

### 52. Kearsipan

Archives; Kode 71302 already mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pengelolaan Arsip dan Rekaman Informasi | 7 | 71302 |

### 53. Ilmu Hukum

Law. Ilmu Hukum and Hukum are the same S1 (Kode 74201 is split 302/165). The D3/D4 legal programmes (paralegal, legislative drafting, IP law) are applied law and have 1–3 Prodi each. Hukum Bisnis and the Islamic law programmes stay separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Hukum | 70 | 74203, 74204, 74207 |
| PJJ Hukum | 1 | 74205 |
| Paralegal | 3 | 74401 |
| Administrasi Hukum Umum | 1 | 74302 |
| Hukum Kekayaan Intelektual | 1 | 74303 |
| Pembangunan Hukum | 1 | 74304 |
| Perancangan Peraturan Perundang-Undangan | 1 | 74305 |
| Peradilan Pidana | 3 | 74301 |

### 54. Hubungan Masyarakat

Public relations; the digital-communication D4 is the same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Hubungan Masyarakat Dan Komunikasi Digital | 6 | 70301, 70303 |

### 55. Perhotelan

Hotel management. Rooms division, food-and-beverage service and hospitality accounting are departments of one field, and Kode 93302 already mixes Perhotelan and Manajemen Perhotelan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pengelolaan Perhotelan | 35 | 93315, 93318, 93309, 93382 |
| Manajemen Perhotelan | 15 | 93302 |
| Manajemen Perhotelan Kampus Payakumbuh | 2 | 93316 |
| Divisi Kamar | 6 | 93404 |
| Tata Hidang | 7 | 94407, 94487 |
| Manajemen Tata Hidangan | 1 | 94307 |
| Manajemen Akuntansi Hospitaliti | 1 | 62304 |

### 56. Kedokteran

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kedokteran Fakultas Ilmu Kesehatan, Kedokteran, dan Ilmu Alam Banyuwangi | 1 | 11204 |

### 57. Kedokteran Hewan

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kedokteran Hewan Fakultas Ilmu Kesehatan, Kedokteran, dan Ilmu Alam Banyuwangi | 1 | 54267 |

### 58. Keperawatan

Nursing. Kode 14201 is split between 'Ilmu Keperawatan' (232) and 'Keperawatan' (125). Keperawatan Anestesiologi stays separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Keperawatan | 358 | 14201, 14204 |
| PJJ Keperawatan | 2 | 14477 |
| Keperawatan K. Pangandaran | 2 | 14203 |

### 59. Kesehatan Masyarakat

Public health, including branch campuses and a single epidemiology Prodi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kesehatan Masyarakat Fakultas Ilmu Kesehatan, Kedokteran, dan Ilmu Alam Banyuwangi | 1 | 13204 |
| Kesehatan Masyarakat K. Sintang | 1 | 13271 |
| Pengawasan Epidemiologi | 1 | 13421 |

### 60. Kesehatan Lingkungan

Environmental health; Kode 11409 already mixes Sanitasi and Kesehatan Lingkungan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sanitasi | 37 | 11409, 13451, 13471 |
| Sanitasi Lingkungan | 18 | 13351, 13371 |

### 61. Gizi

Nutrition and dietetics; same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Gizi | 1 | 13212 |
| Gizi dan Dietetika | 24 | 13311 |

### 62. Keselamatan dan Kesehatan Kerja

Occupational health and safety (K3/Hiperkes) and safety engineering.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Higiene Perusahaan Kesehatan dan Keselamatan Kerja | 3 | 13441 |
| Teknik Keselamatan Dan Kesehatan Kerja | 2 | 32304 |
| Teknik Keselamatan | 2 | 32204 |
| Rekayasa Keselamatan Proses | 1 | 23306 |

### 63. Rekam Medis dan Informasi Kesehatan

Medical records and health information; Kode 13462 already mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Perekam dan Informasi Kesehatan | 2 | 13262 |
| Manajemen Informasi Kesehatan | 51 | 13363, 13364 |

### 64. Administrasi Kesehatan

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Administrasi Kesehatan | 1 | 13264 |

### 65. Informatika Medis

Medical and health informatics; same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Informatika Kesehatan | 5 | 13265 |

### 66. Teknologi Laboratorium Medis

Spelling variant (Medik/Medis).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Laboratorium Medik | 2 | 13250 |

### 67. Radiologi

Radiology technology; Kode 11402 already mixes Radiologi with Radiodiagnostik dan Radioterapi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Radiodiagnostik dan Radioterapi | 2 | 11472 |
| Teknologi Radiologi Pencitraan | 15 | 11302, 13354 |

### 68. Kesehatan Gigi

Dental therapy/dental health. Teknik Gigi (dental technician) stays separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Terapi Gigi | 14 | 12301 |
| Teknologi Kesehatan Gigi | 2 | 12302 |

### 69. Optometri

Refraksi Optisi is the older name of Optometri; Kode 11404 mixes them.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Refraksi Optisi | 8 | 11404 |

### 70. Okupasi Terapi

Word-order variant.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Terapi Okupasi | 2 | 11303 |

### 71. Terapi Wicara

Speech therapy; Kode 94304 mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Terapi Wicara dan Bahasa | 2 | 94305 |

### 72. Pengobatan Tradisional

Traditional medicine (acupuncture, herbal, jamu, TCM); 1–5 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Akupunktur | 4 | 11407 |
| Akupuntur dan Pengobatan Herbal | 5 | 11307, 11308 |
| Pengobatan Tradisional Indonesia | 1 | 11305 |
| Pengobatan Tradisional Tiongkok | 4 | 11306 |
| Jamu | 1 | 48474 |

### 73. Ilmu Biomedis

Biomedical science; Kode 11223 already contains Sains Biomedis.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Biomedis | 6 | 11312 |

### 74. Teknik Elektromedik

Electromedical engineering; spelling and wording variants. Kode 21303 (mixed with automotive) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Elektro-medis | 1 | 20409 |
| Rekayasa Elektro Medis | 2 | 20308 |

### 75. Farmasi

Clinical/community pharmacy is a concentration of Farmasi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Farmasi Klinik dan Komunitas | 16 | 48202 |

### 76. Analis Farmasi dan Makanan

Spelling variant (Analis/Analisis).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Analisis Farmasi dan Makanan | 6 | 48404 |

### 77. Analisis Kimia

Spelling variant (Analis/Analisis); chemical analysis.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Analis Kimia | 8 | 24402 |

### 78. Biologi

Biology sub-fields with 1–5 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Biologi Terapan | 5 | 46204 |
| Biosains Hewan | 2 | 46207 |
| Konservasi Biologi | 1 | 54255 |

### 79. Bioteknologi

Spelling variant.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bio Teknologi | 1 | 54248 |

### 80. Ilmu Aktuaria

Actuarial science; Kode 94203 is split Ilmu/Sains/Aktuaria.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Aktuaria | 6 | 94207 |

### 81. Statistika

Statistics. Sains Data stays separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Statistika dan Sains Data | 3 | 49205 |
| Komputasi Statistik | 1 | 49502 |

### 82. Sains Data

Data science (academic, applied and distance learning).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Data Terapan | 4 | 49304 |
| PJJ Sains Data | 1 | 49203 |

### 83. Geografi

Geography and geographic information/remote sensing; 1–6 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Informasi Geografi | 6 | 51202 |
| Kartografi dan Penginderaan Jauh | 1 | 51211 |
| Teknologi Penginderaan Jauh | 1 | 51411 |
| Penginderaan Jauh dan Sistem Informasi Geografis | 3 | 51301 |

### 84. Meteorologi

Meteorology and climatology (BMKG school programmes).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Klimatologi | 1 | 54310 |
| Instrumentasi Meteorologi Klimatologi dan Geofisika | 1 | 20306 |

### 85. Geofisika

Kode 33201 is split Teknik Geofisika 12 / Geofisika 10.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Geofisika | 22 | 33201 |

### 86. Teknik Informatika

Computer science. Kode 55201 and 55202 both contain Teknik Informatika, Informatika and Ilmu Komputer. 'Teknik Informatika' is what most Prodi are called and what students type. Teknologi Informasi, Sistem Informasi and Rekayasa Perangkat Lunak stay separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Informatika | 246 | 57304, 55200, 55202, 55206, 55210, 55213, 55214, 55215, 55219, 55223, 55224, 55281 |
| Ilmu Komputer | 27 | 55208, 56206, 59202 |
| PJJ Informatika | 8 | 55203, 55217 |
| Bachelor of Computer Science | 2 | 49103 |
| Teknologi Rekayasa Informatika Industri | 2 | 57308 |
| Informatika Kampus Kota Bogor | 1 | 55225 |
| Informatika Kampus Kota Pontianak | 1 | 55212 |
| Informatika Kampus Kota Sukabumi | 1 | 55211 |
| Informatika PSDKU | 1 | 55604 |

### 87. Rekayasa Perangkat Lunak

Software engineering (S1, D4, D3).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Rekayasa Perangkat Lunak | 47 | 58301, 58302, 58304 |
| Rekayasa Perangkat Lunak Aplikasi | 1 | 58401 |

### 88. Teknologi Informasi

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Informasi Kampus Kota Bogor | 1 | 59207 |

### 89. Kecerdasan Buatan

Artificial intelligence; Buatan/Artifisial are synonyms.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kecerdasan Artifisial | 4 | 55283 |
| Kecerdasan Buatan dan Robotik | 3 | 56209 |
| Teknik Robotika dan Kecerdasan Buatan | 7 | 56203 |

### 90. Keamanan Siber

Cyber security; 1 Prodi each. Keamanan Sistem Informasi (Kode 57302, mixed with Komputerisasi Akuntansi) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Bachelor of Cyber Security | 1 | 55721 |
| Keamanan dan Intelijen Siber | 1 | 26209 |
| Rekayasa Keamanan Siber | 1 | 26214 |

### 91. Teknik Komputer

Computer engineering and networks. Kode 56201 (Sistem Komputer) already mixes Teknik Komputer and Rekayasa Sistem Komputer, and 56402 mixes Teknik/Teknologi Komputer.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sistem Komputer | 66 | 56201, 56205 |
| Rekayasa Sistem Komputer | 4 | 56204 |
| Rekayasa Komputer | 2 | 57210 |
| Teknologi Komputer | 4 | 56405, 56482, 57310 |
| Teknologi Komputer Kampus Kota Tegal | 1 | 56483 |
| Teknologi Rekayasa Komputer | 18 | 56301, 90351 |
| Teknologi Rekayasa Komputer dan Jaringan | 1 | 56307 |
| Teknologi Rekayasa Komputer Jaringan | 3 | 56304 |
| Teknologi Rekayasa Jaringan | 2 | 56306 |
| Teknologi Rekayasa Internet | 3 | 58303 |
| Teknik Multimedia dan Jaringan | 1 | 90244 |

### 92. Multimedia

Multimedia technology. Kode 90443 and 90346 (mixed with networking) are excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Rekayasa Multimedia | 17 | 90343, 90349, 90353 |
| Teknologi Multimedia Broadcasting | 1 | 90447 |
| Rekayasa Multimedia Edukasi Digital | 1 | 90354 |
| Teknologi Rekayasa Komputer Grafis | 1 | 90350 |

### 93. Intelijen

State intelligence programmes (STIN); 1 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Agen Intelijen | 1 | 26203 |
| Analis Intelijen | 1 | 26204 |
| Intelijen Teknologi | 1 | 26210 |

### 94. Akuakultur

Fish farming. Budidaya Perairan is the Indonesian term for Akuakultur, and Kode 54447/54346 mix the names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Budidaya Perairan | 60 | 54349, 54243 |
| Budi Daya Ikan | 20 | 46401, 54447, 54449 |
| Teknologi Akuakultur | 5 | 54346 |
| Teknologi Budi Daya Perikanan | 1 | 54350 |
| Teknologi Budidaya Perikanan | 1 | 54448 |
| Budi Daya Laut dan Pantai | 2 | 54342 |
| Akuakultur Fakultas Ilmu Kesehatan, Kedokteran, dan Ilmu Alam Banyuwangi | 1 | 54224 |
| Bioteknologi Perikanan | 4 | 54303 |
| Teknik Penanganan Patologi Perikanan | 1 | 54418 |

### 95. Perikanan Tangkap

Capture fisheries. Kode 54246 (Pemanfaatan Sumber Daya Perikanan) already contains Perikanan Tangkap. Kode 54443 (mixed with aquaculture) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pemanfaatan Sumber Daya Perikanan | 45 | 54246 |
| Teknologi Penangkapan Ikan | 8 | 54343, 54446 |
| Manajemen Rekayasa Perikanan Tangkap | 3 | 54340 |
| Permesinan Perikanan | 1 | 41301 |

### 96. Teknologi Hasil Perikanan

Fish-product processing; these names are mixed across Kode 54444, 51234 and 41434. Kode 54249 (mixed) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pengolahan Hasil Perikanan | 2 | 51234 |
| Teknologi Pengolahan Hasil Perikanan | 10 | 54347, 54444 |
| Pengolahan dan Penyimpanan Hasil Perikanan | 7 | 54344 |
| Pengolahan Hasil Laut | 7 | 41434 |

### 97. Manajemen Sumber Daya Perairan

Aquatic resource management; spelling and branch-campus variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Sumberdaya Perairan | 2 | 54348, 54260 |
| Manajemen Sumberdaya Perairan Kampus Kabupaten Nias Utara | 1 | 54266 |
| Sumber Daya Akuatik | 5 | 54263, 54272 |
| Teknologi Pengelolaan Sumberdaya Perairan | 1 | 54345 |

### 98. Ilmu Perikanan

General fisheries science. Kode 41234 (mixed) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Perikanan | 2 | 542431 |
| Sains Perikanan | 1 | 54277 |

### 99. Agribisnis Perikanan

Fisheries agribusiness (Agro-/Agri- spelling) and fisheries socio-economics.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Agrobisnis Perikanan | 20 | 54245 |
| Sosial Ekonomi Perikanan | 6 | 54645 |

### 100. Ilmu Kelautan

Marine science; same field.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Kelautan | 2 | 54341 |

### 101. Penyuluhan Pertanian

Agricultural extension programmes (Polbangtan/STPP) split by commodity.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Penyuluhan Pertanian Berkelanjutan | 14 | 54315 |
| Penyuluhan Perkebunan | 2 | 54358 |
| Penyuluhan Peternakan dan Kesejahteraan Hewan | 13 | 54316, 54320 |
| Penyuluhan Kehutanan | 1 | 54455 |
| Penyuluhan Perikanan | 1 | 54356 |
| Komunikasi dan Pengembangan Masyarakat | 2 | 54298 |

### 102. Pendidikan Guru Sekolah Dasar

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme. PSKGJ is the in-service (teachers already working) track.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PGSD Kampus Cibiru | 1 | 86284 |
| PGSD Kampus Purwakarta | 1 | 86285 |
| PGSD Kampus Serang | 1 | 86286 |
| PGSD Kampus Sumedang | 1 | 86287 |
| PGSD Kampus Tasikmalaya | 1 | 86288 |
| PJJ Pendidikan Guru Sekolah Dasar | 4 | 86209 |
| PSKGJ Pendidikan Guru Sekolah Dasar(PGSD) | 2 | 86276 |

### 103. Pendidikan Guru Pendidikan Anak Usia Dini

Early-childhood teacher education, including branch campuses and the small Christian/Buddhist variants. Pendidikan Islam Anak Usia Dini (239 Prodi) stays separate, as PGMI does from PGSD.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PGPAUD Kampus Cibiru | 1 | 86280 |
| PGPAUD Kampus Purwakarta | 1 | 86281 |
| PGPAUD Kampus Serang | 1 | 86282 |
| PGPAUD Kampus Tasikmalaya | 1 | 86283 |
| PJJ Pendidikan Guru Pendidikan Anak Usia Dini | 1 | 86219 |
| Pendidikan Kristen Anak Usia Dini | 8 | 86242 |
| Pendidikan Buddha Anak Usia Dini | 2 | 86234 |

### 104. Pendidikan Jasmani, Kesehatan dan Rekreasi

Physical education (PJOK); punctuation variants. Kode 85201 already mixes Pendidikan Jasmani and PJKR.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Jasmani, Kesehatan & Rekreasi | 2 | 85271 |
| Pendidikan Jasmani, Kesehatan, dan Rekreasi | 1 | 85208 |
| Pendidikan Jasmani | 17 | 852011, 85207 |
| PGSD Pendidikan Jasmani | 4 | 89202 |
| PGSD Penjas Kampus Sumedang | 1 | 89270 |

### 105. Ilmu Keolahragaan

Sport science; 1 Prodi each besides Ilmu Keolahragaan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Keolahragaan | 1 | 89205 |
| Olahraga Rekreasi | 1 | 85204 |
| Rekayasa Keolahragaan | 1 | 89203 |
| Analisis Performa Olahraga | 1 | 85212 |
| Manajemen Olahraga | 1 | 89301 |

### 106. Pendidikan Kepelatihan Olahraga

Sports coaching; Kode 85203 mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kepelatihan Fisik Olahraga | 1 | 85272 |
| Kepelatihan Kecabangan Olahraga | 2 | 85203 |
| Kepelatihan Olahraga | 1 | 85206 |
| Ilmu Kepelatihan Olah Raga | 1 | 85401 |

### 107. Pendidikan Bahasa dan Sastra Indonesia

Indonesian teacher education ('Tadris' is the PTKI name); Kode 88201 already mixes these names. Also fixes the capital 'Dan'.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Bahasa Dan Sastra Indonesia | 276 | 88201, 882011 |
| Pendidikan Bahasa Indonesia | 5 | 88226 |
| Tadris Bahasa Indonesia | 4 | 88225 |
| PSKGJ Pendidikan Bahasa Indonesia dan Daerah | 1 | 88271 |

### 108. Pendidikan Bahasa Inggris

English teacher education; Tadris = Pendidikan at PTKI.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Tadris Bahasa Inggris | 16 | 88222 |
| PSKGJ Pendidikan Bahasa Inggris | 2 | 88273 |

### 109. Pendidikan Bahasa Arab

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Jarak Jauh Pendidikan Bahasa Arab | 1 | 88229 |

### 110. Pendidikan Biologi

Biology teacher education: Tadris, branch and in-service variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Biologi K. Kab. Gayo Lues | 1 | 84026 |
| Tadris Biologi | 1 | 88224 |
| PSKGJ Pendidikan Biologi | 1 | 84275 |

### 111. Pendidikan Matematika

Mathematics teacher education: Tadris and in-service variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Tadris Matematika | 8 | 88223 |
| PSKGJ Pendidikan Matematika | 1 | 84272 |

### 112. Pendidikan Ilmu Pengetahuan Alam

Science teacher education. Kode 84201 ('Pendidikan IPA', mixed with Hubungan Internasional) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Tadris IPA | 4 | 84210 |

### 113. Pendidikan Ilmu Pengetahuan Sosial

Social-studies teacher education; Kode 84207 mixes Tadris IPS and Pendidikan IPS.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Tadris IPS | 21 | 84207 |

### 114. Pendidikan Luar Sekolah

Non-formal education; Kode 86205 mixes all three names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Masyarakat | 6 | 86227 |
| Pendidikan Non Formal | 4 | 86229 |

### 115. Pendidikan Luar Biasa

Special-needs education (PLB is the older name for Pendidikan Khusus).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Khusus | 10 | 86222, 86257 |
| Pendidikan Inklusi | 1 | 86405 |

### 116. Pendidikan Seni Drama, Tari dan Musik

Performing-arts teacher education; Kode 88209 mixes both names. Also fixes the capital 'Dan'.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Seni Drama, Tari Dan Musik | 26 | 88209 |
| Pendidikan Seni Pertunjukan | 5 | 88217 |

### 117. Pendidikan Teknik Mesin

Branch-campus, distance-learning (PJJ/Pendidikan Jarak Jauh) or faculty-suffixed name of the same programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Pendidikan Vokasional Teknik Mesin | 1 | 83210 |

### 118. Pendidikan Teknik Otomotif

Automotive teacher education; Kode 83204 mixes both names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Vokasional Teknologi Otomotif | 5 | 85213, 86218 |

### 119. Pendidikan Teknik Elektronika

'Vokasional' variant of the same teacher-education programme.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Vokasional Teknik Elektronika | 1 | 85211 |

### 120. Pendidikan Teknik Bangunan

Building/architecture teacher education; a single Prodi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Teknik Arsitektur | 1 | 83208 |

### 121. Pendidikan Kesejahteraan Keluarga

'Vokasional' variant.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Vokasional Kesejahteraan Keluarga | 1 | 83216 |

### 122. Pendidikan Tata Rias

Cosmetology teacher education; variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Tata Rias Dan Kecantikan | 1 | 83313 |
| Pendidikan Vokasional Tata Rias | 2 | 83315 |

### 123. Pendidikan Tata Busana

Fashion teacher education; Kode 83314 mixes both names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Vokasional Desain Fashion | 4 | 82119 |

### 124. Pendidikan Tata Boga

Culinary teacher education; 'Vokasional' variant.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Vokasional Seni Kuliner | 2 | 82120 |

### 125. Pendidikan Teknologi Informasi

IT/informatics teacher education; Kode 83207 already mixes both names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pendidikan Informatika | 2 | 83209 |

### 126. Administrasi Pendidikan

Educational administration/management. Manajemen Pendidikan Islam (302 Prodi) stays separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kebijakan Pendidikan | 1 | 86250 |
| Manajemen Pendidikan Kristen | 3 | 86238 |

### 127. Agribisnis

Agribusiness, split by commodity or with branch/'Pengelolaan/Manajemen' wording. Kode 54401 and 54302 already mix these names. Mixed Kode (54290, 54281, 54331, 41331) are excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Agribisnis Kampus Batang | 1 | 54226 |
| Agribisnis Digital | 1 | 54228 |
| Manajemen Agribisnis | 7 | 54304, 54305, 54402 |
| Pengelolaan Agribisnis | 1 | 55478 |
| Agribisnis Pangan | 8 | 54302 |
| Agribisnis Hortikultura | 5 | 54311 |
| Agribisnis Peternakan | 11 | 54335, 54435 |
| Sosial Ekonomi Pertanian | 4 | 54202, 54546 |
| Pengelolaan Agribisnis Perkebunan | 1 | 55477 |

### 128. Agroteknologi

Crop science. Agroteknologi, Agroekoteknologi, Agronomi and Ilmu Pertanian are the same S1 under the 2018 nomenclature, and Kode 54212/54293/54297 mix them. D3/D4 horticulture and food-crop production are the vocational track. Ilmu Tanah and Proteksi Tanaman stay separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Agroekoteknologi | 9 | 54212, 54282, 54293 |
| Agronomi | 14 | 52220, 54204, 54297 |
| Ilmu Pertanian | 10 | 54217, 54271 |
| Agroteknologi Kampus Kab. Tojo Una-una | 1 | 54213 |
| Agroteknologi Kampus Kabupaten Nias Utara | 1 | 54220 |
| Sains Pertanian | 2 | 54209 |
| Pertanian Berkelanjutan | 1 | 54222 |
| Smart Agriculture | 1 | 54225 |
| Pertanian Presisi | 1 | 42303 |
| Budidaya Pertanian Lahan Kering | 1 | 54419 |
| Manajemen Lahan Kering | 4 | 54415 |
| Budi Daya Tanaman Hortikultura | 8 | 54412 |
| Budidaya Tanaman Pangan | 8 | 54416 |
| Teknologi Produksi Tanaman Hortikultura | 6 | 41320, 54312 |
| Teknologi Produksi Tanaman Pangan | 12 | 41322, 41323 |
| Pemuliaan Tanaman dan Teknologi Benih | 1 | 54307 |

### 129. Pengelolaan Perkebunan

Plantation-crop management; Kode 54357 and 54371 mix these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pengelolaan Perkebunan Kopi | 3 | 54372 |
| Pengelolaan dan Teknologi Perkebunan | 1 | 42334 |
| Budidaya Tanaman Perkebunan | 20 | 54371, 54471 |
| Teknologi Produksi Tanaman Perkebunan | 3 | 41332, 54732 |

### 130. Peternakan

Animal science. Livestock production, feed and livestock-product programmes are sub-fields, and Kode 54236/54238/54432 mix them.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Budidaya Ternak | 9 | 54433 |
| Produksi Ternak | 6 | 54432 |
| Teknologi Produksi Ternak | 6 | 54318 |
| Industri Peternakan Cerdas | 1 | 54275 |
| Nutrisi dan Teknologi Pakan Ternak | 9 | 54239, 54240 |
| Nutrisi Dan Makanan Ternak | 1 | 54431 |
| Teknologi Pakan Ternak | 6 | 54317 |
| Sosial Ekonomi Peternakan | 1 | 54270 |
| Teknologi Hasil Ternak | 1 | 54234 |

### 131. Kesehatan Hewan

Veterinary paramedic programmes (D3/D4); Kode 54362 mixes Teknologi Veteriner and Paramedik Veteriner.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Paramedik Veteriner | 1 | 54363 |
| Teknologi Veteriner | 3 | 54362 |

### 132. Kehutanan

Forestry. Forest management, silviculture, conservation and forest products are the classic departments of a Kehutanan faculty, and each of these has 1–6 Prodi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kehutanan K. Kab. Gayo Lues | 1 | 54254 |
| Rekayasa Kehutanan | 1 | 54269 |
| Manajemen Hutan | 3 | 54258 |
| Manajemen Hutan Alam Produksi | 2 | 54454 |
| Pengelolaan Hutan | 2 | 54352 |
| Budidaya Hutan | 2 | 54452 |
| Silvikultur | 1 | 54259 |
| Konservasi Hutan | 6 | 54256 |
| Teknologi Hasil Hutan | 2 | 54257, 54273 |

### 133. Teknologi Pangan

Food science and technology; Kode 41203 mixes Ilmu dan Teknologi Pangan with Teknologi Pangan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu dan Teknologi Pangan | 14 | 41203 |
| Teknologi Pangan dan Hasil Pertanian | 6 | 41223 |
| Teknologi Rekayasa Pangan | 9 | 41321, 54306 |
| Sains Pangan | 1 | 41232 |
| Nanoteknologi Pangan | 1 | 30204 |

### 134. Teknologi Hasil Pertanian

Agricultural-product processing; Kode 41433 mixes Hasil Perkebunan with Pengolahan Hasil Perkebunan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Pengolahan Hasil Pertanian | 1 | 54301 |
| Teknologi Hasil Perkebunan | 8 | 41433 |
| Teknologi Pengolahan Hasil Perkebunan | 1 | 41436 |

### 135. Teknologi Pulp dan Kertas

Same programme at D3/D4.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Pengolahan Pulp dan Kertas | 1 | 41334 |

### 136. Teknologi Industri Pertanian

Agroindustrial technology; Agroindustri is its D3 form.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Teknologi Industri Pertanian | 1 | 41212 |
| Teknik Industri Pertanian | 2 | 41213 |
| Agroindustri | 7 | 41011, 41411 |
| Manajemen Agroindustri | 1 | 41312 |

### 137. Teknik Pertanian

Agricultural and biosystems engineering, including mechanisation; Kode 54208 mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Pertanian dan Biosistem | 2 | 80203 |
| Rekayasa Pertanian dan Biosistem | 5 | 54208 |
| Teknologi Mekanisasi Pertanian | 2 | 42402 |
| Teknologi Rekayasa Mesin Industri Perkebunan | 1 | 41302 |

### 138. Desain Komunikasi Visual

Visual communication design; Kode 90242/90342 mix DKV, Desain Grafis and Desain Media.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Desain Grafis | 12 | 90342, 90442, 90472, 90473 |
| Desain Media | 2 | 90348 |
| Desain Media Digital | 1 | 90352 |

### 139. Teknologi Grafika

Printing and packaging technology (Politeknik Negeri Media Kreatif).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Grafika | 4 | 90444, 90474, 90475 |
| Teknik Kemasan | 1 | 90445 |
| Teknologi Industri Cetak kemasan | 2 | 90341 |
| Teknologi Rekayasa Pengemasan | 1 | 21320 |

### 140. Desain Produk

Product design; furniture/wood variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Desain Produk Industri | 2 | 90233 |
| Desain Produk Kayu Dan Serat | 2 | 90312 |

### 141. Desain Mode

Fashion design. Tata Busana is the D3 name for the same field, and Kode 94405 mixes Tata Busana with Desain Busana.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Desain Mode Batik | 1 | 90212 |
| Tata Busana | 6 | 94405, 94410 |

### 142. Kriya

Craft arts; Kode 90211 mixes Kriya and Kriya Seni. Batik and keris-making are crafts.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kriya Seni | 3 | 90401 |
| Kriya Batik | 2 | 90411 |
| Batik dan Fashion | 1 | 90311 |
| Senjata Tradisional Keris | 1 | 90232 |

### 143. Seni Rupa

Fine art; Kode 90201 mixes Seni Rupa Murni, Seni Murni and Seni Rupa.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Seni Rupa Murni | 17 | 90201 |
| Seni Intermedia | 1 | 88200 |
| Konservasi Seni | 1 | 88220 |

### 144. Film dan Televisi

Film and television; the three main names are swapped across Kode 91361/91261/91461.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Produksi Film dan Televisi | 9 | 91361, 91363 |
| Televisi dan Film | 10 | 91261 |
| Kajian Film, Televisi, dan Media | 5 | 91262 |
| Sinematik | 1 | 79303 |

### 145. Penyiaran

Broadcasting programmes (MMTC-type D4s); 1 Prodi each besides Penyiaran.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Penyiaran Konten Digital | 1 | 70205 |
| Manajemen Produksi Siaran | 1 | 70305 |
| Manajemen Produksi Berita | 1 | 70306 |
| Manajemen Teknik Studio Produksi | 1 | 70307 |

### 146. Seni Musik

Music. Kode 91221 mixes Musik Gereja, Seni Musik and Musik. Etnomusikologi and Karawitan stay separate.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Musik | 2 | 91223 |
| Musik Gereja | 30 | 91221 |
| Penciptaan Musik | 1 | 91222 |
| Angklung dan Musik Bambu | 5 | 91321 |
| Bisnis Musik | 1 | 64211 |

### 147. Seni Tari

Dance; regional-dance D4s have 1 Prodi each. Tari Sunda (Kode 90202, mixed) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Tari Melayu | 1 | 91332 |
| Tari Minang | 1 | 91331 |
| Koreografi Inkuiri | 1 | 88227 |

### 148. Seni Teater

Theatre.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teater Musikal | 1 | 91322 |

### 149. Tata Rias dan Kecantikan

Beauty and cosmetology; Kode 94412 mixes Kosmetik dan Perawatan Kecantikan with Tata Rias dan Kecantikan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kosmetik dan Perawatan Kecantikan | 3 | 94313, 94412 |
| Tata Rias | 3 | 94408 |

### 150. Administrasi Publik

Public administration. Kode 63201 mixes Ilmu Administrasi Negara (120) with Administrasi Publik (91), the current official name.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Administrasi Negara | 232 | 63201, 63208 |
| Ilmu Administrasi Negara PSDKU | 1 | 63206 |
| Administrasi Negara | 4 | 63205, 63301 |
| Administrasi Pembangunan Negara | 3 | 95305 |
| Studi Kebijakan Publik | 1 | 63302 |
| Manajemen Sumber Daya Manusia Sektor Publik | 8 | 61302, 61421 |

### 151. Ilmu Pemerintahan

Government studies, including IPDN programmes. Kode 65301 (mixed) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Administrasi Pemerintahan | 2 | 65401 |
| Administrasi Pemerintahan Daerah | 4 | 65302 |
| Praktik Perpolisian Tata Pamong | 1 | 55222 |

### 152. Hubungan Internasional

Kode 64201 is split 37/36 between the two names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Hubungan Internasional | 74 | 64201 |

### 153. Ilmu Komunikasi

Communication studies; branch, distance-learning and narrow variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Komunikasi K. Pangandaran | 1 | 70204 |
| PJJ Ilmu Komunikasi | 5 | 70203 |
| Komunikasi Digital | 1 | 70211 |
| Manajemen Komunikasi | 3 | 57207 |

### 154. Kesejahteraan Sosial

Social welfare and social work; Kode 72201 mixes Ilmu Kesejahteraan Sosial and Kesejahteraan Sosial.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Ilmu Kesejahteraan Sosial | 28 | 72201 |
| Pekerjaan Sosial | 3 | 72302 |
| Pekerja Sosial | 1 | 72401 |
| Rehabilitasi Sosial | 2 | 72303 |
| Perlindungan dan Pemberdayaan Sosial | 2 | 72304 |
| Pembangunan Sosial | 9 | 68201, 86228 |

### 155. Ilmu Kepolisian

Police science; Kode 55220 mixes Ilmu/Sains Kepolisian.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kepolisian | 2 | 95420, 55221 |

### 156. Pemasyarakatan

Corrections programmes (Politeknik Ilmu Pemasyarakatan); 1 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Pemasyarakatan | 1 | 61311 |
| Teknik Pemasyarakatan | 1 | 68301 |
| Bimbingan Kemasyarakatan | 1 | 86301 |

### 157. Keimigrasian

Immigration programmes (Politeknik Imigrasi); 1 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Administrasi Keimigrasian | 1 | 74312 |
| Hukum Keimigrasian | 1 | 74311 |
| Manajemen Teknologi Keimigrasian | 1 | 74313 |

### 158. Pertanahan

Land administration (STPN); 1 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kebijakan dan Manajemen Pendaftaran Tanah | 1 | 63304 |
| Manajemen Penataan Ruang dan Pertanahan | 1 | 63305 |
| Survei Pemetaan dan Informasi Pertanahan | 1 | 63306 |

### 159. Perencanaan Wilayah dan Kota

Urban and regional planning. Kode 35401 (mixed with surveying) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Pembangunan Wilayah | 1 | 95203 |
| Perencanaan Tata Ruang Wilayah dan Kota K. Pekalongan | 1 | 35403 |
| Desain Kawasan Binaan | 2 | 35302 |

### 160. Ilmu Lingkungan

Environmental science (not engineering).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Sains Lingkungan | 3 | 95202 |

### 161. Teknik Sipil

Civil engineering. The D3/D4 building, road/bridge, hydraulic and construction-management programmes are polytechnic civil-engineering tracks, and Kode 22305/22402/22403 already mix them with Teknik Sipil. Kode 22304 (mixed with mechanical) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Sipil Kampus Kab Tojo Una-una | 1 | 22212 |
| Rekayasa Sipil | 5 | 22701 |
| Teknologi Sipil | 3 | 22408 |
| Konstruksi Sipil | 7 | 22402 |
| Konstruksi Gedung | 8 | 22403 |
| Teknologi Rekayasa Konstruksi Bangunan Gedung | 15 | 22303, 22309 |
| Teknologi Rekayasa Konstruksi Jalan dan Jembatan | 24 | 22301 |
| Perancangan Jalan dan Jembatan | 1 | 22307 |
| Teknologi Konstruksi Jalan dan Jembatan | 1 | 22406 |
| Teknologi Rekayasa Konstruksi Bangunan Air | 10 | 22305, 22311 |
| Teknologi Konstruksi Bangunan Air | 2 | 22404 |
| Teknik Bangunan dan Landasan | 3 | 22405 |
| Teknologi Rekayasa Pengelolaan Dan Pemeliharaan Bangunan Sipil | 1 | 22308 |
| Manajemen Konstruksi | 13 | 22302, 22310 |
| Teknik Pengairan | 3 | 22202 |
| Teknik Sumber Daya Air | 1 | 22207 |
| Rekayasa Sumber Daya Air | 1 | 22205 |
| Rekayasa Tata Kelola Air Terpadu | 1 | 46205 |

### 162. Arsitektur

Architecture (D4 variant).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Arsitektur Bangunan Gedung | 6 | 54314, 54319 |

### 163. Teknik Lingkungan

Environmental engineering; Kode 22104's names are environmental-infrastructure variants.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Pengolahan Limbah | 1 | 32203 |
| Teknologi Rekayasa Pengendalian Pencemaran Lingkungan | 2 | 24306 |
| Rekayasa Infrastruktur dan Lingkungan | 5 | 22104 |
| Teknik Infrastruktur dan Lingkungan | 1 | 22208 |

### 164. Teknik Elektro

Electrical and electronic engineering. Kode 20401 (Teknik Elektronika) already contains Teknik Elektro, and 20303/20405 mix Listrik and Elektro names. Kode 20301 (mixed with electromedical) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Rekayasa Elektro | 3 | 20207 |
| Teknik Tenaga Listrik | 3 | 20203 |
| Teknik Listrik | 48 | 20305, 20403 |
| Teknologi Listrik | 13 | 20405 |
| Teknologi Rekayasa Instalasi Listrik | 14 | 20303, 20309 |
| Elektronika dan Instrumentasi | 3 | 30202 |
| Teknik Elektronika | 87 | 20401, 20406, 30302 |
| Teknologi Rekayasa Sistem Elektronika | 19 | 20307, 20310 |

### 165. Teknik Kelistrikan Kapal

Ship electrical engineering, D3 and D4.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Rekayasa Kelistrikan Kapal | 1 | 36307 |

### 166. Teknik Instrumentasi

Instrumentation and control; 1–2 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Instrumentasi & Elektronika Migas | 1 | 32405 |
| Metrologi dan Instrumentasi | 2 | 20404 |
| Teknologi Rekayasa Instrumentasi dan Kontrol | 2 | 30404 |
| Rekayasa Instrumentasi dan Automasi | 2 | 21300 |

### 167. Teknik Mekatronika

Mechatronics and automation; Kode 21412/21312/36304 mix these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Mekatronika | 7 | 21412 |
| Teknologi Rekayasa Mekatronika | 17 | 21312, 21316 |
| Teknologi Rekayasa Otomasi | 11 | 36304 |
| Elektro Mekanika | 1 | 30303 |
| Teknologi Rekayasa Robotika | 1 | 56208 |

### 168. Teknik Telekomunikasi

Telecommunications engineering.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| PJJ Teknik Telekomunikasi | 1 | 20372 |
| Teknologi Rekayasa Jaringan Telekomunikasi | 6 | 20304 |

### 169. Teknik Mesin

Mechanical engineering. Manufacturing, design, maintenance, foundry, welding, HVAC and heavy-equipment programmes are polytechnic mechanical tracks, and Kode 21302/21301/21408 already mix them with Teknik Mesin. Otomotif has its own Jurusan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Rekayasa Mesin | 1 | 30603 |
| Teknologi Mesin | 1 | 21420 |
| Teknik Mesin Industri | 7 | 21402 |
| Teknik Mesin Produksi dan Perawatan | 1 | 21311 |
| Perawatan Dan Perbaikan Mesin | 14 | 21408 |
| Perawatan dan Perbaikan | 1 | 21416 |
| Rekayasa Perancangan Mekanik | 18 | 21301, 21319 |
| Teknik Perancangan Mekanik | 2 | 21409 |
| Pembuatan Peralatan dan Perkakas Produksi | 1 | 21404 |
| Teknik Manufaktur | 9 | 21208, 21307 |
| Teknologi Manufaktur | 6 | 21407 |
| Teknologi Rekayasa Manufaktur | 22 | 21314, 21317, 36301 |
| Pengecoran | 2 | 21410 |
| Teknologi Rekayasa Pengelasan dan Fabrikasi | 6 | 36303 |
| Teknik Pendingin Dan Tata Udara | 6 | 21305, 21405 |
| Teknik Alat Berat | 12 | 21413, 21414, 21415 |
| Pemeliharaan Alat Berat | 1 | 21421 |
| Teknologi Rekayasa Pemeliharaan Alat Berat | 6 | 21313, 21318 |

### 170. Teknik Otomotif

Automotive engineering; Kode 21403 mixes Mesin/Teknik/Teknologi Otomotif.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Mesin Otomotif | 20 | 21403 |
| Teknik Otomotif Elektronik | 1 | 21310 |
| Teknologi Rekayasa Otomotif | 19 | 21304 |

### 171. Teknik Energi

Energy engineering; Kode 21308 and 21306 mix renewable, conversion and power-generation names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Sistem Energi | 8 | 21206, 21210 |
| Teknik Energi Terbarukan | 2 | 21202 |
| Teknologi Rekayasa Energi Terbarukan | 11 | 21308, 21315 |
| Teknologi Rekayasa Pembangkit Energi | 5 | 21309 |
| Teknik Konversi Energi | 4 | 21406 |
| Teknologi Konversi Energi | 1 | 21418 |
| Sistem Pembangkit Energi | 4 | 21306 |
| Teknik Bioenergi dan Kemurgi | 1 | 21012 |

### 172. Teknik Nuklir

Nuclear engineering; 1 Prodi each.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknokimia Nuklir | 1 | 37301 |

### 173. Teknik Industri

Industrial engineering; Kode 26401 mixes Teknik Industri with Teknik dan Manajemen Industri.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Industri Kampus Batang | 1 | 26216 |
| PJJ Teknik Industri | 2 | 26205 |
| Rekayasa Industri | 4 | 26211, 26281 |
| Manajemen Industri | 9 | 26104, 26402 |
| Manajemen Rekayasa | 7 | 26202 |
| Manajemen Teknologi Rekayasa | 1 | 26305 |

### 174. Teknik Kimia

Chemical engineering; the polytechnic industrial-chemistry and bioprocess programmes are tracks of it.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Kimia Industri | 7 | 24301 |
| Teknologi Rekayasa Kimia Industri | 15 | 24105, 24305, 24308 |
| Teknik Bioproses | 3 | 25202, 25203 |
| Petro dan oleo Kimia | 2 | 24403, 24405 |

### 175. Teknik Tekstil

Textile engineering.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Kimia Tekstil | 2 | 24304 |
| Rekayasa Tekstil | 1 | 24202 |

### 176. Teknik Metalurgi

Metallurgy and materials engineering (usually one department).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Material | 4 | 28201 |
| Teknologi Metalurgi | 2 | 27401 |
| Teknologi Metalurgi Ekstraksi | 2 | 27301 |
| Teknologi Rekayasa Metalurgi | 1 | 27302 |
| Teknologi Rekayasa Material Maju | 1 | 28301 |

### 177. Teknik Pertambangan

Mining engineering.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Rekayasa Pertambangan | 1 | 31202 |
| Teknologi Pertambangan | 1 | 31301 |

### 178. Teknik Perminyakan

Petroleum/oil-and-gas engineering; Kode 32401/32402 mix these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Perminyakan | 3 | 32401 |
| Rekayasa Minyak dan Gas | 1 | 32400 |
| Teknik Pengolahan Minyak dan Gas | 6 | 32202, 32402 |
| Teknologi Rekayasa Sistem Mekanikal Minyak dan Gas | 1 | 26303 |

### 179. Teknik Geologi

Geological engineering. Kode 34401 (mixed with geomatics) is excluded.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Rekayasa Geologi | 2 | 34302 |
| Teknologi Geologi | 1 | 34301 |

### 180. Teknik Geodesi

Geodesy, geomatics and surveying; the same field under old and new names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Geomatika | 6 | 29202 |
| Teknologi Geomatika | 1 | 29301 |
| Teknologi Rekayasa Geomatika Dan Survei | 5 | 35303 |
| Survei dan Pemetaan | 2 | 35402 |

### 181. Teknik Perkapalan

Naval architecture and shipbuilding.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Bangunan Kapal | 3 | 36403 |
| Teknologi Rekayasa Konstruksi Perkapalan | 4 | 36305, 36309 |
| Teknik Sistem Perkapalan | 6 | 36202 |

### 182. Teknik Kelautan

Ocean and offshore engineering; Kode 38201 already mixes Teknik Kelautan with Oseanografi/Hidrografi.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Lepas Pantai | 1 | 54040 |
| Teknologi Rekayasa Kelautan | 1 | 38301 |
| Hidro Oseanografi | 1 | 38401 |

### 183. Permesinan Kapal

Ship machinery, D3 and D4.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Rekayasa Permesinan Kapal | 6 | 36306 |

### 184. Nautika

Deck-officer training; 'Operasi Kapal' is the D4 polytechnic name.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknologi Rekayasa Operasi Kapal | 4 | 36308, 36310 |

### 185. Penerbang

Pilot training.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Penerbang Sayap Tetap | 1 | 40408 |

### 186. Lalu Lintas Udara

Air traffic services; Kode 39404 mixes these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Lalu Lintas Udara | 4 | 39404 |
| Teknik Navigasi Udara | 1 | 40308 |

### 187. Teknik Pesawat Udara

Aircraft engineering and maintenance (airframe, engine, avionics); Kode 40403/40407 mix these names.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Aeronautika | 3 | 40403 |
| Teknik Aeronautika | 4 | 40402 |
| Teknik Aeronautika Pertahanan | 1 | 40301 |
| Teknologi Pemeliharaan Pesawat Udara | 6 | 40407 |
| Teknologi Rekayasa Pemeliharaan Pesawat Udara | 3 | 40311 |
| Teknologi Rekayasa Aeronautika | 1 | 40303 |
| Motor Pesawat | 1 | 40404 |
| Listrik Pesawat | 1 | 40401 |
| Avionika | 1 | 40405 |

### 188. Teknik Dirgantara

Aerospace engineering (S1).

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Teknik Penerbangan | 4 | 40201 |

### 189. Manajemen Pertahanan

Defence management (military academies). The second name is truncated in the export ("…Aspek Dar" = "Aspek Darat"), and Kode 61308 also contains Manajemen Pertahanan and an Air Force variant, so the service-specific names are dropped.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Manajemen Pertahanan Matra Laut | 5 | 61308 |
| Manajemen Pertahanan Matra Laut Aspek Dar | 2 | 61309 |

### 190. Asuransi

Insurance D3 programmes split by line (life, health, general); 1–2 Prodi each. Asuransi Syariah stays separate, consistent with the other Syariah finance Jurusan.

| Merged name | Prodi | Kode Prodi |
|---|---:|---|
| Asuransi Jiwa | 1 | 94401 |
| Asuransi Kesehatan | 1 | 94402 |
| Administrasi Asuransi & Aktuaria | 2 | 94409 |

## Kode left untouched

These rows keep the proposed Jurusan exactly as generated. Each needs a human decision.

| Kode | Jenjang | Prodi | Proposed Jurusan | Top names | Why untouched |
|---|---|---:|---|---|---|
| 87220 | S1 | 25 | Ekonomi | Ekonomi (5); Pendidikan IPS (5); Tadris IPS (4) | Names split between Ekonomi, Pendidikan IPS and Tadris IPS (20% agreement); unclear whether this Kode is economics or social-studies teaching. |
| 61305 | D4 | 4 | Administrasi Perkantoran Digital | Administrasi Perkantoran Digital (2); Manajemen Perusahaan (2) | Names split evenly between Administrasi Perkantoran Digital and Manajemen Perusahaan. |
| 61411 | D3 | 2 | Manajemen Logistik Industri Elektronika | Manajemen Logistik Industri Elektronika (1); Teknik Industri Agro (1) | Names mix Manajemen Logistik Industri Elektronika with Teknik Industri Agro. |
| 61304 | D4 | 24 | Manajemen Pemasaran Internasional | Manajemen Pemasaran Internasional (9); Manajemen Pemasaran (5); Pemasaran Digital (5) | Names split between international marketing (9), marketing (5) and digital marketing (5); no clear target. |
| 90202 | D4 | 2 | Tari Sunda | Tari Sunda (1); Tata Kelola Seni (1) | Only 2 Prodi: Tari Sunda and Tata Kelola Seni. |
| 14202 | S1 | 3 | Higiene Gigi | Higiene Gigi (1); Ilmu Keperawatan K. Jembrana (1); Keperawatan (1) | Only 3 Prodi: Higiene Gigi, Ilmu Keperawatan and Keperawatan; dental hygiene vs nursing is unclear. |
| 13472 | D3 | 2 | Rekam Medis & Informasi Kesehatan | Rekam Medis & Informasi Kesehatan (1); Teknologi Laboratorium Medis (1) | Only 2 Prodi: Rekam Medis and Teknologi Laboratorium Medis. |
| 84201 | S1 | 17 | Pendidikan IPA | Pendidikan IPA (6); Hubungan Internasional (5); Pendidikan Ilmu Pengetahuan Alam (4) | Names mix Pendidikan IPA with 5 Prodi called Hubungan Internasional; likely a data error in the export. |
| 88216 | S1 | 2 | Pendidikan Seni dan Keagamaan | Pendidikan Seni dan Keagamaan (1); Pendidikan Seni Tari (1) | Only 2 Prodi: religious arts education and dance education. |
| 84211 | S1 | 2 | Pendidikan Teknologi Agroindustri | Pendidikan Teknologi Agroindustri (1); Teknologi Agroindustri (1) | Only 2 Prodi: one teacher-education and one non-education agroindustry programme. |
| 54290 | S1 | 2 | Agribisnis | Agribisnis (1); Ekonomi Sumberdaya Dan Lingkungan (1) | Only 2 Prodi: Agribisnis and Ekonomi Sumberdaya dan Lingkungan. |
| 54281 | S1 | 2 | Agribisnis K. Mataram | Agribisnis K. Mataram (1); Agroekoteknologi (1) | Only 2 Prodi: an Agribisnis branch campus and Agroekoteknologi. |
| 54331 | D4 | 3 | Agribisnis Unggas | Agribisnis Unggas (1); Manajemen Bisnis Unggas (1); Teknologi Pakan Ternak (1) | Names mix poultry business with animal-feed technology. |
| 54411 | D3 | 2 | Agro Industri | Agro Industri (1); Teknologi Industri Benih (1) | Only 2 Prodi: Agro Industri and Teknologi Industri Benih. |
| 54453 | D3 | 4 | Ekowisata | Ekowisata (2); Konservasi Sumberdaya Hutan (1); Manajemen Sumber Daya Hutan (1) | Names mix ecotourism with forest conservation and forest management. |
| 41234 | S1 | 2 | Ilmu Perikanan | Ilmu Perikanan (1); Teknologi Hasil Perikanan (1) | Only 2 Prodi: Ilmu Perikanan and Teknologi Hasil Perikanan. |
| 54205 | S1 | 2 | Ilmu Pertanian | Ilmu Pertanian (1); Teknologi Hasil Pertanian (1) | Only 2 Prodi: Ilmu Pertanian and Teknologi Hasil Pertanian. |
| 41401 | D3 | 7 | Keteknikan Pertanian | Keteknikan Pertanian (1); Mekanisasi Perikanan (1); Mekanisasi Pertanian (1) | 7 Prodi with 14% agreement across agricultural and fisheries mechanisation. |
| 41402 | D3 | 2 | Mekanisasi Perikanan | Mekanisasi Perikanan (1); Tata Air Pertanian (1) | Names mix fisheries mechanisation with agricultural water management. |
| 41331 | D4 | 3 | Pengelolaan Agribisnis | Pengelolaan Agribisnis (1); Teknik Produksi Benih (1); Teknologi Perbenihan (1) | Proposed 'Pengelolaan Agribisnis' but the other names are seed-production programmes. |
| 41311 | D4 | 9 | Pengembangan Produk Agroindustri | Pengembangan Produk Agroindustri (2); Agribisnis (1); Agribisnis Pangan (1) | 9 Prodi with 22% agreement across agroindustry product development and agribusiness. |
| 54451 | D3 | 2 | Pengolahan Hasil Hutan | Pengolahan Hasil Hutan (1); Teknologi Pengolahan Hasil Bumi (1) | Names mix forest-product processing with general crop processing. |
| 41333 | D4 | 4 | Pengolahan Hasil Perkebunan Terpadu | Pengolahan Hasil Perkebunan Terpadu (1); Teknologi Pengolahan Hasil Perkebunan (1); Teknologi Pengolahan Hasil Ternak (1) | Names mix plantation-crop processing with livestock-product processing. |
| 54443 | D3 | 12 | Teknik Penangkapan Ikan | Teknik Penangkapan Ikan (4); Budidaya Perairan (2); Teknologi Budidaya Perikanan (2) | Names mix capture fisheries (Teknik Penangkapan Ikan) with aquaculture (Budidaya Perairan). |
| 54313 | D4 | 4 | Teknologi Benih | Teknologi Benih (2); Teknologi dan Manajemen Pembenihan Ikan (1); Teknologi Pembenihan Ikan (1) | Teknologi Benih here mixes plant-seed and fish-hatchery programmes. |
| 54249 | S1 | 7 | Teknologi Hasil Perikanan | Teknologi Hasil Perikanan (4); Pendidikan Kelautan dan Perikanan Kampus Serang (1); Sosial Ekonomi Perikanan (1) | Names mix fish-product technology, fisheries education and fisheries socio-economics. |
| 90443 | D3 | 3 | Multi Media | Multi Media (1); Teknik Komputer dan Jaringan (1); Teknologi Multimedia dan Broadcasting (1) | Names mix Multimedia, Teknik Komputer dan Jaringan and broadcasting. |
| 65301 | D4 | 3 | Administrasi Pemerintahan | Administrasi Pemerintahan (1); Manajemen Kontrak Pemerintah (1); Manajemen Pemerintahan (1) | Names mix government administration with government contract management. |
| 70209 | S1 | 2 | Bimbingan Penyuluhan Islam | Bimbingan Penyuluhan Islam (1); Kepenyuluhan Buddha (1) | Only 2 Prodi: Islamic counselling and Buddhist extension (Kepenyuluhan Buddha). |
| 68401 | D3 | 2 | Hubungan Masyarakat K. Batang | Hubungan Masyarakat K. Batang (1); Pembangunan Masyarakat Desa (1) | Proposed name is a Humas branch campus, but the other Prodi is Pembangunan Masyarakat Desa. |
| 61208 | S1 | 2 | Manajemen Administrasi Perkantoran | Manajemen Administrasi Perkantoran (1); Pendidikan Administrasi Perkantoran (1) | Only 2 Prodi: office-administration management and its teacher-education counterpart. |
| 57302 | D4 | 19 | Keamanan Sistem Informasi | Keamanan Sistem Informasi (6); Rekayasa Keamanan Siber (6); Komputerisasi Akuntansi (3) | Names mix information security (6), cyber security (6) and Komputerisasi Akuntansi (3). |
| 57482 | D3 | 2 | Manajemen Informatika Kampus Kota Padang | Manajemen Informatika Kampus Kota Padang (1); Sistem Informasi Kampus Kota Tasikmalaya (1) | Names mix Manajemen Informatika and Sistem Informasi branch campuses; the proposed name also carries a campus suffix. Needs a human choice between the two. **Decided later: mapped to Manajemen Informatika. The Sistem Informasi Tasikmalaya Prodi may need a per-Prodi override.** |
| 22313 | D4 | 5 | Pengelolaan Pelabuhan Perikanan | Pengelolaan Pelabuhan Perikanan (1); Teknik Infrastruktur Sipil dan Perancangan Arsitektur (1); Teknik Pengelolaan dan Pemeliharaan Infrastruktur Sipil (1) | Names mix Pengelolaan Pelabuhan Perikanan with civil-infrastructure programmes (20% agreement). |
| 32403 | D3 | 3 | Pengolahan Limbah Industri | Pengolahan Limbah Industri (1); Teknik Analisis Lab Minyak Dan Gas (1); Teknologi Pengolahan Karet dan Plastik (1) | Names mix waste treatment, oil-and-gas lab analysis and rubber/plastic processing. |
| 35401 | D3 | 3 | Perencanaan Tata Ruang Wilayah Dan Kota | Perencanaan Tata Ruang Wilayah Dan Kota (1); Survei Dan Pemetaan (1); Teknik Survey dan Pemetaan (1) | Names mix spatial planning with surveying and mapping. |
| 26304 | D4 | 6 | Relasi Industri | Relasi Industri (3); Administrasi Bisnis Otomotif (1); Bisnis Industri Kreatif (1) | Names mix industrial relations, automotive business administration and creative-industry business. |
| 22304 | D3;D4 | 5 | Teknik Bangunan Rawa | Teknik Bangunan Rawa (1); Teknik Perancangan Irigasi Dan Penanganan Pantai (1); Teknik Perawatan dan Perbaikan Mesin (1) | Names mix Teknik Bangunan Rawa, irrigation/coastal engineering and Teknik Perawatan dan Perbaikan Mesin. |
| 21303 | D4 | 3 | Teknik Elektromedik | Teknik Elektromedik (1); Teknik Otomotif Elektronik (1); Teknik Otomotif Kendaraan Tempur (1) | Names mix Teknik Elektromedik with two automotive programmes (Otomotif Elektronik, Otomotif Kendaraan Tempur). |
| 20301 | D4 | 23 | Teknik Elektronika | Teknik Elektronika (5); Teknologi Rekayasa Elektro-medis (3); Teknik Elektro (2) | 23 Prodi with 22% agreement across electronics, electromedical and electrical engineering. |
| 34401 | D3 | 3 | Teknik Geologi | Teknik Geologi (1); Teknik Geologi Terapan (1); Teknologi Geomatika (1) | Names mix Teknik Geologi and Teknologi Geomatika. |
| 26301 | D4 | 2 | Teknik Industri Otomotif | Teknik Industri Otomotif (1); Teknik Manajemen Industri Pertahanan (1) | Only 2 Prodi: Teknik Industri Otomotif and Teknik Manajemen Industri Pertahanan. |
| 21411 | D3 | 7 | Teknik Mekanikal Bandar Udara | Teknik Mekanikal Bandar Udara (1); Teknik Mesin (1); Teknik Perancangan Mekanik dan Mesin (1) | 7 Prodi with 14% agreement: airport mechanical engineering mixed with general mechanical engineering. |
| 90346 | D4 | 12 | Teknologi Rekayasa Multimedia | Teknologi Rekayasa Multimedia (5); Teknologi Rekayasa Komputer Jaringan (3); Teknik Multimedia dan Jaringan (2) | Names mix Teknologi Rekayasa Multimedia (5) with computer-network programmes (5). |

## Every row still marked perlu_cek (389)

| Kode | Jenjang | Bidang | Prodi | Agreement | Top names | Jurusan now | Reasoning |
|---|---|---|---:|---:|---|---|---|
| 86212 | S1 | Agama | 7 | 57% | Bimbingan dan Konseling Kristen (4); Bimbingan Konseling Kristen (1); Konseling Pastoral (1) | Bimbingan dan Konseling Kristen | Low agreement comes from spelling or wording variants of the same field; "Bimbingan dan Konseling Kristen" is kept (it is also a merge target). |
| 87220 | S1 | Agama | 25 | 20% | Ekonomi (5); Pendidikan IPS (5); Tadris IPS (4) | Ekonomi | Untouched (unsure): Names split between Ekonomi, Pendidikan IPS and Tadris IPS (20% agreement); unclear whether this Kode is economics or social-studies teaching. |
| 76239 | S1 | Agama | 5 | 40% | Filsafat Agama Hindu (2); Filsafat Hindu (2); Ilmu Filsafat Hindu (1) | Studi Agama Hindu | Names are variants of one field. Merged from "Filsafat Agama Hindu" into "Studi Agama Hindu" (see merge "Studi Agama Hindu"). |
| 74239 | S1 | Agama | 14 | 57% | Hukum Tatanegara (Siyasah Syar'iyyah) (8); Hukum Tata Negara (Siyasah Syar`iyyah) (2); Hukum Tatanegara (Siyasah Syar`iyyah) (2) | Hukum Tatanegara (Siyasah Syar'iyyah) | Low agreement comes from spelling or wording variants of the same field; "Hukum Tatanegara (Siyasah Syar'iyyah)" is kept. |
| 76231 | S1 | Agama | 164 | 46% | Ilmu Al-Qur`an dan Tafsir (76); Ilmu Al-Qur'an dan Tafsir (40); Ilmu Al-Quran dan Tafsir (21) | Ilmu Al-Qur'an dan Tafsir | Names are variants of one field. Merged from "Ilmu Al-Qur`an dan Tafsir" into "Ilmu Al-Qur'an dan Tafsir" (see merge "Ilmu Al-Qur'an dan Tafsir"). |
| 76201 | S1 | Agama | 11 | 45% | Manajemen Haji dan Umrah (5); Manajemen Haji dan Umroh (5); Pendidikan Agama Islam (1) | Manajemen Haji dan Umrah | Haji/Umrah vs Haji/Umroh is a spelling split; the single Pendidikan Agama Islam Prodi is a stray minority. Kept. |
| 77202 | S1 | Agama | 9 | 56% | Misiologi (5); Misi dan Komunikasi Kristen (3); Misiologi dan Komunikasi Kristen (1) | Teologi | Names are variants of one field. Merged from "Misiologi" into "Teologi" (see merge "Teologi"). |
| 76202 | S1 | Agama | 10 | 40% | Pariwisata Budaya dan Keagamaan (4); Pariwisata Syariah (4); Pariwisata Budaya dan Agama (2) | Pariwisata | Names are variants of one field. Merged from "Pariwisata Budaya dan Keagamaan" into "Pariwisata" (see merge "Pariwisata"). |
| 70238 | S1 | Agama | 4 | 50% | Pendidikan Penyuluh Agama (2); Bimbingan Penyuluhan Islam (1); Komunikasi dan Penyiaran Islam (1) | Pendidikan Penyuluh Agama | All three names are religious outreach (penyuluhan/dakwah) programmes with 1–2 Prodi each. Kept, but could be merged into Bimbingan dan Konseling Islam if you prefer fewer Jurusan. |
| 83314 | S1 | Agama | 2 | 50% | Pendidikan Tata Busana (1); Pendidikan Vokasional Desain Fashion (1) | Pendidikan Tata Busana | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Tata Busana" is kept (it is also a merge target). |
| 76234 | S1 | Agama | 21 | 57% | Studi Agama-Agama (12); Studi Agama Agama (8); Perbandingan Agama (1) | Studi Agama-Agama | Low agreement comes from spelling or wording variants of the same field; "Studi Agama-Agama" is kept. |
| 76236 | S1 | Agama | 23 | 65% | Tasawuf dan Psikoterapi (15); Ilmu Tasawuf (5); Akhlak dan Tasawuf (1) | Tasawuf dan Psikoterapi | Low agreement comes from spelling or wording variants of the same field; "Tasawuf dan Psikoterapi" is kept (it is also a merge target). |
| 77201 | S1 | Agama | 340 | 64% | Teologi (Akademik) (218); Teologi (95); Ilmu Teologi (8) | Teologi | Names are variants of one field. Merged from "Teologi (Akademik)" into "Teologi" (see merge "Teologi"). |
| 60202 | S1 | Agama;Ekonomi | 272 | 68% | Ekonomi Syariah (186); Ekonomi Islam (33); Ekonomi Syari`ah (24) | Ekonomi Syariah | Low agreement comes from spelling or wording variants of the same field; "Ekonomi Syariah" is kept (it is also a merge target). |
| 63215 | S1 | Agama;Teknik | 8 | 63% | Logistik (5); Teknik Logistik (2); Logistik Kelautan (1) | Logistik | Low agreement comes from spelling or wording variants of the same field; "Logistik" is kept (it is also a merge target). |
| 61401 | D3 | Ekonomi | 29 | 55% | Administrasi Perkantoran (16); Manajemen Administrasi (7); Manajemen Perkantoran (4) | Administrasi Perkantoran | Low agreement comes from spelling or wording variants of the same field; "Administrasi Perkantoran" is kept (it is also a merge target). |
| 61303 | D4 | Ekonomi | 2 | 50% | Administrasi Perkantoran Digital (1); Manajemen Perkantoran Digital (1) | Administrasi Perkantoran | Names are variants of one field. Merged from "Administrasi Perkantoran Digital" into "Administrasi Perkantoran" (see merge "Administrasi Perkantoran"). |
| 61305 | D4 | Ekonomi | 4 | 50% | Administrasi Perkantoran Digital (2); Manajemen Perusahaan (2) | Administrasi Perkantoran Digital | Untouched (unsure): Names split evenly between Administrasi Perkantoran Digital and Manajemen Perusahaan. |
| 62301 | D4 | Ekonomi | 28 | 25% | Akuntansi (7); Akuntansi Manajerial (5); Akuntansi Perpajakan (5) | Akuntansi | Low agreement comes from spelling or wording variants of the same field; "Akuntansi" is kept (it is also a merge target). |
| 60304 | D4;S1 | Ekonomi | 6 | 67% | Akuntansi Lembaga Keuangan Syariah (4); Keuangan dan Perbankan Syariah (1); Perbankan Syariah (1) | Akuntansi Syariah | Names are variants of one field. Merged from "Akuntansi Lembaga Keuangan Syariah" into "Akuntansi Syariah" (see merge "Akuntansi Syariah"). |
| 62306 | D4 | Ekonomi | 10 | 40% | Akuntansi Perpajakan (4); Akuntansi (2); Akuntansi Bisnis Digital (1) | Akuntansi | Names are variants of one field. Merged from "Akuntansi Perpajakan" into "Akuntansi" (see merge "Akuntansi"). |
| 62307 | D4 | Ekonomi | 3 | 67% | Akuntansi Sektor Publik (2); Akuntansi Perpajakan (1) | Akuntansi | Names are variants of one field. Merged from "Akuntansi Sektor Publik" into "Akuntansi" (see merge "Akuntansi"). |
| 62202 | S1 | Ekonomi | 57 | 58% | Akuntansi Syariah (33); Akuntansi Syari`ah (21); Akuntansi Syari'ah (2) | Akuntansi Syariah | Low agreement comes from spelling or wording variants of the same field; "Akuntansi Syariah" is kept (it is also a merge target). |
| 62204 | S1 | Ekonomi | 6 | 50% | Akuntansi Syariah (3); Perbankan Syariah (3) | Akuntansi Syariah | Split 3/3 between Akuntansi Syariah and Perbankan Syariah. Kept as Akuntansi Syariah (both are Syariah finance); you may prefer Perbankan Syariah. |
| 61310 | D4 | Ekonomi | 5 | 60% | Analisis Keuangan (3); Analis Keuangan (2) | Keuangan dan Perbankan | Names are variants of one field. Merged from "Analisis Keuangan" into "Keuangan dan Perbankan" (see merge "Keuangan dan Perbankan"). |
| 49206 | S1 | Ekonomi | 2 | 50% | Bachelor of Business Analytics (1); Bsc (Hons) Business Analytics (1) | Bachelor of Business Analytics | Low agreement comes from spelling or wording variants of the same field; "Bachelor of Business Analytics" is kept. |
| 61313 | D4 | Ekonomi | 2 | 50% | Bisnis Properti (1); Manajemen dan Penilaian Properti (1) | Bisnis Properti | Low agreement comes from spelling or wording variants of the same field; "Bisnis Properti" is kept. |
| 87222 | S1 | Ekonomi | 2 | 50% | Ekonomi Keuangan dan Perbankan (1); Ekonomi, Keuangan, dan Perbankan (1) | Keuangan dan Perbankan | Names are variants of one field. Merged from "Ekonomi Keuangan dan Perbankan" into "Keuangan dan Perbankan" (see merge "Keuangan dan Perbankan"). |
| 60204 | S1 | Ekonomi | 3 | 33% | Ilmu Ekonomi dan Keuangan Islam (1); Manajemen Keuangan Syari`ah (1); Perbankan Syariah (1) | Ilmu Ekonomi dan Keuangan Islam | Three single Prodi in Islamic economics, finance and banking. Kept; a candidate to merge into Ekonomi Syariah. |
| 61409 | D3 | Ekonomi | 2 | 50% | Kebendaharaan Negara (1); Keuangan Negara (1) | Keuangan Negara | Names are variants of one field. Merged from "Kebendaharaan Negara" into "Keuangan Negara" (see merge "Keuangan Negara"). |
| 61306 | D4 | Ekonomi | 11 | 18% | Keuangan (2); Perbankan dan Keuangan (2); Akuntansi Lembaga Keuangan Syariah (1) | Keuangan dan Perbankan | Names are variants of one field. Merged from "Keuangan" into "Keuangan dan Perbankan" (see merge "Keuangan dan Perbankan"). |
| 61406 | D3 | Ekonomi | 72 | 64% | Keuangan Dan Perbankan (46); Manajemen Keuangan (8); Perbankan dan Keuangan (8) | Keuangan dan Perbankan | Names are variants of one field. Merged from "Keuangan Dan Perbankan" into "Keuangan dan Perbankan" (see merge "Keuangan dan Perbankan"). |
| 40306 | D4 | Ekonomi | 5 | 40% | Logistik Niaga-El (2); Logistik Bisnis (1); Logistik Niaga El (1) | Logistik | Names are variants of one field. Merged from "Logistik Niaga-El" into "Logistik" (see merge "Logistik"). |
| 61271 | S1 | Ekonomi | 5 | 60% | Manajemen (3); Manajemen K. Kab. Gayo Lues (1); Manajemen K. Sintang (1) | Manajemen | Low agreement comes from spelling or wording variants of the same field; "Manajemen" is kept (it is also a merge target). |
| 61281 | S1 | Ekonomi | 2 | 50% | Manajemen (1); Manajemen K. Mataram (1) | Manajemen | Low agreement comes from spelling or wording variants of the same field; "Manajemen" is kept (it is also a merge target). |
| 61307 | D4 | Ekonomi | 2 | 50% | Manajemen Aset (1); Manajemen Aset Publik (1) | Keuangan Negara | Names are variants of one field. Merged from "Manajemen Aset" into "Keuangan Negara" (see merge "Keuangan Negara"). |
| 61301 | D4 | Ekonomi | 5 | 60% | Manajemen Bisnis (3); Keuangan Daerah (1); Manajemen Keuangan (1) | Manajemen | Names are variants of one field. Merged from "Manajemen Bisnis" into "Manajemen" (see merge "Manajemen"). |
| 60203 | S1 | Ekonomi | 4 | 50% | Manajemen Bisnis Syariah (2); Bisnis Islam (1); Manajemen Bisnis Syari'ah (1) | Manajemen Syariah | Names are variants of one field. Merged from "Manajemen Bisnis Syariah" into "Manajemen Syariah" (see merge "Manajemen Syariah"). |
| 61413 | D3 | Ekonomi | 2 | 50% | Manajemen Kampus Kab Rembang (1); Manajemen Perusahaan (1) | Manajemen | Names are variants of one field. Merged from "Manajemen Kampus Kab Rembang" into "Manajemen" (see merge "Manajemen"). |
| 61211 | S1 | Ekonomi | 34 | 56% | Manajemen Keuangan Syariah (19); Manajemen Bisnis Syariah (11); Manajemen Bisnis Syari'ah (1) | Manajemen Syariah | Names are variants of one field. Merged from "Manajemen Keuangan Syariah" into "Manajemen Syariah" (see merge "Manajemen Syariah"). |
| 61411 | D3 | Ekonomi | 2 | 50% | Manajemen Logistik Industri Elektronika (1); Teknik Industri Agro (1) | Manajemen Logistik Industri Elektronika | Untouched (unsure): Names mix Manajemen Logistik Industri Elektronika with Teknik Industri Agro. |
| 61304 | D4 | Ekonomi | 24 | 38% | Manajemen Pemasaran Internasional (9); Manajemen Pemasaran (5); Pemasaran Digital (5) | Manajemen Pemasaran Internasional | Untouched (unsure): Names split between international marketing (9), marketing (5) and digital marketing (5); no clear target. |
| 61402 | D3 | Ekonomi | 9 | 67% | Manajemen Perdagangan (6); Bisnis Internasional (1); Manajemen Bisnis Syariah (1) | Manajemen | Names are variants of one field. Merged from "Manajemen Perdagangan" into "Manajemen" (see merge "Manajemen"). |
| 61403 | D3 | Ekonomi | 17 | 41% | Manajemen Perpajakan (7); Manajemen Pajak (5); Perpajakan (2) | Perpajakan | Names are variants of one field. Merged from "Manajemen Perpajakan" into "Perpajakan" (see merge "Perpajakan"). |
| 61308 | D4 | Ekonomi | 5 | 40% | Manajemen Pertahanan Matra Laut (2); Manajemen Pertahanan (1); Pertahanan TNI Angkatan Udara (1) | Manajemen Pertahanan | Names are variants of one field. Merged from "Manajemen Pertahanan Matra Laut" into "Manajemen Pertahanan" (see merge "Manajemen Pertahanan"). |
| 61309 | D4 | Ekonomi | 2 | 50% | Manajemen Pertahanan Matra Laut Aspek Dar (1); Manajemen Pertahanan Matra Laut Aspek Darat (1) | Manajemen Pertahanan | Names are variants of one field. Merged from "Manajemen Pertahanan Matra Laut Aspek Dar" into "Manajemen Pertahanan" (see merge "Manajemen Pertahanan"). |
| 61405 | D3 | Ekonomi | 41 | 61% | Manajemen Perusahaan (25); Manajemen Bisnis (5); Manajemen Bandar Udara (3) | Manajemen | Names are variants of one field. Merged from "Manajemen Perusahaan" into "Manajemen" (see merge "Manajemen"). |
| 61210 | S1 | Ekonomi | 5 | 60% | Manajemen Retail (3); Manajemen (1); PJJ Bisnis Digital (1) | Manajemen | Names are variants of one field. Merged from "Manajemen Retail" into "Manajemen" (see merge "Manajemen"). |
| 61302 | D4 | Ekonomi | 7 | 57% | Manajemen Sumber Daya Manusia Sektor Publik (4); Manajemen Sumber Daya Manusia Aparatur (3) | Administrasi Publik | Names are variants of one field. Merged from "Manajemen Sumber Daya Manusia Sektor Publik" into "Administrasi Publik" (see merge "Administrasi Publik"). |
| 61408 | D3 | Ekonomi | 5 | 40% | Manajemen Transportasi Udara (2); Manajemen Transportasi (1); Manajemen Transportasi Jalan (1) | Transportasi | Names are variants of one field. Merged from "Manajemen Transportasi Udara" into "Transportasi" (see merge "Transportasi"). |
| 60301 | D4 | Ekonomi | 4 | 50% | Pembangunan Pedesaan dan Ekonomi Masyarakat (2); Pembangunan Ekonomi dan Pemberdayaan Masyarakat (1); Pembangunan Ekonomi Kewilayahan (1) | Ekonomi Pembangunan | Names are variants of one field. Merged from "Pembangunan Pedesaan dan Ekonomi Masyarakat" into "Ekonomi Pembangunan" (see merge "Ekonomi Pembangunan"). |
| 61314 | D4 | Ekonomi | 2 | 50% | Perbankan (1); Perbankan Dan Keuangan Digital (1) | Keuangan dan Perbankan | Names are variants of one field. Merged from "Perbankan" into "Keuangan dan Perbankan" (see merge "Keuangan dan Perbankan"). |
| 13263 | S1 | Ekonomi;Kesehatan | 25 | 88% | Administrasi Kesehatan (22); Manajemen Informasi Kesehatan (2); Adminstrasi Kesehatan (1) | Administrasi Kesehatan | Flagged only because the Kode spans more than one bidang (Ekonomi;Kesehatan); the names agree, so "Administrasi Kesehatan" is kept. |
| 60206 | S1 | Ekonomi;Sosial | 201 | 97% | Ekonomi Syariah (194); Ekonomi Syari'ah (2); Ekonomi Islam (1) | Ekonomi Syariah | Flagged only because the Kode spans more than one bidang (Ekonomi;Sosial); the names agree, so "Ekonomi Syariah" is kept. |
| 82201 | S1 | Humaniora | 25 | 48% | Antropologi (12); Antropologi Sosial (9); Antropologi Budaya (4) | Antropologi | Low agreement comes from spelling or wording variants of the same field; "Antropologi" is kept. |
| 79210 | S1 | Humaniora | 3 | 67% | Bahasa dan Kebudayaan Korea (2); Bahasa Korea (1) | Bahasa dan Kebudayaan Korea | Low agreement comes from spelling or wording variants of the same field; "Bahasa dan Kebudayaan Korea" is kept (it is also a merge target). |
| 79203 | S1 | Humaniora | 40 | 68% | Bahasa dan Sastra Arab (27); Sastra Arab (12); Bahasa dan Kebudayaan Arab (1) | Bahasa dan Sastra Arab | Low agreement comes from spelling or wording variants of the same field; "Bahasa dan Sastra Arab" is kept (it is also a merge target). |
| 79214 | S1 | Humaniora | 8 | 63% | Bahasa Mandarin (5); Bahasa Mandarin dan Kebudayaan Tiongkok (3) | Bahasa Mandarin | Low agreement comes from spelling or wording variants of the same field; "Bahasa Mandarin" is kept (it is also a merge target). |
| 79309 | D4 | Humaniora | 3 | 67% | Bahasa Mandarin untuk Komunikasi Bisnis dan Profesional (2); Bahasa dan Budaya Tiongkok (1) | Bahasa Mandarin | Names are variants of one field. Merged from "Bahasa Mandarin untuk Komunikasi Bisnis dan Profesional" into "Bahasa Mandarin" (see merge "Bahasa Mandarin"). |
| 74203 | S1 | Humaniora | 3 | 67% | Hukum (2); Ilmu Hukum (1) | Ilmu Hukum | Names are variants of one field. Merged from "Hukum" into "Ilmu Hukum" (see merge "Ilmu Hukum"). |
| 75201 | S1 | Humaniora | 16 | 69% | Ilmu Filsafat (11); Filsafat (3); Filsafat Keilahian (1) | Ilmu Filsafat | Philosophy, plus one Filsafat Keilahian (Christian divinity) Prodi that arguably belongs to Teologi. Kept. |
| 71201 | S1 | Humaniora | 28 | 54% | Ilmu Perpustakaan (15); Ilmu Perpustakaan dan Informasi Islam (9); Perpustakaan dan Sains Informasi (4) | Ilmu Perpustakaan | Low agreement comes from spelling or wording variants of the same field; "Ilmu Perpustakaan" is kept (it is also a merge target). |
| 93316 | D4 | Humaniora | 2 | 50% | Manajemen Perhotelan Kampus Payakumbuh (1); Pengelolaan Perhotelan (1) | Perhotelan | Names are variants of one field. Merged from "Manajemen Perhotelan Kampus Payakumbuh" into "Perhotelan" (see merge "Perhotelan"). |
| 71302 | D4 | Humaniora | 7 | 43% | Pengelolaan Arsip dan Rekaman Informasi (3); Kearsipan (1); Kearsipan Dan Informasi Digital (1) | Kearsipan | Names are variants of one field. Merged from "Pengelolaan Arsip dan Rekaman Informasi" into "Kearsipan" (see merge "Kearsipan"). |
| 71202 | S1 | Humaniora | 17 | 59% | Perpustakaan dan Sains Informasi (10); Ilmu Perpustakaan dan Informasi (2); Ilmu Perpustakaan dan Informasi Islam (2) | Ilmu Perpustakaan | Names are variants of one field. Merged from "Perpustakaan dan Sains Informasi" into "Ilmu Perpustakaan" (see merge "Ilmu Perpustakaan"). |
| 79212 | S1 | Humaniora | 2 | 50% | Sastra Bali (1); Sastra Melayu (1) | Sastra Daerah | Names are variants of one field. Merged from "Sastra Bali" into "Sastra Daerah" (see merge "Sastra Daerah"). |
| 79209 | S1 | Humaniora | 8 | 63% | Sastra Cina (5); Bahasa Mandarin (1); Bahasa Mandarin dan Kebudayaan Tiongkok (1) | Bahasa Mandarin | Names are variants of one field. Merged from "Sastra Cina" into "Bahasa Mandarin" (see merge "Bahasa Mandarin"). |
| 79211 | S1 | Humaniora | 8 | 38% | Sastra Daerah (3); Bahasa, Sastra, dan Budaya Jawa (1); Sastra Batak (1) | Sastra Daerah | Low agreement comes from spelling or wording variants of the same field; "Sastra Daerah" is kept (it is also a merge target). |
| 79205 | S1 | Humaniora | 8 | 63% | Sastra Perancis (5); Bahasa dan Sastra Prancis (2); Sastra Prancis (1) | Sastra Perancis | Low agreement comes from spelling or wording variants of the same field; "Sastra Perancis" is kept. |
| 90202 | D4 | Humaniora | 2 | 50% | Tari Sunda (1); Tata Kelola Seni (1) | Tari Sunda | Untouched (unsure): Only 2 Prodi: Tari Sunda and Tata Kelola Seni. |
| 93311 | D4 | Humaniora;Sosial | 4 | 25% | Destinasi Pariwisata (1); Pariwisata (1); Pariwisata Bahari (1) | Pariwisata | Names are variants of one field. Merged from "Destinasi Pariwisata" into "Pariwisata" (see merge "Pariwisata"). |
| 71441 | S1 | Humaniora;Sosial | 8 | 88% | Hubungan Masyarakat (7); Ilmu Hubungan Masyarakat (1) | Hubungan Masyarakat | Flagged only because the Kode spans more than one bidang (Humaniora;Sosial); the names agree, so "Hubungan Masyarakat" is kept. |
| 14202 | S1 | Kesehatan | 3 | 33% | Higiene Gigi (1); Ilmu Keperawatan K. Jembrana (1); Keperawatan (1) | Higiene Gigi | Untouched (unsure): Only 3 Prodi: Higiene Gigi, Ilmu Keperawatan and Keperawatan; dental hygiene vs nursing is unclear. |
| 13441 | D3 | Kesehatan | 3 | 33% | Higiene Perusahaan Kesehatan dan Keselamatan Kerja (1); Hiperkes Dan Keselamatan Kerja (1); Keselamatan Kesehatan Kerja (1) | Keselamatan dan Kesehatan Kerja | Names are variants of one field. Merged from "Higiene Perusahaan Kesehatan dan Keselamatan Kerja" into "Keselamatan dan Kesehatan Kerja" (see merge "Keselamatan dan Kesehatan Kerja"). |
| 11223 | S1 | Kesehatan | 8 | 63% | Ilmu Biomedis (5); Teknik Biomedis (2); Sains Biomedis (1) | Ilmu Biomedis | Mostly biomedical science; the 2 Teknik Biomedis Prodi are the engineering counterpart, which has its own Jurusan on another Kode. Kept. |
| 14201 | S1 | Kesehatan | 357 | 65% | Ilmu Keperawatan (232); Keperawatan (125) | Keperawatan | Names are variants of one field. Merged from "Ilmu Keperawatan" into "Keperawatan" (see merge "Keperawatan"). |
| 15474 | D3 | Kesehatan | 4 | 50% | Kebidanan (2); PJJ Kebidanan (2) | Kebidanan | Low agreement comes from spelling or wording variants of the same field; "Kebidanan" is kept. |
| 11201 | S1 | Kesehatan | 90 | 54% | Kedokteran (49); Pendidikan Dokter (41) | Kedokteran | Low agreement comes from spelling or wording variants of the same field; "Kedokteran" is kept (it is also a merge target). |
| 12201 | S1 | Kesehatan | 47 | 57% | Kedokteran Gigi (27); Pendidikan Dokter Gigi (20) | Kedokteran Gigi | Low agreement comes from spelling or wording variants of the same field; "Kedokteran Gigi" is kept. |
| 14476 | D3 | Kesehatan | 2 | 50% | Keperawatan (1); Keperawatan (Kep. Yapen) (1) | Keperawatan | Low agreement comes from spelling or wording variants of the same field; "Keperawatan" is kept (it is also a merge target). |
| 14203 | S1 | Kesehatan | 2 | 50% | Keperawatan K. Pangandaran (1); Keperawatan Kampus Sumedang (1) | Keperawatan | Names are variants of one field. Merged from "Keperawatan K. Pangandaran" into "Keperawatan" (see merge "Keperawatan"). |
| 13241 | S1 | Kesehatan | 10 | 40% | Keselamatan dan Kesehatan Kerja (4); Kesehatan dan Keselamatan Kerja (2); Rekayasa Keselamatan Kebakaran (2) | Keselamatan dan Kesehatan Kerja | K3 plus 2 fire-safety engineering Prodi; same safety field. Kept. |
| 11306 | D4 | Kesehatan | 4 | 50% | Pengobatan Tradisional Tiongkok (2); Pengobat Tradisional (1); Pengobatan Tradisional Indonesia (1) | Pengobatan Tradisional | Names are variants of one field. Merged from "Pengobatan Tradisional Tiongkok" into "Pengobatan Tradisional" (see merge "Pengobatan Tradisional"). |
| 13262 | S1 | Kesehatan | 2 | 50% | Perekam dan Informasi Kesehatan (1); Rekam Medis dan Informasi Kesehatan (1) | Rekam Medis dan Informasi Kesehatan | Names are variants of one field. Merged from "Perekam dan Informasi Kesehatan" into "Rekam Medis dan Informasi Kesehatan" (see merge "Rekam Medis dan Informasi Kesehatan"). |
| 11402 | D3 | Kesehatan | 29 | 45% | Radiologi (13); Radiodiagnostik dan Radioterapi (11); Teknik Radiodiagnostik dan Radioterapi (3) | Radiologi | Low agreement comes from spelling or wording variants of the same field; "Radiologi" is kept (it is also a merge target). |
| 11404 | D3 | Kesehatan | 8 | 63% | Refraksi Optisi (5); Optometri (3) | Optometri | Names are variants of one field. Merged from "Refraksi Optisi" into "Optometri" (see merge "Optometri"). |
| 13472 | D3 | Kesehatan | 2 | 50% | Rekam Medis & Informasi Kesehatan (1); Teknologi Laboratorium Medis (1) | Rekam Medis & Informasi Kesehatan | Untouched (unsure): Only 2 Prodi: Rekam Medis and Teknologi Laboratorium Medis. |
| 13462 | D3 | Kesehatan | 63 | 46% | Rekam Medis dan Informasi Kesehatan (29); Rekam Medik Dan Informasi Kesehatan (13); Perekam dan Informasi Kesehatan (12) | Rekam Medis dan Informasi Kesehatan | Low agreement comes from spelling or wording variants of the same field; "Rekam Medis dan Informasi Kesehatan" is kept (it is also a merge target). |
| 11409 | D3 | Kesehatan | 6 | 67% | Sanitasi (4); Kesehatan Lingkungan (2) | Kesehatan Lingkungan | Names are variants of one field. Merged from "Sanitasi" into "Kesehatan Lingkungan" (see merge "Kesehatan Lingkungan"). |
| 12401 | D3 | Kesehatan | 12 | 58% | Teknik Gigi (7); Kesehatan Gigi (3); Keperawatan Gigi (1) | Teknik Gigi | Teknik Gigi (dental technician, 7) is the majority; the 3 Kesehatan Gigi and 1 Keperawatan Gigi Prodi belong to the dental-therapy field. Kept, but those 4 Prodi may need a per-Prodi override. |
| 11408 | D3 | Kesehatan | 2 | 50% | Teknik Kardiovaskular (1); Teknik Kardiovaskuler (1) | Teknik Kardiovaskular | Low agreement comes from spelling or wording variants of the same field; "Teknik Kardiovaskular" is kept. |
| 11472 | D3 | Kesehatan | 2 | 50% | Teknik Radiodiagnostik dan Radioterapi (1); Teknologi Radiologi Pencitraan (1) | Radiologi | Names are variants of one field. Merged from "Teknik Radiodiagnostik dan Radioterapi" into "Radiologi" (see merge "Radiologi"). |
| 12302 | D4 | Kesehatan | 2 | 50% | Teknologi Kesehatan Gigi (1); Terapi Gigi (1) | Kesehatan Gigi | Names are variants of one field. Merged from "Teknologi Kesehatan Gigi" into "Kesehatan Gigi" (see merge "Kesehatan Gigi"). |
| 13250 | D4;S1 | Kesehatan | 2 | 50% | Teknologi Laboratorium Medik (1); Teknologi Laboratorium Medis (1) | Teknologi Laboratorium Medis | Names are variants of one field. Merged from "Teknologi Laboratorium Medik" into "Teknologi Laboratorium Medis" (see merge "Teknologi Laboratorium Medis"). |
| 13453 | D3 | Kesehatan | 61 | 54% | Teknologi Laboratorium Medis (33); Analis Kesehatan (25); Analisis Kesehatan (2) | Teknologi Laboratorium Medis | Low agreement comes from spelling or wording variants of the same field; "Teknologi Laboratorium Medis" is kept (it is also a merge target). |
| 48402 | D3 | MIPA | 10 | 60% | Analis Farmasi dan Makanan (6); Analisis Farmasi Dan Makanan (2); Analis Farmasi (1) | Analis Farmasi dan Makanan | Low agreement comes from spelling or wording variants of the same field; "Analis Farmasi dan Makanan" is kept (it is also a merge target). |
| 47401 | D3 | MIPA | 5 | 20% | Analisis Kimia (1); Kimia (1); Kimia Industri (1) | Analisis Kimia | Analisis Kimia, Kimia and Kimia Industri at D3: all chemical analysis. Kept, and it is also the merge target for Analis Kimia. |
| 50201 | S1 | MIPA | 2 | 50% | Astronomi (1); Sains Atmosfir dan Keplanetan (1) | Astronomi | Astronomy plus one Sains Atmosfir dan Keplanetan Prodi (planetary/atmospheric science); closely related. Kept. |
| 48202 | S1 | MIPA | 16 | 38% | Farmasi Klinik dan Komunitas (6); Farmasi Klinis (6); Farmasi Klinis dan Komunitas (4) | Farmasi | Names are variants of one field. Merged from "Farmasi Klinik dan Komunitas" into "Farmasi" (see merge "Farmasi"). |
| 94203 | S1 | MIPA | 23 | 35% | Ilmu Aktuaria (8); Sains Aktuaria (8); Aktuaria (7) | Ilmu Aktuaria | Low agreement comes from spelling or wording variants of the same field; "Ilmu Aktuaria" is kept (it is also a merge target). |
| 51234 | S1 | MIPA | 2 | 50% | Pengolahan Hasil Perikanan (1); Teknologi Pengolahan Hasil Perikanan (1) | Teknologi Hasil Perikanan | Names are variants of one field. Merged from "Pengolahan Hasil Perikanan" into "Teknologi Hasil Perikanan" (see merge "Teknologi Hasil Perikanan"). |
| 542431 | S1 | MIPA | 2 | 50% | Perikanan (1); Perikanan Laut Tropis (1) | Ilmu Perikanan | Names are variants of one field. Merged from "Perikanan" into "Ilmu Perikanan" (see merge "Ilmu Perikanan"). |
| 49501 | D4 | MIPA | 3 | 67% | Statistika (2); Statistika Bisnis (1) | Statistika | Low agreement comes from spelling or wording variants of the same field; "Statistika" is kept (it is also a merge target). |
| 49205 | S1 | MIPA | 3 | 67% | Statistika dan Sains Data (2); Statistika (1) | Statistika | Names are variants of one field. Merged from "Statistika dan Sains Data" into "Statistika" (see merge "Statistika"). |
| 84208 | S1 | MIPA;Pendidikan | 23 | 96% | Pendidikan Ilmu Pengetahuan Alam (22); Pendidikan Matematika (1) | Pendidikan Ilmu Pengetahuan Alam | Flagged only because the Kode spans more than one bidang (MIPA;Pendidikan); the names agree, so "Pendidikan Ilmu Pengetahuan Alam" is kept. |
| 85203 | S1 | Pendidikan | 2 | 50% | Kepelatihan Kecabangan Olahraga (1); Pendidikan Kepelatihan Olah Raga (1) | Pendidikan Kepelatihan Olahraga | Names are variants of one field. Merged from "Kepelatihan Kecabangan Olahraga" into "Pendidikan Kepelatihan Olahraga" (see merge "Pendidikan Kepelatihan Olahraga"). |
| 88202 | S1 | Pendidikan | 16 | 31% | Pendidikan Bahasa dan Sastra Daerah (5); Pendidikan Bahasa Dan Sastra Jawa (3); Pendidikan Bahasa Bali (2) | Pendidikan Bahasa dan Sastra Daerah | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Bahasa dan Sastra Daerah" is kept (it is also a merge target). |
| 88201 | S1 | Pendidikan | 275 | 69% | Pendidikan Bahasa Dan Sastra Indonesia (190); Pendidikan Bahasa Indonesia (57); Tadris Bahasa Indonesia (22) | Pendidikan Bahasa dan Sastra Indonesia | Names are variants of one field. Merged from "Pendidikan Bahasa Dan Sastra Indonesia" into "Pendidikan Bahasa dan Sastra Indonesia" (see merge "Pendidikan Bahasa dan Sastra Indonesia"). |
| 87211 | S1 | Pendidikan | 3 | 33% | Pendidikan Bisnis (1); Pendidikan Manajemen Perkantoran (1); Pendidikan Tata Niaga (1) | Pendidikan Ekonomi | Names are variants of one field. Merged from "Pendidikan Bisnis" into "Pendidikan Ekonomi" (see merge "Pendidikan Ekonomi"). |
| 86234 | S1 | Pendidikan | 2 | 50% | Pendidikan Buddha Anak Usia Dini (1); Pendidikan Guru Pendidikan Anak Usia Dini (1) | Pendidikan Guru Pendidikan Anak Usia Dini | Names are variants of one field. Merged from "Pendidikan Buddha Anak Usia Dini" into "Pendidikan Guru Pendidikan Anak Usia Dini" (see merge "Pendidikan Guru Pendidikan Anak Usia Dini"). |
| 84206 | S1 | Pendidikan | 50 | 38% | Pendidikan Ilmu Pengetahuan Alam (19); Tadris IPA (15); Pendidikan IPA (13) | Pendidikan Ilmu Pengetahuan Alam | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Ilmu Pengetahuan Alam" is kept (it is also a merge target). |
| 83209 | S1 | Pendidikan | 2 | 50% | Pendidikan Informatika (1); Pendidikan Vokasional Informatika (1) | Pendidikan Teknologi Informasi | Names are variants of one field. Merged from "Pendidikan Informatika" into "Pendidikan Teknologi Informasi" (see merge "Pendidikan Teknologi Informasi"). |
| 84201 | S1 | Pendidikan | 17 | 35% | Pendidikan IPA (6); Hubungan Internasional (5); Pendidikan Ilmu Pengetahuan Alam (4) | Pendidikan IPA | Untouched (unsure): Names mix Pendidikan IPA with 5 Prodi called Hubungan Internasional; likely a data error in the export. |
| 85271 | S1 | Pendidikan | 2 | 50% | Pendidikan Jasmani, Kesehatan & Rekreasi (1); Pendidikan Jasmani, Kesehatan, dan Rekreasi (1) | Pendidikan Jasmani, Kesehatan dan Rekreasi | Names are variants of one field. Merged from "Pendidikan Jasmani, Kesehatan & Rekreasi" into "Pendidikan Jasmani, Kesehatan dan Rekreasi" (see merge "Pendidikan Jasmani, Kesehatan dan Rekreasi"). |
| 85201 | S1 | Pendidikan | 131 | 26% | Pendidikan Jasmani, Kesehatan dan Rekreasi (34); Pendidikan Jasmani (32); Pendidikan Jasmani Kesehatan dan Rekreasi (19) | Pendidikan Jasmani, Kesehatan dan Rekreasi | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Jasmani, Kesehatan dan Rekreasi" is kept (it is also a merge target). |
| 86202 | S1 | Pendidikan | 28 | 39% | Pendidikan Luar Biasa (11); Pendidikan Khusus (8); Pendidikan Anak Usia Dini (4) | Pendidikan Luar Biasa | Special-needs education (PLB/Pendidikan Khusus). 4 Prodi named Pendidikan Anak Usia Dini sit under this Kode, probably a data error; they may need a per-Prodi override. |
| 86205 | S1 | Pendidikan | 26 | 46% | Pendidikan Luar Sekolah (12); Pendidikan Masyarakat (7); Pendidikan Non Formal (3) | Pendidikan Luar Sekolah | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Luar Sekolah" is kept (it is also a merge target). |
| 87121 | S1 | Pendidikan | 10 | 60% | Pendidikan Musik (6); Pendidikan Musik Gereja (3); Musik Gerejawi (1) | Pendidikan Musik | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Musik" is kept. |
| 86229 | S1 | Pendidikan | 4 | 50% | Pendidikan Non Formal (2); Pendidikan Nonformal (2) | Pendidikan Luar Sekolah | Names are variants of one field. Merged from "Pendidikan Non Formal" into "Pendidikan Luar Sekolah" (see merge "Pendidikan Luar Sekolah"). |
| 88216 | S1 | Pendidikan | 2 | 50% | Pendidikan Seni dan Keagamaan (1); Pendidikan Seni Tari (1) | Pendidikan Seni dan Keagamaan | Untouched (unsure): Only 2 Prodi: religious arts education and dance education. |
| 88209 | S1 | Pendidikan | 26 | 31% | Pendidikan Seni Drama, Tari Dan Musik (8); Pendidikan Seni Drama Tari dan Musik (5); Pendidikan Seni Pertunjukan (5) | Pendidikan Seni Drama, Tari dan Musik | Names are variants of one field. Merged from "Pendidikan Seni Drama, Tari Dan Musik" into "Pendidikan Seni Drama, Tari dan Musik" (see merge "Pendidikan Seni Drama, Tari dan Musik"). |
| 88212 | S1 | Pendidikan | 6 | 50% | Pendidikan Tari (3); Pendidikan Seni Tari (2); Seni Tari (1) | Pendidikan Tari | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Tari" is kept. |
| 83204 | S1 | Pendidikan | 14 | 50% | Pendidikan Teknik Otomotif (7); Pendidikan Vokasional Teknologi Otomotif (6); Pendidkan Teknik Otomotif (1) | Pendidikan Teknik Otomotif | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Teknik Otomotif" is kept (it is also a merge target). |
| 84211 | S1 | Pendidikan | 2 | 50% | Pendidikan Teknologi Agroindustri (1); Teknologi Agroindustri (1) | Pendidikan Teknologi Agroindustri | Untouched (unsure): Only 2 Prodi: one teacher-education and one non-education agroindustry programme. |
| 83207 | S1 | Pendidikan | 91 | 59% | Pendidikan Teknologi Informasi (54); Pendidikan Informatika (10); Pendidikan Teknik Informatika (7) | Pendidikan Teknologi Informasi | Low agreement comes from spelling or wording variants of the same field; "Pendidikan Teknologi Informasi" is kept (it is also a merge target). |
| 86218 | S1 | Pendidikan | 3 | 67% | Pendidikan Vokasional Teknologi Otomotif (2); Pendidikan Vokasional Teknik Elektronika (1) | Pendidikan Teknik Otomotif | Names are variants of one field. Merged from "Pendidikan Vokasional Teknologi Otomotif" into "Pendidikan Teknik Otomotif" (see merge "Pendidikan Teknik Otomotif"). |
| 89202 | S1 | Pendidikan | 4 | 50% | PGSD Pendidikan Jasmani (2); Pendidikan Jasmani (1); Pendidikan Jasmani Sekolah Dasar (1) | Pendidikan Jasmani, Kesehatan dan Rekreasi | Names are variants of one field. Merged from "PGSD Pendidikan Jasmani" into "Pendidikan Jasmani, Kesehatan dan Rekreasi" (see merge "Pendidikan Jasmani, Kesehatan dan Rekreasi"). |
| 88273 | S1 | Pendidikan | 2 | 50% | PSKGJ Pendidikan Bahasa Inggris (1); Tadris Bahasa Inggris (1) | Pendidikan Bahasa Inggris | Names are variants of one field. Merged from "PSKGJ Pendidikan Bahasa Inggris" into "Pendidikan Bahasa Inggris" (see merge "Pendidikan Bahasa Inggris"). |
| 84207 | S1 | Pendidikan | 21 | 48% | Tadris IPS (10); Pendidikan IPS (7); Pendidikan Ilmu Pengetahuan Sosial (3) | Pendidikan Ilmu Pengetahuan Sosial | Names are variants of one field. Merged from "Tadris IPS" into "Pendidikan Ilmu Pengetahuan Sosial" (see merge "Pendidikan Ilmu Pengetahuan Sosial"). |
| 86231 | S1 | Pendidikan;Agama | 223 | 93% | Manajemen Pendidikan Islam (207); Manajemen Pendidikan (7); Manajemen Pendidikan Islam (Kependidikan Islam) (3) | Manajemen Pendidikan Islam | Flagged only because the Kode spans more than one bidang (Pendidikan;Agama); the names agree, so "Manajemen Pendidikan Islam" is kept. |
| 86207 | S1 | Pendidikan;Agama;Ekonomi | 231 | 63% | Pendidikan Guru Pendidikan Anak Usia Dini (145); Pendidikan Islam Anak Usia Dini (72); Pendidikan Islam Anak Usia Dini (PIAUD) (5) | Pendidikan Guru Pendidikan Anak Usia Dini | This Kode holds PG-PAUD (145) and 77 PIAUD-named Prodi. Kept as PG-PAUD; the PIAUD-named Prodi here may need a per-Prodi override to Pendidikan Islam Anak Usia Dini. |
| 86201 | S1 | Pendidikan;Sosial | 140 | 72% | Bimbingan Dan Konseling (101); Bimbingan dan Konseling Pendidikan Islam (13); Bimbingan Konseling (13) | Bimbingan Dan Konseling | Flagged for spanning two bidang; general counselling, with 13 BKPI-named Prodi that may need an override to Bimbingan dan Konseling Islam. |
| 54290 | S1 | Pertanian | 2 | 50% | Agribisnis (1); Ekonomi Sumberdaya Dan Lingkungan (1) | Agribisnis | Untouched (unsure): Only 2 Prodi: Agribisnis and Ekonomi Sumberdaya dan Lingkungan. |
| 54299 | S1 | Pertanian | 3 | 33% | Agribisnis (1); Ekonomi Pertanian dan Agribisnis (1); Sosial Ekonomi Pertanian (1) | Agribisnis | Low agreement comes from spelling or wording variants of the same field; "Agribisnis" is kept (it is also a merge target). |
| 54401 | D3 | Pertanian | 13 | 23% | Agribisnis (3); Agrobisnis (3); Manajemen Agribisnis (3) | Agribisnis | Low agreement comes from spelling or wording variants of the same field; "Agribisnis" is kept (it is also a merge target). |
| 54311 | D4 | Pertanian | 5 | 40% | Agribisnis Hortikultura (2); Agribisnis Pangan (1); Pengelolaan Agribisnis Perkebunan (1) | Agribisnis | Names are variants of one field. Merged from "Agribisnis Hortikultura" into "Agribisnis" (see merge "Agribisnis"). |
| 54281 | S1 | Pertanian | 2 | 50% | Agribisnis K. Mataram (1); Agroekoteknologi (1) | Agribisnis K. Mataram | Untouched (unsure): Only 2 Prodi: an Agribisnis branch campus and Agroekoteknologi. |
| 54302 | D4 | Pertanian | 8 | 50% | Agribisnis Pangan (4); Pengelolaan Agribisnis (3); Manajemen Agribisnis (1) | Agribisnis | Names are variants of one field. Merged from "Agribisnis Pangan" into "Agribisnis" (see merge "Agribisnis"). |
| 54331 | D4 | Pertanian | 3 | 33% | Agribisnis Unggas (1); Manajemen Bisnis Unggas (1); Teknologi Pakan Ternak (1) | Agribisnis Unggas | Untouched (unsure): Names mix poultry business with animal-feed technology. |
| 54411 | D3 | Pertanian | 2 | 50% | Agro Industri (1); Teknologi Industri Benih (1) | Agro Industri | Untouched (unsure): Only 2 Prodi: Agro Industri and Teknologi Industri Benih. |
| 54212 | S1 | Pertanian | 3 | 33% | Agroekoteknologi (1); Agroteknologi (1); Agroteknologi K. Kab. Gayo Lues (1) | Agroteknologi | Names are variants of one field. Merged from "Agroekoteknologi" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54293 | S1 | Pertanian | 4 | 25% | Agroekoteknologi (1); Agroteknologi (1); Pemuliaan dan Bioteknologi Tanaman (1) | Agroteknologi | Names are variants of one field. Merged from "Agroekoteknologi" into "Agroteknologi" (see merge "Agroteknologi"). |
| 41411 | D3 | Pertanian | 6 | 67% | Agroindustri (4); Teknologi Pertanian (1); Teknologi Produksi (1) | Teknologi Industri Pertanian | Names are variants of one field. Merged from "Agroindustri" into "Teknologi Industri Pertanian" (see merge "Teknologi Industri Pertanian"). |
| 54297 | S1 | Pertanian | 4 | 25% | Agronomi (1); Agronomi dan Hortikultura (1); Agroteknologi (1) | Agroteknologi | Names are variants of one field. Merged from "Agronomi" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54303 | D4 | Pertanian | 4 | 50% | Bioteknologi Perikanan (2); Teknologi Pembenihan Ikan (2) | Akuakultur | Names are variants of one field. Merged from "Bioteknologi Perikanan" into "Akuakultur" (see merge "Akuakultur"). |
| 54447 | D3 | Pertanian | 17 | 29% | Budi Daya Ikan (5); Budidaya Perikanan (4); Teknik Budidaya Perikanan (4) | Akuakultur | Names are variants of one field. Merged from "Budi Daya Ikan" into "Akuakultur" (see merge "Akuakultur"). |
| 54449 | D3 | Pertanian | 2 | 50% | Budi Daya Ikan (1); Budidaya Ikan (1) | Akuakultur | Names are variants of one field. Merged from "Budi Daya Ikan" into "Akuakultur" (see merge "Akuakultur"). |
| 54412 | D3 | Pertanian | 8 | 25% | Budi Daya Tanaman Hortikultura (2); Hortikultura (2); Tanaman Pangan dan Hortikultura (2) | Agroteknologi | Names are variants of one field. Merged from "Budi Daya Tanaman Hortikultura" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54416 | D3 | Pertanian | 8 | 63% | Budidaya Tanaman Pangan (5); Budi Daya Tanaman Perkebunan (1); Budidaya Pertanian (1) | Agroteknologi | Names are variants of one field. Merged from "Budidaya Tanaman Pangan" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54371 | D4 | Pertanian | 9 | 33% | Budidaya Tanaman Perkebunan (3); Teknologi Produksi Tanaman Perkebunan (2); Budidaya Perkebunan (1) | Pengelolaan Perkebunan | Names are variants of one field. Merged from "Budidaya Tanaman Perkebunan" into "Pengelolaan Perkebunan" (see merge "Pengelolaan Perkebunan"). |
| 54433 | D3 | Pertanian | 9 | 44% | Budidaya Ternak (4); Budi Daya Ternak (2); Budidaya Peternakan (1) | Peternakan | Names are variants of one field. Merged from "Budidaya Ternak" into "Peternakan" (see merge "Peternakan"). |
| 54453 | D3 | Pertanian | 4 | 50% | Ekowisata (2); Konservasi Sumberdaya Hutan (1); Manajemen Sumber Daya Hutan (1) | Ekowisata | Untouched (unsure): Names mix ecotourism with forest conservation and forest management. |
| 41203 | D4;S1 | Pertanian | 14 | 50% | Ilmu dan Teknologi Pangan (7); Teknologi Pangan (3); Nutrisi dan Teknologi Pakan Ternak (1) | Teknologi Pangan | Names are variants of one field. Merged from "Ilmu dan Teknologi Pangan" into "Teknologi Pangan" (see merge "Teknologi Pangan"). |
| 41234 | S1 | Pertanian | 2 | 50% | Ilmu Perikanan (1); Teknologi Hasil Perikanan (1) | Ilmu Perikanan | Untouched (unsure): Only 2 Prodi: Ilmu Perikanan and Teknologi Hasil Perikanan. |
| 54205 | S1 | Pertanian | 2 | 50% | Ilmu Pertanian (1); Teknologi Hasil Pertanian (1) | Ilmu Pertanian | Untouched (unsure): Only 2 Prodi: Ilmu Pertanian and Teknologi Hasil Pertanian. |
| 54271 | S1 | Pertanian | 7 | 43% | Ilmu Pertanian (3); Budidaya Perkebunan (1); Budidaya Pertanian (1) | Agroteknologi | Names are variants of one field. Merged from "Ilmu Pertanian" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54252 | S1 | Pertanian | 2 | 50% | Kehutanan (1); Rekayasa Kehutanan (1) | Kehutanan | Low agreement comes from spelling or wording variants of the same field; "Kehutanan" is kept (it is also a merge target). |
| 41401 | D3 | Pertanian | 7 | 14% | Keteknikan Pertanian (1); Mekanisasi Perikanan (1); Mekanisasi Pertanian (1) | Keteknikan Pertanian | Untouched (unsure): 7 Prodi with 14% agreement across agricultural and fisheries mechanisation. |
| 54298 | S1 | Pertanian | 2 | 50% | Komunikasi dan Pengembangan Masyarakat (1); Penyuluhan dan Komunikasi Pertanian (1) | Penyuluhan Pertanian | Names are variants of one field. Merged from "Komunikasi dan Pengembangan Masyarakat" into "Penyuluhan Pertanian" (see merge "Penyuluhan Pertanian"). |
| 54256 | S1 | Pertanian | 6 | 50% | Konservasi Hutan (3); Konservasi Sumber Daya Alam (2); Konservasi Sumberdaya Hutan Dan Ekowisata (1) | Kehutanan | Names are variants of one field. Merged from "Konservasi Hutan" into "Kehutanan" (see merge "Kehutanan"). |
| 54258 | S1 | Pertanian | 3 | 67% | Manajemen Hutan (2); Pengelolaan Hutan (1) | Kehutanan | Names are variants of one field. Merged from "Manajemen Hutan" into "Kehutanan" (see merge "Kehutanan"). |
| 54454 | D3 | Pertanian | 2 | 50% | Manajemen Hutan Alam Produksi (1); Pengelolaan Hutan (1) | Kehutanan | Names are variants of one field. Merged from "Manajemen Hutan Alam Produksi" into "Kehutanan" (see merge "Kehutanan"). |
| 54415 | D3 | Pertanian | 4 | 25% | Manajemen Lahan Kering (1); Manajemen Pertanian Lahan Kering (1); Perencanaan Sumber Daya Lahan (1) | Agroteknologi | Names are variants of one field. Merged from "Manajemen Lahan Kering" into "Agroteknologi" (see merge "Agroteknologi"). |
| 54340 | D4 | Pertanian | 3 | 33% | Manajemen Rekayasa Perikanan Tangkap (1); Pengelolaan Perikanan Pesisir (1); Teknologi Penangkapan Ikan (1) | Perikanan Tangkap | Names are variants of one field. Merged from "Manajemen Rekayasa Perikanan Tangkap" into "Perikanan Tangkap" (see merge "Perikanan Tangkap"). |
| 54242 | S1 | Pertanian | 51 | 55% | Manajemen Sumber Daya Perairan (28); Manajemen Sumberdaya Perairan (7); Perikanan (5) | Manajemen Sumber Daya Perairan | Aquatic resource management, with 5 Prodi named simply Perikanan. Kept. |
| 41402 | D3 | Pertanian | 2 | 50% | Mekanisasi Perikanan (1); Tata Air Pertanian (1) | Mekanisasi Perikanan | Untouched (unsure): Names mix fisheries mechanisation with agricultural water management. |
| 54239 | S1 | Pertanian | 5 | 60% | Nutrisi dan Teknologi Pakan Ternak (3); Nustrisi dan Teknologi Pakan Ternak (1); Nutrisi dan Teknologi Pakan (1) | Peternakan | Names are variants of one field. Merged from "Nutrisi dan Teknologi Pakan Ternak" into "Peternakan" (see merge "Peternakan"). |
| 54246 | S1 | Pertanian | 45 | 49% | Pemanfaatan Sumber Daya Perikanan (22); Perikanan Tangkap (7); Manajemen Sumber Daya Perairan (6) | Perikanan Tangkap | Names are variants of one field. Merged from "Pemanfaatan Sumber Daya Perikanan" into "Perikanan Tangkap" (see merge "Perikanan Tangkap"). |
| 41331 | D4 | Pertanian | 3 | 33% | Pengelolaan Agribisnis (1); Teknik Produksi Benih (1); Teknologi Perbenihan (1) | Pengelolaan Agribisnis | Untouched (unsure): Proposed 'Pengelolaan Agribisnis' but the other names are seed-production programmes. |
| 54357 | D4 | Pertanian | 6 | 50% | Pengelolaan Perkebunan (3); Manajemen Perkebunan (1); Pengelolaan Perkebunan Kopi (1) | Pengelolaan Perkebunan | Low agreement comes from spelling or wording variants of the same field; "Pengelolaan Perkebunan" is kept (it is also a merge target). |
| 54457 | D3 | Pertanian | 2 | 50% | Pengelolaan Perkebunan (1); Perkebunan (1) | Pengelolaan Perkebunan | Low agreement comes from spelling or wording variants of the same field; "Pengelolaan Perkebunan" is kept (it is also a merge target). |
| 41311 | D4 | Pertanian | 9 | 22% | Pengembangan Produk Agroindustri (2); Agribisnis (1); Agribisnis Pangan (1) | Pengembangan Produk Agroindustri | Untouched (unsure): 9 Prodi with 22% agreement across agroindustry product development and agribusiness. |
| 54344 | D4 | Pertanian | 7 | 57% | Pengolahan dan Penyimpanan Hasil Perikanan (4); Agribisnis Perikanan dan Kelautan (1); Manajemen Rekayasa Pengolahan Hasil Perikanan (1) | Teknologi Hasil Perikanan | Names are variants of one field. Merged from "Pengolahan dan Penyimpanan Hasil Perikanan" into "Teknologi Hasil Perikanan" (see merge "Teknologi Hasil Perikanan"). |
| 54451 | D3 | Pertanian | 2 | 50% | Pengolahan Hasil Hutan (1); Teknologi Pengolahan Hasil Bumi (1) | Pengolahan Hasil Hutan | Untouched (unsure): Names mix forest-product processing with general crop processing. |
| 41434 | D3 | Pertanian | 7 | 43% | Pengolahan Hasil Laut (3); Teknik Pengolahan Produk Perikanan (2); Pengolahan Hasil Laut/Perikanan (1) | Teknologi Hasil Perikanan | Names are variants of one field. Merged from "Pengolahan Hasil Laut" into "Teknologi Hasil Perikanan" (see merge "Teknologi Hasil Perikanan"). |
| 41333 | D4 | Pertanian | 4 | 25% | Pengolahan Hasil Perkebunan Terpadu (1); Teknologi Pengolahan Hasil Perkebunan (1); Teknologi Pengolahan Hasil Ternak (1) | Pengolahan Hasil Perkebunan Terpadu | Untouched (unsure): Names mix plantation-crop processing with livestock-product processing. |
| 54358 | D4 | Pertanian | 2 | 50% | Penyuluhan Perkebunan (1); Penyuluhan Perkebunan Presisi (1) | Penyuluhan Pertanian | Names are variants of one field. Merged from "Penyuluhan Perkebunan" into "Penyuluhan Pertanian" (see merge "Penyuluhan Pertanian"). |
| 54315 | D4 | Pertanian | 14 | 50% | Penyuluhan Pertanian Berkelanjutan (7); Penyuluhan Pertanian (5); Penyuluhan Pertanian Lahan Kering (1) | Penyuluhan Pertanian | Names are variants of one field. Merged from "Penyuluhan Pertanian Berkelanjutan" into "Penyuluhan Pertanian" (see merge "Penyuluhan Pertanian"). |
| 54316 | D4 | Pertanian | 12 | 50% | Penyuluhan Peternakan dan Kesejahteraan Hewan (6); Penyuluhan Peternakan (3); Penyuluhan Perternakan (1) | Penyuluhan Pertanian | Names are variants of one field. Merged from "Penyuluhan Peternakan dan Kesejahteraan Hewan" into "Penyuluhan Pertanian" (see merge "Penyuluhan Pertanian"). |
| 54236 | S1 | Pertanian | 3 | 67% | Peternakan (2); Teknologi Hasil Peternakan (1) | Peternakan | Low agreement comes from spelling or wording variants of the same field; "Peternakan" is kept (it is also a merge target). |
| 54238 | S1 | Pertanian | 3 | 67% | Peternakan (2); Teknologi Produksi Ternak (1) | Peternakan | Low agreement comes from spelling or wording variants of the same field; "Peternakan" is kept (it is also a merge target). |
| 54432 | D3 | Pertanian | 6 | 50% | Produksi Ternak (3); Budi Daya Ternak (2); Budidaya Ternak (1) | Peternakan | Names are variants of one field. Merged from "Produksi Ternak" into "Peternakan" (see merge "Peternakan"). |
| 54202 | S1 | Pertanian | 3 | 67% | Sosial Ekonomi Pertanian (2); Ekonomi Pertanian (1) | Agribisnis | Names are variants of one field. Merged from "Sosial Ekonomi Pertanian" into "Agribisnis" (see merge "Agribisnis"). |
| 54443 | D3 | Pertanian | 12 | 33% | Teknik Penangkapan Ikan (4); Budidaya Perairan (2); Teknologi Budidaya Perikanan (2) | Teknik Penangkapan Ikan | Untouched (unsure): Names mix capture fisheries (Teknik Penangkapan Ikan) with aquaculture (Budidaya Perairan). |
| 54346 | D4 | Pertanian | 5 | 60% | Teknologi Akuakultur (3); Teknologi Akuakultur Dan Pasca Panen Perikanan (1); Teknologi Budi Daya Perikanan/Teknologi Akuakultur (1) | Akuakultur | Names are variants of one field. Merged from "Teknologi Akuakultur" into "Akuakultur" (see merge "Akuakultur"). |
| 54313 | D4 | Pertanian | 4 | 50% | Teknologi Benih (2); Teknologi dan Manajemen Pembenihan Ikan (1); Teknologi Pembenihan Ikan (1) | Teknologi Benih | Untouched (unsure): Teknologi Benih here mixes plant-seed and fish-hatchery programmes. |
| 54249 | S1 | Pertanian | 7 | 57% | Teknologi Hasil Perikanan (4); Pendidikan Kelautan dan Perikanan Kampus Serang (1); Sosial Ekonomi Perikanan (1) | Teknologi Hasil Perikanan | Untouched (unsure): Names mix fish-product technology, fisheries education and fisheries socio-economics. |
| 41433 | D3 | Pertanian | 8 | 25% | Teknologi Hasil Perkebunan (2); Teknologi Pengolahan Hasil Perkebunan (2); Pengolahan Hasil Perkebunan Kelapa Sawit (1) | Teknologi Hasil Pertanian | Names are variants of one field. Merged from "Teknologi Hasil Perkebunan" into "Teknologi Hasil Pertanian" (see merge "Teknologi Hasil Pertanian"). |
| 41431 | D3 | Pertanian | 3 | 67% | Teknologi Hasil Pertanian (2); Teknologi Pengolahan (1) | Teknologi Hasil Pertanian | Low agreement comes from spelling or wording variants of the same field; "Teknologi Hasil Pertanian" is kept (it is also a merge target). |
| 42402 | D3 | Pertanian | 2 | 50% | Teknologi Mekanisasi Pertanian (1); Teknologi Rekayasa Mesin Pertanian (1) | Teknik Pertanian | Names are variants of one field. Merged from "Teknologi Mekanisasi Pertanian" into "Teknik Pertanian" (see merge "Teknik Pertanian"). |
| 41421 | D3 | Pertanian | 6 | 67% | Teknologi Pangan (4); Penjaminan Mutu Industri Pangan (1); Teknologi Industri Pangan (1) | Teknologi Pangan | Low agreement comes from spelling or wording variants of the same field; "Teknologi Pangan" is kept (it is also a merge target). |
| 54446 | D3 | Pertanian | 3 | 67% | Teknologi Penangkapan Ikan (2); Pemanfaatan Sumber Daya Perairan (1) | Perikanan Tangkap | Names are variants of one field. Merged from "Teknologi Penangkapan Ikan" into "Perikanan Tangkap" (see merge "Perikanan Tangkap"). |
| 54444 | D3 | Pertanian | 9 | 44% | Teknologi Pengolahan Hasil Perikanan (4); Teknologi Hasil Perikanan (3); Teknik Pengolahan Produk Perikanan (1) | Teknologi Hasil Perikanan | Names are variants of one field. Merged from "Teknologi Pengolahan Hasil Perikanan" into "Teknologi Hasil Perikanan" (see merge "Teknologi Hasil Perikanan"). |
| 54434 | D3 | Pertanian | 3 | 67% | Teknologi Pengolahan Kulit (2); Teknologi Pengolahan Hasil Ternak (1) | Teknologi Pengolahan Kulit | Leather processing with one livestock-product processing Prodi. Kept as Teknologi Pengolahan Kulit. |
| 54312 | D4 | Pertanian | 4 | 50% | Teknologi Produksi Tanaman Hortikultura (2); Agribisnis Hortikultura (1); Teknologi Industri Hortikultura (1) | Agroteknologi | Names are variants of one field. Merged from "Teknologi Produksi Tanaman Hortikultura" into "Agroteknologi" (see merge "Agroteknologi"). |
| 41322 | D4 | Pertanian | 11 | 64% | Teknologi Produksi Tanaman Pangan (7); Teknologi Produksi Tanaman Perkebunan (3); Teknologi Produksi Tanaman Hortikultura (1) | Agroteknologi | Names are variants of one field. Merged from "Teknologi Produksi Tanaman Pangan" into "Agroteknologi" (see merge "Agroteknologi"). |
| 91321 | D3;D4 | Seni | 5 | 20% | Angklung dan Musik Bambu (1); Musik (1); Musik Film (1) | Seni Musik | Names are variants of one field. Merged from "Angklung dan Musik Bambu" into "Seni Musik" (see merge "Seni Musik"). |
| 90342 | D4 | Seni | 7 | 57% | Desain Grafis (4); Desain Media (2); Fashion Merchandising (1) | Desain Komunikasi Visual | Names are variants of one field. Merged from "Desain Grafis" into "Desain Komunikasi Visual" (see merge "Desain Komunikasi Visual"). |
| 90442 | D3 | Seni | 3 | 67% | Desain Grafis (2); Komputer Grafis (1) | Desain Komunikasi Visual | Names are variants of one field. Merged from "Desain Grafis" into "Desain Komunikasi Visual" (see merge "Desain Komunikasi Visual"). |
| 90242 | S1 | Seni | 4 | 50% | Desain Komunikasi Visual (2); Desain Grafis (1); Desain Produk (1) | Desain Komunikasi Visual | DKV with one Desain Grafis and one Desain Produk Prodi (4 total). Kept as DKV. |
| 90331 | D4 | Seni | 12 | 67% | Desain Mode (8); Barang Jadi Tekstil (1); Desain Mode Kriya Batik (1) | Desain Mode | Low agreement comes from spelling or wording variants of the same field; "Desain Mode" is kept (it is also a merge target). |
| 90431 | D3 | Seni | 8 | 38% | Desain Produk (3); Desain dan Teknologi Produk Kulit (1); Desain Furnitur (1) | Desain Produk | Low agreement comes from spelling or wording variants of the same field; "Desain Produk" is kept (it is also a merge target). |
| 91461 | D3 | Seni | 4 | 25% | Film Dan Televisi (1); Manajemen & Produksi Film Video & TV (1); Produksi Film dan Televisi (1) | Film dan Televisi | Low agreement comes from spelling or wording variants of the same field; "Film dan Televisi" is kept (it is also a merge target). |
| 94412 | D4 | Seni | 2 | 50% | Kosmetik dan Perawatan Kecantikan (1); Tata Rias dan Kecantikan (1) | Tata Rias dan Kecantikan | Names are variants of one field. Merged from "Kosmetik dan Perawatan Kecantikan" into "Tata Rias dan Kecantikan" (see merge "Tata Rias dan Kecantikan"). |
| 90211 | S1 | Seni | 13 | 62% | Kriya (8); Kriya Seni (5) | Kriya | Low agreement comes from spelling or wording variants of the same field; "Kriya" is kept (it is also a merge target). |
| 90401 | D3 | Seni | 3 | 33% | Kriya Seni (1); Seni Rupa (1); Seni Rupa Dan Disain (1) | Kriya | Names are variants of one field. Merged from "Kriya Seni" into "Kriya" (see merge "Kriya"). |
| 90443 | D3 | Seni | 3 | 33% | Multi Media (1); Teknik Komputer dan Jaringan (1); Teknologi Multimedia dan Broadcasting (1) | Multi Media | Untouched (unsure): Names mix Multimedia, Teknik Komputer dan Jaringan and broadcasting. |
| 91223 | S1 | Seni | 2 | 50% | Musik (1); Musik Gereja (1) | Seni Musik | Names are variants of one field. Merged from "Musik" into "Seni Musik" (see merge "Seni Musik"). |
| 91221 | S1 | Seni | 30 | 43% | Musik Gereja (13); Seni Musik (11); Musik (4) | Seni Musik | Names are variants of one field. Merged from "Musik Gereja" into "Seni Musik" (see merge "Seni Musik"). |
| 91361 | D4;S1 | Seni | 8 | 63% | Produksi Film dan Televisi (5); Televisi dan Film (2); Film dan Televisi (1) | Film dan Televisi | Names are variants of one field. Merged from "Produksi Film dan Televisi" into "Film dan Televisi" (see merge "Film dan Televisi"). |
| 88214 | S1 | Seni | 7 | 43% | Seni Pertunjukan (3); Pendidikan Seni Pertunjukan (2); Seni Pertunjukan Keagamaan (2) | Seni Pertunjukan | Performing arts; includes 2 performing-arts education Prodi and 2 religious performing-arts Prodi. Kept. |
| 90201 | S1 | Seni | 17 | 47% | Seni Rupa Murni (8); Seni Murni (4); Seni Rupa (3) | Seni Rupa | Names are variants of one field. Merged from "Seni Rupa Murni" into "Seni Rupa" (see merge "Seni Rupa"). |
| 91231 | S1 | Seni | 17 | 53% | Seni Tari (9); Tari (5); Pendidikan Seni dan Budaya Keagamaan Hindu (2) | Seni Tari | Dance; includes 2 Hindu religious-arts education Prodi. Kept as Seni Tari. |
| 91251 | S1 | Seni | 9 | 56% | Seni Teater (5); Teater (4) | Seni Teater | Low agreement comes from spelling or wording variants of the same field; "Seni Teater" is kept (it is also a merge target). |
| 90444 | D3 | Seni | 2 | 50% | Teknik Grafika (1); Teknik Grafis (1) | Teknologi Grafika | Names are variants of one field. Merged from "Teknik Grafika" into "Teknologi Grafika" (see merge "Teknologi Grafika"). |
| 90344 | D4 | Seni | 2 | 50% | Teknologi Grafika (1); Teknologi Rekayasa Cetak Dan Grafis 3 Dimensi (1) | Teknologi Grafika | Low agreement comes from spelling or wording variants of the same field; "Teknologi Grafika" is kept (it is also a merge target). |
| 90343 | D4;S1 | Seni | 10 | 30% | Teknologi Rekayasa Multimedia (3); Teknologi Rekayasa Multimedia Grafis (2); BroadBand Multimedia (1) | Multimedia | Names are variants of one field. Merged from "Teknologi Rekayasa Multimedia" into "Multimedia" (see merge "Multimedia"). |
| 91261 | D4;S1 | Seni | 10 | 40% | Televisi dan Film (4); Film (2); Film dan Televisi (2) | Film dan Televisi | Names are variants of one field. Merged from "Televisi dan Film" into "Film dan Televisi" (see merge "Film dan Televisi"). |
| 63401 | D3 | Sosial | 2 | 50% | Administrasi (1); Manajemen Administrasi (1) | Administrasi Perkantoran | Names are variants of one field. Merged from "Administrasi" into "Administrasi Perkantoran" (see merge "Administrasi Perkantoran"). |
| 94409 | D3 | Sosial | 2 | 50% | Administrasi Asuransi & Aktuaria (1); Manajemen Aktuaria (1) | Asuransi | Names are variants of one field. Merged from "Administrasi Asuransi & Aktuaria" into "Asuransi" (see merge "Asuransi"). |
| 63211 | S1 | Sosial | 110 | 55% | Administrasi Bisnis (60); Ilmu Administrasi Niaga (30); Ilmu Administrasi Bisnis (18) | Administrasi Bisnis | Low agreement comes from spelling or wording variants of the same field; "Administrasi Bisnis" is kept (it is also a merge target). |
| 63311 | D4 | Sosial | 27 | 22% | Administrasi Bisnis Internasional (6); Administrasi Bisnis (4); Bisnis Digital (4) | Bisnis Internasional | Names are variants of one field. Merged from "Administrasi Bisnis Internasional" into "Bisnis Internasional" (see merge "Bisnis Internasional"). |
| 63413 | D3 | Sosial | 6 | 50% | Administrasi Keuangan (3); Administrasi Bisnis (1); Akuntansi (1) | Administrasi Keuangan | Financial administration (3) with one Administrasi Bisnis and one Akuntansi Prodi. Kept; small (6 Prodi). |
| 63301 | D4 | Sosial | 3 | 67% | Administrasi Negara (2); Administrasi Keuangan Publik (1) | Administrasi Publik | Names are variants of one field. Merged from "Administrasi Negara" into "Administrasi Publik" (see merge "Administrasi Publik"). |
| 65301 | D4 | Sosial | 3 | 33% | Administrasi Pemerintahan (1); Manajemen Kontrak Pemerintah (1); Manajemen Pemerintahan (1) | Administrasi Pemerintahan | Untouched (unsure): Names mix government administration with government contract management. |
| 65401 | D3 | Sosial | 2 | 50% | Administrasi Pemerintahan (1); Administrasi Publik (1) | Ilmu Pemerintahan | Names are variants of one field. Merged from "Administrasi Pemerintahan" into "Ilmu Pemerintahan" (see merge "Ilmu Pemerintahan"). |
| 94403 | D3 | Sosial | 2 | 50% | Asuransi (1); Asuransi Kerugian (1) | Asuransi | Low agreement comes from spelling or wording variants of the same field; "Asuransi" is kept (it is also a merge target). |
| 70232 | S1 | Sosial | 106 | 31% | Bimbingan dan Konseling Islam (33); Bimbingan dan Konseling Pendidikan Islam (23); Bimbingan Konseling Islam (18) | Bimbingan dan Konseling Islam | Low agreement comes from spelling or wording variants of the same field; "Bimbingan dan Konseling Islam" is kept (it is also a merge target). |
| 70209 | S1 | Sosial | 2 | 50% | Bimbingan Penyuluhan Islam (1); Kepenyuluhan Buddha (1) | Bimbingan Penyuluhan Islam | Untouched (unsure): Only 2 Prodi: Islamic counselling and Buddhist extension (Kepenyuluhan Buddha). |
| 94201 | S1 | Sosial | 4 | 25% | Bio Kewirausahaan (1); Bisnis (1); Entrepreneurship (1) | Kewirausahaan | Names are variants of one field. Merged from "Bio Kewirausahaan" into "Kewirausahaan" (see merge "Kewirausahaan"). |
| 63313 | D4 | Sosial | 2 | 50% | Demografi dan Pencatatan Sipil (1); Studi Kependudukan dan Pencatatan Sipil (1) | Demografi dan Pencatatan Sipil | Low agreement comes from spelling or wording variants of the same field; "Demografi dan Pencatatan Sipil" is kept. |
| 93205 | S1 | Sosial | 3 | 67% | Hospitality dan Pariwisata (2); Hospitaliti dan Pariwisata (1) | Pariwisata | Names are variants of one field. Merged from "Hospitality dan Pariwisata" into "Pariwisata" (see merge "Pariwisata"). |
| 70403 | D3 | Sosial | 2 | 50% | Hubungan Masyarakat (1); Komunikasi Massa (1) | Hubungan Masyarakat | Public relations and mass communication (2 Prodi). Kept as Hubungan Masyarakat. |
| 68401 | D3 | Sosial | 2 | 50% | Hubungan Masyarakat K. Batang (1); Pembangunan Masyarakat Desa (1) | Hubungan Masyarakat K. Batang | Untouched (unsure): Proposed name is a Humas branch campus, but the other Prodi is Pembangunan Masyarakat Desa. |
| 74234 | S1 | Sosial | 217 | 40% | Hukum Ekonomi Syariah (Muamalah) (87); Hukum Ekonomi Syari`ah (Mu`amalah) (31); Hukum Ekonomi Syariah (28) | Hukum Ekonomi Syariah (Muamalah) | Low agreement comes from spelling or wording variants of the same field; "Hukum Ekonomi Syariah (Muamalah)" is kept. |
| 74230 | S1 | Sosial | 321 | 41% | Hukum Keluarga Islam (Ahwal Syakhshiyyah) (132); Hukum Keluarga (Ahwal Syakhshiyah) (54); Hukum Keluarga (Ahwal Al Syakhshiyah) (19) | Hukum Keluarga Islam (Ahwal Syakhshiyyah) | Low agreement comes from spelling or wording variants of the same field; "Hukum Keluarga Islam (Ahwal Syakhshiyyah)" is kept (it is also a merge target). |
| 74235 | S1 | Sosial | 66 | 30% | Hukum Tatanegara (Siyasah Syar'iyyah) (20); Hukum Tatanegara (Siyasah) (14); Hukum Tata Negara (Siyasah) (8) | Hukum Tatanegara (Siyasah Syar'iyyah) | Low agreement comes from spelling or wording variants of the same field; "Hukum Tatanegara (Siyasah Syar'iyyah)" is kept. |
| 63201 | S1 | Sosial | 231 | 52% | Ilmu Administrasi Negara (120); Administrasi Publik (91); Ilmu Administrasi Publik (11) | Administrasi Publik | Names are variants of one field. Merged from "Ilmu Administrasi Negara" into "Administrasi Publik" (see merge "Administrasi Publik"). |
| 64201 | S1 | Sosial | 74 | 50% | Ilmu Hubungan Internasional (37); Hubungan Internasional (36); Pendidikan Ilmu Pengetahuan Alam (1) | Hubungan Internasional | Names are variants of one field. Merged from "Ilmu Hubungan Internasional" into "Hubungan Internasional" (see merge "Hubungan Internasional"). |
| 74201 | S1 | Sosial | 467 | 65% | Ilmu Hukum (302); Hukum (165) | Ilmu Hukum | Low agreement comes from spelling or wording variants of the same field; "Ilmu Hukum" is kept (it is also a merge target). |
| 55220 | S1 | Sosial | 2 | 50% | Ilmu Kepolisian (1); Sains Kepolisian (1) | Ilmu Kepolisian | Low agreement comes from spelling or wording variants of the same field; "Ilmu Kepolisian" is kept (it is also a merge target). |
| 72201 | S1 | Sosial | 28 | 68% | Ilmu Kesejahteraan Sosial (19); Kesejahteraan Sosial (9) | Kesejahteraan Sosial | Names are variants of one field. Merged from "Ilmu Kesejahteraan Sosial" into "Kesejahteraan Sosial" (see merge "Kesejahteraan Sosial"). |
| 70235 | S1 | Sosial | 9 | 56% | Ilmu Komunikasi Hindu (5); Penerangan Agama Hindu (3); Kepenyuluhan Buddha (1) | Ilmu Komunikasi Hindu | Hindu communication/religious information, plus one Buddhist extension Prodi. Kept. |
| 93201 | S1 | Sosial | 3 | 33% | Industri Perjalanan (1); Industri Perjalanan Wisata (1); Manajemen Pemasaran Pariwisata (1) | Pariwisata | Names are variants of one field. Merged from "Industri Perjalanan" into "Pariwisata" (see merge "Pariwisata"). |
| 70202 | S1 | Sosial | 13 | 54% | Jurnalistik (7); Jurnalistik Islam (5); Ilmu Komunikasi (1) | Jurnalistik | Journalism (incl. Jurnalistik Islam) plus one Ilmu Komunikasi Prodi. Kept. |
| 70236 | S1 | Sosial | 2 | 50% | Kepanditaan (1); Kepanditaan Buddha (1) | Studi Agama Buddha | Names are variants of one field. Merged from "Kepanditaan" into "Studi Agama Buddha" (see merge "Studi Agama Buddha"). |
| 93303 | D4 | Sosial | 2 | 50% | Kepariwisataan (1); Manajemen Bisnis Pariwisata (1) | Pariwisata | Names are variants of one field. Merged from "Kepariwisataan" into "Pariwisata" (see merge "Pariwisata"). |
| 66201 | S1 | Sosial | 3 | 67% | Kriminologi (2); Akuntansi (1) | Kriminologi | Criminology, plus one Prodi called Akuntansi, which is almost certainly a data error. Kept. |
| 61208 | S1 | Sosial | 2 | 50% | Manajemen Administrasi Perkantoran (1); Pendidikan Administrasi Perkantoran (1) | Manajemen Administrasi Perkantoran | Untouched (unsure): Only 2 Prodi: office-administration management and its teacher-education counterpart. |
| 93308 | D4 | Sosial | 6 | 33% | Manajemen Bisnis Internasional (2); Manajemen Pemasaran Internasional (2); Bisnis Internasional (1) | Bisnis Internasional | Names are variants of one field. Merged from "Manajemen Bisnis Internasional" into "Bisnis Internasional" (see merge "Bisnis Internasional"). |
| 63314 | D4;S1 | Sosial | 9 | 22% | Manajemen Logistik (2); Bisnis dan Logistik Maritim (1); Bisnis Logistik (1) | Logistik | Names are variants of one field. Merged from "Manajemen Logistik" into "Logistik" (see merge "Logistik"). |
| 70234 | S1 | Sosial | 6 | 50% | Manajemen Pendidikan Islam (3); Dirasat Islamiyah (1); Pendidikan Agama Islam (1) | Manajemen Pendidikan Islam | Islamic education management, plus one Dirasat Islamiyah and one PAI Prodi. Kept. |
| 93302 | D4 | Sosial | 15 | 33% | Manajemen Perhotelan (5); Perhotelan (5); Pengelolaan Perhotelan (3) | Perhotelan | Names are variants of one field. Merged from "Manajemen Perhotelan" into "Perhotelan" (see merge "Perhotelan"). |
| 74401 | D3 | Sosial | 3 | 67% | Paralegal (2); Administrasi Peradilan (1) | Ilmu Hukum | Names are variants of one field. Merged from "Paralegal" into "Ilmu Hukum" (see merge "Ilmu Hukum"). |
| 85205 | S1 | Sosial | 3 | 67% | Pariwisata (2); Pendidikan Pariwisata (1) | Pariwisata | Low agreement comes from spelling or wording variants of the same field; "Pariwisata" is kept (it is also a merge target). |
| 93202 | S1 | Sosial | 47 | 68% | Pariwisata (32); Pariwisata Syariah (6); Destinasi Pariwisata (2) | Pariwisata | Low agreement comes from spelling or wording variants of the same field; "Pariwisata" is kept (it is also a merge target). |
| 93403 | D3 | Sosial | 8 | 38% | Pariwisata (3); Kepariwisataan (2); Bina Wisata (1) | Pariwisata | Low agreement comes from spelling or wording variants of the same field; "Pariwisata" is kept (it is also a merge target). |
| 72302 | D4 | Sosial | 3 | 67% | Pekerjaan Sosial (2); Politik Indonesia Terapan (1) | Kesejahteraan Sosial | Names are variants of one field. Merged from "Pekerjaan Sosial" into "Kesejahteraan Sosial" (see merge "Kesejahteraan Sosial"). |
| 68201 | S1 | Sosial | 6 | 67% | Pembangunan Sosial (4); Ilmu Sosiatri (1); Pembangunan Sosial dan Kesejahteraan (1) | Kesejahteraan Sosial | Names are variants of one field. Merged from "Pembangunan Sosial" into "Kesejahteraan Sosial" (see merge "Kesejahteraan Sosial"). |
| 70402 | D3 | Sosial | 4 | 50% | Penerbitan (2); Jurnalistik (1); Penyiaran Radio dan Televisi (1) | Penerbitan | Publishing, plus one journalism and one broadcasting Prodi. Kept. |
| 93314 | D4 | Sosial | 2 | 50% | Pengelolaan Konvensi dan Acara (1); Usaha Jasa Konvensi, Perjalanan Insentif, dan Pameran (1) | Pariwisata | Names are variants of one field. Merged from "Pengelolaan Konvensi dan Acara" into "Pariwisata" (see merge "Pariwisata"). |
| 74233 | S1 | Sosial | 21 | 48% | Perbandingan Madzhab (10); Perbandingan Mazhab (9); Perbandingan Madzhab dan Hukum (1) | Perbandingan Madzhab | Low agreement comes from spelling or wording variants of the same field; "Perbandingan Madzhab" is kept. |
| 93482 | D3 | Sosial | 2 | 50% | Perhotelan (1); Perhotelan Kampus Kota Yogyakarta (1) | Perhotelan | Low agreement comes from spelling or wording variants of the same field; "Perhotelan" is kept (it is also a merge target). |
| 93406 | D3 | Sosial | 6 | 67% | Perjalanan Wisata (4); Usaha Perjalanan Pariwisata (1); Usaha Perjalanan Wisata (1) | Pariwisata | Names are variants of one field. Merged from "Perjalanan Wisata" into "Pariwisata" (see merge "Pariwisata"). |
| 63421 | D3 | Sosial | 10 | 60% | Perpajakan (6); Administrasi Perpajakan (3); Pajak Bumi dan Bangunan/Penilai (1) | Perpajakan | Low agreement comes from spelling or wording variants of the same field; "Perpajakan" is kept (it is also a merge target). |
| 73202 | S1 | Sosial | 2 | 50% | PJJ Psikologi (1); Psikologi (1) | Psikologi | Names are variants of one field. Merged from "PJJ Psikologi" into "Psikologi" (see merge "Psikologi"). |
| 73204 | S1 | Sosial | 15 | 60% | Psikologi Islam (9); Psikologi Kristen (5); Pendidikan Psikologi Konseling Buddha (1) | Psikologi | Names are variants of one field. Merged from "Psikologi Islam" into "Psikologi" (see merge "Psikologi"). |
| 63412 | D3 | Sosial | 45 | 67% | Sekretari (30); Kesekretariatan (10); Administrasi Perkantoran (2) | Administrasi Perkantoran | Names are variants of one field. Merged from "Sekretari" into "Administrasi Perkantoran" (see merge "Administrasi Perkantoran"). |
| 94405 | D3 | Sosial | 3 | 67% | Tata Busana (2); Desain Busana (1) | Desain Mode | Names are variants of one field. Merged from "Tata Busana" into "Desain Mode" (see merge "Desain Mode"). |
| 94410 | D4 | Sosial | 3 | 67% | Tata Busana (2); Tata Rias dan Busana (1) | Desain Mode | Names are variants of one field. Merged from "Tata Busana" into "Desain Mode" (see merge "Desain Mode"). |
| 94304 | D3;D4 | Sosial | 2 | 50% | Terapi Wicara (1); Terapi Wicara dan Bahasa (1) | Terapi Wicara | Low agreement comes from spelling or wording variants of the same field; "Terapi Wicara" is kept (it is also a merge target). |
| 94404 | D3 | Sosial | 3 | 67% | Terapi Wicara (2); Audiologi (1) | Terapi Wicara | Low agreement comes from spelling or wording variants of the same field; "Terapi Wicara" is kept (it is also a merge target). |
| 93301 | D4 | Sosial | 21 | 57% | Usaha Perjalanan Wisata (12); Manajemen Pariwisata (4); Bisnis Perjalanan Wisata (1) | Pariwisata | Names are variants of one field. Merged from "Usaha Perjalanan Wisata" into "Pariwisata" (see merge "Pariwisata"). |
| 93310 | D4 | Sosial | 12 | 33% | Usaha Perjalanan Wisata (4); Manajemen Bisnis Pariwisata (3); Pengelolaan Usaha Rekreasi (2) | Pariwisata | Names are variants of one field. Merged from "Usaha Perjalanan Wisata" into "Pariwisata" (see merge "Pariwisata"). |
| 63212 | S1 | Sosial;Humaniora | 2 | 50% | Administrasi Bisnis (1); Administrasi Fiskal (1) | Administrasi Bisnis | Business administration and fiscal administration (2 Prodi). Kept as Administrasi Bisnis. |
| 40403 | D3 | Teknik | 3 | 33% | Aeronautika (1); Rangka Pesawat (1); Rangka Pesawat Terbang (1) | Teknik Pesawat Udara | Names are variants of one field. Merged from "Aeronautika" into "Teknik Pesawat Udara" (see merge "Teknik Pesawat Udara"). |
| 24402 | D3 | Teknik | 8 | 63% | Analis Kimia (5); Analisis Kimia (2); Kimia Analisis (1) | Analisis Kimia | Names are variants of one field. Merged from "Analis Kimia" into "Analisis Kimia" (see merge "Analisis Kimia"). |
| 49103 | S1 | Teknik | 2 | 50% | Bachelor of Computer Science (1); Bsc (Hons) Computer Science (1) | Teknik Informatika | Names are variants of one field. Merged from "Bachelor of Computer Science" into "Teknik Informatika" (see merge "Teknik Informatika"). |
| 54342 | D4 | Teknik | 2 | 50% | Budi Daya Laut dan Pantai (1); Manajemen Rekayasa Budidaya Laut (1) | Akuakultur | Names are variants of one field. Merged from "Budi Daya Laut dan Pantai" into "Akuakultur" (see merge "Akuakultur"). |
| 35302 | D4 | Teknik | 2 | 50% | Desain Kawasan Binaan (1); Perencanaan Tata Ruang dan Pertanahan (1) | Perencanaan Wilayah dan Kota | Names are variants of one field. Merged from "Desain Kawasan Binaan" into "Perencanaan Wilayah dan Kota" (see merge "Perencanaan Wilayah dan Kota"). |
| 90312 | D4 | Teknik | 2 | 50% | Desain Produk Kayu Dan Serat (1); Rekayasa Kayu (1) | Desain Produk | Names are variants of one field. Merged from "Desain Produk Kayu Dan Serat" into "Desain Produk" (see merge "Desain Produk"). |
| 30202 | S1 | Teknik | 3 | 33% | Elektronika dan Instrumentasi (1); Instrumentasi (1); Teknik Elektro (1) | Teknik Elektro | Names are variants of one field. Merged from "Elektronika dan Instrumentasi" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 59202 | S1 | Teknik | 7 | 43% | Ilmu Komputer (3); Rekayasa Perangkat Lunak (3); Sistem Informasi Akuntansi (1) | Teknik Informatika | Names are variants of one field. Merged from "Ilmu Komputer" into "Teknik Informatika" (see merge "Teknik Informatika"). |
| 55202 | S1 | Teknik | 140 | 56% | Informatika (78); Teknik Informatika (59); Teknologi Informasi (2) | Teknik Informatika | Names are variants of one field. Merged from "Informatika" into "Teknik Informatika" (see merge "Teknik Informatika"). |
| 55281 | S1 | Teknik | 3 | 67% | Informatika (2); Teknik Informatika (1) | Teknik Informatika | Names are variants of one field. Merged from "Informatika" into "Teknik Informatika" (see merge "Teknik Informatika"). |
| 57302 | D4 | Teknik | 19 | 32% | Keamanan Sistem Informasi (6); Rekayasa Keamanan Siber (6); Komputerisasi Akuntansi (3) | Keamanan Sistem Informasi | Untouched (unsure): Names mix information security (6), cyber security (6) and Komputerisasi Akuntansi (3). |
| 55283 | S1 | Teknik | 4 | 50% | Kecerdasan Artifisial (2); Kecerdasan Buatan (1); Rekayasa Kecerdasan Artifisial (1) | Kecerdasan Buatan | Names are variants of one field. Merged from "Kecerdasan Artifisial" into "Kecerdasan Buatan" (see merge "Kecerdasan Buatan"). |
| 56209 | D4 | Teknik | 3 | 67% | Kecerdasan Buatan dan Robotik (2); Kecerdasan Buatan dan Robotika (1) | Kecerdasan Buatan | Names are variants of one field. Merged from "Kecerdasan Buatan dan Robotik" into "Kecerdasan Buatan" (see merge "Kecerdasan Buatan"). |
| 32404 | D3 | Teknik | 3 | 33% | Keselamatan Kerja & Pencegahan Kebakaran (1); Penyelamatan dan Pemadam Kebakaran Penerbangan (1); Pertolongan Kecelakaan Pesawat (1) | Keselamatan Kerja & Pencegahan Kebakaran | All three names are aviation fire, rescue and safety. Kept; the name is the export’s own. |
| 92301 | D4 | Teknik | 3 | 67% | Ketatalaksanaan Pelayaran Niaga Dan Kepelabuhan (2); Tata Laksana Angkutan Laut dan Kepelabuhan (1) | Manajemen Pelabuhan dan Pelayaran | Names are variants of one field. Merged from "Ketatalaksanaan Pelayaran Niaga Dan Kepelabuhan" into "Manajemen Pelabuhan dan Pelayaran" (see merge "Manajemen Pelabuhan dan Pelayaran"). |
| 92401 | D3 | Teknik | 23 | 48% | Ketatalaksanaan Pelayaran Niaga Dan Kepelabuhan (11); Ketatalaksanaan Pelayaran Niaga Dan Kepel (9); Ketatalaksanaan Pelayaran Niaga (1) | Manajemen Pelabuhan dan Pelayaran | Names are variants of one field. Merged from "Ketatalaksanaan Pelayaran Niaga Dan Kepelabuhan" into "Manajemen Pelabuhan dan Pelayaran" (see merge "Manajemen Pelabuhan dan Pelayaran"). |
| 22403 | D3 | Teknik | 8 | 25% | Konstruksi Gedung (2); Teknik Konstruksi Gedung (2); Teknologi Konstruksi Bangunan Gedung (2) | Teknik Sipil | Names are variants of one field. Merged from "Konstruksi Gedung" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 22402 | D3 | Teknik | 7 | 29% | Konstruksi Sipil (2); Teknik Konstruksi Sipil (2); Teknik Ekonomi Konstruksi (1) | Teknik Sipil | Names are variants of one field. Merged from "Konstruksi Sipil" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 57482 | D3 | Teknik | 2 | 50% | Manajemen Informatika Kampus Kota Padang (1); Sistem Informasi Kampus Kota Tasikmalaya (1) | Manajemen Informatika Kampus Kota Padang | Untouched (unsure): Names mix Manajemen Informatika and Sistem Informasi branch campuses; the proposed name also carries a campus suffix. Needs a human choice between the two. **Decided later: mapped to Manajemen Informatika. The Sistem Informasi Tasikmalaya Prodi may need a per-Prodi override.** |
| 57207 | S1 | Teknik | 3 | 67% | Manajemen Komunikasi (2); Manajemen Informasi Komunikasi (1) | Ilmu Komunikasi | Names are variants of one field. Merged from "Manajemen Komunikasi" into "Ilmu Komunikasi" (see merge "Ilmu Komunikasi"). |
| 22302 | D4 | Teknik | 11 | 18% | Manajemen Konstruksi (2); Manajemen Rekayasa Konstruksi (2); Jasa Konstruksi (1) | Teknik Sipil | Names are variants of one field. Merged from "Manajemen Konstruksi" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 39404 | D3 | Teknik | 4 | 50% | Manajemen Lalu Lintas Udara (2); Lalu Lintas Udara (1); Pemanduan Lalu Lintas Udara (1) | Lalu Lintas Udara | Names are variants of one field. Merged from "Manajemen Lalu Lintas Udara" into "Lalu Lintas Udara" (see merge "Lalu Lintas Udara"). |
| 92304 | D4 | Teknik | 5 | 60% | Manajemen Pelabuhan Dan Logistik Maritim (3); Ketatalaksanaan Angkutan Laut dan Kepelabuhan (1); Ketatalaksanaan Angkutan Laut dan Kepelabuhanan (1) | Manajemen Pelabuhan dan Pelayaran | Names are variants of one field. Merged from "Manajemen Pelabuhan dan Logistik Maritim" into "Manajemen Pelabuhan dan Pelayaran" (see merge "Manajemen Pelabuhan dan Pelayaran"). |
| 21412 | D3 | Teknik | 7 | 57% | Mekatronika (4); Teknik Mekatronika (3) | Teknik Mekatronika | Names are variants of one field. Merged from "Mekatronika" into "Teknik Mekatronika" (see merge "Teknik Mekatronika"). |
| 21403 | D3 | Teknik | 20 | 45% | Mesin Otomotif (9); Teknik Otomotif (5); Teknologi Otomotif (3) | Teknik Otomotif | Names are variants of one field. Merged from "Mesin Otomotif" into "Teknik Otomotif" (see merge "Teknik Otomotif"). |
| 33202 | S1 | Teknik | 2 | 50% | Meteorologi (1); Meteorologi Terapan (1) | Meteorologi | Low agreement comes from spelling or wording variants of the same field; "Meteorologi" is kept (it is also a merge target). |
| 20404 | D3 | Teknik | 2 | 50% | Metrologi dan Instrumentasi (1); Metrologi Dan Instrumetasi (1) | Teknik Instrumentasi | Names are variants of one field. Merged from "Metrologi dan Instrumentasi" into "Teknik Instrumentasi" (see merge "Teknik Instrumentasi"). |
| 90448 | D3 | Teknik | 2 | 50% | Multimedia (1); Teknologi Multimedia Broadcasting (1) | Multimedia | Low agreement comes from spelling or wording variants of the same field; "Multimedia" is kept (it is also a merge target). |
| 21410 | D3 | Teknik | 2 | 50% | Pengecoran (1); Teknologi Pengecoran Logam (1) | Teknik Mesin | Names are variants of one field. Merged from "Pengecoran" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 22313 | D4 | Teknik | 5 | 20% | Pengelolaan Pelabuhan Perikanan (1); Teknik Infrastruktur Sipil dan Perancangan Arsitektur (1); Teknik Pengelolaan dan Pemeliharaan Infrastruktur Sipil (1) | Pengelolaan Pelabuhan Perikanan | Untouched (unsure): Names mix Pengelolaan Pelabuhan Perikanan with civil-infrastructure programmes (20% agreement). |
| 51301 | D4 | Teknik | 3 | 67% | Penginderaan Jauh dan Sistem Informasi Geografis (2); Sistem Informasi Geografis (1) | Geografi | Names are variants of one field. Merged from "Penginderaan Jauh dan Sistem Informasi Geografis" into "Geografi" (see merge "Geografi"). |
| 32403 | D3 | Teknik | 3 | 33% | Pengolahan Limbah Industri (1); Teknik Analisis Lab Minyak Dan Gas (1); Teknologi Pengolahan Karet dan Plastik (1) | Pengolahan Limbah Industri | Untouched (unsure): Names mix waste treatment, oil-and-gas lab analysis and rubber/plastic processing. |
| 21408 | D3 | Teknik | 14 | 36% | Perawatan Dan Perbaikan Mesin (5); Pemeliharaan Mesin (4); Teknologi Mesin (2) | Teknik Mesin | Names are variants of one field. Merged from "Perawatan Dan Perbaikan Mesin" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 35401 | D3 | Teknik | 3 | 33% | Perencanaan Tata Ruang Wilayah Dan Kota (1); Survei Dan Pemetaan (1); Teknik Survey dan Pemetaan (1) | Perencanaan Tata Ruang Wilayah Dan Kota | Untouched (unsure): Names mix spatial planning with surveying and mapping. |
| 32401 | D3 | Teknik | 3 | 33% | Perminyakan (1); Teknik Eksplorasi Produksi Minyak Dan Gas (1); Teknik Perminyakan Dan Gas Bumi (1) | Teknik Perminyakan | Names are variants of one field. Merged from "Perminyakan" into "Teknik Perminyakan" (see merge "Teknik Perminyakan"). |
| 57203 | S1 | Teknik | 6 | 50% | PJJ Sistem Informasi (3); Sistem Informasi (3) | Sistem Informasi | Names are variants of one field. Merged from "PJJ Sistem Informasi" into "Sistem Informasi" (see merge "Sistem Informasi"). |
| 20308 | D4 | Teknik | 2 | 50% | Rekayasa Elektro Medis (1); Teknologi Rekayasa Elektro-Medis (1) | Teknik Elektromedik | Names are variants of one field. Merged from "Rekayasa Elektro Medis" into "Teknik Elektromedik" (see merge "Teknik Elektromedik"). |
| 22104 | S1 | Teknik | 5 | 40% | Rekayasa Infrastruktur dan Lingkungan (2); Rekayasa Infrastruktur Lingkungan (1); Teknik Infrastruktur Lingkungan (1) | Teknik Lingkungan | Names are variants of one field. Merged from "Rekayasa Infrastruktur dan Lingkungan" into "Teknik Lingkungan" (see merge "Teknik Lingkungan"). |
| 21300 | S1 | Teknik | 2 | 50% | Rekayasa Instrumentasi dan Automasi (1); Rekayasa Instrumentasi dan Otomasi (1) | Teknik Instrumentasi | Names are variants of one field. Merged from "Rekayasa Instrumentasi dan Automasi" into "Teknik Instrumentasi" (see merge "Teknik Instrumentasi"). |
| 21301 | D4 | Teknik | 17 | 35% | Rekayasa Perancangan Mekanik (6); Teknik Mesin Produksi dan Perawatan (4); Teknik Mesin Kapal Perang (2) | Teknik Mesin | Names are variants of one field. Merged from "Rekayasa Perancangan Mekanik" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 54208 | S1 | Teknik | 5 | 40% | Rekayasa Pertanian dan Biosistem (2); Teknik Pertanian dan Biosistem (2); Teknik Biosistem (1) | Teknik Pertanian | Names are variants of one field. Merged from "Rekayasa Pertanian dan Biosistem" into "Teknik Pertanian" (see merge "Teknik Pertanian"). |
| 39301 | D4 | Teknik | 3 | 33% | Rekayasa Sistem Transportasi Jalan (1); Teknologi Rekayasa Bandar Udara (1); Transportasi (1) | Transportasi | Names are variants of one field. Merged from "Rekayasa Sistem Transportasi Jalan" into "Transportasi" (see merge "Transportasi"). |
| 26304 | D4 | Teknik | 6 | 50% | Relasi Industri (3); Administrasi Bisnis Otomotif (1); Bisnis Industri Kreatif (1) | Relasi Industri | Untouched (unsure): Names mix industrial relations, automotive business administration and creative-industry business. |
| 57403 | D3 | Teknik | 12 | 67% | Sistem Informasi (8); Teknologi Informasi (4) | Sistem Informasi | D3 information systems, with 4 Prodi named Teknologi Informasi. Kept as Sistem Informasi. |
| 57303 | D4 | Teknik | 3 | 33% | Sistem Informasi Bisnis (1); Sistem Informasi Industri Otomotif (1); Teknologi Rekayasa Informatika Industri (1) | Sistem Informasi | Names are variants of one field. Merged from "Sistem Informasi Bisnis" into "Sistem Informasi" (see merge "Sistem Informasi"). |
| 56201 | S1 | Teknik | 65 | 60% | Sistem Komputer (39); Teknik Komputer (13); Rekayasa Sistem Komputer (9) | Teknik Komputer | Names are variants of one field. Merged from "Sistem Komputer" into "Teknik Komputer" (see merge "Teknik Komputer"). |
| 21306 | D4 | Teknik | 4 | 25% | Sistem Pembangkit Energi (1); Teknik Energi (1); Teknik Energi Terbarukan (1) | Teknik Energi | Names are variants of one field. Merged from "Sistem Pembangkit Energi" into "Teknik Energi" (see merge "Teknik Energi"). |
| 40402 | D3 | Teknik | 4 | 50% | Teknik Aeronautika (2); Aeronautika (1); Penerangan Aeronautika (1) | Teknik Pesawat Udara | Names are variants of one field. Merged from "Teknik Aeronautika" into "Teknik Pesawat Udara" (see merge "Teknik Pesawat Udara"). |
| 21413 | D3 | Teknik | 7 | 43% | Teknik Alat Berat (3); Alat Berat (2); Teknik Mesin Alat Berat (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknik Alat Berat" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 21414 | D3 | Teknik | 4 | 50% | Teknik Alat Berat (2); Pemeliharaan Alat Berat (1); Perawatan Alat Berat (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknik Alat Berat" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 22405 | D3 | Teknik | 3 | 33% | Teknik Bangunan dan Landasan (1); Teknologi Bangunan dan Jalur Perkeretaapian (1); Teknologi Konstruksi Jalan dan Jembatan (1) | Teknik Sipil | Names are variants of one field. Merged from "Teknik Bangunan dan Landasan" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 36403 | D3 | Teknik | 3 | 67% | Teknik Bangunan Kapal (2); Teknik Bangunan dan Landasan (1) | Teknik Perkapalan | Names are variants of one field. Merged from "Teknik Bangunan Kapal" into "Teknik Perkapalan" (see merge "Teknik Perkapalan"). |
| 22304 | D3;D4 | Teknik | 5 | 20% | Teknik Bangunan Rawa (1); Teknik Perancangan Irigasi Dan Penanganan Pantai (1); Teknik Perawatan dan Perbaikan Mesin (1) | Teknik Bangunan Rawa | Untouched (unsure): Names mix Teknik Bangunan Rawa, irrigation/coastal engineering and Teknik Perawatan dan Perbaikan Mesin. |
| 21303 | D4 | Teknik | 3 | 33% | Teknik Elektromedik (1); Teknik Otomotif Elektronik (1); Teknik Otomotif Kendaraan Tempur (1) | Teknik Elektromedik | Untouched (unsure): Names mix Teknik Elektromedik with two automotive programmes (Otomotif Elektronik, Otomotif Kendaraan Tempur). |
| 20301 | D4 | Teknik | 23 | 22% | Teknik Elektronika (5); Teknologi Rekayasa Elektro-medis (3); Teknik Elektro (2) | Teknik Elektronika | Untouched (unsure): 23 Prodi with 22% agreement across electronics, electromedical and electrical engineering. |
| 20401 | D3;D4 | Teknik | 69 | 52% | Teknik Elektronika (36); Teknik Elektro (7); Teknologi Elektro-medis (4) | Teknik Elektro | Names are variants of one field. Merged from "Teknik Elektronika" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 30302 | D4 | Teknik | 7 | 43% | Teknik Elektronika (3); Teknologi Rekayasa Instrumentasi (2); Elektronika Instrumentasi (1) | Teknik Elektro | Names are variants of one field. Merged from "Teknik Elektronika" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 33201 | S1 | Teknik | 22 | 55% | Teknik Geofisika (12); Geofisika (10) | Geofisika | Names are variants of one field. Merged from "Teknik Geofisika" into "Geofisika" (see merge "Geofisika"). |
| 34401 | D3 | Teknik | 3 | 33% | Teknik Geologi (1); Teknik Geologi Terapan (1); Teknologi Geomatika (1) | Teknik Geologi | Untouched (unsure): Names mix Teknik Geologi and Teknologi Geomatika. |
| 26401 | D3 | Teknik | 12 | 50% | Teknik Industri (6); Teknologi Industri (2); Teknik dan Manajemen Industri (1) | Teknik Industri | Low agreement comes from spelling or wording variants of the same field; "Teknik Industri" is kept (it is also a merge target). |
| 26301 | D4 | Teknik | 2 | 50% | Teknik Industri Otomotif (1); Teknik Manajemen Industri Pertahanan (1) | Teknik Industri Otomotif | Untouched (unsure): Only 2 Prodi: Teknik Industri Otomotif and Teknik Manajemen Industri Pertahanan. |
| 55201 | S1 | Teknik | 473 | 66% | Teknik Informatika (311); Informatika (96); Ilmu Komputer (57) | Teknik Informatika | Low agreement comes from spelling or wording variants of the same field; "Teknik Informatika" is kept (it is also a merge target). |
| 56403 | D3 | Teknik | 2 | 50% | Teknik Informatika (1); Teknologi Informasi (1) | Teknik Informatika | Low agreement comes from spelling or wording variants of the same field; "Teknik Informatika" is kept (it is also a merge target). |
| 30402 | D3 | Teknik | 2 | 50% | Teknik Instrumentasi (1); Teknologi Instrumentasi Industri Petrokimia (1) | Teknik Instrumentasi | Low agreement comes from spelling or wording variants of the same field; "Teknik Instrumentasi" is kept (it is also a merge target). |
| 38201 | S1 | Teknik | 12 | 58% | Teknik Kelautan (7); Oseanografi (4); Hidrografi (1) | Teknik Kelautan | Low agreement comes from spelling or wording variants of the same field; "Teknik Kelautan" is kept (it is also a merge target). |
| 38402 | D3 | Teknik | 5 | 60% | Teknik Kelautan (3); Teknologi Kelautan (1); Teknologi Nautika (1) | Teknik Kelautan | Ocean engineering, plus one Teknologi Nautika Prodi. Kept. |
| 36404 | D3 | Teknik | 3 | 67% | Teknik Kelistrikan Kapal (2); Sistem Kelistrikan kapal (1) | Teknik Kelistrikan Kapal | Low agreement comes from spelling or wording variants of the same field; "Teknik Kelistrikan Kapal" is kept (it is also a merge target). |
| 32304 | D4 | Teknik | 2 | 50% | Teknik Keselamatan Dan Kesehatan Kerja (1); Teknologi Rekayasa Keselamatan (1) | Keselamatan dan Kesehatan Kerja | Names are variants of one field. Merged from "Teknik Keselamatan Dan Kesehatan Kerja" into "Keselamatan dan Kesehatan Kerja" (see merge "Keselamatan dan Kesehatan Kerja"). |
| 24406 | D3 | Teknik | 2 | 50% | Teknik Kimia (1); Teknik Kimia Mineral (1) | Teknik Kimia | Low agreement comes from spelling or wording variants of the same field; "Teknik Kimia" is kept (it is also a merge target). |
| 56402 | D3 | Teknik | 20 | 50% | Teknik Komputer (10); Teknologi Komputer (7); Teknologi Informasi (2) | Teknik Komputer | D3 computer engineering, with 2 Teknologi Informasi Prodi. Kept as Teknik Komputer. |
| 25401 | D3 | Teknik | 5 | 60% | Teknik Lingkungan (3); Pengelolaan Lingkungan (1); Teknologi Lingkungan (1) | Teknik Lingkungan | Low agreement comes from spelling or wording variants of the same field; "Teknik Lingkungan" is kept (it is also a merge target). |
| 20305 | D4 | Teknik | 8 | 38% | Teknik Listrik (3); Teknologi Rekayasa Instalasi Listrik (2); Teknik Listrik Bandara (1) | Teknik Elektro | Names are variants of one field. Merged from "Teknik Listrik" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 21307 | D4 | Teknik | 8 | 25% | Teknik Manufaktur (2); Perancangan Manufaktur (1); Proses Manufaktur (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknik Manufaktur" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 21411 | D3 | Teknik | 7 | 14% | Teknik Mekanikal Bandar Udara (1); Teknik Mesin (1); Teknik Perancangan Mekanik dan Mesin (1) | Teknik Mekanikal Bandar Udara | Untouched (unsure): 7 Prodi with 14% agreement: airport mechanical engineering mixed with general mechanical engineering. |
| 21302 | D4 | Teknik | 16 | 31% | Teknik Mesin (5); Teknik Mesin Produksi dan Perawatan (4); Teknik Manufaktur Kapal (1) | Teknik Mesin | Mechanical engineering, plus one ship-manufacturing Prodi. Kept. |
| 21402 | D3 | Teknik | 7 | 29% | Teknik Mesin Industri (2); Mesin Industri (1); Teknik Manufaktur Industri Agro (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknik Mesin Industri" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 22202 | S1 | Teknik | 3 | 67% | Teknik Pengairan (2); Teknik Sumber Daya Air (1) | Teknik Sipil | Names are variants of one field. Merged from "Teknik Pengairan" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 32202 | D4 | Teknik | 2 | 50% | Teknik Pengolahan Minyak dan Gas (1); Teknik Produksi Migas (1) | Teknik Perminyakan | Names are variants of one field. Merged from "Teknik Pengolahan Minyak dan Gas" into "Teknik Perminyakan" (see merge "Teknik Perminyakan"). |
| 32402 | D3 | Teknik | 4 | 50% | Teknik Pengolahan Minyak dan Gas (2); Teknik Pengolahan Migas (1); Teknologi Pengolahan Minyak Dan Gas (1) | Teknik Perminyakan | Names are variants of one field. Merged from "Teknik Pengolahan Minyak dan Gas" into "Teknik Perminyakan" (see merge "Teknik Perminyakan"). |
| 21409 | D3 | Teknik | 2 | 50% | Teknik Perancangan Mekanik (1); Teknologi Perancangan Mekanik (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknik Perancangan Mekanik" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 36401 | D3 | Teknik | 3 | 67% | Teknik Perkapalan (2); Teknik Perancangan Dan Konstruksi Kapal (1) | Teknik Perkapalan | Low agreement comes from spelling or wording variants of the same field; "Teknik Perkapalan" is kept (it is also a merge target). |
| 24404 | D3 | Teknik | 2 | 50% | Teknik Tekstil (1); Teknologi industri Tekstil (1) | Teknik Tekstil | Low agreement comes from spelling or wording variants of the same field; "Teknik Tekstil" is kept (it is also a merge target). |
| 20202 | S1 | Teknik | 6 | 67% | Teknik Telekomunikasi (4); Information and Communications Technology (1); Sistem Telekomunikasi (1) | Teknik Telekomunikasi | Telecommunications, plus one ICT and one Sistem Telekomunikasi Prodi. Kept. |
| 20302 | D4 | Teknik | 7 | 57% | Teknik Telekomunikasi (4); Rekayasa Perangkat Keras Kriptografi (1); Teknik Telekomunikasi Militer (1) | Teknik Telekomunikasi | Telecommunications, plus one hardware-cryptography and one military-telecom Prodi. Kept. |
| 20203 | S1 | Teknik | 3 | 67% | Teknik Tenaga Listrik (2); Teknik Elektro (1) | Teknik Elektro | Names are variants of one field. Merged from "Teknik Tenaga Listrik" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 90341 | D4 | Teknik | 2 | 50% | Teknologi Industri Cetak kemasan (1); Teknologi Rekayasa Pengemasan (1) | Teknologi Grafika | Names are variants of one field. Merged from "Teknologi Industri Cetak kemasan" into "Teknologi Grafika" (see merge "Teknologi Grafika"). |
| 24301 | D4 | Teknik | 7 | 43% | Teknologi Kimia Industri (3); Teknik Kimia Polimer (1); Teknik Kimia Produksi Bersih (1) | Teknik Kimia | Names are variants of one field. Merged from "Teknologi Kimia Industri" into "Teknik Kimia" (see merge "Teknik Kimia"). |
| 56482 | D3 | Teknik | 2 | 50% | Teknologi Komputer (1); Teknologi Komputer Kampus Kabupaten Banyumas (1) | Teknik Komputer | Names are variants of one field. Merged from "Teknologi Komputer" into "Teknik Komputer" (see merge "Teknik Komputer"). |
| 20405 | D3 | Teknik | 13 | 38% | Teknologi Listrik (5); Teknik Listrik (3); Teknik Listrik Bandara (2) | Teknik Elektro | Names are variants of one field. Merged from "Teknologi Listrik" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 21407 | D3 | Teknik | 6 | 33% | Teknologi Manufaktur (2); Mesin Otomotif (1); Teknik Manufaktur (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknologi Manufaktur" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 27401 | D3 | Teknik | 2 | 50% | Teknologi Metalurgi (1); Teknologi Metalurgi Industri Logam (1) | Teknik Metalurgi | Names are variants of one field. Merged from "Teknologi Metalurgi" into "Teknik Metalurgi" (see merge "Teknik Metalurgi"). |
| 27301 | D4 | Teknik | 2 | 50% | Teknologi Metalurgi Ekstraksi (1); Teknologi Rekayasa Metalurgi (1) | Teknik Metalurgi | Names are variants of one field. Merged from "Teknologi Metalurgi Ekstraksi" into "Teknik Metalurgi" (see merge "Teknik Metalurgi"). |
| 40407 | D3 | Teknik | 6 | 50% | Teknologi Pemeliharaan Pesawat Udara (3); Teknik Perawatan Pesawat Udara (1); Teknik Pesawat Udara (1) | Teknik Pesawat Udara | Names are variants of one field. Merged from "Teknologi Pemeliharaan Pesawat Udara" into "Teknik Pesawat Udara" (see merge "Teknik Pesawat Udara"). |
| 21308 | D4 | Teknik | 6 | 33% | Teknologi Rekayasa Energi Terbarukan (2); Teknologi Rekayasa Konversi Energi (2); Teknik Konservasi Energi (1) | Teknik Energi | Names are variants of one field. Merged from "Teknologi Rekayasa Energi Terbarukan" into "Teknik Energi" (see merge "Teknik Energi"). |
| 35303 | D4 | Teknik | 5 | 40% | Teknologi Rekayasa Geomatika Dan Survei (2); Survei Pemetaan dan Informasi Geografis (1); Teknologi Rekayasa Penginderaan Jauh (1) | Teknik Geodesi | Names are variants of one field. Merged from "Teknologi Rekayasa Geomatika Dan Survei" into "Teknik Geodesi" (see merge "Teknik Geodesi"). |
| 20303 | D4 | Teknik | 13 | 38% | Teknologi Rekayasa Instalasi Listrik (5); Teknik Listrik (3); Sistem Kelistrikan (1) | Teknik Elektro | Names are variants of one field. Merged from "Teknologi Rekayasa Instalasi Listrik" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 56306 | D4 | Teknik | 2 | 50% | Teknologi Rekayasa Jaringan (1); Teknologi Rekayasa Jaringan Komputer (1) | Teknik Komputer | Names are variants of one field. Merged from "Teknologi Rekayasa Jaringan" into "Teknik Komputer" (see merge "Teknik Komputer"). |
| 20304 | D4 | Teknik | 6 | 50% | Teknologi Rekayasa Jaringan Telekomunikasi (3); Jaringan Telekomunikasi Digital (1); Teknik Multimedia Digital (1) | Teknik Telekomunikasi | Names are variants of one field. Merged from "Teknologi Rekayasa Jaringan Telekomunikasi" into "Teknik Telekomunikasi" (see merge "Teknik Telekomunikasi"). |
| 24305 | D4 | Teknik | 12 | 42% | Teknologi Rekayasa Kimia Industri (5); Kimia Terapan (2); Analisis Kimia (1) | Teknik Kimia | Names are variants of one field. Merged from "Teknologi Rekayasa Kimia Industri" into "Teknik Kimia" (see merge "Teknik Kimia"). |
| 56301 | D4 | Teknik | 12 | 67% | Teknologi Rekayasa Komputer (8); Teknik Komputer dan Jaringan (2); Teknik Komputer (1) | Teknik Komputer | Names are variants of one field. Merged from "Teknologi Rekayasa Komputer" into "Teknik Komputer" (see merge "Teknik Komputer"). |
| 56304 | D4 | Teknik | 3 | 67% | Teknologi Rekayasa Komputer Jaringan (2); Teknologi Rekayasa Internet (1) | Teknik Komputer | Names are variants of one field. Merged from "Teknologi Rekayasa Komputer Jaringan" into "Teknik Komputer" (see merge "Teknik Komputer"). |
| 22305 | D4 | Teknik | 9 | 33% | Teknologi Rekayasa Konstruksi Bangunan Air (3); Teknik Sipil (2); Teknologi Rekayasa Konstruksi Bangunan Gedung (2) | Teknik Sipil | Names are variants of one field. Merged from "Teknologi Rekayasa Konstruksi Bangunan Air" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 22303 | D4 | Teknik | 14 | 43% | Teknologi Rekayasa Konstruksi Bangunan Gedung (6); Teknik Perawatan Dan Perbaikan Gedung (2); Konstruksi Bangunan (1) | Teknik Sipil | Names are variants of one field. Merged from "Teknologi Rekayasa Konstruksi Bangunan Gedung" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 22301 | D4 | Teknik | 24 | 42% | Teknologi Rekayasa Konstruksi Jalan dan Jembatan (10); Perancangan Jalan dan Jembatan (4); Teknik Perancangan Jalan Dan Jembatan (3) | Teknik Sipil | Names are variants of one field. Merged from "Teknologi Rekayasa Konstruksi Jalan dan Jembatan" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 36305 | D4 | Teknik | 3 | 67% | Teknologi Rekayasa Konstruksi Perkapalan (2); Teknologi Rekayasa Arsitektur Perkapalan (1) | Teknik Perkapalan | Names are variants of one field. Merged from "Teknologi Rekayasa Konstruksi Perkapalan" into "Teknik Perkapalan" (see merge "Teknik Perkapalan"). |
| 36301 | D4 | Teknik | 13 | 54% | Teknologi Rekayasa Manufaktur (7); Teknologi Rekayasa Perancangan Manufaktur (3); Perancangan Manufaktur (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknologi Rekayasa Manufaktur" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 21312 | D4 | Teknik | 13 | 69% | Teknologi Rekayasa Mekatronika (9); Teknik Mekatronika (3); Teknik Otomasi (1) | Teknik Mekatronika | Names are variants of one field. Merged from "Teknologi Rekayasa Mekatronika" into "Teknik Mekatronika" (see merge "Teknik Mekatronika"). |
| 90346 | D4 | Teknik | 12 | 42% | Teknologi Rekayasa Multimedia (5); Teknologi Rekayasa Komputer Jaringan (3); Teknik Multimedia dan Jaringan (2) | Teknologi Rekayasa Multimedia | Untouched (unsure): Names mix Teknologi Rekayasa Multimedia (5) with computer-network programmes (5). |
| 36304 | D4 | Teknik | 11 | 64% | Teknologi Rekayasa Otomasi (7); Teknik Otomasi (2); Teknik Otomasi Industri (1) | Teknik Mekatronika | Names are variants of one field. Merged from "Teknologi Rekayasa Otomasi" into "Teknik Mekatronika" (see merge "Teknik Mekatronika"). |
| 36303 | D4 | Teknik | 6 | 67% | Teknologi Rekayasa Pengelasan dan Fabrikasi (4); Teknik Pengelasan (1); Teknologi Pengelasan Dan Fabrikasi (1) | Teknik Mesin | Names are variants of one field. Merged from "Teknologi Rekayasa Pengelasan dan Fabrikasi" into "Teknik Mesin" (see merge "Teknik Mesin"). |
| 58301 | D4 | Teknik | 12 | 58% | Teknologi Rekayasa Perangkat Lunak (7); Rekayasa Perangkat Lunak (3); Teknologi Rekayasa Komputer (1) | Rekayasa Perangkat Lunak | Names are variants of one field. Merged from "Teknologi Rekayasa Perangkat Lunak" into "Rekayasa Perangkat Lunak" (see merge "Rekayasa Perangkat Lunak"). |
| 20307 | D4 | Teknik | 18 | 33% | Teknologi Rekayasa Sistem Elektronika (6); Teknologi Rekayasa Elektronika (5); Teknik Elektro (2) | Teknik Elektro | Names are variants of one field. Merged from "Teknologi Rekayasa Sistem Elektronika" into "Teknik Elektro" (see merge "Teknik Elektro"). |
| 22408 | D3 | Teknik | 3 | 67% | Teknologi Sipil (2); Teknik Sipil (1) | Teknik Sipil | Names are variants of one field. Merged from "Teknologi Sipil" into "Teknik Sipil" (see merge "Teknik Sipil"). |
| 54362 | D4 | Teknik | 3 | 67% | Teknologi Veteriner (2); Paramedik Veteriner (1) | Kesehatan Hewan | Names are variants of one field. Merged from "Teknologi Veteriner" into "Kesehatan Hewan" (see merge "Kesehatan Hewan"). |
