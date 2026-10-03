# CampusMatch

CampusMatch helps Indonesian students choose a Jurusan and a Kampus. It does this with Ulasan from students and alumni, checked before they are shown, and with a Tes Minat that recommends Jurusan.

## Catalogue

**Kampus**:
A higher-education institution (Perguruan Tinggi) in the CampusMatch catalogue.
_Avoid_: Universitas, PT, campus, university

**Prodi** (Program Studi):
One degree programme at one Kampus and one Jenjang, e.g. "S1 Informatika, Universitas Gadjah Mada". Every Ulasan is about a Prodi.
_Avoid_: Jurusan (when you mean a specific programme), program, major, course

**Kode Prodi**:
The national code for a kind of programme (e.g. 55201), shared by every Prodi of that kind regardless of its local name. One Kampus can have several Prodi with the same Kode Prodi, e.g. at different branch campuses.
_Avoid_: Prodi ID, nomenclature code

**Jurusan**:
A generic field of study from CampusMatch's own curated list, e.g. "Teknik Informatika". It groups equivalent Prodi across many Kampus. Each Prodi belongs to exactly one Jurusan.
_Avoid_: Bidang, major, field, department

**Jenjang**:
The level of a Prodi. CampusMatch covers only D3, D4 and S1.
_Avoid_: Strata, degree level

**Akreditasi**:
The official accreditation grade of a Kampus, as published by the government. CampusMatch does not show accreditation for individual Prodi.
_Avoid_: Rating, peringkat

**Kota**:
The city where a Kampus is located. Used for browsing.
_Avoid_: Lokasi, daerah, region

**Daftar Kampus Unggulan**:
A curated list of Kampus (initially 100, taken from Webometrics) that CampusMatch highlights with a badge and a filter. It does not limit which Kampus are covered and never changes the order of search results. Its source and capture date are recorded with each catalogue import.
_Avoid_: Top 100, ranking

## Ulasan

**Ulasan**:
A Pengulas's account of studying at one Prodi, made up of Bintang, Aspek ratings, a Rekomendasi and written text.
_Avoid_: Review, testimoni, komentar

**Pengulas**:
A student or alumnus with an account who writes Ulasan. Each Pengulas has at most one Ulasan per Prodi.
_Avoid_: Reviewer, user, penulis

**Status Pengulas**:
Whether the Pengulas is a *mahasiswa aktif* or an *alumni* of the Prodi, as they declare it themselves.
_Avoid_: Role, tipe

**Terverifikasi**:
A badge showing that the Pengulas proved a link to the Kampus with a campus email address.
_Avoid_: Verified, asli

**Bintang**:
The overall 1–5 score in an Ulasan.
_Avoid_: Nilai, skor, rating

**Aspek**:
One rated dimension of an Ulasan: Kurikulum, Dosen, Fasilitas, Suasana belajar, Organisasi/administrasi, or Biaya vs kualitas.
_Avoid_: Kategori, kriteria

**Rekomendasi**:
A Pengulas's yes/no answer to "would you recommend this Prodi?".
_Avoid_: Saran

**Tingkat Rekomendasi**:
The share of Terbit Ulasan for a Prodi, Kampus or Jurusan whose Rekomendasi is yes.
_Avoid_: Recommendation rate, persentase puas

## Moderasi

**Screening**:
The automatic check every new or edited Ulasan goes through before it can be shown.
_Avoid_: Filter, auto-moderasi

**Tingkat Risiko**:
The outcome of Screening: *rendah* (low), *perlu dicek* (needs a human check) or *melanggar* (violation).
_Avoid_: Skor, score

**Antrean Moderasi**:
The Ulasan waiting for a Moderator's decision.
_Avoid_: Queue, inbox

**Laporan**:
A visitor's report that a Terbit Ulasan breaks the rules. A Laporan sends the Ulasan back to the Antrean Moderasi.
_Avoid_: Flag, aduan

**Moderator**:
A CampusMatch team member who decides on Ulasan in the Antrean Moderasi and maintains the catalogue.
_Avoid_: Admin, tim redaksi, editor

**Status Ulasan**:
- *Menunggu*: not yet screened, or screening could not finish. Never shown.
- *Terbit*: shown publicly.
- *Ditinjau*: in the Antrean Moderasi. Not shown, unless it was already Terbit and a Laporan sent it back for review.
- *Ditolak*: rejected and never shown.

_Avoid_: Draft, approved, pending

## Tes Minat

**Tes Minat**:
The short questionnaire that produces a Profil RIASEC and Rekomendasi Jurusan.
_Avoid_: Kuis, psikotes, tes bakat

**Profil RIASEC**:
A person's scores on the six interest types: Realistic, Investigative, Artistic, Social, Enterprising and Conventional.
_Avoid_: Kepribadian, hasil tes

**Kode RIASEC**:
The two or three interest types assigned to a Jurusan.
_Avoid_: Tag, kategori

**Rekomendasi Jurusan**:
The Jurusan ranked by how well their Kode RIASEC match a Profil RIASEC.
_Avoid_: Hasil, saran jurusan

## People

**Pengunjung**:
Anyone using CampusMatch without being logged in.
_Avoid_: Guest, tamu, visitor

## Commercial

**Promosi**:
A paid, clearly labelled placement of a Kampus. It never changes Bintang, Tingkat Rekomendasi or the order of organic results.
_Avoid_: Iklan (in reference to Kampus), sponsored, featured
