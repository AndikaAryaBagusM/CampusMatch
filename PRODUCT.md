# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Pengulas (primary for design decisions, confirmed 2026-10-07):** mahasiswa aktif and alumni, 18 or older, who write an Ulasan about one Prodi they studied. The Ulasan are the product's scarce asset, so the design is built around getting them to write and making it feel safe and worthwhile.
- **Readers (secondary):** calon mahasiswa, mostly SMA/SMK students, and their parents. They are choosing a Jurusan and a Kampus, often on a phone, and want honest accounts rather than campus promotion.
- **Moderators:** the internal team. They work in `/moderasi` (Antrean Moderasi, facts, Jurusan mapping, Promosi, Info Biaya).

## Product Purpose

CampusMatch helps people choose a Jurusan and a Kampus in Indonesia with more confidence and fewer wrong choices. It does this by putting real, checked Ulasan from mahasiswa and alumni beside official catalogue data. Success means calon mahasiswa know what studying a Prodi is really like before they apply, Ulasan keep arriving and stay honest and polite, and catalogue data stays complete, current and quick to open on a phone.

## Positioning

Ulasan are about one Prodi (one programme at one Kampus), are anonymous, and each passes Screening and the team before it is shown. They sit beside the official Kemenristekdikti exports, which are dated and sourced. Most competing sites are campus brochures or ranking lists. CampusMatch shows facts, never a ranking, and keeps promotion visibly separate.

## Operating Context

- Mostly phones. The brief requires the site to be quick to open on a phone ("cepat dibuka di HP").
- Readers search for a Jurusan or Kampus, read Kampus, Prodi and Jurusan pages, compare 2–3 Prodi, and browse by Kota or Bidang. Some take the Tes Minat (RIASEC) first.
- Pengulas sign in with Google or an email link, declare they are 18+ and their Status Pengulas and entry year, find their Prodi, and fill in the Ulasan form. Its fields are Bintang, six Aspek, Rekomendasi, a title, text of at least about 150 characters, and an optional Info Biaya. They can earn the Terverifikasi badge with a campus email.
- UI language is Bahasa Indonesia. Domain terms (Prodi, Jurusan, Kampus, Ulasan, Pengulas, Terverifikasi, Estimasi Pengulas, Promosi) are fixed. See CONTEXT.md.

## Capabilities and Constraints

- Routes: home, `/cari`, `/kampus/[slug]` (+`/prodi`, `/ulasan`, `/tulis`), `/prodi/[slug]` (+`/info-biaya`, `/tulis`), `/jurusan/[slug]`, `/kota`, `/kota/[slug]`, `/bandingkan`, `/tes-minat`, `/tes-minat/hasil`, `/akun/*`, `/masuk/*`, `/ulasan/[id]/laporkan`, `/privasi`, `/ketentuan`, `/moderasi/*`.
- Facts only. No pros/cons and no ranking. The Daftar Kampus Unggulan (from Webometrics, with a stated caveat) never affects search order. Promosi is always labelled and never affects scores or ordering.
- Every official figure shows its date and source.
- Ulasan are shown anonymously (Status Pengulas, entry year, Terverifikasi badge). Estimasi Pengulas shows only aggregates, and only once 5 Pengulas have answered.
- The site header is static (it reads no session) so catalogue pages stay cached.
- Stack: Next.js 16 App Router, Tailwind 4, shadcn/ui on Base UI, lucide icons, Neon Postgres, Auth.js, on Vercel.
- There are no uploads, photos or Kampus logos. Kampus are shown with initials.

## Brand Commitments

- The name **CampusMatch** is the only brand element that must be kept.
- The earlier look, taken from a StudyCheck screenshot (`design/StudyCheckClone.png`: blue `#0068ce`, yellow CTA, Inter, white cards), is an explicit anti-reference. Don't bring it back.

## Evidence on Hand

- Catalogue: 27,195 D3/D4/S1 Prodi at 4,261 Kampus, from the Kemenristekdikti exports dated 2 October 2026. The Daftar Kampus Unggulan has 100 Kampus (Webometrics 2026 Juli).
- Bidang groupings with Prodi counts, and Kode RIASEC for every Jurusan (proposed, under review).
- **Absent:** there are no published Ulasan, ratings or Estimasi Pengulas yet. There are no photos, logos, testimonials, user counts or press. Never fabricate any of these on production surfaces.

## Product Principles

1. Honest beats persuasive: show what is known, say what is not, and keep promotion visibly apart.
2. Every claim carries its source and date.
3. Writing an Ulasan must feel safe (anonymous, checked, 18+) and worth the effort (it helps the next student).
4. A phone on a slow connection is the baseline: lightweight, and no decorative motion that delays content.
5. Search first. The quickest path to a Prodi, Kampus or Jurusan is never buried.

## Accessibility & Inclusion

WCAG 2.2 AA contrast and keyboard access. Keep the skip link ("Langsung ke konten") and visible focus. Ratings must never be shown by colour alone.
