import { GarisRute } from "@/components/trayek/garis-rute";

// The Ulasan empty state as the start of the Pengulas line: the next stop is
// writing the first Ulasan. On a Kampus page the first stop is picking a
// Prodi, since every Ulasan is about one Prodi (ADR 0001).
export function RuteUlasanPertama({ hrefTulis, dari }: { hrefTulis: string; dari: "prodi" | "kampus" }) {
  return (
    <div>
      <p className="font-bold">Belum ada ulasan</p>
      <p className="mt-1 mb-5 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
        {dari === "prodi"
          ? "Kuliah atau lulus dari Prodi ini? Jadilah yang pertama menulis ulasan."
          : "Ulasan dari mahasiswa dan alumni untuk Prodi di Kampus ini akan muncul di sini."}
      </p>
      <GarisRute
        label="Rute Pengulas"
        className="text-sm"
        halte={[
          dari === "prodi"
            ? {
                label: "Tulis ulasan",
                href: hrefTulis,
                keterangan: "Bintang, enam Aspek, Rekomendasi, dan ceritamu sendiri.",
                keadaan: "kini",
              }
            : {
                label: "Pilih Prodi-mu",
                href: hrefTulis,
                keterangan: "Setiap ulasan tentang satu Prodi di Kampus ini.",
                keadaan: "kini",
              },
          { label: "Diperiksa", keterangan: "Diperiksa otomatis, lalu ditinjau tim kami bila perlu.", keadaan: "nanti" },
          { label: "Terbit tanpa nama", keterangan: "Hanya status dan tahun masuk yang tampil.", keadaan: "nanti" },
        ]}
      />
    </div>
  );
}
