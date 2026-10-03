# Roadmap: MVP build order

1. **Scaffold and schema**: Next.js app, database, and the core tables (Kampus, Prodi, Jurusan, Ulasan, users).
2. **Catalogue import and search**: import the official xlsx exports and `data/top-100-kampus.csv`, then build search on the home page.
3. **Prodi and Kampus pages**: catalogue data, aggregated Bintang, Aspek scores and Tingkat Rekomendasi.
4. **Login, Ulasan, Screening and Antrean Moderasi** (steps 4 and 5 merged on 2026-10-03): Google and magic-link login, Status Pengulas, the Ulasan form, wordlist and LLM Screening (fail-closed) with cron retry, Laporkan, the Moderator area, and Terbit Ulasan on the Kampus and Prodi pages. See [decisions.md](./decisions.md) 10a–10f.
   - **TODO before public launch**: the full Kebijakan Privasi and Syarat & Ketentuan, and the Kampus takedown process (see [legal-todo.md](./legal-todo.md)). Step 4 ships only a short "Panduan ulasan" on the form and a contact link for Laporan and takedown requests.
5. **Deferred from step 4**: campus-email verification (Terverifikasi) and the Kode Prodi → Jurusan mapping tool with per-Prodi overrides.
6. **Tes Minat**: translated items, Profil RIASEC scoring, Kode RIASEC per Jurusan, the results page with O*NET attribution, and saving results.
7. **Compare Prodi**: side-by-side view of 2–3 Prodi.
8. **Kota browse**: browse Kampus by Kota.
9. **Promosi slot**: a labelled sponsored Kampus placement.
