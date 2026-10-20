# Bimbel may buy Promosi, with one reviewed link to their own site

[ADR 0009](./0009-promosi-never-touches-reviews-or-order.md) made Promosi a Kampus product. Bimbel and test-prep platforms are the readiest buyers: they already pay for online ads aimed at students choosing a Kampus, and what they sell is the next step for those readers. We decided that a bimbel can buy a **Promosi** on the same terms as a Kampus, with one difference: its box links to the bimbel's own site.

- **Where**: unchanged from ADR 0009. Beranda, the Jurusan it buys (any Jurusan, not only those a Kampus offers) and matching search, one box per page, taking turns by the hour with any other Promosi there. Never on Tes Minat results, the Perbandingan, Prodi or Kampus pages, Ulasan, account or Moderator pages.
- **What**: the bimbel's name, up to 140 characters of its text, and the domain its link leads to. The label names the bimbel as the payer. No image, script or tracker.
- **Link**: one https address on a public domain, with no credentials or port and no query parameters other than `utm_*`. It is checked when entered, and both Moderators open it before activation. Clicks still pass through `/promosi/[id]`, so only the daily total is counted.
- **Text rules**: no promise of admission, no suggestion that a Kampus or CampusMatch endorses it, no "terbaik" claims. The second Moderator checks these before activating.
- **Sold directly**: by contract, never through an ad network.

## Considered Options

- **An ad network such as Google AdSense**: no sales work, but it loads third-party scripts that track readers, we can't control which ads appear next to Jurusan pages, and `/privasi` promises neither.
- **Internal links only, as for a Kampus**: a page about the bimbel on CampusMatch. That would mean writing pages for advertisers, and it gives a bimbel little reason to pay.
- **Logos or images**: they sell better, but the app has no file storage and every image would need its own review.
- **Placement on Tes Minat results**: the most valuable spot for a bimbel, but it would read as "recommended for you" (ADR 0007, 0009).
- **External links for Kampus too**: still rejected. A Kampus already has its own CampusMatch page to send readers to.
