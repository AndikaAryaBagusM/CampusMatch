import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Columns3, X } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { DaftarSumber, Keterangan, Ref, rujukan, type Rujukan } from "@/components/fakta/biaya-masuk";
import { labelAkreditasi } from "@/components/kampus/akreditasi-badge";
import { judulQs, QsFootnote } from "@/components/kampus/peringkat-qs";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { SinkronBandingkan } from "@/components/perbandingan/sinkron-bandingkan";
import { BintangTampil } from "@/components/ulasan/bintang-tampil";
import { TeksAngka, TeksPilihan, TeksUangPangkal } from "@/components/info-biaya/estimasi-pengulas";
import { getFaktaKampus, listBiayaProdi, type BiayaTampil } from "@/lib/fakta/kueri";
import { formatRupiah, LABEL_JENIS_BIAYA, LABEL_KATEGORI_JALUR, LABEL_PERIODE, LABEL_TES } from "@/lib/fakta/label";
import { estimasiProdi, K } from "@/lib/info-biaya/estimasi";
import { LABEL_BEASISWA } from "@/lib/info-biaya/label";
import { formatTahunAkademik, tahunAkademikLama } from "@/lib/fakta/tahun-akademik";
import { formatAngka } from "@/lib/format";
import { getProdi, getRingkasanUlasan } from "@/lib/katalog";
import { getInfoQs } from "@/lib/peringkat-qs/kueri";
import { bacaSlugs, hrefBandingkan } from "@/lib/perbandingan/daftar";
import { ASPEK } from "@/lib/ulasan/skema";

// The Perbandingan (ADR 0007, decisions.md 17f, 17k): 2–3 Prodi side by side,
// facts and Ulasan scores, plus muted Estimasi Pengulas rows (ADR 0010). No
// verdict, no pros and cons, and no marks on the highest or lowest value: the
// student draws the conclusion.

export const metadata: Metadata = {
  title: "Perbandingan Prodi",
  description: "Bandingkan biaya, jalur masuk, beasiswa dan ulasan 2–3 Prodi berdampingan.",
  robots: { index: false, follow: true },
};

async function muat(slugs: string[]) {
  return withDb(async (db) => {
    const [qs, kolom] = await Promise.all([
      getInfoQs(db),
      Promise.all(
        slugs.map(async (slug) => {
          const prodi = await getProdi(db, slug);
          if (!prodi) return null;
          const [biayaProdi, fakta, ringkasan] = await Promise.all([
            listBiayaProdi(db, prodi.id),
            getFaktaKampus(db, prodi.kampus.id),
            getRingkasanUlasan(db, { prodiSlug: slug }),
          ]);
          return { prodi, biayaProdi, fakta, ringkasan };
        }),
      ),
    ]);
    const ada = kolom.filter((k) => k !== null);
    const estimasi = await estimasiProdi(db, ada.map((k) => k.prodi.id));
    return { qs, kolom: kolom.map((k) => (k ? { ...k, estimasi: estimasi.get(k.prodi.id)! } : null)) };
  });
}

type Kolom = NonNullable<Awaited<ReturnType<typeof muat>>["kolom"][number]>;

const satuDesimal = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const labelProdi = (k: Kolom) => `${k.prodi.jenjang} ${k.prodi.nama}, ${k.prodi.kampus.nama}`;

function Kosong() {
  return <span className="text-muted-foreground">Belum ada data</span>;
}

function Tahun({ tahun, seKampus }: { tahun: number; seKampus?: boolean }) {
  return (
    <span className="mb-1 block text-xs text-muted-foreground">
      TA {formatTahunAkademik(tahun)}
      {seKampus ? ", berlaku se-Kampus" : null}
      {tahunAkademikLama(tahun) ? (
        <span className="mt-0.5 flex items-center gap-1 text-warning">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          mungkin sudah berubah
        </span>
      ) : null}
    </span>
  );
}

function DaftarBiaya({ daftar, r }: { daftar: BiayaTampil[]; r: Rujukan }) {
  return (
    <ul className="space-y-1">
      {daftar.map((b) => (
        <li key={b.id}>
          {b.label ?? LABEL_JENIS_BIAYA[b.jenis]}
          {b.jalurNama ? <span className="text-muted-foreground"> ({b.jalurNama})</span> : null}:{" "}
          <span className="font-semibold whitespace-nowrap">{formatRupiah(b.jumlah, b.batas)}</span>
          <Ref sumber={b.sumber} r={r} />
          {b.jenis === "lain" || b.jenis === "pendaftaran" ? <span className="text-muted-foreground">, {LABEL_PERIODE[b.periode]}</span> : null}
        </li>
      ))}
    </ul>
  );
}

