import Link from "next/link";
import { BintangTampil } from "@/components/ulasan/bintang-tampil";
import { formatAngka, formatHari } from "@/lib/format";
import type { listProdiTerbanyakUlasan, listUlasanTerbaru } from "@/lib/katalog";
import { STATUS_PENGULAS } from "@/lib/ulasan/skema";

type UlasanBaru = Awaited<ReturnType<typeof listUlasanTerbaru>>[number];
type ProdiRamai = Awaited<ReturnType<typeof listProdiTerbanyakUlasan>>[number];

// The newest stories on the home page: the first lines of each, leading to the
// Prodi page where the whole Ulasan is. Anonymous, as everywhere.
export function UlasanTerbaru({ ulasan }: { ulasan: UlasanBaru[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {ulasan.map((u) => (
        <li key={u.id} className="flex flex-col rounded-md bg-card p-5 ring-1 ring-foreground/10">
          <BintangTampil nilai={u.bintang} />
          <h3 className="mt-2 leading-snug font-bold">{u.judul}</h3>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed break-words text-foreground/85">{u.isi}</p>
          <p className="mt-auto pt-4 text-sm">
            <Link
              href={`/prodi/${u.prodiSlug}#ulasan`}
              prefetch={false}
              className="font-semibold text-jade decoration-2 underline-offset-4 hover:underline"
            >
              {u.prodiNama}
            </Link>
            <span className="block text-muted-foreground">{u.kampusNama}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {STATUS_PENGULAS.find((s) => s.nilai === u.statusPengulas)?.label}, masuk {u.tahunMasuk} · {formatHari(u.terbitAt)}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

// Where there is the most to read. In order of the number of Ulasan only.
export function ProdiRamaiUlasan({ prodi }: { prodi: ProdiRamai[] }) {
  return (
    <ul className="grid gap-x-8 sm:grid-cols-2">
      {prodi.map((p) => (
        <li key={p.slug} className="border-b border-border">
          <Link href={`/prodi/${p.slug}`} prefetch={false} className="group flex items-center justify-between gap-3 px-1 py-2.5">
            <span className="min-w-0">
              <span className="block truncate font-semibold decoration-jade decoration-2 underline-offset-4 group-hover:underline">
                {p.jenjang} {p.nama}
              </span>
              <span className="block truncate text-sm text-muted-foreground">{p.kampusNama}</span>
            </span>
            <span className="tabular shrink-0 text-sm text-muted-foreground">
              <span className="font-plate text-lg font-bold text-foreground">{formatAngka(p.jumlahUlasan)}</span> ulasan
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
