import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { IsiUlasan, LABEL_RISIKO } from "@/components/moderasi/isi-ulasan";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { kontainer, Panel } from "@/components/panel";
import { hitungTabModerasi } from "@/lib/moderasi-tab";
import { formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { LABEL_ALASAN_LAPORAN } from "@/lib/ulasan/laporan";
import { listAntrean, listLaporanTerbuka, listMenunggu } from "@/lib/ulasan/moderasi";
import { MAKS_PUTARAN_SCREENING } from "@/lib/ulasan/status";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { setujui, tolak, turunkan, tutup } from "./actions";

export const metadata: Metadata = {
  title: "Antrean Moderasi",
  robots: { index: false, follow: false },
};

type Tab = "antrean" | "laporan" | "menunggu";
const TABS: Tab[] = ["antrean", "laporan", "menunggu"];


export default async function ModerasiPage(props: PageProps<"/moderasi">) {
  await requireModerator();
  const sp = await props.searchParams;
  const tab: Tab = TABS.includes(param(sp.tab) as Tab) ? (param(sp.tab) as Tab) : "antrean";
  const pesan = param(sp.pesan);
  const kembali = `/moderasi?tab=${tab}`;

  const [jumlah, antrean, laporan, menunggu] = await withDb((db) =>
    Promise.all([
      hitungTabModerasi(db),
      tab === "antrean" ? listAntrean(db) : null,
      tab === "laporan" ? listLaporanTerbuka(db) : null,
      tab === "menunggu" ? listMenunggu(db) : null,
    ]),
  );

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Antrean Moderasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ulasan yang tertahan oleh Screening dan ulasan yang dilaporkan.
        </p>
      </div>
      {pesan ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {pesan}
        </p>
      ) : null}

      <TabModerasiNav jumlah={jumlah} aktif={tab} />

      {antrean ? (
        antrean.length === 0 ? (
          <Kosong />
        ) : (
          antrean.map((r) => (
            <Panel key={r.revisiId}>
              <Kepala prodiNama={r.prodiNama} prodiSlug={r.prodiSlug} kampusNama={r.kampusNama} ulasanId={r.ulasanId} />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {r.tingkatRisiko ? (
                  <span className={cn("rounded-full px-2.5 py-0.5 font-medium", LABEL_RISIKO[r.tingkatRisiko].kelas)}>
                    {LABEL_RISIKO[r.tingkatRisiko].teks}
                  </span>
                ) : (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium">
                    Screening gagal {r.percobaan}× ({MAKS_PUTARAN_SCREENING} putaran)
                  </span>
                )}
                <span className="text-muted-foreground">
                  {r.modelScreening ?? "tanpa model"} · {r.discreeningAt ? formatWaktu(r.discreeningAt) : formatWaktu(r.createdAt)}
                </span>
                {r.nomor > 1 ? (
                  <span className="text-muted-foreground">
                    Revisi ke-{r.nomor}
                    {r.adaVersiTerbit ? ", versi lama masih tampil" : ""}
                  </span>
                ) : null}
              </div>
              {r.alasanScreening ? <p className="mt-2 text-sm">Alasan Screening: {r.alasanScreening}</p> : null}
              <IsiUlasan judul={r.judul} isi={r.isi} bintang={r.bintang} rekomendasi={r.rekomendasi} />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <form action={setujui}>
                  <input type="hidden" name="revisiId" value={r.revisiId} />
                  <input type="hidden" name="kembali" value={kembali} />
                  <button type="submit" className="h-9 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700">
                    Setujui
                  </button>
                </form>
                <FormAlasan action={tolak} idNama="revisiId" id={r.revisiId} kembali={kembali} tombol="Tolak" wajib />
              </div>
            </Panel>
          ))
        )
      ) : null}

      {laporan ? (
        laporan.length === 0 ? (
          <Kosong />
        ) : (
          laporan.map((l) => (
            <Panel key={l.laporanId}>
              <Kepala prodiNama={l.prodiNama} prodiSlug={l.prodiSlug} kampusNama={l.kampusNama} ulasanId={l.ulasanId} />
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
                <p className="font-medium">{LABEL_ALASAN_LAPORAN[l.alasan]}</p>
                {l.catatan ? <p className="mt-1 whitespace-pre-line">{l.catatan}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">Dilaporkan {formatWaktu(l.createdAt)}</p>
              </div>
              {l.masihTerbit && l.judul && l.isi && l.bintang ? (
                <IsiUlasan judul={l.judul} isi={l.isi} bintang={l.bintang} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Ulasan ini sudah tidak tampil.</p>
              )}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                <FormAlasan action={tutup} idNama="laporanId" id={l.laporanId} kembali={kembali} tombol="Tutup laporan" />
                {l.masihTerbit ? (
                  <FormAlasan action={turunkan} idNama="laporanId" id={l.laporanId} kembali={kembali} tombol="Turunkan" wajib />
                ) : null}
              </div>
            </Panel>
          ))
        )
      ) : null}

      {menunggu ? (
        menunggu.length === 0 ? (
          <Kosong />
        ) : (
          <Panel>
            <p className="mb-3 text-sm text-muted-foreground">
              Belum lolos Screening. Cron mencoba lagi; setelah {MAKS_PUTARAN_SCREENING} putaran gagal, ulasan masuk tab
              Ditinjau.
            </p>
            <ul className="divide-y divide-border">
              {menunggu.map((m) => (
                <li key={m.revisiId} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <Link href={`/moderasi/ulasan/${m.ulasanId}`} className="font-medium hover:underline">
                    “{m.judul}”
                  </Link>
                  <span className="text-muted-foreground">
                    {m.prodiNama}, {m.kampusNama} · {m.percobaan} putaran gagal · {formatWaktu(m.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )
      ) : null}
    </div>
  );
}

function Kosong() {
  return (
    <Panel>
      <EmptyState icon={Inbox} title="Tidak ada yang perlu diperiksa" />
    </Panel>
  );
}

function Kepala({ prodiNama, prodiSlug, kampusNama, ulasanId }: { prodiNama: string; prodiSlug: string; kampusNama: string; ulasanId: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-sm">
        <Link href={`/prodi/${prodiSlug}`} className="font-medium hover:underline">
          {prodiNama}
        </Link>
        <span className="text-muted-foreground">, {kampusNama}</span>
      </p>
      <Link href={`/moderasi/ulasan/${ulasanId}`} className="text-sm font-medium text-primary hover:underline">
        Riwayat
      </Link>
    </div>
  );
}


function FormAlasan({
  action,
  idNama,
  id,
  kembali,
  tombol,
  wajib,
}: {
  action: (formData: FormData) => Promise<void>;
  idNama: string;
  id: string;
  kembali: string;
  tombol: string;
  wajib?: boolean;
}) {
  return (
    <form action={action} className="flex flex-1 flex-col gap-2 sm:flex-row">
      <input type="hidden" name={idNama} value={id} />
      <input type="hidden" name="kembali" value={kembali} />
      <label className="sr-only" htmlFor={`alasan-${tombol}-${id}`}>
        Alasan {tombol.toLowerCase()}
      </label>
      <input
        id={`alasan-${tombol}-${id}`}
        name="alasan"
        required={wajib}
        maxLength={1000}
        placeholder={wajib ? "Alasan (wajib, dilihat penulis)" : "Catatan (opsional)"}
        className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <button
        type="submit"
        className={cn(
          "h-9 shrink-0 rounded-full px-4 text-sm font-medium",
          wajib ? "bg-destructive text-white hover:bg-destructive/90" : "bg-white ring-1 ring-border hover:bg-secondary",
        )}
      >
        {tombol}
      </button>
    </form>
  );
}
