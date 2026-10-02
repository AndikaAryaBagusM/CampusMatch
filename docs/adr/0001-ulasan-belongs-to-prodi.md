# An Ulasan belongs to a Prodi; Jurusan is a curated grouping

The brief talks about reviews of "majors and campuses", but a major such as Teknik Informatika exists at hundreds of Kampus and is experienced very differently at each. So every Ulasan is about exactly one **Prodi** (one programme, at one Kampus, at one Jenjang). Scores for a Kampus and for a Jurusan are always aggregated from Prodi Ulasan and are never collected separately. This follows the StudyCheck model in our design reference and the shape of the official Prodi data.

**Jurusan** is our own curated list, kept small (roughly 150–300 entries). Each Prodi is mapped to exactly one Jurusan: automatically when its name matches, otherwise by a Moderator. Official names vary too much ("Informatika", "Teknik Informatika", "Ilmu Komputer") for grouping by exact name to work. The official field-of-study classification is too coarse for teenagers searching.

## Considered Options

- Separate Kampus Ulasan and Prodi Ulasan. Rejected: it means two forms and two moderation flows, and the scores can contradict each other.
- Grouping Jurusan by exact Prodi name. Rejected: the same field ends up split across several profiles.

## Consequences

- An admin mapping tool (Prodi → Jurusan) is part of the MVP.
- A Prodi without a Jurusan mapping still appears under its Kampus. It just isn't reachable from a Jurusan page or a Tes Minat result.
