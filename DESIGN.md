---
name: CampusMatch
description: Indonesian transit signage for choosing a Jurusan and Kampus; every path is a route with named stops.
colors:
  enamel-ground: "#e7ede9"
  signal-ink: "#13201a"
  sheet: "#f2f6f3"
  jade: "#0b6b4e"
  jade-deep: "#08513b"
  jade-tint: "#d5e3db"
  jade-tint-ink: "#0a5e44"
  on-jade: "#ffffff"
  on-jade-muted: "#cfe3d9"
  pengulas-pink: "#c42f73"
  pengulas-ink: "#a8245f"
  pengulas-tint: "#f6dbe7"
  muted: "#dde5e0"
  muted-ink: "#4b5b53"
  rule: "#c3d0c8"
  input-stroke: "#a9b8af"
  star: "#b87400"
  success: "#1d7a3e"
  warning: "#9a4a0c"
  destructive: "#b42318"
  line-pendidikan: "#b45309"
  line-teknik: "#1e3a8a"
  line-sosial: "#86198f"
  line-ekonomi: "#0e7490"
  line-kesehatan: "#c62a36"
  line-pertanian: "#4d7c0f"
  line-agama: "#9f1239"
  line-mipa: "#4f46e5"
  line-humaniora: "#8a6a00"
  line-seni: "#7c2d12"
  line-lainnya: "#58665f"
  promosi-paper: "#f5ecd7"
  promosi-ink: "#6b4a00"
  promosi-text: "#4f4430"
typography:
  display:
    fontFamily: "Overpass, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Overpass, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Overpass, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Overpass, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"kern\""
  body-small:
    fontFamily: "Overpass, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  plate:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.025em"
  figure:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
rounded:
  sm: "3px"
  md: "4.5px"
  lg: "6px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  container: "72rem"
  station: "56px"
  line: "6px"
components:
  button-primary:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.on-jade}"
    rounded: "{rounded.sm}"
    height: "32px"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "{colors.jade-deep}"
  button-pengulas:
    backgroundColor: "{colors.pengulas-pink}"
    textColor: "{colors.on-jade}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 12px"
  button-pengulas-hover:
    backgroundColor: "{colors.pengulas-ink}"
  button-ink:
    backgroundColor: "{colors.signal-ink}"
    textColor: "{colors.enamel-ground}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
  button-ink-hover:
    backgroundColor: "{colors.jade}"
  input-search:
    backgroundColor: "#ffffff"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.sm}"
    height: "48px"
  plate:
    textColor: "#ffffff"
    typography: "{typography.plate}"
    rounded: "{rounded.sm}"
    height: "28px"
    padding: "0 6px"
  tab-active:
    backgroundColor: "{colors.signal-ink}"
    textColor: "{colors.enamel-ground}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  tab-idle:
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  badge-akreditasi:
    backgroundColor: "{colors.jade-tint}"
    textColor: "{colors.jade-tint-ink}"
    rounded: "{rounded.sm}"
    height: "24px"
    padding: "0 8px"
  plate-qs:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.sm}"
    height: "24px"
    padding: "0 8px"
  panel-lembar:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.md}"
    padding: "24px"
  departure-board:
    backgroundColor: "{colors.signal-ink}"
    textColor: "{colors.on-jade}"
    rounded: "{rounded.md}"
    padding: "24px"
  promosi-poster:
    backgroundColor: "{colors.promosi-paper}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: CampusMatch

## Overview

**Creative North Star: "Peta Trayek"**

CampusMatch is set as Indonesian transit signage: angkot route plates, KRL and TransJakarta line maps, a station timetable on an enamel wall. Every path through the site is drawn as a route with named stops. Readers travel Bidang → Jurusan → Prodi; Pengulas travel Cari Prodi-mu → Masuk → Tulis ulasan → Diperiksa → Terbit tanpa nama. A line on this site always diagrams a real sequence or grouping. It never stands for geography, a ranking, or a score.

The page sits on an enamel green-grey ground in signal ink. Jade is the committed field, used where a station would paint its colour: the header wordmark plate, the home hero band, the Kampus station sign, and the footer. Pink is the Pengulas line and the writing action, and nothing else. Each Bidang owns one line colour and a two-letter route code. Facts are timetable rows ruled in ink, figures are set in condensed plate type with tabular numerals, and every official figure carries a source ticket. The density is that of a timetable board: compact, ruled, and legible at a glance on a phone in daylight. There is only a light theme.

The confirmed anti-reference is the earlier StudyCheck-derived look (blue `#0068ce`, a yellow CTA, Inter, a grid of same-size white cards over a blue search hero). None of it belongs to this system.

