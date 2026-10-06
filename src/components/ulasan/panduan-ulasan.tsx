import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Panel } from "@/components/panel";
import { kontakEmail, mailtoTakedown } from "@/lib/kontak";

// The short rules shown next to the form; the full rules are on /ketentuan.
export function PanduanUlasan() {
  const email = kontakEmail();
  return (
    <Panel>
      <h2 className="flex items-center gap-2 font-bold">
        <ShieldCheck className="size-5 text-jade" aria-hidden />
        Panduan ulasan
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm marker:text-jade">
        <li>Tulis dengan jujur, dari pengalamanmu sendiri.</li>
        <li>Kritik boleh, serangan pribadi tidak. Jangan menyebut nama dosen, staf atau mahasiswa.</li>
        <li>Jangan menulis info pribadi: nomor HP, email, alamat, akun media sosial.</li>
        <li>Tanpa SARA, hinaan, atau promosi.</li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Setiap ulasan diperiksa otomatis dan ditinjau tim kami bila perlu. Ulasan tampil tanpa nama. Aturan lengkap ada
        di{" "}
        <Link href="/ketentuan#ulasan" className="font-semibold text-jade underline-offset-4 hover:underline">
          Ketentuan Layanan
        </Link>
        .
      </p>
      {email ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Ingin melaporkan konten atau meminta penghapusan?{" "}
          <a href={mailtoTakedown(email)} className="font-semibold text-jade underline-offset-4 hover:underline">
            Hubungi kami
          </a>
          .
        </p>
      ) : null}
    </Panel>
  );
}
