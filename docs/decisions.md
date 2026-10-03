# CampusMatch: MVP decisions

Product-level decision log from the scoping interview on 2026-10-02. Terms are defined in [CONTEXT.md](../CONTEXT.md), and the reasoning behind the hard-to-reverse decisions is in [adr/](./adr/).

## Domain

1. **What an Ulasan is about**: every Ulasan is about one Prodi (one programme at one Kampus). Kampus and Jurusan scores are aggregated from Prodi Ulasan. See [ADR 0001](./adr/0001-ulasan-belongs-to-prodi.md).
2. **Jurusan**: a curated list maintained by the team. Every Prodi maps to exactly one Jurusan. The mapping is made per Kode Prodi (the national programme code), and a Moderator can override it for an individual Prodi. See [ADR 0001](./adr/0001-ulasan-belongs-to-prodi.md).

## Data

3. **Coverage**: every Kampus with D3, D4 or S1 Prodi in the official exports has a page and appears in search (changed on 2026-10-03; previously only the Daftar Kampus Unggulan). The **Daftar Kampus Unggulan** is a highlight (badge and filter) that never affects search ordering: initially the first 100 Indonesian entries of Webometrics 2026 Juli, **copied once, by hand, into `data/top-100-kampus.csv`** (not scraped). After that, Moderators edit it. Its source and capture date are recorded per import in `impor_katalog`. See [ADR 0003](./adr/0003-catalogue-snapshot-from-official-exports.md).
4. **Catalogue source**: official Kemenristekdikti exports (Program Studi .xlsx and Perguruan Tinggi terakreditasi .xlsx), loaded by an import script as a snapshot. There are no live PDDikti calls. The files are in `data/raw/` and join on `npsn`.
4a. **Jenjang**: only D3, D4 and S1 Prodi are imported.
4b. **Akreditasi**: shown for Kampus only. Prodi accreditation is out of the MVP, since the exports don't include it.
4c. **Import** (`npm run catalogue:import -- --as-of YYYY-MM-DD`): idempotent upserts, never deletes. Each run records the export download date in `impor_katalog`; the latest row is the catalogue's as-of date. Kampus whose Kota is "Lainnya" in the exports go under a per-province Kota "Lainnya".
4d. **Jurusan list**: `npm run catalogue:propose-jurusan` writes `data/jurusan-mapping.csv`, which proposes the most common name of each Kode Prodi as its Jurusan. The team edits the `jurusan` column (blank = unmapped), then `npm run catalogue:load-jurusan` loads it. Mappings a Moderator has changed are never overwritten.

## Roles

5. **MVP roles**: Pengunjung (no login), Pengulas (student/alumni account) and Moderator (internal team, which also maintains the catalogue). A Kampus partner role / Reputation Manager is **out** of the MVP.

## Ulasan and moderation

6. **Moderation flow**: every new or edited Ulasan goes through Screening. *rendah* → Terbit; *perlu dicek* and *melanggar* → Ditinjau in the Antrean Moderasi, *melanggar* first (changed 2026-10-03; previously *melanggar* → Ditolak automatically). Only a Moderator rejects, always with a reason. The **Laporkan** button puts a Terbit Ulasan in the Antrean Moderasi. It stays visible until a Moderator unpublishes it (Turunkan). See [ADR 0002](./adr/0002-auto-publish-after-screening.md).
7. **Screening**: a wordlist/regex pass that can only raise the risk, then Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), run in `after()` so the Pengulas isn't kept waiting. The result (Tingkat Risiko, reason, model, time) is stored on the revision. **Fail-closed:** if the call errors or times out, the Ulasan stays Menunggu and is never published automatically. Screening runs in rounds (one attempt plus up to 2 quick retries). A cron job runs a further round for Menunggu revisions older than 10 minutes. After 3 failed rounds the Ulasan goes to a Moderator with the reason "Screening gagal".
8. **Verification**: login with Google or an email magic link. The Pengulas declares their Status Pengulas (mahasiswa aktif / alumni) and entry year. Verifying a campus email (`.ac.id`) that matches the Kampus is optional and earns the **Terverifikasi** badge.
9. **Ulasan content**: Bintang (1–5); Aspek stars for Kurikulum, Dosen, Fasilitas, Suasana belajar, Organisasi/administrasi and Biaya vs kualitas; Rekomendasi (yes/no); a title; and text of at least about 150 characters, with guiding prompts.
10. **Lifecycle**: one Ulasan per Pengulas per Prodi. An edit creates a new revision and goes through Screening again, and the previous version stays Terbit until the new one passes. While a revision is Menunggu or Ditinjau, the Pengulas can't submit another edit. A Pengulas can delete their own Ulasan. Ulasan are shown anonymously (Status Pengulas, entry year, badge), newest first.

