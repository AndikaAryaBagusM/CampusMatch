import type { Metadata } from "next";
import Link from "next/link";
import { kontainer, Panel } from "@/components/panel";

export const metadata: Metadata = {
  title: "Akun dihapus",
  robots: { index: false, follow: false },
};

export default function AkunDihapusPage() {
  return (
    <div className={`${kontainer} max-w-xl py-10`}>
      <Panel lembar>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Akunmu sudah dihapus</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Karena kamu belum 18 tahun, kami menghapus akunmu dan tidak menyimpan datamu. Kamu tetap bisa membaca ulasan dan
          mengerjakan Tes Minat tanpa akun.
        </p>
        <Link href="/tes-minat" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
          Kerjakan Tes Minat
        </Link>
      </Panel>
    </div>
  );
}
