import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CircleCheck, Compass, MessageSquareText } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { listVerifikasiSaya } from "@/lib/akun/verifikasi-kampus";
import { formatHari } from "@/lib/format";
import { isModerator } from "@/lib/moderator";
import { LABEL_TIPE } from "@/lib/riasec/item";
import { listProfilMinat } from "@/lib/riasec/profil";
import { kodekanProfil, kodeProfil } from "@/lib/riasec/skor";
import { requirePengulas } from "@/lib/sesi";
import { listUlasanSaya } from "@/lib/ulasan/kueri";
import type { StatusUlasan } from "@/lib/ulasan/status";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { hapusProfilSaya, hapusUlasanSaya, hapusVerifikasiKampus, keluar, kirimVerifikasiKampus } from "./actions";

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
  const [sp, [ulasan, profil, verifikasi]] = await Promise.all([
    props.searchParams,
    withDb((db) => Promise.all([listUlasanSaya(db, pengulas.id), listProfilMinat(db, pengulas.id), listVerifikasiSaya(db, pengulas.id)])),
  ]);
  const pesanKampus = param(sp.kampus);
  const kampusOk = param(sp.ok) === "1";
  const terkirim = param(sp.terkirim);
  const profilTersimpan = param(sp.profil) === "tersimpan";

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

      <Panel title="Email kampus" id="email-kampus">
        {pesanKampus ? (
          <p
            role={kampusOk ? "status" : "alert"}
            className={cn(
              "mb-4 rounded-lg p-3 text-sm",
              kampusOk ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-destructive/10 text-destructive",
            )}
          >
            {pesanKampus}
          </p>
        ) : null}
        {verifikasi.length ? (
          <ul className="mb-4 divide-y divide-border">
            {verifikasi.map((v) => (
              <li key={v.kampusId} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">
                    <BadgeCheck className="size-4 text-emerald-700" aria-hidden />
                    Terverifikasi di{" "}
                    <Link href={`/kampus/${v.kampusSlug}`} className="hover:underline">
                      {v.kampusNama}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {v.domain} · {formatHari(v.verifiedAt)}
                  </p>
                </div>
                <form action={hapusVerifikasiKampus}>
                  <input type="hidden" name="kampusId" value={v.kampusId} />
                  <button type="submit" className="text-sm font-medium text-destructive hover:underline">
                    Hapus
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
        <form action={kirimVerifikasiKampus} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="email-kampus-input" className="sr-only">
            Alamat email kampus
          </label>
          <input
            id="email-kampus-input"
            name="email"
            type="email"
            required
            maxLength={320}
            placeholder="nama@mail.kampus.ac.id"
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button type="submit" className="h-9 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-deep">
            Kirim tautan
          </button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          Buktikan kamu kuliah atau pernah kuliah di sebuah Kampus dengan email kampusmu. Kami mengirim satu tautan ke alamat
          itu dan tidak menyimpannya; yang kami simpan hanya domainnya dan tanggalnya. Ulasanmu untuk Prodi di Kampus itu
          lalu bertanda <span className="font-medium">Terverifikasi</span>.
        </p>
      </Panel>

      <Panel title="Profil Minat" id="profil-minat">
        {profilTersimpan ? (
          <p role="status" className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            Profil Minat tersimpan.
          </p>
        ) : null}
        {profil.length === 0 ? (
          <EmptyState icon={Compass} title="Belum ada Profil Minat">
            <Link href="/tes-minat" className="font-medium text-primary hover:underline">
              Kerjakan Tes Minat
            </Link>
            , lalu simpan hasilnya ke akunmu.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {profil.map((p, i) => {
              const kode = kodeProfil(p.profil);
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/tes-minat/hasil?p=${kodekanProfil(p.profil)}`} className="font-medium hover:underline">
                      {kode.split("").map((t) => LABEL_TIPE[t as keyof typeof LABEL_TIPE]).join(", ")} ({kode})
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatHari(p.createdAt)}
                      {i === 0 ? " · terbaru" : ""}
                    </p>
                  </div>
                  <form action={hapusProfilSaya}>
                    <input type="hidden" name="profilId" value={p.id} />
                    <button type="submit" className="text-sm font-medium text-destructive hover:underline">
                      Hapus
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Hanya kamu yang bisa melihat Profil Minat. Kami menyimpan enam skornya dan tanggalnya saja, dan tidak memakainya
          untuk Promosi atau iklan.
        </p>
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
