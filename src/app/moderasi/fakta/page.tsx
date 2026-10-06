import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { kontainer, Panel } from "@/components/panel";
import { listSumberDiperiksa, listSumberDraf } from "@/lib/fakta/periksa";
import { hitungTabModerasi } from "@/lib/moderasi-tab";
import { formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { param } from "@/lib/url";

export const metadata: Metadata = {
  title: "Fakta Biaya & Masuk",
  robots: { index: false, follow: false },
};

export default async function FaktaPage(props: PageProps<"/moderasi/fakta">) {
  const moderator = await requireModerator();
  const cari = (param((await props.searchParams).cari) ?? "").slice(0, 100);
  const [jumlah, { draf, dikembalikan }, diperiksa] = await withDb((db) =>
    Promise.all([hitungTabModerasi(db), listSumberDraf(db), listSumberDiperiksa(db, cari)]),
  );
  const email = moderator.email.toLowerCase();

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      <div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Fakta Biaya & Masuk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fakta Draf per Sumber. Bandingkan setiap fakta dengan dokumennya, lalu tandai Diperiksa. Fakta yang kamu masukkan
          sendiri harus diperiksa Moderator lain.
        </p>
      </div>
      <TabModerasiNav jumlah={jumlah} aktif="fakta" />

      {draf.length === 0 ? (
        <Panel lembar>
          <EmptyState icon={Inbox} title="Tidak ada fakta yang perlu diperiksa">
            Fakta baru masuk lewat <code>npm run fakta:import</code> (lihat data/fakta/README.md).
          </EmptyState>
        </Panel>
      ) : (
        <Panel lembar>
          <ul className="divide-y divide-border">
            {draf.map((s) => {
              const milikSendiri = s.dimasukkan_email?.toLowerCase() === email;
              return (
                <li key={s.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/moderasi/fakta/${s.id}`} className="font-semibold hover:underline">
                      {s.judul}
                    </Link>
                    <p className="text-muted-foreground">
                      {s.kampus_nama ?? "Sumber nasional"} · {s.draf} fakta Draf
                      {s.arsip_url ? "" : " · tanpa arsip"}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {milikSendiri ? "Kamu yang memasukkan" : `oleh ${s.dimasukkan_email ?? "akun terhapus"}`} ·{" "}
                    {formatWaktu(s.updated_at)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel lembar title="Sudah Diperiksa">
        <p className="mb-3 text-sm text-muted-foreground">
          Menemukan angka yang salah di halaman publik? Buka Sumbernya dan tarik faktanya. Satu Moderator cukup.
        </p>
        <form className="mb-4 flex gap-2" role="search">
          <label htmlFor="cari" className="sr-only">
            Cari Kampus atau Sumber
          </label>
          <input
            id="cari"
            name="cari"
            defaultValue={cari}
            maxLength={100}
            placeholder="Nama Kampus, kode, atau judul Sumber"
            className="h-9 min-w-0 flex-1 rounded-sm border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button type="submit" className="h-9 shrink-0 rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary">
            Cari
          </button>
        </form>
        {diperiksa.length === 0 ? (
          <p className="text-sm text-muted-foreground">{cari ? "Tidak ada Sumber yang cocok." : "Belum ada fakta yang tampil."}</p>
        ) : (
          <ul className="divide-y divide-border">
            {diperiksa.map((s) => (
              <li key={s.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/moderasi/fakta/${s.id}`} className="font-semibold hover:underline">
                    {s.judul}
                  </Link>
                  <p className="text-muted-foreground">
                    {s.kampus_nama ?? "Sumber nasional"} · {s.diperiksa} fakta tampil
                    {s.ditarik ? ` · ${s.ditarik} ditarik` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{s.kode}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {dikembalikan.length ? (
        <Panel lembar title="Dikembalikan">
          <p className="mb-3 text-sm text-muted-foreground">
            Fakta Draf yang dikembalikan sudah dihapus. Perbaiki CSV-nya, lalu impor lagi dengan kode yang sama.
          </p>
          <ul className="divide-y divide-border">
            {dikembalikan.map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <p className="font-semibold">
                  {s.judul} <span className="font-normal text-muted-foreground">({s.kode})</span>
                </p>
                <p className="mt-1 rounded-sm bg-amber-50 p-2.5 ring-1 ring-amber-200">{s.catatan_pemeriksa}</p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
