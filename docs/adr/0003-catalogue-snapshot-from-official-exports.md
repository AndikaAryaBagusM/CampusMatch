# The catalogue is a snapshot of official exports, limited to the Daftar Kampus Unggulan

Kampus and Prodi data (name, Jenjang, Akreditasi, location, status) come from official Kemenristekdikti exports: a Program Studi .xlsx and a Perguruan Tinggi terakreditasi .xlsx. An import script loads them into our own database. CampusMatch never calls PDDikti at request time. PDDikti has no documented public API, and its unofficial web API can change or rate-limit without warning. Ulasan and Jurusan mappings also have to point to records we own. To refresh the data, we re-run the import on newer exports.

The MVP covers only the **Daftar Kampus Unggulan**: the first 100 Indonesian entries of a public ranking (Webometrics or UniRank). QS ranks too few Indonesian Kampus to fill 100. This list is **copied once, by hand, into a CSV committed to the repo** (`data/top-100-kampus.csv`, recording the source and capture date). **It is not scraped.** After the first import, Moderators change it by editing the list, not by re-copying the ranking.

## Consequences

- Data is only as fresh as the latest export. Pages should show the data's as-of date.
- A Pengulas from a Kampus outside the list cannot write an Ulasan yet. Growing the list is a product decision, not a technical one.
