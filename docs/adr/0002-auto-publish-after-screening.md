# Low-risk Ulasan are published automatically after Screening

The venture brief promises that *every* Ulasan is checked by tim redaksi before it is shown. We deliberately depart from this: a person reading every Ulasan doesn't scale and slows down the content the platform depends on. Instead, each new or edited Ulasan goes through automatic **Screening**: a wordlist/regex pass, then an LLM classifier (Claude Haiku 4.5) that returns a Tingkat Risiko and a reason. It looks for hate speech/SARA, insults, named individuals, off-topic content and promotional spam.

| Tingkat Risiko | Result |
|---|---|
| rendah | Terbit immediately |
| perlu dicek | Ditinjau: goes to the Antrean Moderasi for a Moderator |
| melanggar | Ditinjau, sorted first in the Antrean Moderasi. Never rejected automatically |

**Every result other than *rendah* goes to a person (changed 2026-10-03).** At first *melanggar* was rejected automatically. While Screening is new we want a Moderator to confirm every rejection, so *melanggar* also goes to the Antrean Moderasi, ahead of *perlu dicek*. Every Ditolak therefore carries a Moderator's reason. The Screening result (Tingkat Risiko, reason, model, time) is stored with the revision so a Moderator can see why an Ulasan was held.

**Fail-closed.** If the Screening call errors, times out or returns something unparseable, the Ulasan stays **Menunggu** and is **never published automatically**. Only an explicit *rendah* result publishes an Ulasan.

Screening runs in **rounds**. A round is one Screening attempt, including up to 2 quick retries after a short delay for transient errors. Only rounds count towards the attempt total. Round 1 runs in `after()`, once the Pengulas's request has been answered. A scheduled job then runs one more round for each Menunggu revision older than 10 minutes. It claims revisions with `FOR UPDATE SKIP LOCKED`, so overlapping runs never screen the same one twice. After **3 failed rounds** the revision goes to the Antrean Moderasi (Ditinjau) with the reason "Screening gagal".

Safety net after publishing: every Terbit Ulasan has a **Laporkan** button for signed-in users. A Laporan puts the Ulasan in the Antrean Moderasi while it stays visible, and a Moderator can unpublish it.

## Considered Options

- Screening plus human approval of everything. This keeps the brief's promise but needs a Moderator for every Ulasan.
- Manual moderation only. Simplest to build, but it doesn't scale.

## Consequences

- Public wording must change. We can no longer say "every review is read by our team". Use something like "every review is checked automatically and reviewed by our team when needed".
- The quality of Screening is now part of the trust promise, so prompts and wordlists need regular review against the Laporan we receive.
