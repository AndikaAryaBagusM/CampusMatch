import { MapPin } from "lucide-react";
import { AkreditasiBadge, labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { UnggulanBadge, UnggulanFootnote } from "@/components/kampus/unggulan-badge";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { TabNav } from "@/components/tab-nav";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { getKampusMedia } from "@/lib/kampus-media";
import type { InfoKatalog, Jenjang, KampusDetail } from "@/lib/katalog";
import { namaKota } from "@/lib/kota";
import { cn } from "@/lib/utils";

export type KampusTab = "ringkasan" | "prodi" | "ulasan";

// Text-and-data header in place of the design's photo mosaic (frames F/O): name,
// place, badges, data tiles, then the tabs.
export function KampusHeader({
  kampus,
  prodiPerJenjang,
  jumlahUlasan,
  info,
  tab,
}: {
  kampus: KampusDetail;
  prodiPerJenjang: { jenjang: Jenjang; jumlah: number }[];
  jumlahUlasan: number;
  info: InfoKatalog | null;
  tab: KampusTab;
}) {
  const jumlahProdi = prodiPerJenjang.reduce((s, j) => s + j.jumlah, 0);
  const { bannerUrl } = getKampusMedia(kampus);
  const base = `/kampus/${kampus.slug}`;

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: "Kota", href: "/kota" },
          { label: namaKota({ nama: kampus.kotaNama, provinsi: kampus.provinsi }), href: `/kota/${kampus.kotaSlug}` },
          { label: kampus.nama },
        ]}
      />
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-border">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- banners will come from varied origins
          <img src={bannerUrl} alt="" className="h-40 w-full object-cover sm:h-56" />
        ) : null}
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <KampusLogo kampus={kampus} size="lg" />
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{kampus.nama}</h1>
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {kampus.bentuk} · {kampus.kotaNama}, {formatProvinsi(kampus.provinsi)}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <AkreditasiBadge akreditasi={kampus.akreditasi} />
                {kampus.unggulan ? <UnggulanBadge /> : null}
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-2 text-white lg:w-[26rem] lg:shrink-0">
            <Tile>
              <span className="text-2xl font-semibold">{formatAngka(jumlahProdi)}</span>
              <span className="text-xs">Prodi</span>
            </Tile>
            <Tile>
              <span className={cn("font-semibold", kampus.akreditasi ? "text-lg" : "text-xs")}>
                {kampus.akreditasi ?? labelAkreditasi(null)}
              </span>
              {kampus.akreditasi ? <span className="text-xs">Akreditasi Kampus</span> : null}
            </Tile>
            <Tile>
              <span className="text-xs font-medium">{jumlahUlasan === 0 ? "Belum ada ulasan" : `${formatAngka(jumlahUlasan)} ulasan`}</span>
            </Tile>
          </ul>
        </div>
        <div className="border-t border-border px-1 sm:px-4">
          <TabNav
            label={`Bagian halaman ${kampus.nama}`}
            tabs={[
              { href: base, label: "Ringkasan", active: tab === "ringkasan" },
              { href: `${base}/prodi`, label: `Prodi (${formatAngka(jumlahProdi)})`, active: tab === "prodi" },
              { href: `${base}/ulasan`, label: `Ulasan (${formatAngka(jumlahUlasan)})`, active: tab === "ulasan" },
            ]}
          />
        </div>
      </div>
      {kampus.unggulan ? <UnggulanFootnote info={info} className="mt-3 px-1" /> : null}
    </>
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex min-h-24 flex-col items-center justify-center gap-0.5 rounded-lg bg-gradient-to-br from-primary to-brand-deep p-2 text-center leading-tight">
      {children}
    </li>
  );
}
