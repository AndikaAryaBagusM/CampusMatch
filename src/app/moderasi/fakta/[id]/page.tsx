import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { formatRupiah, LABEL_JENIS_BIAYA, LABEL_KATEGORI_JALUR, LABEL_PERIODE, LABEL_TES } from "@/lib/fakta/label";
import { getSumber, type SumberLengkap } from "@/lib/fakta/periksa";
import { formatTahunAkademik } from "@/lib/fakta/tahun-akademik";
import { formatTanggal, formatWaktu } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { kembalikan, periksa, tarik } from "../actions";

export const metadata: Metadata = {
  title: "Periksa Sumber",
  robots: { index: false, follow: false },
};

type Status = "draf" | "diperiksa" | "ditarik";

const sel = "py-2 pr-3 align-top";
const kepala = "py-2 pr-3 text-left text-xs font-semibold text-muted-foreground";
const kolomInput =
  "min-h-9 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Only the facts of one Status Fakta.
function saring(s: SumberLengkap, status: Status) {
  const cocok = <T extends { status: Status }>(d: T[]) => d.filter((x) => x.status === status);
  const hasil = { jalur: cocok(s.jalur), biaya: cocok(s.biaya), beasiswa: cocok(s.beasiswa), ikutNasional: cocok(s.ikutNasional) };
  return { ...hasil, jumlah: hasil.jalur.length + hasil.biaya.length + hasil.beasiswa.length + hasil.ikutNasional.length };
}

