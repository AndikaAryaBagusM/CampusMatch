import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { requireModerator } from "@/lib/moderator";
import { cariKampusPromosi, getKampusPromosi, hariIniJakarta, listJurusanKampus, TEKS_MAKS } from "@/lib/promosi";
import { param } from "@/lib/url";
import { buat } from "../actions";

export const metadata: Metadata = {
  title: "Buat Promosi",
  robots: { index: false, follow: false },
};

const kolomInput =
  "min-h-9 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Two steps, both plain GET/POST forms: pick the Kampus, then fill in the rest
// (the Jurusan list depends on the Kampus).
export default async function BuatPromosiPage(props: PageProps<"/moderasi/promosi/baru">) {
  await requireModerator();
  const sp = await props.searchParams;
  const cari = (param(sp.cari) ?? "").slice(0, 100);
  const kampusId = Number(param(sp.kampus));
  const pesan = param(sp.pesan);
  const [hasil, kampus, jurusan] = await withDb(async (db) => {
    const k = Number.isSafeInteger(kampusId) && kampusId > 0 ? await getKampusPromosi(db, kampusId) : null;
    return Promise.all([cari && !k ? cariKampusPromosi(db, cari) : [], k, k ? listJurusanKampus(db, k.id) : []]);
  });
  const hariIni = hariIniJakarta();

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-8`}>
      <PageBreadcrumb items={[{ label: "Promosi", href: "/moderasi/promosi" }, { label: "Buat" }]} />
      <h1 className="text-2xl font-medium tracking-tight">Buat Promosi</h1>
      {pesan ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{pesan}</p> : null}

      {!kampus ? (
        <Panel title="1. Pilih Kampus">
          <form className="flex gap-2" role="search">
            <label htmlFor="cari" className="sr-only">
              NPSN atau nama Kampus
            </label>
            <input id="cari" name="cari" defaultValue={cari} maxLength={100} placeholder="NPSN atau nama Kampus" className={kolomInput} />
            <button type="submit" className="h-9 shrink-0 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-border hover:bg-secondary">
              Cari
            </button>
          </form>
          {cari ? (
            hasil.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Tidak ada Kampus yang cocok.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-sm">
                {hasil.map((k) => (
                  <li key={k.id} className="py-2">
                    <Link href={`/moderasi/promosi/baru?kampus=${k.id}`} className="font-medium text-primary hover:underline">
                      {k.nama}
                    </Link>
                    <span className="text-muted-foreground">
                      {" "}
                      · {k.kotaNama} · NPSN {k.npsn}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </Panel>
      ) : (
        <Panel title={`2. Promosi untuk ${kampus.nama}`}>
          <p className="mb-4 text-sm text-muted-foreground">
            {kampus.kotaNama} · NPSN {kampus.npsn} ·{" "}
            <Link href="/moderasi/promosi/baru" className="text-primary hover:underline">
              Ganti Kampus
            </Link>
          </p>
          <form action={buat} className="space-y-5">
            <input type="hidden" name="kampusId" value={kampus.id} />
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Tempat tampil</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="diBeranda" value="1" className="size-4 accent-primary" />
                Beranda
              </label>
              <p className="mb-1 mt-3 text-sm text-muted-foreground">
                Halaman Jurusan dan pencarian yang cocok, untuk Jurusan yang dibeli (hanya yang ditawarkan Kampus ini):
              </p>
              <div className="max-h-72 overflow-y-auto rounded-lg p-2 ring-1 ring-border">
                {jurusan.map((j) => (
                  <label key={j.id} className="flex items-center gap-2 py-0.5 text-sm">
                    <input type="checkbox" name="jurusan" value={j.id} className="size-4 accent-primary" />
                    {j.nama}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="mulai" className="mb-1 block text-sm font-medium">
                  Mulai
                </label>
                <input id="mulai" name="mulai" type="date" required defaultValue={hariIni} className={kolomInput} />
              </div>
              <div>
                <label htmlFor="selesai" className="mb-1 block text-sm font-medium">
                  Selesai (termasuk)
                </label>
                <input id="selesai" name="selesai" type="date" required min={hariIni} className={kolomInput} />
              </div>
            </div>
            <div>
              <label htmlFor="teks" className="mb-1 block text-sm font-medium">
                Teks dari Kampus (opsional, maks. {TEKS_MAKS} karakter)
              </label>
              <textarea id="teks" name="teks" maxLength={TEKS_MAKS} rows={2} className={kolomInput} />
              <p className="mt-1 text-xs text-muted-foreground">
                Fakta tentang Kampus saja, mis. jadwal pendaftaran. Tanpa klaim &ldquo;terbaik&rdquo;, peringkat, atau
                perbandingan dengan Kampus lain.
              </p>
            </div>
            <div>
              <label htmlFor="catatanInternal" className="mb-1 block text-sm font-medium">
                Catatan internal (tidak tampil publik)
              </label>
              <input id="catatanInternal" name="catatanInternal" maxLength={500} placeholder="Mis. nomor kontrak" className={kolomInput} />
            </div>
            <button type="submit" className="h-9 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-deep">
              Simpan sebagai Draf
            </button>
          </form>
        </Panel>
      )}
    </div>
  );
}