**Key Characteristics:**
- Enamel ground, signal ink, jade field, pink Pengulas line, one line colour per Bidang.
- 6px route lines with round caps; white stops ringed in ink; the current stop is a larger interchange ring.
- Overpass for all text; Barlow Condensed only for route codes, column heads and figures.
- Timetable sections hang from a heavy ink rule on the bare ground; sheets only where a form or tool needs a container.
- Small corners (3px) on plates, buttons and inputs; flat by default.
- One signature interaction: pointing at a stop lights the route up to that stop.

## Colors

A cool enamel neutral carrying one committed jade field, one pink route, and a set of saturated line colours that each keep white text above 4.5:1.

### Primary
- **Station Jade** (jade): The committed field. Header wordmark plate, hero band, Kampus station sign, footer, primary buttons, focus ring, the home rail and its Stasiun markers, breadcrumb route.
- **Deep Jade** (jade-deep): Hover for jade actions, Bidang chips on the hero band, the footer's legal strip.
- **Jade Tint** (jade-tint) with **Tint Ink** (jade-tint-ink): Secondary buttons, akreditasi badges, hover fills.
- **On-Jade White / On-Jade Muted** (on-jade, on-jade-muted): Primary and secondary text on jade and on the ink board; on-jade-muted also draws upcoming route segments on jade.

### Secondary
- **Pengulas Pink** (pengulas-pink): The Pengulas route line, the "Tulis ulasan" action, the Rute Pengulas header strip, the text caret, and the search field's focus ring. **Pengulas Ink** (pengulas-ink) is its hover; **Pengulas Tint** (pengulas-tint) is the text-selection colour.

### Tertiary
- **Bidang line colours** (line-pendidikan through line-seni, line-lainnya as fallback): one per Bidang, hues spread so neighbours never share a family and none sits on jade or pink. Used for that Bidang's route line and its route plate, never as decoration elsewhere.
- **Promosi paper** (promosi-paper, promosi-ink, promosi-text): the paid-placement poster only, a warm paper deliberately foreign to the route system.
- **Status** (star, success, warning, destructive): Bintang, confirmations, cost warnings, errors.

### Neutral
- **Enamel Ground** (enamel-ground): The page itself. Timetable sections sit directly on it.
- **Signal Ink** (signal-ink): All text, stop rings, panel rules, the active tab plate, the search "Cari" plate, the departure board, the Bandingkan bar.
- **Sheet** (sheet): The lighter sheet under forms, account and moderation tools, FAQ, tickets.
- **Muted / Muted Ink** (muted, muted-ink): Quiet fills and secondary text.
- **Rule / Input Stroke** (rule, input-stroke): Row dividers; input borders and the ticket's dashed tear line.

### Named Rules
**The One Field Rule.** Jade is the only colour that fills large areas. Pink fills only small things (a button, a header strip); line colours fill only lines and plates.

**The Pink Means Writing Rule.** Pengulas pink marks the act of writing an Ulasan and the Pengulas route. It is never a generic accent, link colour, or alert.

**The Line Colour Contract.** Every route colour must keep white text above 4.5:1 and stay above 3:1 against the enamel ground. A new Bidang, monogram hue or line meets that before it ships.

## Typography

**Display Font:** Overpass (from `next/font`, variable `--font-overpass`), carrying every heading and all body text
**Label/Mono Font:** Barlow Condensed 600/700 (`--font-barlow-condensed`, the `font-plate` utility)

**Character:** Overpass descends from highway-sign lettering and reads plainly at every size; Barlow Condensed is the painted route plate, tight and upper-case. A small local face ("Titik Tengah") replaces only the middle dot U+00B7, because Overpass sets it off-centre.

### Hierarchy
- **Display** (800, 2.25rem → 3rem → 3.5rem, line-height 1.04, -0.03em): the home headline on the jade band, max about 16ch.
- **Headline** (800, 1.5rem → 1.875rem, tight): station headings on the home rail and the Kampus name on the station sign (up to 2.25rem).
- **Title** (700, 1.125rem): Panel headings hanging from the ink rule; Bidang names at 1.25rem/800.
- **Body** (400, 1rem, kerning on): running text; explanatory paragraphs at 0.875rem, relaxed leading, max 60–68ch. Stop labels are bold; stop notes are body-small in muted ink.
- **Plate** (Barlow Condensed 700, uppercase, 0.025em; 0.75 / 1 / 1.5rem): route codes, column heads on boards and tables, the ticket stub, the Promosi label.
- **Figure** (Barlow Condensed 700, 1.25–1.875rem, tabular): counts that matter (Prodi and Kampus totals, the Kampus station-sign figures).

### Named Rules
**The Plate Type Rule.** Barlow Condensed is for codes, column heads and figures only. Sentences, headings and labels are Overpass.

