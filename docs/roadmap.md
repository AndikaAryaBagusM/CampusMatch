# Roadmap: MVP build order

1. **Scaffold and schema**: Next.js app, database, and the core tables (Kampus, Prodi, Jurusan, Ulasan, users).
2. **Catalogue import and search**: import the official xlsx exports and `data/top-100-kampus.csv`, then build search on the home page.
3. **Prodi and Kampus pages**: catalogue data, aggregated Bintang, Aspek scores and Tingkat Rekomendasi.
4. **Login, Ulasan, Screening and Antrean Moderasi** (steps 4 and 5 merged on 2026-10-03): Google and magic-link login, Status Pengulas, the Ulasan form, wordlist and LLM Screening (fail-closed) with cron retry, Laporkan, the Moderator area, and Terbit Ulasan on the Kampus and Prodi pages. See [decisions.md](./decisions.md) 10a–10f.
   - **TODO before public launch**: a lawyer reviews the draft `/privasi` (Kebijakan Privasi) and `/ketentuan` (Ketentuan Layanan) and answers the open questions in [legal-todo.md](./legal-todo.md).
5. **Deferred from step 4**: campus-email verification (Terverifikasi) and the Kode Prodi → Jurusan mapping tool with per-Prodi overrides.
6. **Info Biaya & Masuk** (added 2026-10-06): Sumber, Biaya, Jalur Masuk and Beasiswa tables; the CSV-per-Sumber import with Draf → Diperiksa checking; facts on the Kampus and Prodi pages. Collect the Daftar Kampus Unggulan first. See [decisions.md](./decisions.md) 17a–17e.
7. **Tes Minat and Profil Minat**: translated items, Profil RIASEC scoring, Kode RIASEC per Jurusan, the results page with O*NET attribution, the Prodi list per Rekomendasi Jurusan, saving a Profil Minat, and the 18+ account declaration. See 17f–17h.
8. **Perbandingan**: side-by-side view of 2–3 Prodi, facts and Ulasan scores only (17f).
9. **Kota browse**: browse Kampus by Kota.
10. **Promosi slot**: a labelled sponsored Kampus placement.
