import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";

export const metadata: Metadata = {
  title: "Cek email kamu",
  robots: { index: false, follow: false },
};

export default function CekEmailPage() {
  return (
    <div className={`${kontainer} max-w-md py-10`}>
      <Panel>
        <EmptyState icon={MailCheck} title="Cek email kamu">
          Kami sudah mengirim tautan masuk. Buka email itu di perangkat ini. Tautan berlaku 24 jam dan hanya bisa dipakai
          sekali. Tidak ada di kotak masuk? Cek folder spam.
        </EmptyState>
      </Panel>
    </div>
  );
}
