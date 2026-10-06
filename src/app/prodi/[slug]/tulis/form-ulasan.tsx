"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronDown, Frown, Smile } from "lucide-react";
import { IsianInfoBiaya } from "@/components/info-biaya/isian-info-biaya";
import { BintangInput } from "@/components/ulasan/bintang-input";
import type { IsianInfoBiaya as IsianIB } from "@/lib/info-biaya/skema";
import {
  ASPEK,
  ISI_MAKS,
  ISI_MIN,
  JUDUL_MAKS,
  JUDUL_MIN,
  STATUS_PENGULAS,
  TAHUN_MIN,
  type IsianUlasan,
} from "@/lib/ulasan/skema";
import { cn } from "@/lib/utils";
import { kirimUlasan, type StatusFormUlasan } from "./actions";

const kotak = "rounded-md bg-card p-5 ring-1 ring-foreground/10 sm:p-6";
const masukan =
  "w-full rounded-sm border border-input bg-white px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

// The Ulasan form (design frame: "Wie gefällt Dir Dein Studium?"), with our
// field set from decisions.md 9. The server re-validates everything.
export function FormUlasan({
  prodiSlug,
  awal,
  adaInfoBiaya,
  edit,
}: {
  prodiSlug: string;
  awal: IsianUlasan;
  adaInfoBiaya: boolean;
  edit: boolean;
}) {
  const [status, action, pending] = useActionState<StatusFormUlasan, FormData>(kirimUlasan, null);
  const isian = status?.isian ?? awal;
  const galat = status?.galat ?? {};
  const isianIB: IsianIB = status?.isianInfoBiaya ?? {};
  const galatIB = status?.galatInfoBiaya ?? {};
  const tahunIni = new Date().getFullYear();

  return (
    // Remounts after each submit so fields and counters show what was sent.
    <form key={status?.kali ?? 0} action={action} className="space-y-6">
      <input type="hidden" name="prodiSlug" value={prodiSlug} />

      {status?.pesan ? (
        <p role="alert" className="rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
          {status.pesan}
        </p>
      ) : null}

      <fieldset className={cn(kotak, "p-0 sm:p-0")}>
        <legend className="sr-only">Penilaian</legend>
        <h2 className="px-5 pt-5 text-lg font-bold sm:px-6 sm:pt-6">Nilai Prodi ini</h2>
        <ul className="mt-3 divide-y divide-border">
          {ASPEK.map((a) => (
            <Baris key={a.kolom} label={a.label} galat={galat[a.kolom]}>
              <BintangInput name={a.kolom} label={a.label} defaultValue={isian[a.kolom]} invalid={!!galat[a.kolom]} />
            </Baris>
          ))}
          <Baris label="Bintang keseluruhan" galat={galat.bintang} sorot>
            <BintangInput name="bintang" label="Bintang keseluruhan" defaultValue={isian.bintang} invalid={!!galat.bintang} />
          </Baris>
        </ul>
      </fieldset>

      <section className={kotak}>
        <h2 className="text-lg font-bold">Bagaimana pengalamanmu di Prodi ini?</h2>
        <div className="mt-4 space-y-4">
          <TeksDenganHitungan
            name="judul"
            label="Judul"
            placeholder="Judul singkat ulasanmu"
            defaultValue={isian.judul ?? ""}
            min={JUDUL_MIN}
            max={JUDUL_MAKS}
            galat={galat.judul}
          />
          <TeksDenganHitungan
            name="isi"
            label="Ceritamu"
            placeholder="Ceritakan kuliah di Prodi ini: materi, dosen, fasilitas, suasana, administrasi, biaya."
            defaultValue={isian.isi ?? ""}
            min={ISI_MIN}
            max={ISI_MAKS}
            galat={galat.isi}
            panjang
          />
        </div>
      </section>

      <fieldset className={kotak}>
        <legend className="sr-only">Rekomendasi</legend>
        <h2 className="text-lg font-bold">Apakah kamu merekomendasikan Prodi ini?</h2>
        <div className="mt-3 flex gap-3">
          <PilihanRekomendasi nilai="ya" label="Ya" icon={Smile} warna="text-success" checked={isian.rekomendasi === "ya"} />
          <PilihanRekomendasi nilai="tidak" label="Tidak" icon={Frown} warna="text-warning" checked={isian.rekomendasi === "tidak"} />
        </div>
        <Galat pesan={galat.rekomendasi} />
      </fieldset>

      <fieldset className={kotak}>
        <legend className="sr-only">Tentang kamu</legend>
        <h2 className="text-lg font-bold">Tentang kamu</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ditampilkan bersama ulasan. Nama dan email tidak ditampilkan.</p>
        <div className="mt-4 space-y-4">
          <div>
            <span className="text-sm font-semibold">Status</span>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {STATUS_PENGULAS.map((s) => (
                <label key={s.nilai} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="statusPengulas"
                    value={s.nilai}
                    required
                    defaultChecked={isian.statusPengulas === s.nilai}
                    className="size-4 accent-primary"
                  />
                  {s.label}
                </label>
              ))}
            </div>
            <Galat pesan={galat.statusPengulas} />
          </div>
          <div className="max-w-60">
            <label htmlFor="tahunMasuk" className="text-sm font-semibold">
              Tahun masuk
            </label>
            <select
              id="tahunMasuk"
              name="tahunMasuk"
              required
              defaultValue={isian.tahunMasuk ?? ""}
              aria-invalid={!!galat.tahunMasuk || undefined}
              className={cn(masukan, "mt-2 h-11")}
            >
              <option value="" disabled>
                Pilih tahun
              </option>
              {Array.from({ length: tahunIni - TAHUN_MIN + 1 }, (_, i) => tahunIni - i).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Galat pesan={galat.tahunMasuk} />
          </div>
        </div>
      </fieldset>

      {/* Optional Info Biaya (ADR 0010): stored apart from the Ulasan, shown only combined.
          An existing one is changed in its own form, so editing the Ulasan never asks for consent again. */}
      {adaInfoBiaya ? (
        <p className={cn(kotak, "text-sm")}>
          Kamu sudah membagikan info biaya untuk Prodi ini.{" "}
          <Link href={`/prodi/${prodiSlug}/info-biaya`} className="font-semibold text-primary hover:underline">
            Ubah info biaya
          </Link>
        </p>
      ) : (
      <details className={cn(kotak, "group p-0 sm:p-0")} open={Object.keys(galatIB).length > 0 || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-lg font-semibold">Info biaya (opsional)</span>
            <span className="block text-sm text-muted-foreground">
              Berapa yang kamu bayar dan lewat jalur apa. Tidak tampil di ulasanmu, hanya sebagai estimasi gabungan.
            </span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="border-t border-border px-5 py-5 sm:px-6">
          <p className="mb-5 text-sm text-muted-foreground">
            Status dan tahun masuk diambil dari bagian &ldquo;Tentang kamu&rdquo;. Kosongkan semua jika tidak ingin berbagi.
          </p>
          <IsianInfoBiaya isian={isianIB} galat={galatIB} />
        </div>
      </details>
      )}

      <div className="flex flex-col items-end gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-sm bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "Mengirim…" : edit ? "Kirim perubahan" : "Kirim ulasan"}
        </button>
        <p className="text-xs text-muted-foreground">
          {edit
            ? "Perubahan diperiksa dulu. Versi lama tetap tampil sampai perubahan lolos."
            : "Ulasanmu diperiksa dulu sebelum tampil."}
        </p>
      </div>
    </form>
  );
}

function Baris({ label, galat, sorot, children }: { label: string; galat?: string; sorot?: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6", sorot && "rounded-b-xl bg-secondary")}>
      <span className={cn("text-sm sm:w-56 sm:shrink-0", sorot && "font-semibold")}>{label}</span>
      <div>
        {children}
        <Galat pesan={galat} />
      </div>
    </li>
  );
}

function TeksDenganHitungan({
  name,
  label,
  placeholder,
  defaultValue,
  min,
  max,
  galat,
  panjang,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  min: number;
  max: number;
  galat?: string;
  panjang?: boolean;
}) {
  const [jumlah, setJumlah] = useState(defaultValue.trim().length);
  const props = {
    id: name,
    name,
    placeholder,
    defaultValue,
    required: true,
    minLength: min,
    maxLength: max,
    "aria-invalid": !!galat || undefined,
    "aria-describedby": `${name}-hitung`,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setJumlah(e.target.value.trim().length),
  };
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      {panjang ? (
        <textarea {...props} rows={8} className={cn(masukan, "mt-2 py-2")} />
      ) : (
        <input {...props} type="text" className={cn(masukan, "mt-2 h-11")} />
      )}
      <p id={`${name}-hitung`} className={cn("mt-1 text-xs", jumlah < min ? "text-muted-foreground" : "font-semibold text-success")}>
        {jumlah} karakter{jumlah < min ? ` (minimal ${min})` : ""}
      </p>
      <Galat pesan={galat} />
    </div>
  );
}

function PilihanRekomendasi({
  nilai,
  label,
  icon: Icon,
  warna,
  checked,
}: {
  nilai: string;
  label: string;
  icon: typeof Smile;
  warna: string;
  checked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 ring-1 ring-foreground/10 has-checked:bg-secondary has-checked:ring-primary has-[input:focus-visible]:ring-3">
      <input type="radio" name="rekomendasi" value={nilai} required defaultChecked={checked} className="sr-only" />
      <Icon className={cn("size-6", warna)} aria-hidden />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p className="mt-1 text-sm text-destructive">{pesan}</p> : null;
}
