import { TabNav } from "@/components/tab-nav";

export type TabModerasi = "antrean" | "laporan" | "menunggu" | "fakta" | "jurusan" | "promosi" | "info-biaya";

export type JumlahModerasi = { ditinjau: number; laporan: number; menunggu: number; fakta: number; promosi: number };

// The Moderator area's tabs: three Ulasan queues, the Biaya & Masuk facts to
// check, the Jurusan mapping tool, Promosi, and Info Biaya (no queue, so no count).
export function TabModerasiNav({ jumlah, aktif }: { jumlah: JumlahModerasi; aktif: TabModerasi }) {
  return (
    <div className="rounded-md bg-card px-1 ring-1 ring-foreground/10 sm:px-4">
      <TabNav
        label="Bagian Antrean Moderasi"
        tabs={[
          { href: "/moderasi?tab=antrean", label: `Ditinjau (${jumlah.ditinjau})`, active: aktif === "antrean" },
          { href: "/moderasi?tab=laporan", label: `Laporan (${jumlah.laporan})`, active: aktif === "laporan" },
          { href: "/moderasi?tab=menunggu", label: `Menunggu (${jumlah.menunggu})`, active: aktif === "menunggu" },
          { href: "/moderasi/fakta", label: `Fakta (${jumlah.fakta})`, active: aktif === "fakta" },
          { href: "/moderasi/jurusan", label: "Jurusan", active: aktif === "jurusan" },
          { href: "/moderasi/promosi", label: `Promosi (${jumlah.promosi})`, active: aktif === "promosi" },
          { href: "/moderasi/info-biaya", label: "Info Biaya", active: aktif === "info-biaya" },
        ]}
      />
    </div>
  );
}
