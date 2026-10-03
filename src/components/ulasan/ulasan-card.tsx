import Link from "next/link";
import { Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatHari } from "@/lib/format";
import type { UlasanPublik } from "@/lib/katalog";
import { STATUS_PENGULAS } from "@/lib/ulasan/skema";
import { BintangTampil } from "./bintang-tampil";

// One Terbit Ulasan, anonymous: only Status Pengulas and tahun masuk identify
// the writer. Text is rendered as React text (escaped, never HTML or markdown);
// whitespace-pre-line keeps the writer's line breaks.
export function UlasanCard({ ulasan, tampilkanProdi }: { ulasan: UlasanPublik; tampilkanProdi?: boolean }) {
  const status = STATUS_PENGULAS.find((s) => s.nilai === ulasan.statusPengulas)?.label;
  return (
    <article className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <BintangTampil nilai={ulasan.bintang} />
        <h3 className="font-medium">{ulasan.judul}</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        {status}, masuk {ulasan.tahunMasuk} · {formatHari(ulasan.terbitAt)}
        {tampilkanProdi ? (
          <>
            {" · "}
            <Link href={`/prodi/${ulasan.prodiSlug}`} className="text-primary hover:underline">
              {ulasan.prodiNama}
            </Link>
          </>
        ) : null}
      </p>
      <p className="text-sm break-words whitespace-pre-line">{ulasan.isi}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          {ulasan.rekomendasi ? (
            <>
              <ThumbsUp className="size-3.5 text-emerald-600" aria-hidden /> Merekomendasikan Prodi ini
            </>
          ) : (
            <>
              <ThumbsDown className="size-3.5 text-orange-600" aria-hidden /> Tidak merekomendasikan Prodi ini
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