### Step 4 scope (decided 2026-10-03)

10a. **Who can be reviewed**: any Prodi of any of the 4,261 covered Kampus, not only the Daftar Kampus Unggulan. Unggulan never affects eligibility or ordering ([ADR 0003](./adr/0003-catalogue-snapshot-from-official-exports.md)).
10b. **Ulasan stay Prodi-only** ([ADR 0001](./adr/0001-ulasan-belongs-to-prodi.md)). The Kampus page has a "Tulis ulasan" button that asks the Pengulas to pick a Prodi first. Kampus scores are aggregated from its Prodi.
10c. **Login required** to write, edit, delete or Laporkan an Ulasan. Reading stays public. Auth.js with Google and an email magic link (Resend), with sessions stored in the database.
10d. **Moderators** are the signed-in users whose email is in the `MODERATOR_EMAILS` environment variable, checked on every request. There is no public sign-up for Moderators. `users.peran` is not used yet.
10e. **Abuse limits**: rate limits by IP, using HMAC-SHA256 with `IP_HASH_SECRET` (the raw IP is never stored), plus per-Pengulas daily limits.
10f. **Not in this step**: photos, logos or uploads of any kind; Terverifikasi (campus-email verification); the Kode Prodi → Jurusan mapping tool. Jenjang stays D3/D4/S1 and Akreditasi stays Kampus-only.

## Tes Minat

11. **Method**: RIASEC, using the O*NET® Interest Profiler Short Form (60 items), translated and adapted to Indonesian under the **O*NET Tools Developer License**, with the required attribution. Moderators set Kode RIASEC per Jurusan, seeded from O*NET. See [ADR 0004](./adr/0004-riasec-via-onet-interest-profiler.md).
12. **Access**: no login needed. The result has a shareable link, and logged-in users can save it to their profile.

## Scope

13. **In the MVP**: home with a large search box, search results, Jurusan page, Kampus page, Prodi page with Ulasan, the Ulasan form, the Tes Minat, Pengulas accounts, and the Moderator area (Antrean Moderasi, catalogue, Jurusan and Kode RIASEC mapping). Also Kota browsing, a side-by-side comparison of 2–3 Prodi, and a labelled **Promosi** Kampus slot that never affects scores or organic ordering.
14. **Out of the MVP**: Profesi/salary pages, Kampus partner / Reputation Manager, awards, social features (chat, following, feeds), and off-topic articles.

## Technology

15. **Stack**: Next.js (App Router, TypeScript) on Vercel; Neon Postgres; Drizzle; Auth.js; name search with `pg_trgm` (substring and typo matching; Postgres has no Indonesian text-search configuration, and catalogue names are too short for stemming to help); Tailwind with shadcn/ui; Screening via `after()` calling `claude-haiku-4-5-20251001`, plus a cron retry; the xlsx import uses SheetJS. See [ADR 0005](./adr/0005-nextjs-postgres-on-vercel.md).
16. **Name**: CampusMatch. The GitHub repo is `AndikaAryaBagusM/CampusMatch` (renamed from `kampusCheck`).

See also: [roadmap.md](./roadmap.md) and [legal-todo.md](./legal-todo.md).
