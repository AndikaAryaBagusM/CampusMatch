# Kode RIASEC per Jurusan

Seeds the Kode RIASEC each Jurusan gets (decisions.md 11 and 17f, ADR 0004). Moderators own the result: every code can be changed.

| File | What it is |
|---|---|
| `jurusan-onet.csv` | Curated: for each Jurusan, 1–3 O*NET-SOC occupations it typically leads to, separated by spaces. |
| `onet-31-0-minat.csv` | The O*NET 31.0 *Career Interest Types* ratings (scale OI, 1–7 per type) for 923 occupations, trimmed to code, title and the six ratings. |
| `kode-riasec.csv` | Generated for review: the proposed code (`usulan`), the averages behind it and the occupations used. Edit `kode`. |

## Workflow

1. Edit `jurusan-onet.csv` when a Jurusan's occupations are wrong or a new Jurusan appears. Codes must exist in `onet-31-0-minat.csv`.
2. `npm run riasec:propose` checks every name and code and writes `kode-riasec.csv`: the three types with the highest average rating, most important first. Edits to `kode` that differ from the old proposal are kept when you re-run it.
3. Review the `kode` column (2–3 letters of RIASEC; blank removes the code), then `npm run riasec:load -- --dry-run` and `npm run riasec:load`.

Proposals for mixed Jurusan (e.g. *Pendidikan X* = teacher + X) are averages and deserve a second look.

## Source and licence

O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) licence: <https://www.onetcenter.org/database.html>. CampusMatch changed it: the file keeps only the Occupational Interests ratings, and each Jurusan's code is an average over the occupations CampusMatch mapped it to. The credit is shown on the Tes Minat pages.
