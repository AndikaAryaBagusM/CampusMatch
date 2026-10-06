import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { formatAngka, formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { ALASAN_MAKS, getKodePemetaan, kodeSah, listSemuaJurusan, type GrupPemetaan } from "@/lib/pemetaan-jurusan";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { pindahkanProdi, ubahKode } from "../../actions";

export const metadata: Metadata = {
  title: "Pemetaan Kode Prodi",
  robots: { index: false, follow: false },
};

const kolomInput =
  "min-h-9 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function PilihJurusan({ id, daftar, kosong }: { id: string; daftar: { id: number; nama: string }[]; kosong: React.ReactNode }) {
  return (
    <select id={id} name="jurusanId" required defaultValue="" className={kolomInput}>
      <option value="" disabled>
        Pilih Jurusan…
      </option>
      {kosong}
      {daftar.map((j) => (
        <option key={j.id} value={j.id}>
          {j.nama}
        </option>
      ))}
    </select>
  );
}

// A name group: one checkbox for all its Prodi, and each Prodi on its own.
function Grup({ g }: { g: GrupPemetaan }) {
  const tujuan = [...new Set(g.prodi.map((p) => p.jurusanNama ?? "belum dipetakan"))];
  const adaOverride = g.prodi.some((p) => p.override);
  return (
    <li className="py-3">
      <label className="flex items-start gap-3">
        <input type="checkbox" name="grup" value={g.prodi.map((p) => p.id).join(",")} className="mt-1 size-4 accent-primary" />
        <span className="min-w-0 flex-1">
          <span className="font-semibold">
            {g.jenjang} {g.nama}
          </span>
          <span className="text-muted-foreground"> · {formatAngka(g.prodi.length)} Prodi</span>
          <span className={cn("block text-sm", adaOverride ? "text-amber-800" : "text-muted-foreground")}>
            → {tujuan.join(" / ")}
            {adaOverride ? " (sebagian atau semua dipindahkan)" : null}
          </span>
        </span>
      </label>
      <details className="ml-7 mt-1">
        <summary className="cursor-pointer text-sm text-primary">Pilih per Prodi</summary>
        <ul className="mt-2 space-y-1 text-sm">
          {g.prodi.map((p) => (
            <li key={p.id}>
              <label className="flex items-start gap-2">
                <input type="checkbox" name="prodi" value={p.id} className="mt-0.5 size-4 accent-primary" />
                <span>
                  <Link href={`/prodi/${p.slug}`} className="hover:underline" target="_blank">
                    {p.kampusNama}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    → {p.jurusanNama ?? "belum dipetakan"}
                    {p.override ? " (dipindahkan)" : null}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

export default async function KodePemetaanPage(props: PageProps<"/moderasi/jurusan/kode/[kode]">) {
  await requireModerator();
  const [{ kode }, sp] = await Promise.all([props.params, props.searchParams]);
  if (!kodeSah(kode)) notFound();
  const [peta, semuaJurusan] = await withDb((db) => Promise.all([getKodePemetaan(db, kode), listSemuaJurusan(db)]));
  if (!peta) notFound();
  const pesan = param(sp.pesan);
  const berhasil = param(sp.ok) === "1";

  return (
    <div className={`${kontainer} max-w-4xl space-y-6 py-8`}>
      <PageBreadcrumb items={[{ label: "Pemetaan Jurusan", href: "/moderasi/jurusan" }, { label: `Kode ${kode}` }]} />
      <div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Kode Prodi {kode}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {peta.jenjang.join(", ")}
          {peta.bidang.length ? ` · ${peta.bidang.join(", ")}` : null} · {formatAngka(peta.jumlahProdi)} Prodi
        </p>
        <p className="mt-2">
          Jurusan:{" "}
          {peta.jurusan ? (
            <Link href={`/jurusan/${peta.jurusan.slug}`} className="font-semibold text-primary hover:underline" target="_blank">
              {peta.jurusan.nama}
            </Link>
          ) : (
            <span className="font-semibold">belum dipetakan</span>
          )}
          {peta.jurusan?.olehModerator ? <span className="text-sm text-muted-foreground"> (diubah Moderator; CSV tidak menimpanya)</span> : null}
        </p>
      </div>

      {pesan ? (
        <p
          role={berhasil ? "status" : "alert"}
          className={cn("rounded-sm p-3 text-sm", berhasil ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-destructive/10 text-destructive")}
        >
          {pesan}
        </p>
      ) : null}

      <Panel lembar title="Pindahkan Prodi tertentu">
        <form action={pindahkanProdi} className="space-y-4">
          <input type="hidden" name="kode" value={kode} />
          <p className="text-sm text-muted-foreground">
            Centang satu nama untuk memindahkan semua Prodi bernama itu, atau buka &ldquo;Pilih per Prodi&rdquo;.
          </p>
          <ul className="divide-y divide-border">
            {peta.grup.map((g) => (
              <Grup key={`${g.jenjang}|${g.nama}`} g={g} />
            ))}
          </ul>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="tujuan-prodi" className="mb-1 block text-sm font-semibold">
                Pindahkan ke
              </label>
              <PilihJurusan
                id="tujuan-prodi"
                daftar={semuaJurusan}
                kosong={<option value="kode">Kembalikan ke Jurusan Kode{peta.jurusan ? ` (${peta.jurusan.nama})` : ""}</option>}
              />
            </div>
            <div>
              <label htmlFor="alasan-prodi" className="mb-1 block text-sm font-semibold">
                Alasan
              </label>
              <textarea id="alasan-prodi" name="alasan" required maxLength={ALASAN_MAKS} rows={2} className={kolomInput} />
            </div>
          </div>
          <button type="submit" className="h-9 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-deep">
            Pindahkan yang dicentang
          </button>
        </form>
      </Panel>

      <Panel lembar title="Ubah Jurusan seluruh Kode">
        <form action={ubahKode} className="space-y-4">
          <input type="hidden" name="kode" value={kode} />
          <p className="text-sm text-muted-foreground">
            Semua Prodi dengan Kode {kode} ikut pindah, kecuali yang sudah dipindahkan sendiri-sendiri.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="tujuan-kode" className="mb-1 block text-sm font-semibold">
                Jurusan baru
              </label>
              <PilihJurusan id="tujuan-kode" daftar={semuaJurusan.filter((j) => j.id !== peta.jurusan?.id)} kosong={null} />
            </div>
            <div>
              <label htmlFor="alasan-kode" className="mb-1 block text-sm font-semibold">
                Alasan
              </label>
              <textarea id="alasan-kode" name="alasan" required maxLength={ALASAN_MAKS} rows={2} className={kolomInput} />
            </div>
          </div>
          <button type="submit" className="h-9 rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary">
            Ubah Jurusan Kode
          </button>
        </form>
      </Panel>

      <Panel lembar title="Riwayat">
        {peta.riwayat.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada perubahan oleh Moderator.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {peta.riwayat.map((r) => (
              <li key={r.id} className="py-2">
                <p>
                  {r.jenis === "kode" ? (
                    <span className="font-semibold">Seluruh Kode</span>
                  ) : (
                    <span className="font-semibold">
                      {r.prodiNama ?? "Prodi terhapus"}
                      {r.kampusNama ? `, ${r.kampusNama}` : null}
                    </span>
                  )}
                  : {r.lama ?? "belum dipetakan"} → {r.baru ?? "belum dipetakan"}
                </p>
                <p className="text-muted-foreground">
                  &ldquo;{r.alasan}&rdquo; · {r.olehEmail ?? "akun terhapus"} · {formatWaktu(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
