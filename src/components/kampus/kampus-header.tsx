import { MapPin } from "lucide-react";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { KampusLogo } from "@/components/kampus/kampus-logo";
import { PeringkatQsBadge, QsFootnote } from "@/components/kampus/peringkat-qs";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { TabNav } from "@/components/tab-nav";
import { formatAngka, formatProvinsi } from "@/lib/format";
import { getKampusMedia } from "@/lib/kampus-media";
import type { Jenjang, KampusDetail } from "@/lib/katalog";
import type { InfoQs } from "@/lib/peringkat-qs/kueri";
import { namaKota } from "@/lib/kota";

export type KampusTab = "ringkasan" | "prodi" | "ulasan";

// The Kampus as a station sign: the name on the jade field with one timetable
// line of its figures, then the tabs as platform signs on the ground.
export function KampusHeader({
  kampus,
  prodiPerJenjang,
  jumlahUlasan,
  qs,
  tab,
}: {
  kampus: KampusDetail;
  prodiPerJenjang: { jenjang: Jenjang; jumlah: number }[];
  jumlahUlasan: number;
  qs: InfoQs | null;
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
      <div className="overflow-hidden rounded-md">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- banners will come from varied origins
          <img src={bannerUrl} alt="" className="h-40 w-full object-cover sm:h-56" />
        ) : null}
        <div className="flex min-w-0 gap-4 bg-jade p-5 text-on-jade sm:p-6">
          <KampusLogo kampus={kampus} size="lg" className="ring-2 ring-on-jade" />
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">{kampus.nama}</h1>
            <p className="flex items-start gap-1.5 text-sm text-on-jade-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {kampus.bentuk} · {kampus.kotaNama}, {formatProvinsi(kampus.provinsi)}
              </span>
            </p>
            <p className="tabular flex flex-wrap items-baseline gap-x-2 pt-1 text-sm text-on-jade-muted">
              <span>
                <span className="font-plate text-xl font-bold text-on-jade">{formatAngka(jumlahProdi)}</span> Prodi
              </span>
              <span aria-hidden>·</span>
              <span>{labelAkreditasi(kampus.akreditasi)}</span>
              <span aria-hidden>·</span>
              <span>{jumlahUlasan === 0 ? "Belum ada ulasan" : `${formatAngka(jumlahUlasan)} ulasan`}</span>
            </p>
            {kampus.peringkatQs && qs ? <PeringkatQsBadge peringkat={kampus.peringkatQs} edisi={qs.edisi} className="mt-1" /> : null}
          </div>
        </div>
      </div>
      <div>
        <TabNav
            label={`Bagian halaman ${kampus.nama}`}
            tabs={[
              { href: base, label: "Ringkasan", active: tab === "ringkasan" },
              { href: `${base}/prodi`, label: `Prodi (${formatAngka(jumlahProdi)})`, active: tab === "prodi" },
              { href: `${base}/ulasan`, label: `Ulasan (${formatAngka(jumlahUlasan)})`, active: tab === "ulasan" },
            ]}
          />
      </div>
      {kampus.peringkatQs ? <QsFootnote qs={qs} /> : null}
    </>
  );
}
