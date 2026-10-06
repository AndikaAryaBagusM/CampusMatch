import Link from "next/link";
import { formatAngka } from "@/lib/format";
import type { Jenjang } from "@/lib/katalog";

export type ProdiBaris = {
  id: number;
  nama: string;
  slug: string;
  jenjang: Jenjang;
  jurusanNama: string | null;
  jurusanSlug: string | null;
  jumlahUlasan: number;
};

// The design's programme table (frame O), grouped by Jenjang. On phones each
// row stacks (mobile frames). The rating columns are replaced by the Ulasan
// status, since no ratings exist yet.
export function ProdiTable({ rows }: { rows: ProdiBaris[] }) {
  const groups: { jenjang: Jenjang; rows: ProdiBaris[] }[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last?.jenjang === r.jenjang) last.rows.push(r);
    else groups.push({ jenjang: r.jenjang, rows: [r] });
  }

  return (
    <div className="border-t-[3px] border-foreground">
      <div
        aria-hidden
        className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_8rem] gap-4 border-b-2 border-foreground px-5 py-3 font-plate text-sm font-semibold tracking-wide text-muted-foreground uppercase md:grid"
      >
        <span>Prodi</span>
        <span>Jurusan</span>
        <span>Ulasan</span>
      </div>
      {groups.map((g) => (
        <section key={g.jenjang} aria-label={`Prodi ${g.jenjang}`}>
          <h3 className="flex items-center gap-2 bg-muted px-5 py-2 text-sm font-bold">
            <span className="inline-flex h-5 items-center rounded-sm bg-foreground px-1.5 font-plate text-xs font-bold tracking-wide text-background">
              {g.jenjang}
            </span>
            {g.rows.length} Prodi
          </h3>
          <ul className="divide-y divide-border">
            {g.rows.map((p) => (
              <li
                key={p.id}
                className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_8rem] md:items-center md:gap-4"
              >
                <Link href={`/prodi/${p.slug}`} className="font-semibold text-foreground decoration-jade decoration-2 underline-offset-4 hover:underline">
                  {p.jenjang} {p.nama}
                </Link>
                <span className="text-muted-foreground md:text-foreground/90">
                  <span className="md:hidden">Jurusan: </span>
                  {p.jurusanSlug ? (
                    <Link href={`/jurusan/${p.jurusanSlug}`} className="underline-offset-4 hover:text-jade hover:underline">
                      {p.jurusanNama}
                    </Link>
                  ) : (
                    <span className="italic">Belum dipetakan</span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {p.jumlahUlasan === 0 ? "Belum ada ulasan" : `${formatAngka(p.jumlahUlasan)} ulasan`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
