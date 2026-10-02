# An Ulasan belongs to a Prodi; Jurusan is a curated grouping

The brief talks about reviews of "majors and campuses", but a major such as Teknik Informatika exists at hundreds of Kampus and is experienced very differently at each. So every Ulasan is about exactly one **Prodi** (one programme, at one Kampus, at one Jenjang). Scores for a Kampus and for a Jurusan are always aggregated from Prodi Ulasan and are never collected separately. This follows the StudyCheck model in our design reference and the shape of the official Prodi data.

**Jurusan** is our own curated list, kept small (roughly 150–300 entries). Each Prodi is mapped to exactly one Jurusan. The mapping is made **per Kode Prodi**, the national programme code in the official export, rather than per name. Official names vary too much for name matching to work, but the code already groups the variants. For example, Kode Prodi 55201 covers "Teknik Informatika", "Informatika" and "Ilmu Komputer". The export has 2,488 codes against 3,403 distinct names. A Moderator maps codes to Jurusan, and can override the mapping for an individual Prodi that its code groups wrongly. The official field-of-study classification is too coarse for teenagers searching.

## Considered Options

- Separate Kampus Ulasan and Prodi Ulasan. Rejected: it means two forms and two moderation flows, and the scores can contradict each other.
- Grouping Jurusan by exact Prodi name. Rejected: the same field ends up split across several profiles.

## Consequences

- An admin mapping tool (Kode Prodi → Jurusan, with a per-Prodi override) is part of the MVP.
- A Prodi without a Jurusan mapping still appears under its Kampus. It just isn't reachable from a Jurusan page or a Tes Minat result.
