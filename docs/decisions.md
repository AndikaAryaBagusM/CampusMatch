# CampusMatch: MVP decisions

Product-level decision log from the scoping interview on 2026-10-02. Terms are defined in [CONTEXT.md](../CONTEXT.md), and the reasoning behind the hard-to-reverse decisions is in [adr/](./adr/).

## Domain

1. **What an Ulasan is about**: every Ulasan is about one Prodi (one programme at one Kampus). Kampus and Jurusan scores are aggregated from Prodi Ulasan. See [ADR 0001](./adr/0001-ulasan-belongs-to-prodi.md).
2. **Jurusan**: a curated list maintained by the team. Every Prodi maps to exactly one Jurusan, automatically when the name matches, otherwise by a Moderator. See [ADR 0001](./adr/0001-ulasan-belongs-to-prodi.md).

## Data

3. **Coverage**: the Daftar Kampus Unggulan, initially the first 100 Indonesian entries of Webometrics/UniRank. It was **copied once, by hand, into `data/top-100-kampus.csv`** (not scraped). After that, Moderators edit it. See [ADR 0003](./adr/0003-catalogue-snapshot-from-official-exports.md).
4. **Catalogue source**: official Kemenristekdikti exports (Program Studi .xlsx and Perguruan Tinggi terakreditasi .xlsx), loaded by an import script as a snapshot. There are no live PDDikti calls. *Pending: the export files are to be added under `data/raw/`, and their columns checked before the importer is written.*

## Roles

5. **MVP roles**: Pengunjung (no login), Pengulas (student/alumni account) and Moderator (internal team, which also maintains the catalogue). A Kampus partner role / Reputation Manager is **out** of the MVP.

## Ulasan and moderation

6. **Moderation flow**: every new or edited Ulasan goes through Screening. *rendah* → Terbit; *perlu dicek* → Antrean Moderasi; *melanggar* → Ditolak with a reason. The **Laporkan** button returns a Terbit Ulasan to the queue. See [ADR 0002](./adr/0002-auto-publish-after-screening.md).
7. **Screening**: a wordlist/regex pass, then Claude Haiku 4.5. **Fail-closed:** if the call errors or times out, the Ulasan stays Menunggu and is never published automatically. A cron job retries, then hands the Ulasan to a Moderator.
8. **Verification**: login with Google or an email magic link. The Pengulas declares their Status Pengulas (mahasiswa aktif / alumni) and entry year. Verifying a campus email (`.ac.id`) that matches the Kampus is optional and earns the **Terverifikasi** badge.
9. **Ulasan content**: Bintang (1–5); Aspek stars for Kurikulum, Dosen, Fasilitas, Suasana belajar, Organisasi/administrasi and Biaya vs kualitas; Rekomendasi (yes/no); a title; and text of at least about 150 characters, with guiding prompts.
10. **Lifecycle**: one Ulasan per Pengulas per Prodi. An edit goes through Screening again, and the previous version stays Terbit until the new one passes. A Pengulas can delete their own Ulasan. Ulasan are shown anonymously (Status Pengulas, entry year, badge).

## Tes Minat

11. **Method**: RIASEC, using the O*NET® Interest Profiler Short Form (60 items), translated and adapted to Indonesian under the **O*NET Tools Developer License**, with the required attribution. Moderators set Kode RIASEC per Jurusan, seeded from O*NET. See [ADR 0004](./adr/0004-riasec-via-onet-interest-profiler.md).
12. **Access**: no login needed. The result has a shareable link, and logged-in users can save it to their profile.

## Scope

13. **In the MVP**: home with a large search box, search results, Jurusan page, Kampus page, Prodi page with Ulasan, the Ulasan form, the Tes Minat, Pengulas accounts, and the Moderator area (Antrean Moderasi, catalogue, Jurusan and Kode RIASEC mapping). Also Kota browsing, a side-by-side comparison of 2–3 Prodi, and a labelled **Promosi** Kampus slot that never affects scores or organic ordering.
14. **Out of the MVP**: Profesi/salary pages, Kampus partner / Reputation Manager, awards, social features (chat, following, feeds), and off-topic articles.

## Technology

15. **Stack**: Next.js (App Router, TypeScript) on Vercel; Neon Postgres; Drizzle; Auth.js; Postgres FTS with `pg_trgm`; Tailwind with shadcn/ui; Screening via `after()` calling `claude-haiku-4-5-20251001`, plus a cron retry; the xlsx import uses SheetJS. See [ADR 0005](./adr/0005-nextjs-postgres-on-vercel.md).
16. **Name**: CampusMatch. The repo name `kampusCheck` stays as it is.

See also: [roadmap.md](./roadmap.md) and [legal-todo.md](./legal-todo.md).
