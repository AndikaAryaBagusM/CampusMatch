# Campus email domains (`domain-kampus.csv`)

A Pengulas earns the **Terverifikasi** badge at a Kampus by confirming a link sent to an address on that Kampus's email domain (decision 17o). This file says which domain belongs to which Kampus.

| Column | Meaning |
|---|---|
| `npsn` | The Kampus, as in the catalogue. |
| `nama` | For people; not loaded. |
| `domain_usulan` | A proposal, from the Kampus's known official website. **Not checked.** |
| `domain` | The checked domain. Only this column is loaded on production. |
| `sumber` | Where you checked it, e.g. the Kampus's page about student email. |
| `catatan` | Anything a reviewer should know. |

## Checking a row

1. Open the Kampus's official site and find the domain its students' email addresses use, for example on the IT services or student-email page.
2. Write the **base** domain in `domain`, e.g. `ugm.ac.id`. Subdomains such as `mail.ugm.ac.id` or `student.ugm.ac.id` match it automatically.
3. Put the page you used in `sumber`.

Domains must end in `.ac.id`, or `.edu` for the few campuses that use it (UPI, UPH, UKSW). One domain can belong to only one Kampus.

## Loading

```
npm run kampus:load-domain -- --dry-run
npm run kampus:load-domain                       # dev
npm run kampus:load-domain -- --allow-production # production, after checking the host it prints
```

`--usulan` also loads the unchecked `domain_usulan` proposals. It is refused unless `DB_ENV=development`, so unchecked domains never reach production.

Starting set: the 100 Kampus in the Daftar Kampus Unggulan (2026-10-06; that Webometrics list was replaced by the Peringkat QS on 2026-10-07, see ADR 0011, and all 20 QS Kampus are among the 100). Add other Kampus as rows when they're needed.
