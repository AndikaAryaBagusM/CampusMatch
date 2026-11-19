import type { Metadata } from "next";
import { kontainer, Panel } from "@/components/panel";
import { DaftarTersimpan } from "@/components/simpanan/daftar-tersimpan";
import { ASAL_SITUS } from "@/lib/situs";

export const metadata: Metadata = {
  title: "Prodi tersimpan",
  // The list is the visitor's own, read from their browser.
  robots: { index: false, follow: true },
};

export default function TersimpanPage() {
  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-10`}>
      <div className="space-y-2">
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">Prodi tersimpan</h1>
        <p className="max-w-[62ch] text-muted-foreground">
          Daftar ini hanya tersimpan di browser ini, tanpa akun, dan tidak dikirim ke CampusMatch. Kirim ke WhatsApp
          supaya tidak hilang saat berganti perangkat, atau untuk dibahas dengan orang tua dan guru BK.
        </p>
      </div>
      <Panel>
        <DaftarTersimpan asal={ASAL_SITUS} />
      </Panel>
    </div>
  );
}
