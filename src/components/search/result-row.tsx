import Link from "next/link";
import { BookOpen } from "lucide-react";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge } from "@/components/kampus/unggulan-badge";
import { BarisJadwal, KepalaJadwal, Sel, SelJadwal } from "@/components/trayek/jadwal";
import { Plat } from "@/components/trayek/plat";
import { formatAngka } from "@/lib/format";
import type { SearchResults } from "@/lib/search";

// Search results as timetable rows: the destination, then fixed columns of
// facts under column heads. Stars are left out.

const tautan = "font-bold decoration-jade decoration-2 underline-offset-4 hover:underline";

const KOLOM_JURUSAN = "minmax(0,1fr) 8rem";
const KOLOM_KAMPUS = "minmax(0,1fr) 12rem 12rem";
// The Kampus column sits right after the name: it is what tells same-named Prodi apart.
const KOLOM_PRODI = "minmax(0,26rem) minmax(0,1fr)";

export function KepalaJurusan() {
  return <KepalaJadwal tipis kolom={KOLOM_JURUSAN} judul={["Jurusan", "Prodi"]} kanan={[1]} />;
}
export function KepalaKampus() {
  return <KepalaJadwal tipis kolom={KOLOM_KAMPUS} judul={["Kampus", "Kota", "Akreditasi"]} />;
}
export function KepalaProdi() {
  return <KepalaJadwal tipis kolom={KOLOM_PRODI} judul={["Prodi", "Kampus"]} />;
}

export function JurusanResult({ j }: { j: SearchResults["jurusan"][number] }) {
  return (
    <BarisJadwal kolom={KOLOM_JURUSAN}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm bg-jade text-on-jade">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <Link href={`/jurusan/${j.slug}`} className={tautan}>
            {j.nama}
          </Link>
          <p className="text-sm text-muted-foreground">Jurusan</p>
        </div>
      </div>
      <SelJadwal>
        <Sel label="Prodi" angka>
          {formatAngka(j.jumlahProdi)}
        </Sel>
      </SelJadwal>
    </BarisJadwal>
  );
}

export function KampusResult({ k }: { k: SearchResults["kampus"][number] }) {
  return (
    <BarisJadwal kolom={KOLOM_KAMPUS}>
      <div className="flex min-w-0 items-center gap-3">
        <KampusLogo kampus={k} size="sm" />
        <div className="min-w-0">
          <Link href={`/kampus/${k.slug}`} className={tautan}>
            {k.nama}
          </Link>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {k.bentuk}
            {k.unggulan ? <UnggulanBadge className="h-5" /> : null}
          </p>
        </div>
      </div>
      <SelJadwal>
        <Sel label="Kota">{k.kotaNama}</Sel>
        <Sel label="Akreditasi">{labelAkreditasi(k.akreditasi)}</Sel>
      </SelJadwal>
    </BarisJadwal>
  );
}

export function ProdiResult({ p }: { p: SearchResults["prodi"][number] }) {
  return (
    <BarisJadwal kolom={KOLOM_PRODI}>
      <div className="flex min-w-0 items-center gap-3">
        <KampusLogo kampus={{ npsn: p.kampusNpsn, nama: p.kampusNama }} size="sm" />
        <div className="min-w-0">
          <Link href={`/prodi/${p.slug}`} className={`flex flex-wrap items-center gap-x-2 ${tautan}`}>
            <Plat warna="var(--foreground)" ukuran="sm">
              {p.jenjang}
            </Plat>
            {p.nama}
          </Link>
          {p.unggulan ? <UnggulanBadge className="mt-1.5 h-5" /> : null}
        </div>
      </div>
      <SelJadwal>
        <Sel label="Kampus">
          <Link href={`/kampus/${p.kampusSlug}`} className="underline-offset-4 hover:underline">
            {p.kampusNama}
          </Link>
        </Sel>
      </SelJadwal>
    </BarisJadwal>
  );
}
