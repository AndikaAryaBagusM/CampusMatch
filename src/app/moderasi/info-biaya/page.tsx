import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { withDb } from "@/db";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { formatRupiah, LABEL_KATEGORI_JALUR, LABEL_TES } from "@/lib/fakta/label";
import { formatAngka, formatHari, formatWaktu } from "@/lib/format";
import { K } from "@/lib/info-biaya/estimasi";
import { LABEL_BEASISWA } from "@/lib/info-biaya/label";
import { listInfoBiayaProdiModerasi, listProdiInfoBiaya } from "@/lib/info-biaya/layanan";
import { hitungTabModerasi } from "@/lib/moderasi-tab";
import { requireModerator } from "@/lib/moderator";
import { STATUS_PENGULAS } from "@/lib/ulasan/skema";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { kesampingkan, pulihkan } from "./actions";

export const metadata: Metadata = {
  title: "Info Biaya",
  robots: { index: false, follow: false },
};

const kolomInput =
  "min-h-9 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const rp = (v: number | null) => (v === null ? "—" : formatRupiah(v));

// Info Biaya per Prodi (ADR 0010). No queue: entries count automatically, and
// a Moderator sets aside the ones that look fake. Only Moderators ever see a
// single entry.
export default async function InfoBiayaModerasiPage(props: PageProps<"/moderasi/info-biaya">) {
  await requireModerator();
  const sp = await props.searchParams;
  const slug = param(sp.prodi);
  const pesan = param(sp.pesan);
  const berhasil = param(sp.ok) === "1";
  const [jumlah, daftar, detail] = await withDb((db) =>
    Promise.all([hitungTabModerasi(db), slug ? [] : listProdiInfoBiaya(db), slug ? listInfoBiayaProdiModerasi(db, slug) : null]),
  );

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      {detail ? <PageBreadcrumb items={[{ label: "Info Biaya", href: "/moderasi/info-biaya" }, { label: detail.prodi.nama }]} /> : null}
      <div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">{detail ? `Info Biaya: ${detail.prodi.nama}` : "Info Biaya"}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {detail
            ? `${detail.prodi.kampusNama}. `
            : null}
          Jawaban Pengulas tentang biaya dan jalur masuk, ditampilkan publik hanya sebagai Estimasi Pengulas (minimal {K}{" "}
          jawaban per angka). Angka yang jauh dari yang lain tidak dihitung otomatis. Kesampingkan jawaban yang tampak palsu;
          datanya tetap tersimpan.
        </p>
      </div>
      <TabModerasiNav jumlah={jumlah} aktif="info-biaya" />

      {pesan ? (
        <p
          role={berhasil ? "status" : "alert"}
          className={cn("rounded-sm p-3 text-sm", berhasil ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-destructive/10 text-destructive")}
        >
          {pesan}
        </p>
      ) : null}

      {slug && !detail ? <Panel lembar>Prodi tidak ditemukan.</Panel> : null}

      {!slug ? (
        <Panel lembar title="Prodi dengan Info Biaya">
          {daftar.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada Info Biaya.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {daftar.map((p) => (
                <li key={p.slug} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/moderasi/info-biaya?prodi=${p.slug}`} className="font-semibold hover:underline">
                      {p.nama}
                    </Link>
                    <span className="text-muted-foreground">, {p.kampusNama}</span>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {formatAngka(p.jumlah)} jawaban{p.dikesampingkan ? `, ${p.dikesampingkan} dikesampingkan` : ""} · {formatHari(p.terakhir)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      {detail ? (
        <Panel lembar title={`Jawaban (${detail.entri.length})`}>
          {detail.entri.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada Info Biaya untuk Prodi ini.</p>
          ) : (
            <ul className="space-y-4">
              {detail.entri.map((e) => (
                <li
                  key={e.id}
                  className={cn("rounded-sm p-4 text-sm ring-1", e.dikesampingkanAt ? "bg-secondary/50 ring-foreground/10" : e.pencilan ? "ring-amber-300" : "ring-foreground/10")}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                      {e.email ?? "akun tanpa email"}
                      {e.terverifikasi ? (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-emerald-800">
                          <BadgeCheck className="size-3.5" aria-hidden />
                          Terverifikasi
                        </span>
                      ) : null}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {STATUS_PENGULAS.find((s) => s.nilai === e.statusPengulas)?.label}, masuk {e.tahunMasuk} · {formatWaktu(e.updatedAt)}
                    </span>
                  </div>
                  {e.pencilan && !e.dikesampingkanAt ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-900">
                      <AlertTriangle className="size-3.5" aria-hidden />
                      Ada angka jauh dari jawaban lain; angka itu tidak dihitung dalam Estimasi.
                    </p>
                  ) : null}
                  {e.diLuarJendela ? <p className="mt-2 text-xs text-muted-foreground">Di luar lima angkatan terakhir; akan dihapus otomatis.</p> : null}
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    <dt className="text-muted-foreground">UKT/SPP per semester</dt>
                    <dd>
                      {rp(e.biayaSemester)}
                      {e.kelompokUkt ? <span className="text-muted-foreground">, Kelompok {e.kelompokUkt}</span> : null}
                    </dd>
                    <dt className="text-muted-foreground">Uang Pangkal</dt>
                    <dd>{e.uangPangkal === 0 ? "Tidak ada" : rp(e.uangPangkal)}</dd>
                    <dt className="text-muted-foreground">Biaya lain saat masuk</dt>
                    <dd>{rp(e.biayaLainMasuk)}</dd>
                    <dt className="text-muted-foreground">Jalur dan seleksi</dt>
                    <dd>
                      {[e.kategoriJalur ? LABEL_KATEGORI_JALUR[e.kategoriJalur] : null, e.tes?.map((t) => LABEL_TES[t]).join(", ")]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </dd>
                    <dt className="text-muted-foreground">Beasiswa</dt>
                    <dd>{e.beasiswa ? LABEL_BEASISWA[e.beasiswa] : "—"}</dd>
                  </dl>

                  {e.dikesampingkanAt ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <p className="text-muted-foreground">
                        Dikesampingkan oleh {e.dikesampingkanEmail ?? "akun terhapus"}, {formatWaktu(e.dikesampingkanAt)}: &ldquo;
                        {e.alasanDikesampingkan}&rdquo;
                      </p>
                      <form action={pulihkan}>
                        <input type="hidden" name="prodi" value={detail.prodi.slug} />
                        <input type="hidden" name="id" value={e.id} />
                        <button type="submit" className="font-semibold text-primary hover:underline">
                          Hitung lagi
                        </button>
                      </form>
                    </div>
                  ) : (
                    <details className="mt-3 border-t border-border pt-3">
                      <summary className="cursor-pointer font-semibold text-destructive hover:underline">Kesampingkan</summary>
                      <form action={kesampingkan} className="mt-3 space-y-2">
                        <input type="hidden" name="prodi" value={detail.prodi.slug} />
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="userId" value={e.userId} />
                        <label htmlFor={`alasan-${e.id}`} className="block text-sm font-semibold">
                          Alasan
                        </label>
                        <input id={`alasan-${e.id}`} name="alasan" required maxLength={500} className={kolomInput} />
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="semuaAkun" value="1" className="size-4 accent-primary" />
                          Semua info biaya dari akun ini, di semua Prodi
                        </label>
                        <button type="submit" className="h-9 rounded-sm bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/90">
                          Kesampingkan
                        </button>
                      </form>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link href={`/prodi/${detail.prodi.slug}#estimasi-pengulas`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
            Lihat Estimasi di halaman Prodi
          </Link>
        </Panel>
      ) : null}
    </div>
  );
}
