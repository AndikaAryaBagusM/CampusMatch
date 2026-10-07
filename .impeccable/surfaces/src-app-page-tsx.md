---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/layout.tsx"]
---

## Scope

Home (`src/app/page.tsx`) sets the visual world for the whole site. Mode: Persuade on home; every other route is Operate/Read inside the same world. Primary audience for design decisions: Pengulas (mahasiswa/alumni, 18+). Readers (SMA/SMK, parents) are secondary. There are 0 Ulasan today, so every surface must look complete with empty states, and no ratings, counts or testimonials may be invented.

## Direction contract

THESIS: Every path through CampusMatch is a route with named stops: Bidang → Jurusan → Prodi for readers, and Cari Prodi-mu → Masuk → Tulis → Diperiksa → Terbit for Pengulas. It refuses the category default of a blue search hero over a grid of same-size white cards.

OWN-WORLD: Indonesian transit signage (angkot route plates, KRL/TransJakarta line maps). The ground is enamel green-grey `#e7ede9`, with ink `#13201a`. Jade `#0b6b4e` is the committed field: header plate, hero band and footer. Pink `#c42f73` is the Pengulas line and the writing action. Each Bidang is a line colour. The lines are 6px with round caps, the stops are white dots ringed in ink, and the plates are rectangles with 6px radius. Overpass carries all text, and Barlow Condensed is used for route codes and figures. Facts are ruled timetable rows with tabular figures, every official figure carries a source ticket, and the QS World University Rankings list is a departure board in QS's own order.

STORY: A mahasiswa sees in one glance that writing an Ulasan is a short, checked, anonymous route, and starts by finding their Prodi. A reader sees that the search and Bidang lines lead to real Prodi with sourced facts, and that no ranking or promotion bends the route.

FIRST VIEWPORT: Desktop 1440. Header: the jade route-plate wordmark, the nav, a small search and Akun. Below it, a full-bleed jade band about 560px tall. On the left (7 columns): the headline in Overpass 800 at about 56px, white; the real Prodi and Kampus counts; the working search (white input, ink "Cari" plate) as stop 1; and the Bidang route-code chips. On the right (5 columns): the Rute Pengulas, a vertical pink line with 5 stops and the first stop linked to the search. A vertical rail from the hero runs down into the Bidang map. Mobile 390: the headline, then the search, then the vertical Rute Pengulas.

FORM: Peta Trayek, the candidate assigned from position 7 of my resonance-ordered list. Seed key 311ca1af.
Raises: one continuous route line rules the home layout (from Curved Crease Shell). Every official figure carries a source ticket (from Moon-Shadow Bazaar). Ulasan states print as stops on the line, not as pills (from Phosphor Terminal). Each flow announces "Berikutnya: …" (from Algorave Floor). A Prodi chosen for Bandingkan fills its station marker (from Kinetic Sand Glyphs).
Signature interaction: hovering or focusing a stop lights the route up to that stop. Motion grammar: the line draws once on load from an already-visible default (ease-out, at most 600ms), and is off under prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- New copy introduced by the route (stop labels, "Rute Pengulas", "Berikutnya") is reported to the user for approval.
- `design/StudyCheckClone.png` is untracked; ask before deleting it.