export default async function PeriksaSumberPage({ params, searchParams }: PageProps<"/moderasi/fakta/[id]">) {
  const moderator = await requireModerator();
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const s = await withDb((db) => getSumber(db, id));
  if (!s) notFound();
  const sp = await searchParams;
  const pesan = param(sp.pesan);
  const berhasil = param(sp.ok) === "1";
  const milikSendiri = s.dimasukkanOleh === moderator.id;
  const draf = saring(s, "draf");
  const tampil = saring(s, "diperiksa");
  const ditarik = saring(s, "ditarik");

  return (
    <div className={`${kontainer} max-w-5xl space-y-6 pb-8`}>
      <PageBreadcrumb items={[{ label: "Fakta Biaya & Masuk", href: "/moderasi/fakta" }, { label: s.kode }]} />
      {pesan ? (
        <p
          role={berhasil ? "status" : "alert"}
          className={cn("rounded-sm p-3 text-sm", berhasil ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-destructive/10 text-destructive")}
        >
          {pesan}
        </p>
      ) : null}

      <Panel lembar>
        <h1 className="text-xl leading-tight font-extrabold">{s.judul}</h1>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Kampus</dt>
          <dd>
            {s.kampusSlug ? (
              <Link href={`/kampus/${s.kampusSlug}`} className="text-primary hover:underline">
                {s.kampusNama}
              </Link>
            ) : (
              "Sumber nasional"
            )}
          </dd>
          <dt className="text-muted-foreground">Penerbit</dt>
          <dd>{s.penerbit}</dd>
          <dt className="text-muted-foreground">Dokumen</dt>
          <dd className="break-all">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {s.url}
            </a>
          </dd>
          <dt className="text-muted-foreground">Arsip</dt>
          <dd className="break-all">
            {s.arsipUrl ? (
              <a href={s.arsipUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {s.arsipUrl}
              </a>
            ) : (
              <span className="font-semibold text-amber-700">Tanpa arsip</span>
            )}
          </dd>
          <dt className="text-muted-foreground">Diakses</dt>
          <dd>{formatTanggal(s.diaksesPada)}</dd>
          <dt className="text-muted-foreground">Dimasukkan</dt>
          <dd>{milikSendiri ? "Kamu" : (s.dimasukkanEmail ?? "akun terhapus")}</dd>
        </dl>
      </Panel>

      {draf.jumlah ? (
        <>
          <h2 className="text-lg font-bold">Draf ({draf.jumlah})</h2>
          <TabelFakta fakta={draf} />
          <Panel lembar title="Keputusan">
            <div className="grid gap-6 md:grid-cols-2">
              <form action={periksa} className="space-y-3">
                <input type="hidden" name="sumberId" value={s.id} />
                <p className="text-sm">
                  Semua {draf.jumlah} fakta Draf sudah sama dengan dokumennya. Setelah ditandai, fakta tampil di halaman
                  publik.
                </p>
                {!s.arsipUrl ? (
                  <div className="space-y-1.5">
                    <label htmlFor="alasanTanpaArsip" className="text-sm font-semibold">
                      Alasan menerima tanpa arsip (wajib)
                    </label>
                    <textarea id="alasanTanpaArsip" name="alasanTanpaArsip" required maxLength={1000} rows={2} className={kolomInput} />
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={milikSendiri}
                  className="h-9 rounded-sm bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tandai Diperiksa
                </button>
                {milikSendiri ? (
                  <p className="text-xs text-muted-foreground">Kamu yang memasukkan fakta ini, jadi Moderator lain yang memeriksanya.</p>
                ) : null}
              </form>
              <form action={kembalikan} className="space-y-3">
                <input type="hidden" name="sumberId" value={s.id} />
                <div className="space-y-1.5">
                  <label htmlFor="catatan" className="text-sm font-semibold">
                    Kembalikan: apa yang perlu diperbaiki?
                  </label>
                  <textarea id="catatan" name="catatan" required maxLength={1000} rows={2} className={kolomInput} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Fakta Draf Sumber ini dihapus dan catatanmu ditampilkan untuk yang memasukkan.
                </p>
                <button type="submit" className="h-9 rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary">
                  Kembalikan
                </button>
              </form>
            </div>
          </Panel>
        </>
      ) : null}

      {tampil.jumlah ? (
        <form action={tarik} className="space-y-4">
          <input type="hidden" name="sumberId" value={s.id} />
          <h2 className="text-lg font-bold">Tampil di halaman publik ({tampil.jumlah})</h2>
          <TabelFakta fakta={tampil} pilih />
          <Panel lembar title="Tarik fakta">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Fakta yang ditarik langsung hilang dari halaman publik tetapi tetap tersimpan sebagai riwayat. Menarik Jalur
                Masuk ikut menarik biaya yang terkait dengannya. Untuk memperbaiki angka, impor Sumber baru setelah
                menarik yang salah.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="alasan" className="text-sm font-semibold">
                  Alasan (wajib, disimpan)
                </label>
                <textarea id="alasan" name="alasan" required maxLength={1000} rows={2} className={kolomInput} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" name="semua" value="" className="h-9 rounded-sm bg-destructive px-4 text-sm font-semibold text-white hover:bg-destructive/90">
                  Tarik yang dipilih
                </button>
                <button
                  type="submit"
                  name="semua"
                  value="ya"
                  className="h-9 rounded-sm bg-card px-4 text-sm font-semibold text-destructive ring-1 ring-destructive/40 hover:bg-destructive/10"
                >
                  Tarik semua {tampil.jumlah} fakta Sumber ini
                </button>
              </div>
            </div>
          </Panel>
        </form>
      ) : null}

      {ditarik.jumlah ? (
        <>
          <h2 className="text-lg font-bold">Ditarik ({ditarik.jumlah})</h2>
          <TabelFakta fakta={ditarik} riwayat />
        </>
      ) : null}

      {draf.jumlah + tampil.jumlah + ditarik.jumlah === 0 ? (
        <Panel lembar>
          <p className="text-sm text-muted-foreground">Sumber ini belum punya fakta. Impor lagi foldernya setelah diperbaiki.</p>
        </Panel>
      ) : null}
    </div>
  );
}

type Fakta = ReturnType<typeof saring>;

// The facts of one status. `pilih` adds a checkbox per row (named after the
// table, as the tarik action reads them); `riwayat` adds when and why each was withdrawn.
function SelPilih({ aktif, nama, id, label }: { aktif?: boolean; nama: string; id: number; label: string }) {
  if (!aktif) return null;
  return (
    <td className={`${sel} w-8`}>
      <input type="checkbox" name={nama} value={id} aria-label={`Pilih ${label}`} className="size-4 accent-destructive" />
    </td>
  );
}

function SelRiwayat({ aktif, f }: { aktif?: boolean; f: { ditarikAt: Date | null; alasanDitarik: string | null } }) {
  if (!aktif) return null;
  return (
    <td className={`${sel} text-xs text-muted-foreground`}>
      {f.ditarikAt ? formatWaktu(f.ditarikAt) : ""}
      <span className="block text-foreground">{f.alasanDitarik}</span>
    </td>
  );
}

function TabelFakta({ fakta, pilih, riwayat }: { fakta: Fakta; pilih?: boolean; riwayat?: boolean }) {
  const KepalaPilih = pilih ? (
    <th className={`${kepala} w-8`}>
      <span className="sr-only">Pilih</span>
    </th>
  ) : null;
  const KepalaRiwayat = riwayat ? <th className={kepala}>Ditarik</th> : null;

  return (
    <>
      {fakta.jalur.length ? (
        <Panel lembar title={`Jalur Masuk (${fakta.jalur.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {KepalaPilih}
                  <th className={kepala}>TA</th>
                  <th className={kepala}>Nama</th>
                  <th className={kepala}>Kategori</th>
                  <th className={kepala}>Seleksi</th>
                  <th className={kepala}>Pendaftaran</th>
                  {KepalaRiwayat}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fakta.jalur.map((j) => (
                  <tr key={j.id}>
                    <SelPilih aktif={pilih} nama="jalur" id={j.id} label={j.nama} />
                    <td className={sel}>{formatTahunAkademik(j.tahunAkademik)}</td>
                    <td className={sel}>{j.nama}</td>
                    <td className={sel}>{LABEL_KATEGORI_JALUR[j.kategori]}</td>
                    <td className={sel}>{j.tes.map((t) => LABEL_TES[t]).join(", ")}</td>
                    <td className={sel}>
                      {j.pendaftaranBuka || j.pendaftaranTutup
                        ? `${j.pendaftaranBuka ? formatTanggal(j.pendaftaranBuka) : "…"} – ${j.pendaftaranTutup ? formatTanggal(j.pendaftaranTutup) : "…"}`
                        : "—"}
                    </td>
                    <SelRiwayat aktif={riwayat} f={j} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {fakta.biaya.length ? (
        <Panel lembar title={`Biaya (${fakta.biaya.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {KepalaPilih}
                  <th className={kepala}>TA</th>
                  <th className={kepala}>Prodi</th>
                  <th className={kepala}>Jenis</th>
                  <th className={kepala}>Jalur</th>
                  <th className={`${kepala} text-right`}>Jumlah</th>
                  {KepalaRiwayat}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fakta.biaya.map((b) => (
                  <tr key={b.id}>
                    <SelPilih aktif={pilih} nama="biaya" id={b.id} label={`${LABEL_JENIS_BIAYA[b.jenis]} ${formatRupiah(b.jumlah)}`} />
                    <td className={sel}>{formatTahunAkademik(b.tahunAkademik)}</td>
                    <td className={sel}>
                      {b.prodiSlug ? (
                        <Link href={`/prodi/${b.prodiSlug}`} className="hover:underline">
                          {b.prodiJenjang} {b.prodiNama}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Seluruh Kampus</span>
                      )}
                    </td>
                    <td className={sel}>
                      {LABEL_JENIS_BIAYA[b.jenis]}
                      {b.label ? `, ${b.label}` : ""}
                    </td>
                    <td className={sel}>{b.jalurNama ?? "—"}</td>
                    <td className={`${sel} text-right whitespace-nowrap`}>
                      {formatRupiah(b.jumlah, b.batas)}
                      <span className="block text-xs text-muted-foreground">{LABEL_PERIODE[b.periode]}</span>
                    </td>
                    <SelRiwayat aktif={riwayat} f={b} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {fakta.beasiswa.length || fakta.ikutNasional.length ? (
        <Panel lembar title={`Beasiswa (${fakta.beasiswa.length + fakta.ikutNasional.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {KepalaPilih}
                  <th className={kepala}>TA</th>
                  <th className={kepala}>Beasiswa</th>
                  {KepalaRiwayat}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fakta.beasiswa.map((b) => (
                  <tr key={`b-${b.id}`}>
                    <SelPilih aktif={pilih} nama="beasiswa" id={b.id} label={b.nama} />
                    <td className={sel}>{formatTahunAkademik(b.tahunAkademik)}</td>
                    <td className={sel}>
                      <p className="font-semibold">{b.nama}</p>
                      <p>Penyelenggara: {b.penyelenggara}</p>
                      <p>Untuk: {b.sasaran}</p>
                      <p>Mencakup: {b.cakupan}</p>
                      {b.url ? (
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                          {b.url}
                        </a>
                      ) : null}
                    </td>
                    <SelRiwayat aktif={riwayat} f={b} />
                  </tr>
                ))}
                {fakta.ikutNasional.map((b) => (
                  <tr key={`ikut-${b.id}`}>
                    <SelPilih aktif={pilih} nama="beasiswaKampus" id={b.id} label={`ikut ${b.nama}`} />
                    <td className={sel}>{formatTahunAkademik(b.tahunAkademik)}</td>
                    <td className={sel}>
                      Ikut program nasional <span className="font-semibold">{b.nama}</span>
                    </td>
                    <SelRiwayat aktif={riwayat} f={b} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </>
  );
}
