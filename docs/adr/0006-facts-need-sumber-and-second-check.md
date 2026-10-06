# Every Biaya & Masuk fact needs a Sumber and a second Moderator's check

Tuition, admission and scholarship facts (Biaya, Jalur Masuk, Beasiswa) are copied by hand from official Kampus documents, and a wrong fee shown to a student choosing a Kampus is a real harm. So every fact must point to a **Sumber** (URL, title, publisher, access date and a **Wayback Machine link** made with "Save Page Now" when the fact is entered) and carries its own **Tahun Akademik**. A fact starts as *Draf* and is shown only once a **different** Moderator has checked it against its Sumber (*Diperiksa*). Facts are entered as one CSV per Sumber (an SK Rektor usually covers every Prodi's UKT), imported as Draf; each row is matched to one of our Prodi by name within the Kampus, and unmatched rows block the import. Small corrections use a form.

Facts belong to a Kampus or Prodi, not to the Daftar Kampus Unggulan: Unggulan only decides which Kampus are collected first ([ADR 0003](./0003-catalogue-snapshot-from-official-exports.md) still holds). A fact is stored at Prodi level only when the Kampus publishes it per Prodi; a Kampus-wide figure is never copied down to each Prodi. Facts are refreshed once a year (February–June, following the SNPMB calendar) and never deleted: a new Tahun Akademik adds rows, and pages label facts from an older Tahun Akademik as possibly out of date.

## Considered Options

- **Our own archived copy in Vercel Blob**: more reliable than Wayback, but it needs storage and an upload feature, which [decisions.md](../decisions.md) 10f keeps out. If Wayback cannot capture a page, the Sumber is marked "tanpa arsip" and the checking Moderator records why it was accepted anyway.
- **Kampus edit their own facts**: faster, but it needs a Kampus partner role (out of the MVP) and makes the Kampus both the subject and the editor. Kampus send corrections to the contact email instead.
- **A Pengumpul Data role** for assistants who only enter Draf facts: rejected for now; data entry is Moderator work under `MODERATOR_EMAILS`.
- **Daya tampung and keketatan**: left out; there is no reliable official source for every Kampus.
