# Pengulas estimates sit beside the official facts, never replace them

Official Biaya & Masuk facts need a Sumber and a second Moderator ([ADR 0006](./0006-facts-need-sumber-and-second-check.md)), so they cover only what a Kampus publishes, starting with the Unggulan. To fill the gap we let Pengulas share what they actually paid and how they got in, as an **Info Biaya**, and show it combined as the **Estimasi Pengulas**. Because a UKT Kelompok or a KIP Kuliah answer reveals a family's income, UU PDP treats it as specific personal data (personal financial data), and the design is built around that.

- **Separate storage and display**: Info Biaya has its own table and never becomes a Fakta. The Estimasi is shown in its own labelled block on the Prodi page, and as muted rows under the official rows in the Perbandingan, which amends [ADR 0007](./0007-comparison-shows-facts-only.md). It is never merged with an official number, and the max-UKT filter and the UKT sort stay official-only.
- **Aggregate only**: a single Info Biaya is never shown, not even on its author's Ulasan card. Each field appears only once **5** Pengulas answered it (median and middle range for amounts, counts for choices), from the last five angkatan, and fields are never cross-tabulated. Only Moderators see entries one by one.
- **No free text**: every answer is a number or a fixed choice, so there is nothing to screen. The form rejects impossible amounts. Values far from the rest (more than three interquartile ranges away, with a floor so equal answers don't exclude their neighbours) are left out automatically. A Moderator can set aside (*Kesampingkan*) an entry or a whole account, with a reason.
- **Equal weight**: Terverifikasi Pengulas count once like everyone else, and the Estimasi says how many of them answered.
- **Consent and retention**: an explicit checkbox on every save, deletion at any time from `/akun`, deletion by the daily cron once the angkatan leaves the window, never used for Promosi.

## Considered Options

- **The fact tables with a source-type column**: fewer tables, but it breaks the Sumber and second-check constraints and invites a crowd number shown as official.
- **Monthly living cost**: varies with lifestyle more than with the Kampus, and 17b keeps living costs out.
- **Extra weight for Terverifikasi**: the weight is an arbitrary editorial number a Kampus could dispute.
- **Showing the answers on the Ulasan card**: richer, but it ties an income bracket to a recognisable review.
- **A minimum of 3**: with three answers the median is one person's figure and the range reveals the others.
- **A Moderator queue for outliers**: more accurate, but steady work for little gain over a median.
