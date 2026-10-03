import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AkreditasiBadge } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge } from "@/components/kampus/unggulan-badge";
import { formatAngka } from "@/lib/format";
import type { SearchResults } from "@/lib/search";

// Result rows after the design's programme list (frame V and its mobile
// version): logo, name, context line, badges. Stars are left out.

const baris = "flex gap-4 p-4 sm:p-5";

export function JurusanResult({ j }: { j: SearchResults["jurusan"][number] }) {
  return (
    <li className={baris}>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <BookOpen className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <Link href={`/jurusan/${j.slug}`} className="font-medium text-primary hover:underline">
          {j.nama}
        </Link>
        <p className="text-sm text-muted-foreground">Jurusan · {formatAngka(j.jumlahProdi)} Prodi</p>
      </div>
    </li>
  );
}

export function KampusResult({ k }: { k: SearchResults["kampus"][number] }) {
  return (
    <li className={baris}>
      <KampusLogo kampus={k} size="sm" />
      <div className="min-w-0 space-y-2">
        <div>
          <Link href={`/kampus/${k.slug}`} className="font-medium text-primary hover:underline">
            {k.nama}
          </Link>
          <p className="text-sm text-muted-foreground">
            {k.bentuk} · {k.kotaNama}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AkreditasiBadge akreditasi={k.akreditasi} />
          {k.unggulan ? <UnggulanBadge /> : null}
        </div>
      </div>
    </li>
  );
}

export function ProdiResult({ p }: { p: SearchResults["prodi"][number] }) {
  return (
    <li className={baris}>
      <KampusLogo kampus={{ npsn: p.kampusNpsn, nama: p.kampusNama }} size="sm" />
      <div className="min-w-0 space-y-1">
        <Link href={`/prodi/${p.slug}`} className="font-medium text-primary hover:underline">
          {p.jenjang} {p.nama}
        </Link>
        <p className="text-sm text-muted-foreground">
          <Link href={`/kampus/${p.kampusSlug}`} className="hover:text-foreground hover:underline">
            {p.kampusNama}
          </Link>
        </p>
        {p.unggulan ? <UnggulanBadge /> : null}
      </div>
    </li>
  );
}
