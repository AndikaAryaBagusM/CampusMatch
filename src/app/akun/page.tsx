import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CircleCheck, Compass, MessageSquareText, Wallet } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { listVerifikasiSaya } from "@/lib/akun/verifikasi-kampus";
import { formatHari } from "@/lib/format";
import { listInfoBiayaSaya } from "@/lib/info-biaya/layanan";
import { isModerator } from "@/lib/moderator";
import { LABEL_TIPE } from "@/lib/riasec/item";
import { listProfilMinat } from "@/lib/riasec/profil";
import { kodekanProfil, kodeProfil } from "@/lib/riasec/skor";
import { requirePengulas } from "@/lib/sesi";
import { listUlasanSaya } from "@/lib/ulasan/kueri";
import type { StatusUlasan } from "@/lib/ulasan/status";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import {
  hapusInfoBiayaSaya,
  hapusProfilSaya,
  hapusUlasanSaya,
  hapusVerifikasiKampus,
  keluar,
  kirimVerifikasiKampus,
} from "./actions";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

// What the Pengulas sees for their newest revision. The Screening details stay
// with the Moderators; a Ditolak shows the Moderator's reason.
const LABEL: Record<StatusUlasan, string> = {
  menunggu: "Sedang diperiksa",
  ditinjau: "Ditinjau tim kami",
  terbit: "Tampil",
  ditolak: "Ditolak",
};

