# The catalogue is a snapshot of official exports, limited to the Daftar Kampus Unggulan

Kampus and Prodi data come from official Kemenristekdikti exports in `data/raw/`:
- **`Program Studi.xlsx`**: Kampus (`npsn`, `nama_pt`), location, `kode_prodi`, `nm_prodi`, `nm_jenj_didik` and `nm_kel_bidang`.
- **`Perguruan Tinggi Terakreditasi.xlsx`**: `npsn`, location and `akred_pt`.

The files join on `npsn`, whose values carry trailing spaces and must be trimmed. Only Prodi at **D3, D4 and S1** are imported; S2, S3, Profesi, Sp and D1/D2 are skipped. **Akreditasi is shown for Kampus only.** The exports have no per-Prodi accreditation, and none is shown in the MVP. The exports have no active/inactive status either, so every listed Prodi is treated as active. Kampus + Kode Prodi + Jenjang is *not* unique (branch campuses such as "Informatika (Kampus Kota Bandung)"), so each Prodi gets its own identifier. An import script loads them into our own database. CampusMatch never calls PDDikti at request time. PDDikti has no documented public API, and its unofficial web API can change or rate-limit without warning. Ulasan and Jurusan mappings also have to point to records we own. To refresh the data, we re-run the import on newer exports.

The MVP covers only the **Daftar Kampus Unggulan**: the first 100 Indonesian entries of a public ranking (Webometrics or UniRank). QS ranks too few Indonesian Kampus to fill 100. This list is **copied once, by hand, into a CSV committed to the repo** (`data/top-100-kampus.csv`, recording the source and capture date). **It is not scraped.** After the first import, Moderators change it by editing the list, not by re-copying the ranking.

## Consequences

- Data is only as fresh as the latest export. Pages should show the data's as-of date.
- A Pengulas from a Kampus outside the list cannot write an Ulasan yet. Growing the list is a product decision, not a technical one.
