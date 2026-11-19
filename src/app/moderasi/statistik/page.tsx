import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { kontainer, Panel } from "@/components/panel";
import { formatAngka, formatTanggal } from "@/lib/format";
import { ASAL, LABEL_ASAL, ringkasanKunjungan, type Asal } from "@/lib/kunjungan";
import { hitungTabModerasi } from "@/lib/moderasi-tab";
import { requireModerator } from "@/lib/moderator";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Statistik kunjungan",
  robots: { index: false, follow: false },
};

const RENTANG = [7, 30, 90] as const;

const labelAsal = (asal: string) => ((ASAL as readonly string[]).includes(asal) ? LABEL_ASAL[asal as Asal] : asal);

// A figure with a bar as long as its share of the largest figure in its list.
function Baris({ label, jumlah, maks, href }: { label: React.ReactNode; jumlah: number; maks: number; href?: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-2">
      <span className="min-w-0 truncate text-sm">
        {href ? (
          <Link href={href} prefetch={false} className="underline-offset-4 hover:underline">
            {label}
          </Link>
        ) : (
          label
        )}
      </span>
      <span className="tabular font-plate text-base font-bold">{formatAngka(jumlah)}</span>
      <span aria-hidden className="col-span-2 h-1.5 overflow-hidden rounded-sm bg-secondary">
        <span className="block h-full rounded-sm bg-jade" style={{ width: `${maks > 0 ? (jumlah / maks) * 100 : 0}%` }} />
      </span>
    </li>
  );
}

export default async function StatistikPage(props: PageProps<"/moderasi/statistik">) {
  await requireModerator();
  const sp = await props.searchParams;
  const hari = RENTANG.find((r) => String(r) === param(sp.hari)) ?? 30;
  const [jumlah, r] = await withDb((db) => Promise.all([hitungTabModerasi(db), ringkasanKunjungan(db, hari)]));
  const maks = (daftar: { jumlah: number }[]) => Math.max(0, ...daftar.map((d) => d.jumlah));

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      <div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Statistik kunjungan</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Jumlah halaman dibuka per hari, tanpa data pengunjung: tidak ada alamat IP, cookie, atau pengenal. Satu orang
          yang membuka lima halaman dihitung lima. Pengunjung yang menyalakan Do Not Track tidak dihitung, jadi angka ini
          batas bawah.
        </p>
      </div>
      <TabModerasiNav jumlah={jumlah} aktif="statistik" />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Rentang</span>
        {RENTANG.map((n) => (
          <Link
            key={n}
            href={`/moderasi/statistik?hari=${n}`}
            aria-current={n === hari ? "true" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-sm px-3 font-semibold",
              n === hari ? "bg-foreground text-background" : "bg-card ring-1 ring-foreground/30 hover:bg-secondary",
            )}
          >
            {n} hari
          </Link>
        ))}
        <span className="ml-auto text-muted-foreground">
          Sejak {formatTanggal(r.mulai)}:{" "}
          <span className="tabular font-plate text-xl font-bold text-foreground">{formatAngka(r.total)}</span> halaman dibuka
        </span>
      </div>

      {r.total === 0 ? (
        <Panel lembar>
          <p className="text-sm text-muted-foreground">Belum ada kunjungan yang tercatat pada rentang ini.</p>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel lembar title="Bagian situs">
            <ul className="divide-y divide-border">
              {r.perBagian.map((b) => (
                <Baris key={b.bagian} label={b.bagian} jumlah={b.jumlah} maks={maks(r.perBagian)} />
              ))}
            </ul>
          </Panel>
          <Panel lembar title="Asal kunjungan">
            <ul className="divide-y divide-border">
              {r.perAsal.map((a) => (
                <Baris key={a.asal} label={labelAsal(a.asal)} jumlah={a.jumlah} maks={maks(r.perAsal)} />
              ))}
            </ul>
          </Panel>
          <Panel lembar title="Halaman terbanyak dibuka">
            <ul className="divide-y divide-border">
              {r.teratas.map((h) => (
                <Baris key={h.jalur} label={h.jalur} href={h.jalur} jumlah={h.jumlah} maks={maks(r.teratas)} />
              ))}
            </ul>
          </Panel>
          <Panel lembar title="Per hari">
            <ul className="divide-y divide-border">
              {r.perHari.map((h) => (
                <Baris key={h.tanggal} label={formatTanggal(h.tanggal)} jumlah={h.jumlah} maks={maks(r.perHari)} />
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </div>
  );
}
