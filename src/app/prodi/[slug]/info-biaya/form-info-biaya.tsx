"use client";

import { useActionState } from "react";
import { IsianInfoBiaya } from "@/components/info-biaya/isian-info-biaya";
import type { IsianInfoBiaya as Isian } from "@/lib/info-biaya/skema";
import { STATUS_PENGULAS, TAHUN_MIN } from "@/lib/ulasan/skema";
import { cn } from "@/lib/utils";
import { kirimInfoBiaya, type StatusFormInfoBiaya } from "./actions";

const kotak = "rounded-xl bg-white p-5 ring-1 ring-border sm:p-6";

// The standalone "Bagikan info biaya" form. The server re-validates everything.
export function FormInfoBiaya({ prodiSlug, awal, edit }: { prodiSlug: string; awal: Isian; edit: boolean }) {
  const [status, action, pending] = useActionState<StatusFormInfoBiaya, FormData>(kirimInfoBiaya, null);
  const isian = status?.isian ?? awal;
  const galat = status?.galat ?? {};
  const tahunIni = new Date().getFullYear();

  return (
    <form key={status?.kali ?? 0} action={action} className="space-y-6">
      <input type="hidden" name="prodiSlug" value={prodiSlug} />
      {status?.pesan ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {status.pesan}
        </p>
      ) : null}

      <fieldset className={kotak}>
        <legend className="sr-only">Tentang kamu</legend>
        <h2 className="text-lg font-medium">Tentang kamu</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <div>
            <span className="text-sm font-medium">Status</span>
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
            {galat.statusPengulas ? <p className="mt-1 text-sm text-destructive">{galat.statusPengulas}</p> : null}
          </div>
          <div className="max-w-60 flex-1">
            <label htmlFor="tahunMasuk" className="text-sm font-medium">
              Tahun masuk
            </label>
            <select
              id="tahunMasuk"
              name="tahunMasuk"
              required
              defaultValue={isian.tahunMasuk ?? ""}
              aria-invalid={!!galat.tahunMasuk || undefined}
              className="mt-2 h-11 w-full rounded-lg border border-input bg-white px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
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
            {galat.tahunMasuk ? <p className="mt-1 text-sm text-destructive">{galat.tahunMasuk}</p> : null}
          </div>
        </div>
      </fieldset>

      <section className={kotak}>
        <h2 className="text-lg font-medium">Biaya dan cara masukmu</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">Isi yang kamu ingat saja. Semua pertanyaan boleh dilewati.</p>
        <IsianInfoBiaya isian={isian} galat={galat} />
      </section>

      <div className="flex flex-col items-end gap-2">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-11 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-brand-deep disabled:opacity-60",
          )}
        >
          {pending ? "Menyimpan…" : edit ? "Simpan perubahan" : "Bagikan info biaya"}
        </button>
      </div>
    </form>
  );
}
