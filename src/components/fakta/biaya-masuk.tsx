import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Panel } from "@/components/panel";
import { formatTanggal } from "@/lib/format";
import type { BeasiswaTampil, BiayaTampil, FaktaKampus, JalurTampil, SumberRingkas, Bagian } from "@/lib/fakta/kueri";
import { formatRupiah, LABEL_JENIS_BIAYA, LABEL_KATEGORI_JALUR, LABEL_PERIODE, LABEL_TES } from "@/lib/fakta/label";
import { formatTahunAkademik, tahunAkademikLama } from "@/lib/fakta/tahun-akademik";

// Biaya & Masuk facts on the Kampus and Prodi pages (decisions.md 17a–17f).
// Every fact carries a numbered reference to its Sumber, listed at the end of
// the panel with the access date and the Wayback copy. Facts only: no
// verdicts, no "best" marks (ADR 0007).

export type Rujukan = { nomor: Map<number, number>; awalan: string };

export function rujukan(daftar: SumberRingkas[], awalan: string): Rujukan & { sumber: SumberRingkas[] } {
  const nomor = new Map<number, number>();
  const sumber: SumberRingkas[] = [];
  for (const s of daftar)
    if (!nomor.has(s.id)) {
      nomor.set(s.id, nomor.size + 1);
      sumber.push(s);
    }
  return { nomor, awalan, sumber };
}

export function Ref({ sumber, r }: { sumber: SumberRingkas; r: Rujukan }) {
  const i = r.nomor.get(sumber.id);
  return (
    <a
      href={`#${r.awalan}-sumber-${i}`}
      aria-label={`Sumber ${i}`}
      className="ml-0.5 align-super text-[0.7rem] font-medium text-primary hover:underline"
    >
      [{i}]
    </a>
  );
}

