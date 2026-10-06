import { Panel } from "@/components/panel";

// Aspek from CONTEXT.md, the dimensions every Ulasan will rate.
const ASPEK = ["Kurikulum", "Dosen", "Fasilitas", "Suasana belajar", "Organisasi/administrasi", "Biaya vs kualitas"];

// Where the rating summary (Bintang, Aspek, Tingkat Rekomendasi) will go. Until
// there are Ulasan it shows no stars, bars or numbers: the six Aspek as
// timetable rows with no value yet. The page's one empty state is the Ulasan
// route.
export function RatingSummaryPlaceholder() {
  return (
    <Panel title="Ringkasan penilaian">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Bintang, nilai per aspek dan tingkat rekomendasi akan muncul setelah ada ulasan dari mahasiswa atau alumni.
      </p>
      <dl className="mt-3 divide-y divide-border text-sm">
        {ASPEK.map((a) => (
          <div key={a} className="flex items-baseline justify-between gap-4 py-2">
            <dt className="font-semibold">{a}</dt>
            <dd className="text-muted-foreground">
              <span aria-hidden>–</span>
              <span className="sr-only">belum dinilai</span>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
