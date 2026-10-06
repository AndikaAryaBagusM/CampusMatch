# The Perbandingan shows facts side by side, and the Tes Minat recommends Jurusan only

The lecturer asked for a pros-and-cons comparison between Kampus. We decided that CampusMatch never writes a verdict about a Kampus. The **Perbandingan** shows 2–3 Prodi side by side (Biaya, Jalur Masuk, Beasiswa, Akreditasi, Bintang, Aspek scores and Tingkat Rekomendasi) with no generated pros or cons and no marks for the "best" value; the student draws the conclusion. It compares Prodi rather than whole Kampus because UKT and Uang Pangkal are per Prodi, and Kampus-level facts appear in each Prodi's column.

The Tes Minat recommends **Jurusan only**, since a Profil RIASEC measures interests, not fit with a particular Kampus. From a Rekomendasi Jurusan the student browses that Jurusan's Prodi at every Kampus, sorted by Kampus name by default, with filters (Unggulan, Kota, Jenjang, maximum UKT) and an optional sort by lowest UKT or by Bintang, and picks Prodi to compare. Nothing is presented as "best for you", and the Daftar Kampus Unggulan never changes the default order ([ADR 0003](./0003-catalogue-snapshot-from-official-exports.md)).

**Amended 2026-10-06** ([ADR 0010](./0010-pengulas-estimates-beside-official-facts.md)): under the Biaya, Jalur Masuk and Beasiswa rows the Perbandingan also shows a muted "Estimasi Pengulas" row, combined from Pengulas' Info Biaya. It is labelled as an estimate, never merged with the fact above it, and never highlighted.

## Considered Options

- **Rule-based Kelebihan/Kekurangan** (e.g. "Biaya vs kualitas dinilai tinggi" above a threshold): traceable, but every threshold is an editorial choice a Kampus could dispute.
- **An LLM summary of Ulasan into pros and cons**: can invent claims and puts words in Pengulas' mouths; a defamation risk.
- **Moderator-written pros and cons**: our own opinion, not facts.
- **Best-in-row marks** in the comparison: rejected in favour of a plain table.
- **Ranking Prodi for the student** by combining the Profil RIASEC with budget and Kota: needs a scoring formula we could not defend.