// The Prodi's own rows of these jenis, then the Kampus-wide ones: for UKT and
// Uang Pangkal only when the Prodi has none (a Kampus-wide value applies to
// it); for other costs both, since they add up.
function SelBiaya({ k, jenis, r, gabung = false }: { k: Kolom; jenis: BiayaTampil["jenis"][]; r: Rujukan; gabung?: boolean }) {
  const milikProdi = k.biayaProdi?.daftar.filter((b) => jenis.includes(b.jenis)) ?? [];
  const seKampus = k.fakta?.biaya?.daftar.filter((b) => jenis.includes(b.jenis)) ?? [];
  const tampilKampus = seKampus.length > 0 && (gabung || milikProdi.length === 0);
  if (!milikProdi.length && !tampilKampus) return <Kosong />;
  return (
    <div className="space-y-3">
      {milikProdi.length ? (
        <div>
          <Tahun tahun={k.biayaProdi!.tahunAkademik} />
          <DaftarBiaya daftar={milikProdi} r={r} />
        </div>
      ) : null}
      {tampilKampus ? (
        <div>
          <Tahun tahun={k.fakta!.biaya!.tahunAkademik} seKampus />
          <DaftarBiaya daftar={seKampus} r={r} />
        </div>
      ) : null}
    </div>
  );
}

