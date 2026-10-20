import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/db";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { requireModerator } from "@/lib/moderator";
import { listSemuaJurusan } from "@/lib/pemetaan-jurusan";
import { cariKampusPromosi, getKampusPromosi, hariIniJakarta, listJurusanKampus, NAMA_MAKS, TEKS_MAKS } from "@/lib/promosi";
import { param } from "@/lib/url";
import { cn } from "@/lib/utils";
import { buat } from "../actions";

export const metadata: Metadata = {
  title: "Buat Promosi",
  robots: { index: false, follow: false },
};

const kolomInput =
  "min-h-9 w-full rounded-sm border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Plain GET/POST forms. A Kampus Promosi takes two steps: pick the Kampus,
// then fill in the rest (the Jurusan list depends on the Kampus). A bimbel
// Promosi (ADR 0012) is one form and may target any Jurusan.
export default async function BuatPromosiPage(props: PageProps<"/moderasi/promosi/baru">) {
  await requireModerator();
  const sp = await props.searchParams;
  const bimbel = param(sp.jenis) === "bimbel";
  const cari = (param(sp.cari) ?? "").slice(0, 100);
  const kampusId = Number(param(sp.kampus));
  const pesan = param(sp.pesan);
  const [hasil, kampus, jurusan] = await withDb(async (db) => {
    if (bimbel) return Promise.all([[], null, listSemuaJurusan(db)]);
    const k = Number.isSafeInteger(kampusId) && kampusId > 0 ? await getKampusPromosi(db, kampusId) : null;
    return Promise.all([cari && !k ? cariKampusPromosi(db, cari) : [], k, k ? listJurusanKampus(db, k.id) : []]);
  });

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-8`}>
      <PageBreadcrumb items={[{ label: "Promosi", href: "/moderasi/promosi" }, { label: "Buat" }]} />
      <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Buat Promosi</h1>
      {pesan ? (
        <p role="alert" className="rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
          {pesan}
        </p>
      ) : null}

      <nav aria-label="Jenis Promosi" className="flex gap-2 text-sm">
        {[
          { label: "Kampus", href: "/moderasi/promosi/baru", aktif: !bimbel },
          {
            label: "Bimbel",
            href: "/moderasi/promosi/baru?jenis=bimbel",
            aktif: bimbel,
          },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.href}
            aria-current={t.aktif ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-sm px-4 font-semibold ring-1 ring-foreground/10",
              t.aktif ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {bimbel ? (
        <Panel lembar title="Promosi bimbel">
          <form action={buat} className="space-y-5">
            <input type="hidden" name="jenis" value="bimbel" />
            <div>
              <label htmlFor="namaPengiklan" className="mb-1 block text-sm font-semibold">
                Nama bimbel
              </label>
              <input id="namaPengiklan" name="namaPengiklan" required maxLength={NAMA_MAKS} className={kolomInput} />
            </div>
            <div>
              <label htmlFor="tautan" className="mb-1 block text-sm font-semibold">
                Tautan
              </label>
              <input id="tautan" name="tautan" type="url" required maxLength={500} placeholder="https://" className={kolomInput} />
              <p className="mt-1 text-xs text-muted-foreground">
                Alamat situs bimbel itu sendiri, diawali https://. Hanya parameter utm_ yang boleh.
              </p>
            </div>
            <IsianUmum
              jurusan={jurusan}
              keteranganJurusan="Halaman Jurusan dan pencarian yang cocok, untuk Jurusan yang dibeli:"
              labelTeks={`Teks dari bimbel (wajib, maks. ${TEKS_MAKS} karakter)`}
              wajibTeks
              keteranganTeks="Tanpa janji lolos atau diterima, tanpa kesan didukung Kampus atau CampusMatch, dan tanpa klaim “terbaik”."
            />
          </form>
        </Panel>
      ) : !kampus ? (
        <Panel lembar title="1. Pilih Kampus">
          <form className="flex gap-2" role="search">
            <label htmlFor="cari" className="sr-only">
              NPSN atau nama Kampus
            </label>
            <input id="cari" name="cari" defaultValue={cari} maxLength={100} placeholder="NPSN atau nama Kampus" className={kolomInput} />
            <button type="submit" className="h-9 shrink-0 rounded-sm bg-card px-4 text-sm font-semibold ring-1 ring-foreground/10 hover:bg-secondary">
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
                    <Link href={`/moderasi/promosi/baru?kampus=${k.id}`} className="font-semibold text-primary hover:underline">
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
        <Panel lembar title={`2. Promosi untuk ${kampus.nama}`}>
          <p className="mb-4 text-sm text-muted-foreground">
            {kampus.kotaNama} · NPSN {kampus.npsn} ·{" "}
            <Link href="/moderasi/promosi/baru" className="text-primary hover:underline">
              Ganti Kampus
            </Link>
          </p>
          <form action={buat} className="space-y-5">
            <input type="hidden" name="jenis" value="kampus" />
            <input type="hidden" name="kampusId" value={kampus.id} />
            <IsianUmum
              jurusan={jurusan}
              keteranganJurusan="Halaman Jurusan dan pencarian yang cocok, untuk Jurusan yang dibeli (hanya yang ditawarkan Kampus ini):"
              labelTeks={`Teks dari Kampus (opsional, maks. ${TEKS_MAKS} karakter)`}
              keteranganTeks="Fakta tentang Kampus saja, mis. jadwal pendaftaran. Tanpa klaim “terbaik”, peringkat, atau perbandingan dengan Kampus lain."
            />
          </form>
        </Panel>
      )}
    </div>
  );
}

// The fields both kinds share: where it shows, its dates, its text and the internal note.
function IsianUmum(props: {
  jurusan: { id: number; nama: string }[];
  keteranganJurusan: string;
  labelTeks: string;
  wajibTeks?: boolean;
  keteranganTeks: string;
}) {
  const hariIni = hariIniJakarta();
  return (
    <>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Tempat tampil</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="diBeranda" value="1" className="size-4 accent-primary" />
          Beranda
        </label>
        <p className="mb-1 mt-3 text-sm text-muted-foreground">{props.keteranganJurusan}</p>
        <div className="max-h-72 overflow-y-auto rounded-sm p-2 ring-1 ring-foreground/10">
          {props.jurusan.map((j) => (
            <label key={j.id} className="flex items-center gap-2 py-0.5 text-sm">
              <input type="checkbox" name="jurusan" value={j.id} className="size-4 accent-primary" />
              {j.nama}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="mulai" className="mb-1 block text-sm font-semibold">
            Mulai
          </label>
          <input id="mulai" name="mulai" type="date" required defaultValue={hariIni} className={kolomInput} />
        </div>
        <div>
          <label htmlFor="selesai" className="mb-1 block text-sm font-semibold">
            Selesai (termasuk)
          </label>
          <input id="selesai" name="selesai" type="date" required min={hariIni} className={kolomInput} />
        </div>
      </div>
      <div>
        <label htmlFor="teks" className="mb-1 block text-sm font-semibold">
          {props.labelTeks}
        </label>
        <textarea id="teks" name="teks" required={props.wajibTeks} maxLength={TEKS_MAKS} rows={2} className={kolomInput} />
        <p className="mt-1 text-xs text-muted-foreground">{props.keteranganTeks}</p>
      </div>
      <div>
        <label htmlFor="catatanInternal" className="mb-1 block text-sm font-semibold">
          Catatan internal (tidak tampil publik)
        </label>
        <input id="catatanInternal" name="catatanInternal" maxLength={500} placeholder="Mis. nomor kontrak" className={kolomInput} />
      </div>
      <button type="submit" className="h-9 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-deep">
        Simpan sebagai Draf
      </button>
    </>
  );
}
