import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { KotakPromosi } from "@/components/promosi/kotak-promosi";
import { formatAngka, formatTanggal, formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { getPromosi, LABEL_KEADAAN } from "@/lib/promosi";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { aktifkanPromosi, hapusDrafPromosi, hentikanPromosi } from "../actions";

export const metadata: Metadata = {
  title: "Promosi",
  robots: { index: false, follow: false },
};

const kolomInput =
  "min-h-9 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function DetailPromosiPage(props: PageProps<"/moderasi/promosi/[id]">) {
  const moderator = await requireModerator();
  const [{ id: raw }, sp] = await Promise.all([props.params, props.searchParams]);
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const p = await withDb((db) => getPromosi(db, id));
  if (!p) notFound();
  const pesan = param(sp.pesan);
  const berhasil = param(sp.ok) === "1";
  const milikSendiri = p.dimasukkanOleh === moderator.id;
  const totalKlik = p.klik.reduce((s, k) => s + k.jumlah, 0);

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-8`}>
      <PageBreadcrumb items={[{ label: "Promosi", href: "/moderasi/promosi" }, { label: p.kampus.nama }]} />
      <div>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Promosi {p.kampus.nama}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{LABEL_KEADAAN[p.keadaan]}</span> · {formatTanggal(p.mulai)} –{" "}
          {formatTanggal(p.selesai)} · {[p.diBeranda ? "Beranda" : null, p.jurusan].filter(Boolean).join(" · ")}
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

      <Panel lembar title="Pratinjau">
        <KotakPromosi promosi={{ id: p.id, teks: p.teks, kampus: p.kampus }} />
        <p className="mt-3 text-xs text-muted-foreground">
          Tautan mengarah ke{" "}
          <Link href={`/kampus/${p.kampus.slug}`} className="text-primary hover:underline">
            halaman Kampus di CampusMatch
          </Link>
          . Klik dari pratinjau ini tidak dihitung kecuali Promosi sedang tayang.
        </p>
      </Panel>

      {p.status === "draf" ? (
        <Panel lembar title="Periksa">
          <p className="mb-3 text-sm text-muted-foreground">
            Cocokkan Kampus, tempat tampil, tanggal, dan teks dengan kontraknya. Teks hanya boleh berisi fakta tentang Kampus,
            tanpa klaim &ldquo;terbaik&rdquo; atau perbandingan.
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={aktifkanPromosi}>
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                disabled={milikSendiri}
                className="h-9 rounded-sm bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aktifkan
              </button>
            </form>
            <form action={hapusDrafPromosi}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="h-9 rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary">
                Hapus draf
              </button>
            </form>
          </div>
          {milikSendiri ? (
            <p className="mt-2 text-sm text-muted-foreground">Kamu yang memasukkan Promosi ini; Moderator lain yang mengaktifkannya.</p>
          ) : null}
        </Panel>
      ) : null}

      {p.status === "aktif" ? (
        <Panel lembar title="Hentikan">
          <form action={hentikanPromosi} className="space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <label htmlFor="alasan" className="block text-sm font-semibold">
              Alasan
            </label>
            <textarea id="alasan" name="alasan" required maxLength={500} rows={2} className={kolomInput} />
            <button type="submit" className="h-9 rounded-sm bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/90">
              Hentikan Promosi
            </button>
          </form>
          <p className="mt-2 text-sm text-muted-foreground">Untuk mengubah teks atau tempat, hentikan lalu buat Promosi baru.</p>
        </Panel>
      ) : null}

      <Panel lembar title={`Klik (${formatAngka(totalKlik)})`}>
        {p.klik.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada klik.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {p.klik.map((k) => (
                <tr key={k.tanggal}>
                  <td className="py-1.5">{formatTanggal(k.tanggal)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatAngka(k.jumlah)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel lembar title="Catatan">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Dimasukkan</dt>
          <dd>
            {p.dimasukkanEmail ?? "akun terhapus"}, {formatWaktu(p.createdAt)}
          </dd>
          {p.diaktifkanAt ? (
            <>
              <dt className="text-muted-foreground">Diaktifkan</dt>
              <dd>
                {p.diaktifkanEmail ?? "akun terhapus"}, {formatWaktu(p.diaktifkanAt)}
              </dd>
            </>
          ) : null}
          {p.dihentikanAt ? (
            <>
              <dt className="text-muted-foreground">Dihentikan</dt>
              <dd>
                {p.dihentikanEmail ?? "akun terhapus"}, {formatWaktu(p.dihentikanAt)}: &ldquo;{p.alasanDihentikan}&rdquo;
              </dd>
            </>
          ) : null}
          {p.catatanInternal ? (
            <>
              <dt className="text-muted-foreground">Catatan internal</dt>
              <dd>{p.catatanInternal}</dd>
            </>
          ) : null}
        </dl>
      </Panel>
    </div>
  );
}