export function DaftarSumber({ r, judul = true }: { r: ReturnType<typeof rujukan>; judul?: boolean }) {
  return (
    <div className={judul ? "border-t border-border pt-4" : undefined}>
      {judul ? <h3 className="mb-2 text-sm font-medium">Sumber</h3> : null}
      <ol className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        {r.sumber.map((s, i) => (
          <li key={s.id} id={`${r.awalan}-sumber-${i + 1}`} className="scroll-mt-24">
            [{i + 1}]{" "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-foreground underline-offset-2 hover:underline">
              {s.judul}
            </a>
            , {s.penerbit}. Diakses {formatTanggal(s.diaksesPada)}.
            {s.arsipUrl ? (
              <>
                {" "}
                <a href={s.arsipUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Arsip
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Keterangan() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Dicatat dari sumber resmi pada tanggal yang tertera dan diperiksa dua orang tim CampusMatch. Biaya dan jalur masuk
      bisa berubah, jadi pastikan lagi ke Kampus sebelum mendaftar. CampusMatch tidak berafiliasi dengan Kampus mana pun.{" "}
      <Link href="/ketentuan#biaya-masuk" className="text-primary hover:underline">
        Selengkapnya
      </Link>
    </p>
  );
}

function JudulBagian({ judul, tahunAkademik }: { judul: string; tahunAkademik: number }) {
  const lama = tahunAkademikLama(tahunAkademik);
  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{judul}</h3>
        <span className="text-xs text-muted-foreground">TA {formatTahunAkademik(tahunAkademik)}</span>
      </div>
      {lama ? (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-px size-4 shrink-0" aria-hidden />
          Data TA {formatTahunAkademik(tahunAkademik)}, mungkin sudah berubah.
        </p>
      ) : null}
    </div>
  );
}

function TabelBiaya({ daftar, r }: { daftar: BiayaTampil[]; r: Rujukan }) {
  const adaJalur = daftar.some((b) => b.jalurNama);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-3 font-medium">
              Rincian
            </th>
            {adaJalur ? (
              <th scope="col" className="py-2 pr-3 font-medium">
                Jalur Masuk
              </th>
            ) : null}
            <th scope="col" className="py-2 text-right font-medium">
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {daftar.map((b) => (
            <tr key={b.id}>
              <td className="py-2 pr-3">
                {LABEL_JENIS_BIAYA[b.jenis]}
                {b.label ? <span className="text-muted-foreground">, {b.label}</span> : null}
              </td>
              {/* No Jalur Masuk means the Sumber didn't tie it to one, not "every jalur". */}
              {adaJalur ? <td className="py-2 pr-3 text-muted-foreground">{b.jalurNama ?? "—"}</td> : null}
              <td className="py-2 text-right whitespace-nowrap">
                <span className="font-medium">{formatRupiah(b.jumlah, b.batas)}</span>
                <Ref sumber={b.sumber} r={r} />
                <span className="block text-xs text-muted-foreground">{LABEL_PERIODE[b.periode]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DaftarJalur({ daftar, r }: { daftar: JalurTampil[]; r: Rujukan }) {
  return (
    <ul className="space-y-3">
      {daftar.map((j) => (
        <li key={j.id} className="rounded-lg p-3 text-sm ring-1 ring-border">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">
              {j.nama}
              <Ref sumber={j.sumber} r={r} />
            </p>
            {j.nama.toLowerCase() !== LABEL_KATEGORI_JALUR[j.kategori].toLowerCase() ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{LABEL_KATEGORI_JALUR[j.kategori]}</span>
            ) : null}
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
            <dt>Seleksi</dt>
            <dd className="text-foreground/90">{j.tes.map((t) => LABEL_TES[t]).join(", ")}</dd>
            {j.pendaftaranBuka || j.pendaftaranTutup ? (
              <>
                <dt>Pendaftaran</dt>
                <dd className="text-foreground/90">
                  {j.pendaftaranBuka ? formatTanggal(j.pendaftaranBuka) : "…"} – {j.pendaftaranTutup ? formatTanggal(j.pendaftaranTutup) : "…"}
                </dd>
              </>
            ) : null}
            {j.biaya.map((b) => (
              <div key={b.id} className="contents">
                <dt>{b.label ?? "Biaya pendaftaran"}</dt>
                <dd className="text-foreground/90">
                  {formatRupiah(b.jumlah, b.batas)}
                  <Ref sumber={b.sumber} r={r} />
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function DaftarBeasiswa({ daftar, r }: { daftar: BeasiswaTampil[]; r: Rujukan }) {
  return (
    <ul className="space-y-3">
      {daftar.map((b) => (
        <li key={`${b.nasional}-${b.nama}`} className="rounded-lg p-3 text-sm ring-1 ring-border">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">
              {b.url ? (
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {b.nama}
                </a>
              ) : (
                b.nama
              )}
              <Ref sumber={b.sumber} r={r} />
              {b.sumberIkut ? <Ref sumber={b.sumberIkut} r={r} /> : null}
            </p>
            {b.nasional ? <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">Program nasional</span> : null}
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
            <dt>Penyelenggara</dt>
            <dd className="text-foreground/90">{b.penyelenggara}</dd>
            <dt>Untuk</dt>
            <dd className="text-foreground/90">{b.sasaran}</dd>
            <dt>Mencakup</dt>
            <dd className="text-foreground/90">{b.cakupan}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function PanelBiayaMasukKampus({ fakta }: { fakta: FaktaKampus }) {
  const { jalur, biaya, beasiswa } = fakta;
  const r = rujukan(
    [
      ...(jalur?.daftar.flatMap((j) => [j.sumber, ...j.biaya.map((b) => b.sumber)]) ?? []),
      ...(biaya?.daftar.map((b) => b.sumber) ?? []),
      ...(beasiswa?.daftar.flatMap((b) => [b.sumber, ...(b.sumberIkut ? [b.sumberIkut] : [])]) ?? []),
    ],
    "kampus",
  );
  return (
    <Panel title="Biaya & Masuk" id="biaya-masuk">
      <div className="space-y-6">
        <Keterangan />
        {jalur ? (
          <section>
            <JudulBagian judul="Jalur Masuk" tahunAkademik={jalur.tahunAkademik} />
            <DaftarJalur daftar={jalur.daftar} r={r} />
          </section>
        ) : null}
        {biaya ? (
          <section>
            <JudulBagian judul="Biaya untuk seluruh Kampus" tahunAkademik={biaya.tahunAkademik} />
            <TabelBiaya daftar={biaya.daftar} r={r} />
          </section>
        ) : null}
        <p className="text-sm text-muted-foreground">UKT atau SPP per Prodi ada di halaman masing-masing Prodi.</p>
        {beasiswa ? (
          <section>
            <JudulBagian judul="Beasiswa" tahunAkademik={beasiswa.tahunAkademik} />
            <DaftarBeasiswa daftar={beasiswa.daftar} r={r} />
          </section>
        ) : null}
        <DaftarSumber r={r} />
      </div>
    </Panel>
  );
}

// The Prodi's own Biaya, then what the Kampus publishes for every Prodi.
export function PanelBiayaProdi({
  biayaProdi,
  biayaKampus,
  kampus,
}: {
  biayaProdi: Bagian<BiayaTampil>;
  biayaKampus: Bagian<BiayaTampil>;
  kampus: { nama: string; slug: string };
}) {
  if (!biayaProdi && !biayaKampus) return null;
  const r = rujukan([...(biayaProdi?.daftar ?? []), ...(biayaKampus?.daftar ?? [])].map((b) => b.sumber), "prodi");
  return (
    <Panel title="Biaya" id="biaya">
      <div className="space-y-6">
        <Keterangan />
        {biayaProdi ? (
          <section>
            <JudulBagian judul="Biaya Prodi ini" tahunAkademik={biayaProdi.tahunAkademik} />
            <TabelBiaya daftar={biayaProdi.daftar} r={r} />
          </section>
        ) : null}
        {biayaKampus ? (
          <section>
            <JudulBagian judul={`Biaya untuk seluruh ${kampus.nama}`} tahunAkademik={biayaKampus.tahunAkademik} />
            <TabelBiaya daftar={biayaKampus.daftar} r={r} />
          </section>
        ) : null}
        <Link href={`/kampus/${kampus.slug}#biaya-masuk`} className="inline-flex text-sm font-medium text-primary hover:underline">
          Jalur Masuk dan Beasiswa di {kampus.nama}
        </Link>
        <DaftarSumber r={r} />
      </div>
    </Panel>
  );
}
