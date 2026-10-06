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
8. **Verification**: login with Google or an email magic link. The Pengulas declares their Status Pengulas (mahasiswa aktif / alumni) and entry year. Verifying a campus email (`.ac.id`) that matches the Kampus is optional and earns the **Terverifikasi** badge. Every account requires declaring "18 tahun atau lebih" (added 2026-10-06, see 17h and [ADR 0008](./adr/0008-adult-only-accounts.md)).
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
12. **Access**: no login needed. The result has a shareable link that carries the scores in the URL (nothing is stored). Logged-in users can save it as a **Profil Minat** (changed 2026-10-06, see 17g).

## Scope

13. **In the MVP**: home with a large search box, search results, Jurusan page, Kampus page, Prodi page with Ulasan, the Ulasan form, the Tes Minat, Pengulas accounts, and the Moderator area (Antrean Moderasi, catalogue, Jurusan and Kode RIASEC mapping). Also Biaya & Masuk facts (17a–17f), Kota browsing, the **Perbandingan** of 2–3 Prodi (facts side by side only, 17f), and a labelled **Promosi** Kampus slot that never affects scores or organic ordering.
14. **Out of the MVP**: Profesi/salary pages, Kampus partner / Reputation Manager, awards, social features (chat, following, feeds), and off-topic articles.

## Technology

15. **Stack**: Next.js (App Router, TypeScript) on Vercel; Neon Postgres; Drizzle; Auth.js; name search with `pg_trgm` (substring and typo matching; Postgres has no Indonesian text-search configuration, and catalogue names are too short for stemming to help); Tailwind with shadcn/ui; Screening via `after()` calling `claude-haiku-4-5-20251001`, plus a cron retry; the xlsx import uses SheetJS. See [ADR 0005](./adr/0005-nextjs-postgres-on-vercel.md).
16. **Name**: CampusMatch. The GitHub repo is `AndikaAryaBagusM/CampusMatch` (renamed from `kampusCheck`).

## Info Biaya & Masuk and Profil Minat (decided 2026-10-06)

From a lecturer requirement: complete, factual cost and admission information for the Daftar Kampus Unggulan, a comparison between Kampus, and a saved Profil Minat. Roadmap step 6 (facts) and step 7 (Profil Minat).

17a. **Scope**: facts belong to a Kampus or Prodi. The Daftar Kampus Unggulan (5,043 Prodi on 2026-10-06) only decides which Kampus are collected first; facts stay if a Kampus leaves the list. See [ADR 0006](./adr/0006-facts-need-sumber-and-second-check.md).
17b. **Which facts**: UKT/SPP per Prodi; Uang Pangkal per Prodi when published that way, otherwise per Kampus; Jalur Masuk with their tests and registration fee per Kampus; Biaya Lain (official compulsory one-off fees only, no living costs) per Kampus; Beasiswa per Kampus, with national schemes recorded once and linked. Not collected: daya tampung, keketatan. A Kampus-wide value is never copied down to each Prodi.
17c. **Shape**: one Biaya table (Kampus or Prodi, Tahun Akademik, jenis UKT/SPP/uang pangkal/pendaftaran/lain, optional Jalur Masuk, label such as "Kelompok III", whole-rupiah amount with a minimal/maksimal flag, per semester or once, Sumber). A Jalur Masuk is per Kampus per Tahun Akademik: name, category (SNBP, SNBT, Mandiri, PTS's own), tests from a fixed list (UTBK, Kampus test, rapor, portofolio, wawancara, prestasi, lain), registration dates only when stated, Sumber. Which Prodi a jalur is open to is not recorded.
17d. **Sumber and checking**: every fact has a Tahun Akademik and a Sumber (URL, title, publisher, access date, required Wayback link, or "tanpa arsip" with the checker's reason). Draf → Diperiksa by a *different* Moderator. Entry is one CSV per Sumber with Prodi matched by name (unmatched rows block the import), plus a form for small fixes. Moderators only; Kampus send corrections by email. As built (step 6): one folder per Sumber under `data/fakta/` holding `sumber.json` and up to three CSVs (`jalur`, `biaya`, `beasiswa`), imported with `npm run fakta:import` (format in `data/fakta/README.md`); the checker marks a whole Sumber Diperiksa or sends it back (its Draf facts are deleted, with a note); a Sumber with Diperiksa facts can't be re-imported, so a change is a new Sumber. Any one Moderator can withdraw shown facts (Ditarik, with a reason, kept as history; see ADR 0006). The small-fixes form is not built yet.
17e. **Refresh**: once a year, February–June. Facts from an older Tahun Akademik are labelled "Data TA X — mungkin sudah berubah". Never deleted.
17f. **Perbandingan**: 2–3 Prodi side by side, facts and Ulasan scores only, no Kelebihan/Kekurangan and no best-value marks. The Tes Minat recommends Jurusan only; from a Rekomendasi Jurusan the student browses its Prodi at every Kampus (sorted by Kampus name, filters for Unggulan, Kota, Jenjang and maximum UKT, optional sort by lowest UKT or Bintang) and picks Prodi to compare. See [ADR 0007](./adr/0007-comparison-shows-facts-only.md).
17g. **Profil Minat**: the six scores and the date only (no item answers), every saved Profil Minat kept as history, Rekomendasi Jurusan recalculated on view, private, deletable, never used for Promosi or ads.
17h. **Age**: every account requires declaring "18 tahun atau lebih". Existing accounts confirm at next sign-in; an under-18 declaration locks the account and shows how to request deletion, and its Ulasan stay Terbit. Under-18s use the Tes Minat without saving. See [ADR 0008](./adr/0008-adult-only-accounts.md).
17j. **Tes Minat as built (2026-10-06)**: the O*NET Short Form v1 checklist (60 activities, 0–10 per type), scores carried in the result link (`/tes-minat/hasil?p=…`), Rekomendasi Jurusan by a 3-2-1 weighted match against Kode RIASEC (ties: more Prodi first), and Kode RIASEC seeded from O*NET 31.0 interest ratings through a reviewed CSV (`npm run riasec:propose`, `npm run riasec:load`, see `data/riasec/README.md`). A translated test needs a Validation Study before launch (ADR 0004).
17i. **Legal**: `/privasi` adds the Profil Minat and the age declaration; `/ketentuan` adds a disclaimer that facts come from official sources on a stated date, may change, and that CampusMatch is not affiliated with any Kampus. Both are written when the features ship.

See also: [roadmap.md](./roadmap.md) and [legal-todo.md](./legal-todo.md).
