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
A generic field of study from CampusMatch's own curated list, e.g. "Teknik Informatika". It groups equivalent Prodi across many Kampus. Each Prodi belongs to exactly one Jurusan: normally the one its Kode Prodi is mapped to, unless a Moderator has moved that single Prodi to another Jurusan.
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
A curated list of Kampus (initially 100, taken from Webometrics) that CampusMatch highlights with a badge and a filter. It does not limit which Kampus are covered and never changes the order of search results. It also sets which Kampus get their Biaya & Masuk facts collected first. Its source and capture date are recorded with each catalogue import.
_Avoid_: Top 100, ranking

## Biaya & Masuk

**Sumber**:
An official public document or page (e.g. an SK Rektor on UKT, a Kampus admissions page) that backs one or more facts, recorded with its URL, publisher, access date and an archived copy.
_Avoid_: Referensi, link, citation

**Tahun Akademik**:
The academic year a fact applies to, e.g. 2026/2027. Every fact has its own; facts from different years exist side by side.
_Avoid_: TA (in prose), tahun ajaran, periode

**Biaya**:
One published amount a student pays a Kampus: UKT, SPP, Uang Pangkal, a registration fee or a Biaya Lain. It belongs to a Prodi when the Kampus publishes it per Prodi, otherwise to the Kampus.
_Avoid_: Tarif, harga, cost

**UKT** (Uang Kuliah Tunggal):
The per-semester fee at a public Kampus, published per Prodi in groups (Kelompok I, II, …). At a private Kampus the per-semester fee is called SPP.
_Avoid_: SPP (for a public Kampus), biaya kuliah

**Uang Pangkal**:
A one-off fee paid on entry, often only for some Jalur Masuk; also published as IPI, SPI or dana pengembangan.
_Avoid_: Uang gedung, sumbangan

**Biaya Lain**:
A compulsory one-off fee the Kampus publishes besides UKT, SPP and Uang Pangkal (e.g. almamater, KKN). Never an estimate of living costs.
_Avoid_: Biaya hidup, extra costs

**Jalur Masuk**:
One admission route of a Kampus in a Tahun Akademik (SNBP, SNBT, a Mandiri route, or a private Kampus's own route), with the tests it requires.
_Avoid_: Seleksi, gelombang, admission path

**Beasiswa**:
A scholarship a student of a Kampus can receive, either the Kampus's own or a national scheme (e.g. KIP Kuliah) that the Kampus takes part in.
_Avoid_: Bantuan biaya, scholarship

**Status Fakta**:
Whether a fact may be shown:
- *Draf*: entered by a Moderator, not shown.
- *Diperiksa*: checked against its Sumber by a second Moderator, shown.
- *Ditarik*: withdrawn by a Moderator after it was shown, always with a reason. Not shown, but kept as history.

_Avoid_: Terverifikasi (that is the Pengulas badge), verified, approved

**Info Biaya**:
One Pengulas's own account of what they paid at one Prodi (UKT or SPP, Uang Pangkal, other fees at entry) and how they got in (Jalur Masuk, tests, Beasiswa). It is never a fact, never shown on its own, and never includes living costs.
_Avoid_: Laporan, Fakta, Biaya (on its own), data crowdsourcing

**Estimasi Pengulas**:
The Info Biaya of at least five Pengulas combined, per Prodi and per question, from the last five angkatan. It is always labelled as an estimate and shown apart from the official facts, never merged with them.
_Avoid_: Rata-rata biaya, estimasi resmi

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
A badge showing that the Pengulas proved a link to the Kampus by opening a link sent to an address on the Kampus's email domain. It is permanent and is shown with the month it was earned, on the Pengulas's Ulasan for that Kampus's Prodi.
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
The Ulasan waiting for a Moderator's decision: Ditinjau revisions and open Laporan.
_Avoid_: Queue, inbox

**Laporan**:
A signed-in user's report that a Terbit Ulasan breaks the rules. A Laporan puts the Ulasan in the Antrean Moderasi. It stays Terbit and visible until a Moderator unpublishes it.
_Avoid_: Flag, aduan

**Turunkan**:
A Moderator's decision to unpublish a Terbit Ulasan after a Laporan. Its live revision becomes Ditolak.
_Avoid_: Takedown, hapus

**Moderator**:
A CampusMatch team member who decides on Ulasan in the Antrean Moderasi and maintains the catalogue.
_Avoid_: Admin, tim redaksi, editor

**Status Ulasan**:
The state of one revision of an Ulasan. An edit is a new revision, and the previous Terbit revision stays shown until the new one is Terbit.
- *Menunggu*: not yet screened, or screening could not finish. Never shown.
- *Terbit*: shown publicly.
- *Ditinjau*: in the Antrean Moderasi after Screening. Not shown.
- *Ditolak*: rejected by a Moderator, always with a reason, and never shown.

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
The Jurusan ranked by how well their Kode RIASEC match a Profil RIASEC. It recommends Jurusan only, never a Prodi or Kampus.
_Avoid_: Hasil, saran jurusan

**Profil Minat**:
A Profil RIASEC saved to an account, with the date the Tes Minat was taken. An account keeps every Profil Minat it has saved.
_Avoid_: Hasil tersimpan, profil kepribadian

**Perbandingan**:
A side-by-side view of 2–3 Prodi showing their facts, Estimasi Pengulas and Ulasan scores, with no verdict on which is better. The Prodi may belong to different Jurusan.
_Avoid_: Kelebihan dan kekurangan, pros and cons, ranking

## People

**Pengunjung**:
Anyone using CampusMatch without being logged in.
_Avoid_: Guest, tamu, visitor

## Commercial

**Promosi**:
A paid, clearly labelled placement of a Kampus beside a list, never inside it. It never changes Bintang, Tingkat Rekomendasi or the order of organic results. It shows (is *Tayang*) between its dates once a second Moderator has activated it.
_Avoid_: Iklan (in reference to Kampus), sponsored, featured, Terverifikasi
