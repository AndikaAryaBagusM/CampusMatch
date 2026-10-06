import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { TabModerasiNav } from "@/components/moderasi/tab-moderasi";
import { kontainer, Panel } from "@/components/panel";
import { hitungSumberDraf } from "@/lib/fakta/periksa";
import { formatAngka } from "@/lib/format";
import { requireModerator } from "@/lib/moderator";
import { cariPemetaan, KODE_PERLU_DICEK, listIsiJurusan } from "@/lib/pemetaan-jurusan";
import { hitungAntrean } from "@/lib/ulasan/moderasi";
import { param } from "@/lib/url";

export const metadata: Metadata = {
  title: "Pemetaan Jurusan",
  robots: { index: false, follow: false },
};

export default async function PemetaanJurusanPage(props: PageProps<"/moderasi/jurusan">) {
  await requireModerator();
  const sp = await props.searchParams;
  const cari = (param(sp.cari) ?? "").slice(0, 100);
  const slugJurusan = param(sp.jurusan) ?? "";
  const [jumlah, jumlahFakta, hasil, isi] = await withDb((db) =>
    Promise.all([
      hitungAntrean(db),
      hitungSumberDraf(db),
      cari ? cariPemetaan(db, cari) : null,
      slugJurusan ? listIsiJurusan(db, slugJurusan) : null,
    ]),
  );

  return (
    <div className={`${kontainer} space-y-6 py-8`}>
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Pemetaan Jurusan</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Setiap Prodi masuk ke Jurusan lewat Kode Prodi-nya. Di sini kamu bisa memindahkan seluruh Kode ke Jurusan lain,
          atau memindahkan Prodi tertentu saja. Setiap perubahan dicatat beserta alasannya. Jurusan baru tetap ditambahkan
          lewat CSV (data/jurusan-mapping.csv).
        </p>
      </div>
      <TabModerasiNav jumlah={{ ...jumlah, fakta: jumlahFakta }} aktif="jurusan" />

      <Panel title="Cari">
        <form className="flex gap-2" role="search">
          <label htmlFor="cari" className="sr-only">
            Kode Prodi, nama Prodi, atau Jurusan
          </label>
          <input
            id="cari"
            name="cari"
            defaultValue={cari}
            maxLength={100}
            placeholder="Kode Prodi (mis. 86207), nama Prodi, atau Jurusan"
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button type="submit" className="h-9 shrink-0 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-border hover:bg-secondary">
            Cari
          </button>
        </form>

        {hasil === null ? (
          cari ? <p className="mt-3 text-sm text-muted-foreground">Ketik minimal 2 karakter.</p> : null
        ) : (
          <div className="mt-4 space-y-4">
            {hasil.jurusan.length ? (
              <div>
                <h3 className="text-sm font-medium">Jurusan</h3>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {hasil.jurusan.map((j) => (
                    <li key={j.slug}>
                      <Link
                        href={`/moderasi/jurusan?jurusan=${j.slug}`}
                        className="inline-flex h-8 items-center rounded-full bg-secondary px-3 text-sm hover:underline"
                      >
                        {j.nama}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h3 className="text-sm font-medium">Kode Prodi</h3>
              {hasil.kode.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">Tidak ada Kode Prodi atau Prodi yang cocok.</p>
              ) : (
                <ul className="mt-1 divide-y divide-border text-sm">
                  {hasil.kode.map((k) => (
                    <li key={k.kode} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                      <Link href={`/moderasi/jurusan/kode/${k.kode}`} className="font-medium text-primary hover:underline">
                        {k.kode} · {k.contoh}
                      </Link>
                      <span className="text-muted-foreground">
                        {formatAngka(k.jumlah)} Prodi{/^\d+$/.test(hasil.q) ? "" : " cocok"} → {k.jurusanNama ?? "belum dipetakan"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Panel>

      {isi ? (
        <Panel title={`Isi Jurusan ${isi.jurusan.nama}`}>
          <ul className="divide-y divide-border text-sm">
            {isi.kode.map((k) => (
              <li key={k.kode} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <Link href={`/moderasi/jurusan/kode/${k.kode}`} className="font-medium text-primary hover:underline">
                  {k.kode} · {k.contoh ?? "tanpa Prodi"}
                </Link>
                <span className="text-muted-foreground">{formatAngka(k.jumlah)} Prodi lewat Kode</span>
              </li>
            ))}
            {isi.override.map((k) => (
              <li key={`o-${k.kode}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <Link href={`/moderasi/jurusan/kode/${k.kode}`} className="font-medium text-primary hover:underline">
                  {k.kode}
                </Link>
                <span className="text-muted-foreground">{formatAngka(k.jumlah)} Prodi dipindahkan ke sini</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Perlu dicek">
        <p className="mb-3 text-sm text-muted-foreground">
          Kode yang Prodi-nya bercampur, dari catatan kurasi (data/jurusan-curation.md).
        </p>
        <ul className="divide-y divide-border text-sm">
          {KODE_PERLU_DICEK.map((k) => (
            <li key={k.kode} className="py-2">
              <Link href={`/moderasi/jurusan/kode/${k.kode}`} className="font-medium text-primary hover:underline">
                {k.kode}
              </Link>
              <span className="text-muted-foreground"> · {k.catatan}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