function SelJalur({ k, r }: { k: Kolom; r: Rujukan }) {
  const jalur = k.fakta?.jalur;
  if (!jalur) return <Kosong />;
  return (
    <>
      <Tahun tahun={jalur.tahunAkademik} />
      <ul className="space-y-2">
        {jalur.daftar.map((j) => (
          <li key={j.id}>
            <span className="font-semibold">{j.nama}</span>
            <Ref sumber={j.sumber} r={r} />
            <span className="block text-muted-foreground">{j.tes.map((t) => LABEL_TES[t]).join(", ")}</span>
            {j.biaya.map((b) => (
              <span key={b.id} className="block">
                {b.label ?? "Pendaftaran"}: <span className="whitespace-nowrap">{formatRupiah(b.jumlah, b.batas)}</span>
                <Ref sumber={b.sumber} r={r} />
              </span>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

function SelBeasiswa({ k, r }: { k: Kolom; r: Rujukan }) {
  const beasiswa = k.fakta?.beasiswa;
  if (!beasiswa) return <Kosong />;
  return (
    <>
      <Tahun tahun={beasiswa.tahunAkademik} />
      <ul className="space-y-1">
        {beasiswa.daftar.map((b) => (
          <li key={`${b.nasional}-${b.nama}`}>
            {b.nama}
            <Ref sumber={b.sumber} r={r} />
            {b.sumberIkut ? <Ref sumber={b.sumberIkut} r={r} /> : null}
            {b.nasional ? <span className="text-muted-foreground"> (program nasional)</span> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function sumberKolom(k: Kolom, i: number) {
  const { biayaProdi, fakta } = k;
  return rujukan(
    [
      ...(biayaProdi?.daftar.map((b) => b.sumber) ?? []),
      ...(fakta?.biaya?.daftar.map((b) => b.sumber) ?? []),
      ...(fakta?.jalur?.daftar.flatMap((j) => [j.sumber, ...j.biaya.map((b) => b.sumber)]) ?? []),
      ...(fakta?.beasiswa?.daftar.flatMap((b) => [b.sumber, ...(b.sumberIkut ? [b.sumberIkut] : [])]) ?? []),
    ],
    `p${i + 1}`,
  );
}

const thBaris = "sticky left-0 z-10 w-32 min-w-32 bg-card py-3 pr-3 text-left align-top text-xs font-semibold text-muted-foreground sm:w-44 sm:min-w-44 sm:text-sm";
const td = "min-w-56 py-3 pr-4 align-top";

function Bagian({ judul, jumlah }: { judul: string; jumlah: number }) {
  return (
    <tr>
      <th scope="colgroup" colSpan={jumlah + 1} className="bg-secondary/60 px-3 py-2 text-left text-sm font-semibold">
        <span className="sticky left-3">{judul}</span>
      </th>
    </tr>
  );
}

export default async function BandingkanPage(props: PageProps<"/bandingkan">) {
  const sp = await props.searchParams;
  const slugs = bacaSlugs(sp.p);
  const { qs, kolom: hasil } = slugs.length ? await muat(slugs) : { qs: null, kolom: [] };
  const kolom = hasil.filter((k): k is Kolom => k !== null);
  const hilang = slugs.length - kolom.length;
  const pilihan = kolom.map((k) => ({ slug: k.prodi.slug, label: labelProdi(k) }));

  if (kolom.length < 2)
    return (
      <div className={`${kontainer} max-w-3xl`}>
        <SinkronBandingkan daftar={pilihan} />
        <PageBreadcrumb items={[{ label: "Perbandingan" }]} />
        <h1 className="mb-6 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">Perbandingan Prodi</h1>
        <Panel>
          <EmptyState icon={Columns3} title={kolom.length === 1 ? "Pilih satu Prodi lagi" : "Pilih 2 atau 3 Prodi untuk dibandingkan"}>
            Tekan <span className="font-semibold">Bandingkan</span> di halaman Prodi atau di daftar Prodi sebuah Jurusan. Prodi
            yang kamu pilih muncul di bilah bawah layar.{" "}
            <Link href="/tes-minat" className="font-semibold text-primary hover:underline">
              Belum tahu Jurusan? Coba Tes Minat
            </Link>
            {hilang > 0 ? <span className="mt-2 block">{hilang} Prodi dari tautan ini tidak ditemukan.</span> : null}
          </EmptyState>
        </Panel>
        {kolom.length === 1 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Sudah dipilih:{" "}
            <Link href={`/prodi/${kolom[0].prodi.slug}`} className="text-primary hover:underline">
              {labelProdi(kolom[0])}
            </Link>
          </p>
        ) : null}
      </div>
    );

  const rujukanKolom = kolom.map(sumberKolom);
  const n = kolom.length;
  // Muted rows under the official ones (ADR 0010): never merged with the fact above.
  const estimasi = (sel: (k: Kolom) => React.ReactNode) => (
    <tr className="border-t border-dashed border-border">
      <th scope="row" className={`${thBaris} font-normal italic`}>
        Estimasi Pengulas
      </th>
      {kolom.map((k) => (
        <td key={k.prodi.slug} className={`${td} text-muted-foreground`}>
          {sel(k)}
        </td>
      ))}
    </tr>
  );
  const baris = (label: string, sel: (k: Kolom, i: number) => React.ReactNode) => (
    <tr className="border-t border-border">
      <th scope="row" className={thBaris}>
        {label}
      </th>
      {kolom.map((k, i) => (
        <td key={k.prodi.slug} className={td}>
          {sel(k, i)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className={kontainer}>
      <SinkronBandingkan daftar={pilihan} />
      <PageBreadcrumb items={[{ label: "Perbandingan" }]} />
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">Perbandingan Prodi</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Data dijajarkan apa adanya. CampusMatch tidak menilai mana yang lebih baik; pertimbangkan sendiri sesuai
          kebutuhanmu.
          {hilang > 0 ? ` ${hilang} Prodi dari tautan ini tidak ditemukan dan dilewati.` : null}
        </p>
      </div>

      <div className="overflow-x-auto border-t-[3px] border-foreground">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <td className={`${thBaris} pt-5`} />
              {kolom.map((k) => (
                <th key={k.prodi.slug} scope="col" className={`${td} pt-5 text-left font-normal`}>
                  <Link href={`/prodi/${k.prodi.slug}`} className="text-base font-semibold text-primary hover:underline">
                    {k.prodi.jenjang} {k.prodi.nama}
                  </Link>
                  <Link href={`/kampus/${k.prodi.kampus.slug}`} className="mt-0.5 block hover:underline">
                    {k.prodi.kampus.nama}
                  </Link>
                  <Link href={`/kota/${k.prodi.kotaSlug}`} className="block text-muted-foreground hover:underline">
                    {k.prodi.kotaNama}
                  </Link>
                  <Link
                    href={hrefBandingkan(slugs.filter((s) => s !== k.prodi.slug))}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                    aria-label={`Hapus ${labelProdi(k)} dari perbandingan`}
                  >
                    <X className="size-3.5" aria-hidden />
                    Hapus
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Bagian judul="Katalog" jumlah={n} />
            {baris("Jurusan", (k) =>
              k.prodi.jurusanSlug ? (
                <Link href={`/jurusan/${k.prodi.jurusanSlug}`} className="text-primary hover:underline">
                  {k.prodi.jurusanNama}
                </Link>
              ) : (
                <span className="text-muted-foreground">Belum dipetakan</span>
              ),
            )}
            {baris("Jenjang", (k) => k.prodi.jenjang)}
            {baris("Bentuk Kampus", (k) => k.prodi.kampus.bentuk)}
            {baris("Akreditasi Kampus", (k) => labelAkreditasi(k.prodi.kampus.akreditasi))}
            {qs
              ? baris(judulQs(qs.edisi), (k) => k.prodi.kampus.peringkatQs ?? <span className="text-muted-foreground">Tidak masuk</span>)
              : null}

            <Bagian judul="Biaya" jumlah={n} />
            {baris("UKT / SPP per semester", (k, i) => <SelBiaya k={k} jenis={["ukt", "spp"]} r={rujukanKolom[i]} />)}
            {estimasi((k) => <TeksAngka r={k.estimasi.biayaSemester} />)}
            {baris("Uang Pangkal", (k, i) => <SelBiaya k={k} jenis={["uang_pangkal"]} r={rujukanKolom[i]} />)}
            {estimasi((k) => <TeksUangPangkal r={k.estimasi.uangPangkal} />)}
            {baris("Biaya lain", (k, i) => <SelBiaya k={k} jenis={["lain", "pendaftaran"]} r={rujukanKolom[i]} gabung />)}
            {estimasi((k) => <TeksAngka r={k.estimasi.biayaLainMasuk} />)}

            <Bagian judul="Masuk dan Beasiswa" jumlah={n} />
            {baris("Jalur Masuk", (k, i) => <SelJalur k={k} r={rujukanKolom[i]} />)}
            {estimasi((k) => <TeksPilihan r={k.estimasi.jalur} label={LABEL_KATEGORI_JALUR} />)}
            {baris("Beasiswa", (k, i) => <SelBeasiswa k={k} r={rujukanKolom[i]} />)}
            {estimasi((k) => <TeksPilihan r={k.estimasi.beasiswa} label={LABEL_BEASISWA} />)}

            <Bagian judul="Ulasan" jumlah={n} />
            {baris("Bintang", (k) =>
              k.ringkasan ? (
                <span className="flex flex-wrap items-center gap-2">
                  <BintangTampil nilai={k.ringkasan.bintang} />
                  <span>
                    <span className="font-semibold">{satuDesimal(k.ringkasan.bintang)}</span>
                    <span className="text-muted-foreground"> dari {formatAngka(k.ringkasan.jumlah)} ulasan</span>
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Belum ada ulasan</span>
              ),
            )}
            {baris("Merekomendasikan", (k) =>
              k.ringkasan ? `${Math.round(k.ringkasan.tingkatRekomendasi * 100)}%` : <span className="text-muted-foreground">—</span>,
            )}
            {ASPEK.map((a) => (
              <BarisAspek key={a.kolom} label={a.label}>
                {kolom.map((k) => (
                  <td key={k.prodi.slug} className={td}>
                    {k.ringkasan ? (
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-20 overflow-hidden rounded-sm bg-secondary" aria-hidden>
                          <span
                            className="block h-full rounded-full bg-jade"
                            style={{ width: `${(k.ringkasan.aspek[a.kolom] / 5) * 100}%` }}
                          />
                        </span>
                        <span className="tabular-nums">{satuDesimal(k.ringkasan.aspek[a.kolom])}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </BarisAspek>
            ))}

            <Bagian judul="Sumber" jumlah={n} />
            {baris("Sumber data biaya dan masuk", (k, i) =>
              rujukanKolom[i].sumber.length ? <DaftarSumber r={rujukanKolom[i]} judul={false} /> : <Kosong />,
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 max-w-3xl space-y-2 px-1">
        {kolom.some((k) => k.prodi.kampus.peringkatQs) ? <QsFootnote qs={qs} /> : null}
        <Keterangan />
        <p className="text-xs text-muted-foreground">
          Biaya Prodi diambil dari data Prodi itu sendiri; bila Kampus hanya menerbitkan biaya untuk seluruh Kampus,
          angka itu ditandai &ldquo;berlaku se-Kampus&rdquo;. Skor ulasan adalah rata-rata ulasan yang sudah terbit.
        </p>
        <p className="text-xs text-muted-foreground">
          Baris Estimasi Pengulas bukan data resmi: gabungan jawaban Pengulas tentang yang mereka bayar, dari angkatan lima
          tahun terakhir, dan baru muncul setelah dijawab minimal {K} Pengulas.
        </p>
      </div>
    </div>
  );
}

function BarisAspek({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <th scope="row" className={thBaris}>
        {label}
      </th>
      {children}
    </tr>
  );
}