**The Tabular Rule.** Tables, timetable rows and every figure use tabular numerals so columns align like a timetable.

**The Figures Right Rule.** In timetable rows, text columns align left and figure columns align right, with the figures set in plate type.

## Layout

A single centred container (72rem max, 16px gutters, 24px from `sm`) under a sticky 64px header on the ground. On home, a full-bleed jade band holds a 12-column grid (headline, counts, search and Bidang chips across 7; the Rute Pengulas across 5); below it one continuous 6px jade rail runs down the left of the container, and each section is a Stasiun on it, its interchange ring beside the heading, with 56px between stations. Bidang lines run horizontally from `md` and vertically on phones (first three stops, the rest behind a native disclosure). Reading pages narrow to 48–56rem. Result lists (search, Kota, Jurusan) are timetable rows: from `md` they share one grid template with their column heads; on phones each row's facts wrap onto one labelled line under the name. Filters sit between the heading and the list as a ruled strip on the ground (hairline ink rules above and below at 25%), not on a sheet. The footer is the jade field with the site's sections as one route line, closed by a deep-jade strip. On phones the order is headline, search, then the vertical Rute Pengulas, and the header nav becomes a scrolling row.

## Elevation & Depth

Flat by default. Depth comes from tone and ink: the ground, a lighter sheet with a faint ink ring, the dark departure board, and heavy ink rules. Shadows are soft, ambient and reserved for three things that genuinely sit above the page.

### Shadow Vocabulary
- **Lifted card on jade** (`box-shadow: 0 18px 40px -20px rgb(8 40 30 / 0.7)`): the Rute Pengulas card on the hero band.
- **Search lift** (`box-shadow: 0 6px 16px -8px rgb(19 32 26 / 0.45)`): the large search field only.
- **Fixed bar** (`box-shadow: 0 -8px 24px -12px rgb(19 32 26 / 0.5)`): the Bandingkan bar along the bottom of the viewport.

### Named Rules
**The Timetable, Not Cards Rule.** Sections sit on the bare ground under a 3px ink rule. Use a sheet only when a form, tool or disclosure list needs a container; never wrap content in a card for decoration.

## Shapes

Signage geometry: rectangles with small corners, round lines and round stops. Plates, buttons, inputs, tabs, badges and tickets use 3px corners; sheets, the board, the station sign and the poster use 4.5px. Route lines are 6px with fully rounded caps; stops are circles (24px, 3px ink ring), the current stop and Stasiun markers are 32px rings with a 6px border in the line colour. Rules are ink: 3px above a timetable section, 2px under sheet headings and board column heads, 1px dividers between rows. The source ticket has a dashed tear line between stub and body.

## Components

### Buttons
Painted plates: solid, small-cornered, bold.
- **Shape:** gently squared (3px).
- **Primary:** jade with white text, 600 weight, 32–36px tall; hover deep jade.
- **Pengulas:** pink "Tulis ulasan" with a pen icon, 40px; hover pengulas ink.
- **Ink plate:** the search "Cari" button, signal ink on white field; hover jade.
- **Outline / Secondary / Ghost:** ink-outlined on sheet, jade-tint fill, or transparent with a muted hover.
- **Focus:** 2px jade outline offset 2px site-wide; pink outline on the search plate.

### Chips
- **Bidang chips:** deep-jade pill-less rectangles (36px) on the hero band with a small route plate leading; hover to ink.
- **Filter chips:** 32px link chips, 3px corners; the active chip is a solid ink plate, idle chips are sheet with an input-stroke ring that turns jade on hover.
- **Badges:** 24px, 3px corners, jade tint for a known akreditasi, muted with a faint ring for "Akreditasi belum tersedia".
- **QS plate:** an outlined plate (sheet fill, 1px ink ring, a small ink dot) holding "QS WUR [edisi] · [rank as published]", so it reads as a cited third-party fact, not our grade; always paired on the page with a QS source ticket that names "QS World University Rankings [edisi]" and links to it.

### Cards / Containers
- **Panel (timetable section):** on the ground, 3px ink rule on top, title hanging from it, ruled rows below.
- **Panel lembar (sheet):** sheet background, 4.5px corners, faint ink ring (10%), 20–24px padding, 2px ink rule under the heading. Only on account, login, report and moderation pages; public reading pages stay on the ground.
- **Departure board:** signal-ink board, white names, on-jade-muted Kota, plate-type column heads. Alphabetical and never ranked by us; the one exception is the home QS board, which keeps QS's own order with the rank as published in its first column (ADR 0011).

