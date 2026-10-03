"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { CATATAN_MAKS, LABEL_ALASAN_LAPORAN, type AlasanLaporan } from "@/lib/ulasan/laporan";
import { kirimLaporan, type StatusLaporan } from "./actions";

export function FormLaporan({ ulasanId, kembaliKe }: { ulasanId: string; kembaliKe: string }) {
  const [status, action, pending] = useActionState<StatusLaporan, FormData>(kirimLaporan, null);

  if (status?.ok) {
    return (
      <div role="status" className="space-y-3">
        <p className="flex items-start gap-2 text-sm">
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
          Terima kasih. Laporanmu sudah kami terima dan akan diperiksa tim kami.
        </p>
        <Link href={kembaliKe} className="text-sm font-medium text-primary hover:underline">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ulasanId" value={ulasanId} />
      {status && !status.ok ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {status.pesan}
        </p>
      ) : null}
      <fieldset>
        <legend className="text-sm font-medium">Apa masalahnya?</legend>
        <div className="mt-2 space-y-2">
          {(Object.entries(LABEL_ALASAN_LAPORAN) as [AlasanLaporan, string][]).map(([nilai, label]) => (
            <label key={nilai} className="flex items-center gap-2 text-sm">
              <input type="radio" name="alasan" value={nilai} required className="size-4 accent-primary" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="catatan" className="text-sm font-medium">
          Catatan (opsional)
        </label>
        <textarea
          id="catatan"
          name="catatan"
          rows={4}
          maxLength={CATATAN_MAKS}
          className="mt-2 w-full rounded-lg border border-input bg-white px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim laporan"}
      </button>
    </form>
  );
}