// The revision's status printed as its place on the Pengulas line: Dikirim,
// then Diperiksa, then Tampil (or Ditolak), with the current stop named.
function RuteStatus({ status }: { status: StatusUlasan }) {
  const selesai = status === "terbit" || status === "ditolak";
  const halte = ["Dikirim", selesai ? "Diperiksa" : LABEL[status], selesai ? LABEL[status] : "Tampil"];
  const kini = selesai ? 2 : 1;
  const warna = status === "ditolak" ? "var(--destructive)" : "var(--jade)";
  return (
    <ol aria-label={`Status: ${LABEL[status]}`} className="flex items-center text-xs font-semibold">
      {halte.map((h, i) => (
        <li key={h} aria-current={i === kini ? "step" : undefined} className="flex items-center">
          {i > 0 ? (
            <span aria-hidden className="h-1 w-5 rounded-full sm:w-8" style={{ background: i <= kini ? warna : "var(--input)" }} />
          ) : null}
          <span className="flex items-center gap-1.5 px-1">
            <span
              aria-hidden
              className={cn("rounded-full", i === kini ? "size-3.5 border-[4px] bg-white" : "size-3 border-[3px]")}
              style={{ borderColor: i <= kini ? warna : "var(--input)", background: i < kini ? warna : undefined }}
            />
            <span className={i === kini ? "text-foreground" : "text-muted-foreground"}>{h}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default async function AkunPage(props: PageProps<"/akun">) {
  const pengulas = await requirePengulas("/akun");
  const [sp, [ulasan, profil, verifikasi, infoBiaya]] = await Promise.all([
    props.searchParams,
    withDb((db) =>
      Promise.all([
        listUlasanSaya(db, pengulas.id),
        listProfilMinat(db, pengulas.id),
        listVerifikasiSaya(db, pengulas.id),
        listInfoBiayaSaya(db, pengulas.id),
      ]),
    ),
  ]);
  const statusInfoBiaya = param(sp.infoBiaya);
  const pesanKampus = param(sp.kampus);
  const kampusOk = param(sp.ok) === "1";
  const terkirim = param(sp.terkirim);
  const profilTersimpan = param(sp.profil) === "tersimpan";

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-10`}>
      {terkirim ? (
        <p role="status" className="flex items-start gap-2 rounded-sm bg-jade-tint p-4 text-sm text-foreground ring-1 ring-jade/30">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          Terima kasih! Ulasanmu sedang diperiksa dan biasanya tampil dalam beberapa menit.
        </p>
      ) : null}

      <Panel
        title="Akun"
        action={
          <form action={keluar}>
            <button type="submit" className="text-sm font-semibold text-primary hover:underline">
              Keluar
            </button>
          </form>
        }
      >
        <p className="text-sm">
          Masuk sebagai <span className="font-semibold">{pengulas.email ?? pengulas.name}</span>
        </p>
        {isModerator(pengulas.email) ? (
          <Link href="/moderasi" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
            Buka Antrean Moderasi
          </Link>
        ) : null}
      </Panel>

      <Panel lembar title="Email kampus" id="email-kampus">
        {pesanKampus ? (
          <p
            role={kampusOk ? "status" : "alert"}
            className={cn(
              "mb-4 rounded-sm p-3 text-sm",
              kampusOk ? "bg-jade-tint text-foreground ring-1 ring-jade/30" : "bg-destructive/10 text-destructive",
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
                  <p className="flex items-center gap-1.5 font-semibold">
                    <BadgeCheck className="size-4 text-jade" aria-hidden />
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
                  <button type="submit" className="text-sm font-semibold text-destructive hover:underline">
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
            className="h-9 min-w-0 flex-1 rounded-sm border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button type="submit" className="h-9 shrink-0 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-deep">
            Kirim tautan
          </button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          Buktikan kamu kuliah atau pernah kuliah di sebuah Kampus dengan email kampusmu. Kami mengirim satu tautan ke alamat
          itu dan tidak menyimpannya; yang kami simpan hanya domainnya dan tanggalnya. Ulasanmu untuk Prodi di Kampus itu
          lalu bertanda <span className="font-semibold">Terverifikasi</span>.
        </p>
      </Panel>

      <Panel lembar title="Profil Minat" id="profil-minat">
        {profilTersimpan ? (
          <p role="status" className="mb-4 flex items-start gap-2 rounded-sm bg-jade-tint p-3 text-sm text-foreground ring-1 ring-jade/30">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            Profil Minat tersimpan.
          </p>
        ) : null}
        {profil.length === 0 ? (
          <EmptyState icon={Compass} title="Belum ada Profil Minat">
            <Link href="/tes-minat" className="font-semibold text-primary hover:underline">
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
                    <Link href={`/tes-minat/hasil?p=${kodekanProfil(p.profil)}`} className="font-semibold hover:underline">
                      {kode.split("").map((t) => LABEL_TIPE[t as keyof typeof LABEL_TIPE]).join(", ")} ({kode})
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatHari(p.createdAt)}
                      {i === 0 ? " · terbaru" : ""}
                    </p>
                  </div>
                  <form action={hapusProfilSaya}>
                    <input type="hidden" name="profilId" value={p.id} />
                    <button type="submit" className="text-sm font-semibold text-destructive hover:underline">
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

      <Panel lembar title="Info Biaya" id="info-biaya">
        {statusInfoBiaya === "tersimpan" ? (
          <p role="status" className="mb-4 flex items-start gap-2 rounded-sm bg-jade-tint p-3 text-sm text-foreground ring-1 ring-jade/30">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            Info biaya tersimpan. Terima kasih!
          </p>
        ) : statusInfoBiaya === "gagal" ? (
          <p role="alert" className="mb-4 rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
            Ulasanmu terkirim, tetapi info biayanya belum tersimpan. Coba bagikan lagi dari halaman Prodi.
          </p>
        ) : null}
        {infoBiaya.length === 0 ? (
          <EmptyState icon={Wallet} title="Belum ada info biaya">
            Di halaman Prodi tempat kamu kuliah, tekan Bagikan info biaya.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {infoBiaya.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link href={`/prodi/${b.prodiSlug}`} className="font-semibold hover:underline">
                    {b.prodiNama}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {b.kampusNama} · masuk {b.tahunMasuk} · {formatHari(b.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Link href={`/prodi/${b.prodiSlug}/info-biaya`} className="font-semibold text-primary hover:underline">
                    Ubah
                  </Link>
                  <form action={hapusInfoBiayaSaya}>
                    <input type="hidden" name="infoBiayaId" value={b.id} />
                    <button type="submit" className="font-semibold text-destructive hover:underline">
                      Hapus
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Info biayamu tidak pernah ditampilkan sendiri, hanya sebagai Estimasi Pengulas gabungan dari minimal 5 Pengulas.
          Info dari angkatan lebih dari lima tahun lalu dihapus otomatis.
        </p>
      </Panel>

      <Panel lembar title="Ulasan saya">
        {ulasan.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="Belum ada ulasan">
            <Link href="/cari?tulis=1" className="font-semibold text-jade underline-offset-4 hover:underline">
              Cari Prodi tempat kamu kuliah
            </Link>
            , lalu tekan Tulis ulasan.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {ulasan.map((u) => {
              const versiLamaTampil = u.terbit && u.revisi.status !== "terbit";
              return (
                <li key={u.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/prodi/${u.prodiSlug}`} className="font-semibold hover:underline">
                        {u.prodiNama}
                      </Link>
                      <p className="text-sm text-muted-foreground">{u.kampusNama}</p>
                    </div>
                    <RuteStatus status={u.revisi.status} />
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
                      <Link href={`/prodi/${u.prodiSlug}/tulis`} className="font-semibold text-primary hover:underline">
                        Ubah
                      </Link>
                    ) : null}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold text-destructive hover:underline">Hapus</summary>
                      <form action={hapusUlasanSaya} className="mt-2 flex items-center gap-2">
                        <input type="hidden" name="ulasanId" value={u.id} />
                        <span className="text-xs text-muted-foreground">Hapus permanen?</span>
                        <button type="submit" className="rounded-md bg-destructive px-3 py-1 text-xs font-semibold text-white">
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
