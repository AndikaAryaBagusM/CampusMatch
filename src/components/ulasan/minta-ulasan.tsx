import { TautanWhatsApp } from "@/components/bagikan/tautan-whatsapp";
import { TombolSalin } from "@/components/bagikan/tombol-salin";
import { urlSitus } from "@/lib/situs";
import { cn } from "@/lib/utils";

// The message a reader sends to someone they know at this Prodi. It leads to
// the Ulasan form, and says what the kakak kelas most needs to hear first:
// it is short and it is published without their name.
export function pesanMintaUlasan({ namaProdi, kampusNama, prodiSlug }: { namaProdi: string; kampusNama: string; prodiSlug: string }) {
  return `Kak, aku lagi cari info kuliah di ${namaProdi}, ${kampusNama}. Boleh minta ceritain pengalaman kakak di CampusMatch? Cuma beberapa menit dan tampil tanpa nama: ${urlSitus(`/prodi/${prodiSlug}/tulis`)}`;
}

// For readers, most of whom can't write an Ulasan themselves: ask a kakak
// kelas who studies here (decisions.md 17s). Nothing is sent through
// CampusMatch; the reader's own WhatsApp carries the message.
export function MintaUlasan({
  namaProdi,
  kampusNama,
  prodiSlug,
  adaUlasan,
  className,
}: {
  namaProdi: string;
  kampusNama: string;
  prodiSlug: string;
  adaUlasan: boolean;
  className?: string;
}) {
  const pesan = pesanMintaUlasan({ namaProdi, kampusNama, prodiSlug });
  return (
    <section aria-labelledby="minta-ulasan-judul" className={cn("rounded-md bg-jade-tint p-5 ring-1 ring-jade/30", className)}>
      <h2 id="minta-ulasan-judul" className="font-bold">
        Kenal yang kuliah di sini?
      </h2>
      <p className="mt-1 text-sm leading-relaxed">
        {adaUlasan
          ? "Makin banyak cerita, makin jelas gambarannya. Minta kakak kelas atau kenalanmu di Prodi ini ikut menulis."
          : "Belum ada yang bercerita tentang Prodi ini. Minta kakak kelas atau kenalanmu di sini menulis ulasan pertama."}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <TautanWhatsApp pesan={pesan} utama>
          Minta lewat WhatsApp
        </TautanWhatsApp>
        <TombolSalin teks={pesan} label="Salin pesan" />
      </div>
    </section>
  );
}
