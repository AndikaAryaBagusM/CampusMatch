import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withDb } from "@/db";
import { IsiUlasan, LABEL_RISIKO } from "@/components/moderasi/isi-ulasan";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { LABEL_ALASAN_LAPORAN } from "@/lib/ulasan/laporan";
import { getRiwayatUlasan } from "@/lib/ulasan/moderasi";
import { STATUS_PENGULAS } from "@/lib/ulasan/skema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Riwayat ulasan",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LABEL_AKSI = {
  screening: "Screening",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  diturunkan: "Diturunkan",
  laporan_ditutup: "Laporan ditutup",
  dihapus_pengulas: "Dihapus penulis",
} as const;

export default async function RiwayatUlasanPage({ params }: PageProps<"/moderasi/ulasan/[id]">) {
  await requireModerator();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const data = await withDb((db) => getRiwayatUlasan(db, id));
  if (!data) notFound();
  const { ulasan, revisi, laporan, riwayat } = data;
  const status = STATUS_PENGULAS.find((s) => s.nilai === ulasan.statusPengulas)?.label;

  return (
    <div className={`${kontainer} max-w-4xl space-y-6 pb-8`}>
      <PageBreadcrumb items={[{ label: "Antrean Moderasi", href: "/moderasi" }, { label: "Riwayat ulasan" }]} />
      <Panel lembar>
        <h1 className="text-xl leading-tight font-extrabold">
          <Link href={`/prodi/${ulasan.prodiSlug}`} className="hover:underline">
            {ulasan.prodiNama}
          </Link>
          , {ulasan.kampusNama}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {status}, masuk {ulasan.tahunMasuk} · ditulis {formatWaktu(ulasan.createdAt)} ·{" "}
          {ulasan.dihapusAt
            ? `dihapus penulis ${formatWaktu(ulasan.dihapusAt)}`
            : ulasan.revisiTerbitId
              ? "sedang tampil"
              : "tidak tampil"}
        </p>
      </Panel>

      <Panel lembar title="Revisi">
        <ol className="space-y-5">
          {revisi.map((r) => (
            <li key={r.id}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold">Revisi ke-{r.nomor}</span>
                <span className="rounded-sm bg-secondary px-2 py-0.5">{r.status}</span>
                {r.id === ulasan.revisiTerbitId ? (
                  <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-emerald-900">tampil</span>
                ) : null}
                <span className="text-muted-foreground">{formatWaktu(r.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm">
                {r.tingkatRisiko ? (
                  <span className={cn("mr-2 rounded-sm px-2 py-0.5 text-xs font-semibold", LABEL_RISIKO[r.tingkatRisiko].kelas)}>
                    {LABEL_RISIKO[r.tingkatRisiko].teks}
                  </span>
                ) : null}
                {r.alasanScreening ?? "Belum ada hasil Screening."}
                <span className="text-xs text-muted-foreground">
                  {" "}
                  ({r.modelScreening ?? "tanpa model"}
                  {r.discreeningAt ? `, ${formatWaktu(r.discreeningAt)}` : ""}, {r.percobaanScreening} putaran gagal)
                </span>
              </p>
              {r.alasanModerator ? <p className="mt-1 text-sm">Alasan Moderator: {r.alasanModerator}</p> : null}
              <IsiUlasan judul={r.judul} isi={r.isi} bintang={r.bintang} rekomendasi={r.rekomendasi} />
            </li>
          ))}
        </ol>
      </Panel>

      <Panel lembar title={`Laporan (${laporan.length})`}>
        {laporan.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum pernah dilaporkan.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {laporan.map((l) => (
              <li key={l.id} className="py-2">
                <span className="font-semibold">{LABEL_ALASAN_LAPORAN[l.alasan]}</span> · {l.status} · {formatWaktu(l.createdAt)}
                {l.catatan ? <p className="mt-1 whitespace-pre-line text-muted-foreground">{l.catatan}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel lembar title="Riwayat keputusan">
        {riwayat.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {riwayat.map((h) => (
              <li key={h.id} className="py-2">
                <span className="font-semibold">{LABEL_AKSI[h.aksi]}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {h.olehEmail ?? "otomatis"} · {formatWaktu(h.createdAt)}
                </span>
                {h.alasan ? <p className="mt-1">{h.alasan}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
