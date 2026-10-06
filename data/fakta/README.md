# Biaya & Masuk facts

One folder per **Sumber** (one official document or page), named with lowercase letters, digits and dashes, e.g. `001001-sk-ukt-2026`. The folder name is the Sumber's `kode`. See [ADR 0006](../../docs/adr/0006-facts-need-sumber-and-second-check.md) and [decisions.md](../../docs/decisions.md) 17a–17e. `_contoh/` (a Kampus Sumber) and `_contoh-nasional/` (a national Beasiswa, which must be imported before a Kampus can take part in it) are examples to copy; folders starting with `_` are never imported.

## Workflow

1. Save the page or PDF in the Wayback Machine (<https://web.archive.org/save>) and copy the resulting `https://web.archive.org/web/...` link.
2. Create the folder: `sumber.json` plus any of `jalur.csv`, `biaya.csv`, `beasiswa.csv` (UTF-8, header row as below).
3. Check it: `npm run fakta:import -- data/fakta/<kode> --oleh <your moderator email> --dry-run`. Every error names the file and row; Prodi that don't match the catalogue list the closest names and their `prodi_slug`.
4. Import it: the same command without `--dry-run`. Facts are **Draf** and not shown.
5. A **different** Moderator opens `/moderasi/fakta`, compares each fact with the document, and marks the Sumber **Diperiksa** (now shown) or sends it back with a note. After sending back, fix the CSV and import again; the note is shown in `/moderasi/fakta` and by the import.

Re-importing a folder replaces its Draf facts. Once its facts are Diperiksa, a folder can't be re-imported: record a change (e.g. a new Tahun Akademik or a corrected SK) as a new folder.

**A wrong number is already shown?** Find its Sumber under "Sudah Diperiksa" in `/moderasi/fakta`, tick the wrong facts and **Tarik** them with a reason (one Moderator is enough; withdrawing a Jalur Masuk also withdraws its fees). Then import the corrected facts as a new folder.

## Rules

- Copy only what the Sumber states. **Never** copy a Kampus-wide amount into a row per Prodi: leave `prodi` empty instead.
- Every row has a `tahun_akademik` such as `2026/2027`.
- Amounts are whole rupiah: `7500000`, `7.500.000` or `Rp 7.500.000`. No decimals, no "juta".
- No cost-of-living estimates, daya tampung or keketatan.

## `sumber.json`

```json
{
  "npsn": "001001",
  "url": "https://um.ugm.ac.id/...",
  "judul": "SK Rektor No. 123/2026 tentang UKT",
  "penerbit": "Universitas Gadjah Mada",
  "diakses_pada": "2026-10-06",
  "arsip_url": "https://web.archive.org/web/20261006000000/https://um.ugm.ac.id/..."
}
```

- `npsn`: the Kampus (as in the catalogue). `null` for a national source, which may only hold `beasiswa.csv` (e.g. the KIP Kuliah guidelines).
- `arsip_url`: the Wayback link, or `null` if the page can't be archived (behind a login, a Google Drive PDF). The checker must then record why it was accepted.

## `jalur.csv`

| Column | Values |
|---|---|
| `tahun_akademik` | `2026/2027` |
| `nama` | The Kampus's own name, e.g. `SIMAK UI`, `SNBP` |
| `kategori` | `snbp`, `snbt`, `mandiri`, `pts` |
| `tes` | One or more of `utbk`, `tes_kampus`, `rapor`, `portofolio`, `wawancara`, `prestasi`, `lain`, separated by `;` |
| `pendaftaran_buka`, `pendaftaran_tutup` | `YYYY-MM-DD`, only if the Sumber states them; otherwise empty |

## `biaya.csv`

| Column | Values |
|---|---|
| `tahun_akademik` | `2026/2027` |
| `jenis` | `ukt`, `spp`, `uang_pangkal`, `pendaftaran`, `lain` |
| `prodi` | The Prodi name as in the Sumber; empty for a Kampus-wide amount |
| `jenjang` | `S1`, `D4`, `D3`; needed when `prodi` is set |
| `prodi_slug` | Optional: the catalogue slug, when the name matches several Prodi (branch campuses) |
| `jalur` | Optional: the `nama` of a Jalur Masuk (in this folder's `jalur.csv` or an earlier Sumber of the same Kampus), e.g. a Mandiri-only uang pangkal or a registration fee |
| `label` | Optional, e.g. `Kelompok III`, `Jaket almamater` |
| `jumlah` | Whole rupiah |
| `batas` | Empty (exact), `minimal` or `maksimal` |
| `periode` | `per_semester` or `sekali`. Optional except for `lain`: UKT and SPP are per semester, uang pangkal and pendaftaran once |

## `beasiswa.csv`

| Column | Values |
|---|---|
| `tahun_akademik` | `2026/2027` |
| `nama` | Name of the Beasiswa |
| `ikut_skema_nasional` | `ya` if this row only records that the Kampus takes part in a national Beasiswa of that `nama` (import its national Sumber first); otherwise empty |
| `penyelenggara` | Who provides it |
| `sasaran` | Who it is for, as the Sumber states |
| `cakupan` | What it covers, as the Sumber states |
| `url` | Optional information page |

`penyelenggara`, `sasaran` and `cakupan` may be empty on an `ikut_skema_nasional` row.
