import { TabNav } from "@/components/tab-nav";

export type TabModerasi = "antrean" | "laporan" | "menunggu" | "fakta" | "jurusan" | "promosi";

export type JumlahModerasi = { ditinjau: number; laporan: number; menunggu: number; fakta: number; promosi: number };

// The Moderator area's tabs: three Ulasan queues, the Biaya & Masuk facts to
// check, the Jurusan mapping tool, and Promosi.
export function TabModerasiNav({ jumlah, aktif }: { jumlah: JumlahModerasi; aktif: TabModerasi }) {
  return (
    <div className="rounded-xl bg-white px-1 ring-1 ring-border sm:px-4">
      <TabNav
        label="Bagian Antrean Moderasi"
        tabs={[
          { href: "/moderasi?tab=antrean", label: `Ditinjau (${jumlah.ditinjau})`, active: aktif === "antrean" },
          { href: "/moderasi?tab=laporan", label: `Laporan (${jumlah.laporan})`, active: aktif === "laporan" },
          { href: "/moderasi?tab=menunggu", label: `Menunggu (${jumlah.menunggu})`, active: aktif === "menunggu" },
          { href: "/moderasi/fakta", label: `Fakta (${jumlah.fakta})`, active: aktif === "fakta" },
          { href: "/moderasi/jurusan", label: "Jurusan", active: aktif === "jurusan" },
          { href: "/moderasi/promosi", label: `Promosi (${jumlah.promosi})`, active: aktif === "promosi" },
        ]}
      />
    </div>
  );
}