### Timetable Rows (Jadwal)
Result lists set as the columns of a departure board. Column heads in Barlow Condensed (600, uppercase, muted ink) under a 3px ink rule, dropped when the list's own heading already carries one. Rows are ruled with 1px dividers, about 14px vertical padding, the destination (name, with its plate or logo) on the left and fixed fact columns after it. Text columns align left; figure columns align right in plate type (700, 1–1.125rem, tabular). On phones the column heads hide and the facts wrap onto one line under the name, each prefixed with its own label.

### Inputs / Fields
- **Style:** white field, 3px corners, input-stroke border; the search form is a white field in a 2px ink ring with the ink "Cari" plate inside.
- **Focus:** ring thickens to 3px pink on the search; other fields take a jade border and soft jade ring. Caret is pink.
- **Error / Disabled:** destructive border and ring; disabled at half opacity.

### Navigation
- **Header:** sticky on the ground with a hairline ink rule; jade wordmark plate (a two-stop pink route mark, then the name), 600-weight links that turn jade and underline on hover, small search, pink write button, Akun.
- **Tabs:** platform signs; the current tab is a solid ink plate, others are ink-outlined plates.
- **Breadcrumb:** the route travelled; a jade home plate, short jade segments between items, the current page ending on a ringed stop.

### Route Line (GarisRute)
The signature component. An ordered list drawn as a 6px line with stops; vertical, horizontal from `md`, or always horizontal with sideways scroll. Stop states: passed (filled with the line colour), current (32px ring in the line colour), upcoming (white stop, washed line; on jade, the on-jade-muted line). Hovering or focusing a stop dims everything after it to 30% (200ms, ease-out-expo). The Rute Pengulas draws in once on load, segment by segment (360ms with 50ms stagger, under 600ms total) from an already-visible stub, and not at all under reduced motion. Flows print the next step as an upcoming stop noted "Berikutnya". Empty Ulasan states are the start of the Pengulas line, not an empty box: "Belum ada ulasan", one sentence, then a route whose current stop is writing (or, on a Kampus, picking a Prodi) followed by upcoming Diperiksa and Terbit tanpa nama. Beside the sign-in steps (/masuk, /akun/usia) a jade Rute Pengulas panel (4.5px corners) shows where signing in sits on the line: Cari Prodi-mu passed, Masuk current, the rest upcoming.

### Route Plate (Plat)
A short upper-case code in Barlow Condensed on a solid route colour, 3px corners, three sizes (20 / 28 / 40px). Used for Bidang codes, interchange marks ("Juga di"), the Rute Pengulas "P". Kampus without a logo get a plate monogram on an oklch L 0.45 hue fixed by NPSN.

### Source Ticket (TiketSumber)
Every official figure carries one: a sheet ticket with a faint ring, a plate-type stub ("Sumber", "QS"), a dashed tear line, then the source and its date in muted ink.

### Station Sign (KampusHeader)
The Kampus on the jade field, optionally under a banner image: logo or monogram ringed in white, the name, the place, one timetable line of figures (plate-type Prodi count, akreditasi, Ulasan count or "Belum ada ulasan"), and the QS plate when it applies. Nothing sits in a strip beneath it; the plate tabs follow directly on the ground, then the QS source ticket.

### Bandingkan Bar
A fixed ink bar along the bottom; one station per comparison slot, filled jade when chosen, a hollow ring while free.

### Promosi Poster
The paid placement in a different paper: warm paper, a 2px dashed brown border, a brown "Promosi" plate and a disclosure line. It never borrows route colours, lines or stops.

## Do's and Don'ts

### Do:
- **Do** draw any real sequence (a flow, a Bidang's Jurusan, the site's sections) as a GarisRute with 6px round-capped lines and ink-ringed white stops.
- **Do** keep jade as the only large field: header plate, hero band, station sign, footer.
- **Do** put a source ticket on every official figure, and set figures in Barlow Condensed with tabular numerals.
- **Do** set sections on the bare ground under a 3px ink rule; reach for the sheet only for account, login, report and moderation tools.
- **Do** set result lists as timetable rows with a shared column template: text left, figures right in plate type.
- **Do** check every new line colour against white (4.5:1) and the ground (3:1).
- **Do** keep motion to the stop-lighting hover and the one-time line draw, both off under reduced motion.

### Don't:
- **Don't** bring back the StudyCheck look: blue `#0068ce`, a yellow CTA, Inter, or a grid of same-size white cards under a blue search hero.
- **Don't** use a route line to imply rank, score or distance; order is alphabetical or by count and says so (the home QS board follows QS's published order and says so).
- **Don't** use pink for anything but the Pengulas route and the writing action.
- **Don't** set sentences or headings in Barlow Condensed.
- **Don't** give the Promosi poster route colours, stops or lines, or set it in the organic list unlabelled.
- **Don't** add a dark theme; the use scene is a phone in daylight.
