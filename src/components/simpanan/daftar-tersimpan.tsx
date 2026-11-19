"use client";

import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import { TautanWhatsApp } from "@/components/bagikan/tautan-whatsapp";
import { EmptyState } from "@/components/empty-state";
import { TombolBandingkan } from "@/components/perbandingan/tombol-bandingkan";
import { lepasProdi, MAKS_TERSIMPAN, pesanTersimpan } from "@/lib/simpanan/daftar";
import { tulisTersimpan, useTersimpan } from "./toko";

// The saved list, read from this browser. `asal` is the site's origin, for the
// links in the WhatsApp message.
export function DaftarTersimpan({ asal }: { asal: string }) {
  const daftar = useTersimpan();

  if (daftar.length === 0)
    return (
      <EmptyState icon={Bookmark} title="Belum ada Prodi tersimpan">
        Tekan <strong>Simpan</strong> di halaman Prodi atau di daftar Prodi sebuah Jurusan.{" "}
        <Link href="/cari" className="font-semibold text-primary hover:underline">
          Cari Prodi
        </Link>
      </EmptyState>
    );

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-border">
        {daftar.map((p) => (
          <li key={p.slug} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0">
            <Link href={`/prodi/${p.slug}`} className="min-w-0 font-semibold decoration-jade decoration-2 underline-offset-4 hover:underline">
              {p.label}
            </Link>
            <span className="flex shrink-0 items-center gap-2">
              <TombolBandingkan slug={p.slug} label={p.label} />
              <button
                type="button"
                onClick={() => tulisTersimpan(lepasProdi(daftar, p.slug))}
                aria-label={`Hapus ${p.label} dari daftar tersimpan`}
                className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <X className="size-4" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <TautanWhatsApp pesan={pesanTersimpan(daftar, (j) => `${asal}${j}`)}>Kirim daftar ke WhatsApp</TautanWhatsApp>
        <button
          type="button"
          onClick={() => tulisTersimpan([])}
          className="inline-flex h-10 items-center rounded-sm px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          Kosongkan
        </button>
        <p className="text-xs text-muted-foreground">
          {daftar.length} dari {MAKS_TERSIMPAN} Prodi.
        </p>
      </div>
    </div>
  );
}
