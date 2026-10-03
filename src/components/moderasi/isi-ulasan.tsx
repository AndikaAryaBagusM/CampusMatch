import type { TingkatRisiko } from "@/lib/ulasan/status";

export const LABEL_RISIKO: Record<TingkatRisiko, { teks: string; kelas: string }> = {
  rendah: { teks: "Rendah", kelas: "bg-emerald-100 text-emerald-900" },
  perlu_dicek: { teks: "Perlu dicek", kelas: "bg-amber-100 text-amber-900" },
  melanggar: { teks: "Melanggar", kelas: "bg-destructive/10 text-destructive" },
};

// One revision's text, as a Moderator reads it.
export function IsiUlasan({ judul, isi, bintang, rekomendasi }: { judul: string; isi: string; bintang: number; rekomendasi?: boolean }) {
  return (
    <div className="mt-3 rounded-lg bg-muted/50 p-3">
      <p className="font-medium">“{judul}”</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {bintang}/5 bintang{rekomendasi === undefined ? "" : rekomendasi ? " · merekomendasikan" : " · tidak merekomendasikan"}
      </p>
      <p className="mt-2 text-sm whitespace-pre-line">{isi}</p>
    </div>
  );
}
