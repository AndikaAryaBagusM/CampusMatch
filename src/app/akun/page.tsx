import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, MessageSquareText } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { isModerator } from "@/lib/moderator";
import { requirePengulas } from "@/lib/sesi";
import { listUlasanSaya } from "@/lib/ulasan/kueri";
import type { StatusUlasan } from "@/lib/ulasan/status";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { hapusUlasanSaya, keluar } from "./actions";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

// What the Pengulas sees for their newest revision. The Screening details stay
// with the Moderators; a Ditolak shows the Moderator's reason.
const LABEL: Record<StatusUlasan, { teks: string; kelas: string }> = {
  menunggu: { teks: "Sedang diperiksa", kelas: "bg-secondary text-primary" },
  ditinjau: { teks: "Ditinjau tim kami", kelas: "bg-amber-100 text-amber-900" },
  terbit: { teks: "Tampil", kelas: "bg-emerald-100 text-emerald-900" },
  ditolak: { teks: "Ditolak", kelas: "bg-destructive/10 text-destructive" },
};

export default async function AkunPage(props: PageProps<"/akun">) {
  const pengulas = await requirePengulas("/akun");
  const [sp, ulasan] = await Promise.all([props.searchParams, withDb((db) => listUlasanSaya(db, pengulas.id))]);
  const terkirim = param(sp.terkirim);

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-10`}>
      {terkirim ? (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          Terima kasih! Ulasanmu sedang diperiksa dan biasanya tampil dalam beberapa menit.
        </p>
      ) : null}

      <Panel
        title="Akun"
        action={
          <form action={keluar}>
            <button type="submit" className="text-sm font-medium text-primary hover:underline">
              Keluar
            </button>
          </form>
        }
      >
        <p className="text-sm">
          Masuk sebagai <span className="font-medium">{pengulas.email ?? pengulas.name}</span>
        </p>
        {isModerator(pengulas.email) ? (
          <Link href="/moderasi" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
            Buka Antrean Moderasi
          </Link>
        ) : null}
      </Panel>

      <Panel title="Ulasan saya">
        {ulasan.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="Belum ada ulasan">
            Cari Prodi tempat kamu kuliah, lalu tekan Tulis ulasan.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {ulasan.map((u) => {
              const label = LABEL[u.revisi.status];
              const versiLamaTampil = u.terbit && u.revisi.status !== "terbit";
              return (
                <li key={u.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/prodi/${u.prodiSlug}`} className="font-medium hover:underline">
                        {u.prodiNama}
                      </Link>
                      <p className="text-sm text-muted-foreground">{u.kampusNama}</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", label.kelas)}>{label.teks}</span>
                  </div>
                  <p className="text-sm">“{u.revisi.judul}”</p>
                  {u.revisi.status === "ditolak" && u.revisi.alasan_moderator ? (
                    <p className="text-sm text-destructive">Alasan: {u.revisi.alasan_moderator}</p>
                  ) : null}
                  {versiLamaTampil ? (
                    <p className="text-xs text-muted-foreground">Versi sebelumnya masih tampil sampai perubahan ini lolos.</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {u.revisi.status === "terbit" || u.revisi.status === "ditolak" ? (
                      <Link href={`/prodi/${u.prodiSlug}/tulis`} className="font-medium text-primary hover:underline">
                        Ubah
                      </Link>
                    ) : null}
                    <details className="group">
                      <summary className="cursor-pointer font-medium text-destructive hover:underline">Hapus</summary>
                      <form action={hapusUlasanSaya} className="mt-2 flex items-center gap-2">
                        <input type="hidden" name="ulasanId" value={u.id} />
                        <span className="text-xs text-muted-foreground">Hapus permanen?</span>
                        <button type="submit" className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-white">
                          Ya, hapus
                        </button>
                      </form>
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
