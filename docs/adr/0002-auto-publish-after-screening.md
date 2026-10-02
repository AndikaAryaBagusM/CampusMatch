# Low-risk Ulasan are published automatically after Screening

The venture brief promises that *every* Ulasan is checked by tim redaksi before it is shown. We deliberately depart from this: a person reading every Ulasan doesn't scale and slows down the content the platform depends on. Instead, each new or edited Ulasan goes through automatic **Screening**: a wordlist/regex pass, then an LLM classifier (Claude Haiku 4.5) that returns a Tingkat Risiko and a reason. It looks for hate speech/SARA, insults, named individuals, off-topic content and promotional spam.

| Tingkat Risiko | Result |
|---|---|
| rendah | Terbit immediately |
| perlu dicek | Ditinjau: goes to the Antrean Moderasi for a Moderator |
| melanggar | Ditolak, with the reason shown to the Pengulas |

**Fail-closed.** If the Screening call errors, times out or returns something unparseable, the Ulasan stays **Menunggu** and is **never published automatically**. Only an explicit *rendah* result publishes an Ulasan. A scheduled retry re-screens Menunggu Ulasan. Any that still fail after the retries go to the Antrean Moderasi for a person.

Safety net after publishing: every Terbit Ulasan has a **Laporkan** button. A Laporan sends the Ulasan back to the Antrean Moderasi, and a Moderator can unpublish it.

## Considered Options

- Screening plus human approval of everything. This keeps the brief's promise but needs a Moderator for every Ulasan.
- Manual moderation only. Simplest to build, but it doesn't scale.

## Consequences

- Public wording must change. We can no longer say "every review is read by our team". Use something like "every review is checked automatically and reviewed by our team when needed".
- The quality of Screening is now part of the trust promise, so prompts and wordlists need regular review against the Laporan we receive.
