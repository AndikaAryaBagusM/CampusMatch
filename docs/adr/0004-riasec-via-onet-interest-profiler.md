# The Tes Minat uses RIASEC, based on the O*NET® Interest Profiler Short Form

The Tes Minat scores a Profil RIASEC (Holland's six interest types) and ranks Jurusan by how well their Kode RIASEC match it. RIASEC is well established, easy to explain, and familiar to Indonesian school counsellors (BK). Rather than writing unvalidated questions, we adapt the 60-item **O*NET® Interest Profiler Short Form** from the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), translated and adapted for Indonesian SMA/SMK students. Each Jurusan's Kode RIASEC is set by a Moderator, starting from O*NET codes for the careers that Jurusan leads to.

## Licence (checked 2026-10-02)

The Interest Profiler is **not public domain**. It is offered under a choice of licences:

- The O*NET Interest Profiler page labels the Short Form **CC BY 4.0**.
- The Career Exploration Tools licence page offers **CC BY-ND 4.0** for verbatim redistribution, or the **O*NET Tools Developer License** for modified or extended versions.

A translation and adaptation is a modification, so it can't be distributed under CC BY-ND. **We use the O*NET Tools Developer License.**

**Required attribution**, shown on the Tes Minat page and the results page:

> This page includes information from the O\*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O\*NET Tools Developer License. O\*NET® is a trademark of USDOL/ETA. CampusMatch has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.

(Corrected 2026-10-06 from the full licence text: the trademark sentence and the agency's full name were missing. The pages show the notice verbatim in English, then in Indonesian.)

Other conditions:
- Use "O*NET®" only as an adjective ("O*NET® Interest Profiler"), never in plural or possessive form.
- Modified versions must be validated, and we must not imply USDOL/ETA endorsement.

**Licence text read 2026-10-06** (<https://www.onetcenter.org/license_toolsdev.html>; it carries no version number or date). It is royalty-free and worldwide and needs no prior approval, but:

- **Validation Study (launch blocker).** Anyone who modifies the material "must conduct a study ('Validation Study')" showing that results from the adapted material are valid for the intended purpose, audience and end-user, following the *Standards for Educational and Psychological Testing* and 41 C.F.R. Part 60-3. A translation for Indonesian SMA/SMK students is such a modification. Until a study is done, the pages say the test is not yet validated and should be discussed with a counsellor (guru BK), not used as a decision. See [legal-todo.md](../legal-todo.md).
- The notice above must appear conspicuously, with an accessible description of the changes.
- Rights end automatically on breach and come back if it is cured within 30 days.

## As built (roadmap step 7, 2026-10-06)

- **Form:** the paper **Short Form v1** checklist (`Interest_Profiler.pdf`): tick the activities you would like to do; each type scores the number of ticks, 0–10. The 60 activities are translated and shown interleaved (R, I, A, S, E, C, R, …) rather than under type headings. Tied top types are shown as ties, as the form tells the person to choose.
- **Kode RIASEC per Jurusan:** each Jurusan is mapped by hand to 1–3 O\*NET occupations (`data/riasec/jurusan-onet.csv`); its proposed code is the three highest averages of their O\*NET 31.0 interest ratings. Moderators review and edit the codes. The O\*NET 31.0 Database is CC BY 4.0 and is credited on the Tes Minat pages.
- **Matching:** a Jurusan scores the person's points for its code's types, weighted 3, 2, 1 by position; ties go to the Jurusan more Prodi offer.

Sources: <https://www.onetcenter.org/license_tools.html>, <https://www.onetcenter.org/IP.html>

## Considered Options

- Writing our own questions: we'd have full control, but the test would be unvalidated and hard to defend.
- Licensing a commercial test from a psychology bureau: credible, but too costly and slow for the MVP.
