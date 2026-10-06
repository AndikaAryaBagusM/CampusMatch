import Link from "next/link";
import { BadgeCheck, Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatBulan, formatHari } from "@/lib/format";
import type { UlasanPublik } from "@/lib/katalog";
import { STATUS_PENGULAS } from "@/lib/ulasan/skema";
import { BintangTampil } from "./bintang-tampil";

// One Terbit Ulasan, anonymous: only Status Pengulas and tahun masuk identify
// the writer, plus the Terverifikasi badge and its month. Text is rendered as React text (escaped, never HTML or markdown);
// whitespace-pre-line keeps the writer's line breaks.
export function UlasanCard({ ulasan, tampilkanProdi }: { ulasan: UlasanPublik; tampilkanProdi?: boolean }) {
  const status = STATUS_PENGULAS.find((s) => s.nilai === ulasan.statusPengulas)?.label;
  return (
    <article className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <BintangTampil nilai={ulasan.bintang} />
        <h3 className="text-lg leading-snug font-bold">{ulasan.judul}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {status}, masuk {ulasan.tahunMasuk}
        {ulasan.terverifikasiSejak ? (
          <span
            className="ml-1.5 inline-flex items-center gap-1 rounded-sm bg-jade px-1.5 py-0.5 text-xs font-bold text-on-jade"
            title={`Terverifikasi email kampus, ${formatBulan(ulasan.terverifikasiSejak)}`}
          >
            <BadgeCheck className="size-3.5" aria-hidden />
            Terverifikasi
            <span className="sr-only">email kampus, {formatBulan(ulasan.terverifikasiSejak)}</span>
          </span>
        ) : null}{" "}
        · {formatHari(ulasan.terbitAt)}
        {tampilkanProdi ? (
          <>
            {" · "}
            <Link href={`/prodi/${ulasan.prodiSlug}`} className="font-semibold text-jade underline-offset-4 hover:underline">
              {ulasan.prodiNama}
            </Link>
          </>
        ) : null}
      </p>
      <p className="max-w-[68ch] leading-relaxed break-words whitespace-pre-line">{ulasan.isi}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          {ulasan.rekomendasi ? (
            <>
              <ThumbsUp className="size-4 text-success" aria-hidden /> Merekomendasikan Prodi ini
            </>
          ) : (
            <>
              <ThumbsDown className="size-4 text-warning" aria-hidden /> Tidak merekomendasikan Prodi ini
            </>
          )}
        </span>
        {/* A plain link: the target asks for login, so this page stays static. */}
        <Link
          href={`/ulasan/${ulasan.id}/laporkan`}
          prefetch={false}
          rel="nofollow"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive hover:underline"
        >
          <Flag className="size-3.5" aria-hidden />
          Laporkan
        </Link>
      </div>
    </article>
  );
}

export function DaftarUlasan({ ulasan, tampilkanProdi }: { ulasan: UlasanPublik[]; tampilkanProdi?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {ulasan.map((u) => (
        <li key={u.id} className="py-5 first:pt-0 last:pb-0">
          <UlasanCard ulasan={u} tampilkanProdi={tampilkanProdi} />
        </li>
      ))}
    </ul>
  );
}
