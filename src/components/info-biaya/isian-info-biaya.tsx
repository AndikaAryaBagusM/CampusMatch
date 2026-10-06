import { LABEL_KATEGORI_JALUR, LABEL_TES } from "@/lib/fakta/label";
import { formatAngka } from "@/lib/format";
import { BATAS_INFO_BIAYA, BEASISWA, KATEGORI_JALUR, LABEL_BEASISWA, TES } from "@/lib/info-biaya/label";
import type { GalatInfoBiaya, IsianInfoBiaya } from "@/lib/info-biaya/skema";
import { cn } from "@/lib/utils";

const masukan =
  "w-full rounded-sm border border-input bg-white px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

// The Info Biaya questions (ADR 0010), shared by the standalone form and the
// optional section of the Ulasan form. Every answer is optional and none is
// free text. Status Pengulas and tahun masuk are asked by the surrounding form.
export function IsianInfoBiaya({ isian, galat }: { isian: IsianInfoBiaya; galat: GalatInfoBiaya }) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold">Jalur Masuk</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {KATEGORI_JALUR.map((j) => (
            <label key={j} className="flex items-center gap-2 text-sm">
              <input type="radio" name="jalur" value={j} defaultChecked={isian.jalur === j} className="size-4 accent-primary" />
              {LABEL_KATEGORI_JALUR[j]}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="radio" name="jalur" value="" defaultChecked={!isian.jalur} className="size-4 accent-primary" />
            Lewati
          </label>
        </div>
        <Galat pesan={galat.jalur} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Seleksi yang kamu ikuti</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {TES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="tes" value={t} defaultChecked={isian.tes?.includes(t)} className="size-4 accent-primary" />
              {LABEL_TES[t]}
            </label>
          ))}
        </div>
        <Galat pesan={galat.tes} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Rupiah
          name="biayaSemester"
          label="UKT atau SPP per semester"
          bantuan="Yang ditetapkan untukmu, sebelum dipotong beasiswa."
          isian={isian}
          galat={galat}
          maks={BATAS_INFO_BIAYA.biayaSemester}
        />
        <div>
          <label htmlFor="kelompokUkt" className="text-sm font-semibold">
            Kelompok UKT
          </label>
          <input
            id="kelompokUkt"
            name="kelompokUkt"
            type="number"
            min={1}
            max={BATAS_INFO_BIAYA.kelompokUkt}
            defaultValue={isian.kelompokUkt ?? ""}
            aria-invalid={!!galat.kelompokUkt || undefined}
            aria-describedby="kelompokUkt-bantuan"
            className={cn(masukan, "mt-2 h-11")}
          />
          <p id="kelompokUkt-bantuan" className="mt-1 text-xs text-muted-foreground">
            Jika ada. Hanya untuk memeriksa angka, tidak ditampilkan.
          </p>
          <Galat pesan={galat.kelompokUkt} />
        </div>
      </div>

      <div>
        <Rupiah name="uangPangkal" label="Uang Pangkal (IPI, SPI)" isian={isian} galat={galat} maks={BATAS_INFO_BIAYA.uangPangkal} />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="tanpaUangPangkal" value="1" defaultChecked={isian.tanpaUangPangkal === "1"} className="size-4 accent-primary" />
          Saya tidak membayar Uang Pangkal
        </label>
      </div>

      <Rupiah
        name="biayaLainMasuk"
        label="Biaya lain saat masuk"
        bantuan="Jumlah biaya sekali bayar lainnya, termasuk biaya pendaftaran."
        isian={isian}
        galat={galat}
        maks={BATAS_INFO_BIAYA.biayaLainMasuk}
      />

      <fieldset>
        <legend className="text-sm font-semibold">Beasiswa</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {BEASISWA.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input type="radio" name="beasiswa" value={b} defaultChecked={isian.beasiswa === b} className="size-4 accent-primary" />
              {LABEL_BEASISWA[b]}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="radio" name="beasiswa" value="" defaultChecked={!isian.beasiswa} className="size-4 accent-primary" />
            Lewati
          </label>
        </div>
        <Galat pesan={galat.beasiswa} />
      </fieldset>

      <div className="rounded-sm bg-secondary/60 p-3">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="setuju"
            value="1"
            defaultChecked={isian.setuju === "1"}
            aria-invalid={!!galat.setuju || undefined}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            Saya setuju info biaya ini diproses sebagai data pribadi spesifik dan hanya ditampilkan sebagai estimasi
            gabungan dari minimal 5 Pengulas.
          </span>
        </label>
        <Galat pesan={galat.setuju} />
      </div>
    </div>
  );
}

function Rupiah({
  name,
  label,
  bantuan,
  isian,
  galat,
  maks,
}: {
  name: "biayaSemester" | "uangPangkal" | "biayaLainMasuk";
  label: string;
  bantuan?: string;
  isian: IsianInfoBiaya;
  galat: GalatInfoBiaya;
  maks: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">Rp</span>
        <input
          id={name}
          name={name}
          inputMode="numeric"
          placeholder={`maks. ${formatAngka(maks)}`}
          defaultValue={isian[name] ?? ""}
          aria-invalid={!!galat[name] || undefined}
          aria-describedby={bantuan ? `${name}-bantuan` : undefined}
          className={cn(masukan, "h-11 pl-10")}
        />
      </div>
      {bantuan ? (
        <p id={`${name}-bantuan`} className="mt-1 text-xs text-muted-foreground">
          {bantuan}
        </p>
      ) : null}
      <Galat pesan={galat[name]} />
    </div>
  );
}

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p className="mt-1 text-sm text-destructive">{pesan}</p> : null;
}

// A saved Info Biaya back into form strings, to pre-fill an edit.
export function isianDariInfoBiaya(r: {
  statusPengulas: string;
  tahunMasuk: number;
  kategoriJalur: string | null;
  tes: string[] | null;
  biayaSemester: number | null;
  kelompokUkt: number | null;
  uangPangkal: number | null;
  biayaLainMasuk: number | null;
  beasiswa: string | null;
}): IsianInfoBiaya {
  const angka = (v: number | null) => (v === null ? "" : formatAngka(v));
  return {
    statusPengulas: r.statusPengulas,
    tahunMasuk: String(r.tahunMasuk),
    jalur: r.kategoriJalur ?? "",
    tes: r.tes ?? [],
    biayaSemester: angka(r.biayaSemester),
    kelompokUkt: r.kelompokUkt === null ? "" : String(r.kelompokUkt),
    uangPangkal: r.uangPangkal ? formatAngka(r.uangPangkal) : "",
    tanpaUangPangkal: r.uangPangkal === 0 ? "1" : "",
    biayaLainMasuk: angka(r.biayaLainMasuk),
    beasiswa: r.beasiswa ?? "",
  };
}
