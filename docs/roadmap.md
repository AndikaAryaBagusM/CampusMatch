# Roadmap: MVP build order

1. **Scaffold and schema**: Next.js app, database, and the core tables (Kampus, Prodi, Jurusan, Ulasan, users).
2. **Catalogue import and search**: import the official xlsx exports and `data/top-100-kampus.csv`, then build search on the home page.
3. **Prodi and Kampus pages**: catalogue data, aggregated Bintang, Aspek scores and Tingkat Rekomendasi.
4. **Login, Ulasan, Screening and Antrean Moderasi** (steps 4 and 5 merged on 2026-10-03): Google and magic-link login, Status Pengulas, the Ulasan form, wordlist and LLM Screening (fail-closed) with cron retry, Laporkan, the Moderator area, and Terbit Ulasan on the Kampus and Prodi pages. See [decisions.md](./decisions.md) 10a–10f.
   - **TODO before public launch**: a lawyer reviews the draft `/privasi` (Kebijakan Privasi) and `/ketentuan` (Ketentuan Layanan) and answers the open questions in [legal-todo.md](./legal-todo.md).
5. **Deferred from step 4**: campus-email verification (Terverifikasi) and the Kode Prodi → Jurusan mapping tool with per-Prodi overrides.
   - Built 2026-10-06: the mapping tool at `/moderasi/jurusan` with the `riwayat_jurusan` log (migration `0007`). See 17m.
   - Built 2026-10-06: Terverifikasi with campus email (`/akun`, `/akun/verifikasi-kampus`, `data/domain-kampus.csv`, migration `0009`). See 17o. Emails reach anyone only once the Resend domain is verified.
6. **Info Biaya & Masuk** (added 2026-10-06): Sumber, Biaya, Jalur Masuk and Beasiswa tables; the CSV-per-Sumber import with Draf → Diperiksa checking; facts on the Kampus and Prodi pages. Collect the Daftar Kampus Unggulan first. See [decisions.md](./decisions.md) 17a–17e.
   - Built 2026-10-06: migration `0005`, `npm run fakta:import`, `/moderasi/fakta`, the panels on the Kampus and Prodi pages, and `/ketentuan` section 9.
   - Withdrawing shown facts (Ditarik) at `/moderasi/fakta/[id]`; a correction is then imported as a new Sumber.
   - **Not built yet**: the form for small fixes; calling Save Page Now from the import.
   - **Data collection** (the main work): 100 Kampus, 5,043 Prodi.
7. **Tes Minat and Profil Minat**: translated items, Profil RIASEC scoring, Kode RIASEC per Jurusan, the results page with O*NET attribution, the Prodi list per Rekomendasi Jurusan, saving a Profil Minat, and the 18+ account declaration. See 17f–17h.
   - Built 2026-10-06: migration `0006`, `/tes-minat`, `/tes-minat/hasil`, Profil Minat in `/akun`, `/akun/usia` and `/akun/dikunci`, and Kode RIASEC for all 372 Jurusan (proposed from O*NET, loaded on dev, **to be reviewed**). See 17j.
   - **Not built yet**: a Moderator screen for Kode RIASEC (the CSV workflow covers it for now).
   - **Before launch**: the Validation Study the O*NET Tools Developer License requires (ADR 0004).
8. **Perbandingan**: side-by-side view of 2–3 Prodi, facts and Ulasan scores only (17f).
   - Built 2026-10-06: `/bandingkan`, the Bandingkan button and bottom bar (list kept in the browser), and the Jurusan page as a Prodi list with Kota and maximum-UKT filters and UKT/Bintang sort. No migration. See 17k.
9. **Kota browse**: browse Kampus by Kota.
   - Built 2026-10-06: `/kota` (by Provinsi) and `/kota/[slug]` (Kampus in name order, Unggulan and Bentuk filters), linked from the header, footer and every page that shows a Kota. No migration. See 17l.
10. **Promosi slot**: a labelled sponsored Kampus placement.
   - Built 2026-10-06: `/moderasi/promosi` (Draf, a second Moderator activates, stop with a reason), the labelled box on the home page, Jurusan pages and search, `/promosi/[id]` daily click totals, `/ketentuan` section 10, and migration `0008`. See 17n and ADR 0009.
