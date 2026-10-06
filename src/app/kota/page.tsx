import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { KatalogAsOf } from "@/components/katalog-as-of";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer } from "@/components/panel";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { getInfoKatalog } from "@/lib/katalog";
import { listKotaPerProvinsi, namaKota } from "@/lib/kota";

// The catalogue changes only with an import; cache for a day like the other
// catalogue pages.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Kampus per Kota",
  description: "Cari Kampus di Indonesia menurut Kota dan Provinsi.",
  alternates: { canonical: "/kota" },
};

export default async function KotaIndexPage() {
  const [provinsi, info] = await withDb((db) => Promise.all([listKotaPerProvinsi(db), getInfoKatalog(db)]));
  const jumlahKota = provinsi.reduce((s, p) => s + p.kota.length, 0);

  return (
    <div className={kontainer}>
      <PageBreadcrumb items={[{ label: "Kota" }]} />
      <div className="space-y-2">
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">Kampus per Kota</h1>
        <p className="text-muted-foreground">
          {formatAngka(jumlahKota)} Kota di {formatAngka(provinsi.length)} Provinsi. Pilih Kota untuk melihat semua
          Kampus di sana.
        </p>
      </div>

      <nav aria-label="Provinsi" className="mt-6 border-t-[3px] border-foreground pt-4">
        <ul className="flex flex-wrap gap-2">
          {provinsi.map((p) => (
            <li key={p.slug}>
              <a
                href={`#provinsi-${p.slug}`}
                className="inline-flex h-8 items-center rounded-sm bg-secondary px-3 text-sm hover:underline"
              >
                {formatProvinsi(p.provinsi)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-8">
        {provinsi.map((p) => (
          <section key={p.slug} id={`provinsi-${p.slug}`} className="scroll-mt-24" aria-labelledby={`judul-${p.slug}`}>
            <h2 id={`judul-${p.slug}`} className="text-lg font-semibold">
              {formatProvinsi(p.provinsi)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">{formatAngka(p.jumlahKampus)} Kampus</span>
            </h2>
            <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {p.kota.map((k) => (
                <li key={k.slug}>
                  <Link href={`/kota/${k.slug}`} className="flex justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-card">
                    <span className="text-primary hover:underline">{namaKota(k)}</span>
                    <span className="shrink-0 text-muted-foreground">{formatAngka(k.jumlahKampus)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <KatalogAsOf info={info} className="mt-8 px-1" />
    </div>
  );
}
