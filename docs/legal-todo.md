# Legal to-do

> **A lawyer must review [/privasi](../src/app/privasi/page.tsx) (Kebijakan Privasi) and [/ketentuan](../src/app/ketentuan/page.tsx) (Ketentuan Layanan) before public launch.** Both pages were drafted on 2026-10-03 from how the app actually works, not by a lawyer. Until the review is done they are drafts, even though they are publicly reachable and linked from the footer and the sign-in page.

None of the four items below is finished. All four must be done before public launch.

| # | Item | Status |
|---|---|---|
| 1 | **Privacy policy** (Kebijakan Privasi): what we collect, why, how long we keep it, and who processes it | ◐ Draft at `/privasi`; lawyer review needed. Covers the account (email, name, Google profile picture URL, Google account id and tokens), the Ulasan, Status Pengulas, tahun masuk, Laporan, and the hashed IP. Campus email, the Profil Minat (six scores and a date, never used for Promosi) and the stored 18+ declaration must be added when those features ship ([ADR 0008](./adr/0008-adult-only-accounts.md)). |
| 2 | **Terms of use** (Ketentuan Layanan): Ulasan content rules, the licence Pengulas grant us over their Ulasan, disclaimers | ◐ Draft at `/ketentuan`; lawyer review needed. Promosi labelling, Tes Minat disclaimers and the Biaya & Masuk disclaimer (official sources on a stated date, may change, not affiliated with any Kampus) must be added when those features ship. |
| 3 | **Kampus takedown/dispute process**: how a Kampus or a named person contests an Ulasan, the contact channel, response time, who decides, and what is recorded | ◐ Described in `/ketentuan` section 7 (email to `KONTAK_EMAIL`; a Moderator decides; decisions are recorded in `riwayat_moderasi`). No response time is promised yet. |
| 4 | **UU PDP (UU No. 27/2022) obligations**: lawful basis and consent; data-subject rights; breach notification; processor agreements and cross-border transfer | ◐ Rights and the request channel are listed in `/privasi` sections 7–8. Still open: see the questions below. |

## Questions for the lawyer

1. **Data controller.** The pages name only "CampusMatch" and a contact email. Which legal entity (and address) must be named as the controller?
2. **Lawful basis and consent.** `/privasi` relies on consent at sign-in and on submitting an Ulasan, plus legitimate interest for abuse prevention. The sign-in page shows a "Dengan masuk, kamu menyetujui…" line, not a checkbox. Is that enough under UU PDP?
3. **Users under 18.** Many future users (especially for the Tes Minat) will be SMA/SMK students. Decided 2026-10-06 ([ADR 0008](./adr/0008-adult-only-accounts.md)): every account requires a self-declared "18 tahun atau lebih"; under-18s can take the Tes Minat without an account, and nothing is stored. Confirm a self-declaration is enough under UU PDP, and advise on a parental-consent flow if we later want under-18 accounts.
4. **Cross-border transfer.** Vercel, Neon (Singapore region), Resend, Google and Anthropic process data outside Indonesia. Confirm the transfer basis and whether processor agreements or DPAs are needed with each.
5. **Anthropic.** Ulasan text (without account data) is sent to the Claude API for Screening. Confirm the wording and check Anthropic's data-retention terms for API inputs.
6. **Deletion.** Deleting an Ulasan in /akun hides it but keeps the row (`ulasan.dihapus_at`); permanent erasure and account deletion are done by hand on request. Confirm that is acceptable and set a retention period for hidden Ulasan, Laporan and moderation history.
7. **Response times.** Neither page promises a deadline for data requests or takedown requests. Set them to match UU PDP.
8. **Breach notification.** `/privasi` section 9 commits to notifying affected people and the authority as UU PDP requires. Confirm the wording and the internal procedure.
9. **Account suspension.** `/ketentuan` section 5 reserves the right to disable accounts that keep breaking the rules. The app has no such switch yet.

Related: the O*NET attribution requirement for the Tes Minat is recorded in [ADR 0004](./adr/0004-riasec-via-onet-interest-profiler.md).
