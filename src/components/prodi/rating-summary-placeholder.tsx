import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";

// Aspek from CONTEXT.md, the dimensions every Ulasan will rate.
const ASPEK = ["Kurikulum", "Dosen", "Fasilitas", "Suasana belajar", "Organisasi/administrasi", "Biaya vs kualitas"];

// Where the rating summary (Bintang, Aspek, Tingkat Rekomendasi; frame P) will
// go. Until there are Ulasan it shows no stars, bars or numbers.
export function RatingSummaryPlaceholder() {
  return (
    <Panel title="Ringkasan penilaian">
      <EmptyState icon={MessageSquareText} title="Belum ada ulasan" className="py-4">
        Bintang, nilai per aspek dan tingkat rekomendasi akan muncul setelah ada ulasan dari mahasiswa atau alumni.
      </EmptyState>
      <div className="mt-2 border-t border-border pt-4">
        <p className="mb-2 text-sm font-medium">Yang akan dinilai</p>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
          {ASPEK.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
