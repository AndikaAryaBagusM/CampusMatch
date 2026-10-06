import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, LinkIcon } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { getTokenVerifikasi } from "@/lib/akun/verifikasi-kampus";
import { param } from "@/lib/url";
import { konfirmasiVerifikasiKampus } from "../actions";

export const metadata: Metadata = {
  title: "Konfirmasi email kampus",
  robots: { index: false, follow: false },
};

// Opened from the link in the email. Opening it changes nothing: mail
// scanners fetch links, so confirming takes a press of the button (POST).
export default async function VerifikasiKampusPage(props: PageProps<"/akun/verifikasi-kampus">) {
  const sp = await props.searchParams;
  const berhasil = param(sp.berhasil);
  const token = (param(sp.token) ?? "").slice(0, 100);
  const info = token ? await withDb((db) => getTokenVerifikasi(db, token)) : null;

  return (
    <div className={`${kontainer} max-w-xl py-10`}>
      <Panel>
        {berhasil ? (
          <EmptyState icon={BadgeCheck} title={`Kamu Terverifikasi di ${berhasil}`}>
            Ulasanmu untuk Prodi di Kampus ini sekarang bertanda Terverifikasi.{" "}
            <Link href="/akun#email-kampus" className="font-medium text-primary hover:underline">
              Kembali ke Akun
            </Link>
          </EmptyState>
        ) : info?.berlaku ? (
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-medium">Konfirmasi email kampus</h1>
            <p className="text-sm text-muted-foreground">
              Tandai ulasanmu di <span className="font-medium text-foreground">{info.kampusNama}</span> sebagai Terverifikasi.
              Kami hanya menyimpan domain email kampusmu dan tanggal hari ini.
            </p>
            <form action={konfirmasiVerifikasiKampus}>
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-deep">
                Konfirmasi
              </button>
            </form>
          </div>
        ) : (
          <EmptyState icon={LinkIcon} title="Tautan sudah dipakai atau kedaluwarsa">
            Tautan berlaku 24 jam dan hanya sekali.{" "}
            <Link href="/akun#email-kampus" className="font-medium text-primary hover:underline">
              Minta tautan baru di halaman Akun
            </Link>
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}
