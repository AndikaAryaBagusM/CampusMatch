# S2 Prodi are imported only for Kampus with a Peringkat QS

[ADR 0003](./0003-catalogue-snapshot-from-official-exports.md) imported only D3, D4 and S1. Undergraduates also want to plan a master's, and the Kampus they look at for one are mostly the well-known ones. We decided to import **S2** Prodi (not S2 Terapan, S3, Profesi or Sp) from the same export, but **only for the Kampus that have a Peringkat QS** (the reviewed matches in `data/qs-kampus.csv`, ADR 0011): 888 Prodi at 20 Kampus in the 2026-10-02 export. When a Kampus enters or leaves QS, the next import follows the CSV. Rows already imported are never deleted (ADR 0003).

- **Names as published**: an S2 Prodi keeps the name its Kampus publishes ("Magister Manajemen", "Kajian Wilayah Eropa"). No Jurusan is created for S2. An S2 Kode Prodi joins an *existing* Jurusan only when at least 70% of its Prodi are published under that Jurusan's name, ignoring "Magister", a leading "Ilmu" and "dan" (`npm run catalogue:propose-jurusan-s2`, reviewed in `data/jurusan-mapping.csv` like every other row). That maps 102 Kode (438 Prodi); the other 203 Kode (424 Prodi) stay unmapped and are found on their Kampus page and in search.
- **Where S2 shows**: on the Kampus page and its Prodi list, in search, as its own Prodi page, in the Perbandingan, and on a Jurusan page only when S2 is chosen (an "S2" chip and a "Lanjut S2" line under the header). An S1 or D4 Prodi page lists the S2 Prodi of its Jurusan under "Lanjut S2", the same Kampus first. A Jurusan's default list and counts, the Beranda bidang counts and the Tes Minat Prodi counts stay D3, D4 and S1: they help choose a first degree.
- **Ulasan**: S2 students and alumni write Ulasan exactly as for any Prodi.
- **Biaya & Masuk**: none for S2 yet. Kampus-wide facts (UKT groups, SNBP/SNBT, KIP Kuliah) are for D3, D4 and S1, so they are never shown for, or used to index, an S2 Prodi, and an S2 Prodi gets no Kampus-wide UKT in the Jurusan list. Info Biaya is not asked for S2, because its Jalur Masuk are the undergraduate ones. Collecting S2 fees is a later decision.

## Considered Options

- **Every S2 Prodi in the export (4,322)**: most are at Kampus readers would not compare for a master's, and every page needs Ulasan to be worth indexing. Start where the interest is.
- **New S2-only Jurusan for the unmapped Kode** (e.g. "Kajian Wilayah"): rejected by the user, who wants the names each Kampus publishes rather than our own groupings.
- **Mapping each S2 Kode to the Jurusan of its S1 "sibling" Kode** (same digits, third digit 2): checked against the names and wrong too often (11124 Ilmu Forensik → Teknik Biomedis, 46105 → Teknik Sipil).
- **A separate Magister section**: S2 would sit apart from the Jurusan pages where an undergraduate already is.
