# The Kampus highlight is the QS World University Rankings, shown as QS's own rank

Supersedes the list source and Moderator editing in [ADR 0003](./0003-catalogue-snapshot-from-official-exports.md) (decided 2026-10-07).

The Daftar Kampus Unggulan was 100 Kampus copied once from Webometrics 2026 Juli and stored as a yes/no flag. A badge and a filter showed it, but it said nothing about *where* a Kampus stood, and a hand-curated "unggulan" list read as our own verdict. We replaced it with **every Indonesian Kampus in the latest edition of the QS World University Rankings** (20 in the 2027 edition, published 2026-06-18), each with its **Peringkat QS exactly as QS publishes it**: a rank (276), a shared rank (=191) or a band (851-900, 1401+).

- **Stored as a fact, not a flag.** `peringkat_qs` holds one row per Kampus per edition: the rank text, its numeric bounds for ordering, the name QS lists, the source URL and the capture date. Membership is "has a row in the latest edition". Older editions stay as history. There is no `unggulan` flag and no Moderator-edited list.
- **Copied by hand, matched by a person.** The Indonesian entries are copied from QS's ranking page into `data/raw/qs-wur-<edisi>-indonesia.json` (name, location and rank only; no scores, indicators, logos or whole tables). Each entry is matched to a Kampus in the reviewed `data/qs-kampus.csv`; the loader (`npm run kampus:load-qs`) refuses to run while any entry is unmatched or matched twice, and running it again changes nothing.
- **Always attributed.** Wherever a rank shows, it is labelled "QS World University Rankings [edisi]", with a link to the source on the page and a note on what QS measures (mostly academic and employer reputation surveys, citations and staff-student ratio, for the whole university). It is never called "terbaik", and CampusMatch states that it is not affiliated with QS.
- **Kept apart from Ulasan.** The rank is never read by any Ulasan, Bintang, Aspek or Tingkat Rekomendasi query, and never changes the order of search, Jurusan or Kota lists. The QS filter only narrows a list. A test checks that changing ranks leaves scores and search order unchanged.
- **One ordered place.** The home page lists the QS Kampus in QS's order with the rank on each row. It is the only list ordered by rank; it shows QS's order, not ours.
- **Biaya & Masuk collection** starts with the QS Kampus (decisions.md 17a). Facts already collected for other Kampus stay.

## Considered Options

- **Keep Webometrics, or a top-100 from any ranking**: QS lists only about 20 Indonesian Kampus, so we took all of them rather than mix rankings.
- **A yes/no flag plus a separate rank table**: two sources of truth for one fact.
- **Alphabetical home list with the rank shown**: closer to the old "never ranked" rule, but the user chose to follow QS's order, since the list is QS's.
- **Keeping the name "Kampus Unggulan"**: it reads as our own quality verdict.

## Consequences

- When QS publishes a new edition, the team copies it into a new `data/raw/` file, reviews the matches and runs the loader. Kampus that drop out lose the badge, and pages switch to the new edition at once.
- The old `kampus.unggulan` and `impor_katalog.unggulan_*` columns stay unused until production runs the new code, then a later migration drops them.
