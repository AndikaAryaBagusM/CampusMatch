# Roadmap: MVP build order

1. **Scaffold and schema**: Next.js app, database, and the core tables (Kampus, Prodi, Jurusan, Ulasan, users).
2. **Catalogue import and search**: import the official xlsx exports and `data/top-100-kampus.csv`, then build search on the home page.
3. **Prodi and Kampus pages**: catalogue data, aggregated Bintang, Aspek scores and Tingkat Rekomendasi.
4. **Login and Ulasan form**: Google and magic-link login, Status Pengulas, the Ulasan form, and campus-email verification.
5. **Screening and Antrean Moderasi**: wordlist and LLM Screening (fail-closed), cron retry, the Moderator queue, Laporkan, and the Prodi → Jurusan mapping tool.
6. **Tes Minat**: translated items, Profil RIASEC scoring, Kode RIASEC per Jurusan, the results page with O*NET attribution, and saving results.
7. **Compare Prodi**: side-by-side view of 2–3 Prodi.
8. **Kota browse**: browse Kampus by Kota.
9. **Promosi slot**: a labelled sponsored Kampus placement.
