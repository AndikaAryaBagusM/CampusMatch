# The catalogue is a snapshot of official exports; the Daftar Kampus Unggulan is a highlight

Kampus and Prodi data come from official Kemenristekdikti exports in `data/raw/`:
- **`Program Studi.xlsx`**: Kampus (`npsn`, `nama_pt`), location, `kode_prodi`, `nm_prodi`, `nm_jenj_didik` and `nm_kel_bidang`.
- **`Perguruan Tinggi Terakreditasi.xlsx`**: `npsn`, location and `akred_pt`.

The files join on `npsn`, whose values carry trailing spaces and must be trimmed. Only Prodi at **D3, D4 and S1** are imported; S2, S3, Profesi, Sp and D1/D2 are skipped. **Akreditasi is shown for Kampus only.** The exports have no per-Prodi accreditation, and none is shown in the MVP. The exports have no active/inactive status either, so every listed Prodi is treated as active. Kampus + Kode Prodi + Jenjang is *not* unique (branch campuses such as "Informatika (Kampus Kota Bandung)"), so each Prodi gets its own identifier. An import script loads them into our own database. CampusMatch never calls PDDikti at request time. PDDikti has no documented public API, and its unofficial web API can change or rate-limit without warning. Ulasan and Jurusan mappings also have to point to records we own. To refresh the data, we re-run the import on newer exports.

**Coverage is every Kampus with D3, D4 or S1 Prodi in the exports.** Each has a public page and appears in search.

The **Daftar Kampus Unggulan** is a curated highlight, not a coverage limit: a badge and a filter, which never change the order of search results. It started as the first 100 Indonesian entries of a public ranking (Webometrics 2026 Juli; QS ranks too few Indonesian Kampus to fill 100). The list is **copied once, by hand, into a CSV committed to the repo** (`data/top-100-kampus.csv`, with `sumber` and `tanggal_ambil` columns). **It is not scraped.** After the first import, Moderators change it by editing the list, not by re-copying the ranking. Each import records the list's `sumber` and `tanggal_ambil` in `impor_katalog` (copied from the previous import when the CSV is absent), so pages can name the source next to the badge. Pages also state that Webometrics measures web presence and research output, not teaching quality, so the badge doesn't read as a quality stamp.

## Consequences

- Data is only as fresh as the latest export. Pages show the data's as-of date from the latest `impor_katalog` row.
- Whether a Pengulas can write an Ulasan for every covered Kampus, or only some, is decided with the Ulasan form (roadmap step 4).
