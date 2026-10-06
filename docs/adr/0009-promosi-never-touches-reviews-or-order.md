# Promosi is a labelled slot beside the lists, never inside them

CampusMatch's planned revenue is Kampus paying for visibility, while its value to students is trust in Ulasan and neutral lists. We decided that a **Promosi** is a separate, labelled box that sits beside the content and never changes it.

- **Where**: at most one per page, on the home page, on the pages of the Jurusan the Kampus paid for, and above search results that match those Jurusan. It is **never** on Tes Minat results, the Perbandingan, Prodi or Kampus pages, Ulasan, account or Moderator pages. A test checks which pages render it.
- **What**: the Kampus's catalogue data (logo, name, Kota, Akreditasi) and up to 140 characters of its own text. It never shows Bintang or Ulasan, and it never changes Ulasan, Bintang, Tingkat Rekomendasi or the order of any list. It links only to the Kampus's CampusMatch page.
- **Who**: one Moderator enters it as Draf, and a **different** Moderator activates it, the same two-person rule as for facts ([ADR 0006](./0006-facts-need-sumber-and-second-check.md)). An active Promosi is never edited: to change it, stop it and enter a new one.
- **When**: it shows between its start and end dates (Asia/Jakarta). Several Promosi for one place take turns by the hour.
- **Measuring**: only a daily click total per Promosi, through `/promosi/[id]`, with no cookies, IP or anything about the visitor. Crawlers are told to skip those links.

## Considered Options

- **Links to the Kampus's own site**: worth more to the Kampus, but it sends students off-site, needs URL review, and invites tracking parameters.
- **Counting impressions**: the home page is cached, so counting views would need client-side scripts and per-visitor signals.
- **Promosi on Tes Minat results or in the Perbandingan**: it would read as "recommended for you" (ADR 0007).
- **Showing a promoted Kampus on every Jurusan it offers**: a large Kampus would appear almost everywhere. Instead, a Moderator picks the Jurusan that were bought.
- **One Moderator activating it**: paid text needs a second pair of eyes.
