import type { Metadata } from "next";
import { kontainer, Panel } from "@/components/panel";
import { AtribusiOnet } from "@/components/tes-minat/atribusi-onet";
import { ITEM } from "@/lib/riasec/item";

export const metadata: Metadata = {
  title: "Tes Minat",
  description:
    "Centang kegiatan kerja yang ingin kamu lakukan, lalu lihat Profil RIASEC dan Jurusan yang cocok dengan minatmu. Gratis, tanpa akun.",
  alternates: { canonical: "/tes-minat" },
};

// The 60 activities as one plain GET form: it works without JavaScript and
// nothing is stored. The result page reads the ticked items (?i=…) and moves
// the scores into the shareable link.
export default function TesMinatPage() {
  return (
    <div className={`${kontainer} max-w-4xl space-y-6 py-10`}>
      <div className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">Tes Minat</h1>
        <p className="max-w-2xl text-muted-foreground">
          Baca 60 kegiatan kerja di bawah, lalu centang yang <strong className="text-foreground">ingin kamu lakukan</strong>.
          Jangan pikirkan berapa lama pendidikannya atau berapa gajinya. Hasilnya berupa Profil RIASEC dan daftar Jurusan
          yang cocok dengan minatmu. Butuh sekitar 5 menit, tanpa akun.
        </p>
      </div>

      <form action="/tes-minat/hasil" method="get" className="space-y-6">
        <Panel>
          <fieldset>
            <legend className="sr-only">Kegiatan yang ingin kamu lakukan</legend>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ITEM.map((item) => (
                <li key={item.id}>
                  <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg p-3 text-sm ring-1 ring-border transition-colors hover:bg-secondary has-checked:bg-secondary has-checked:ring-primary">
                    <input type="checkbox" name="i" value={item.id} className="mt-0.5 size-4 shrink-0 accent-primary" />
                    <span>{item.teks}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="h-11 rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90">
            Lihat hasil
          </button>
          <p className="text-sm text-muted-foreground">Jawabanmu tidak disimpan. Hasilnya bisa kamu simpan ke akun nanti.</p>
        </div>
      </form>

      <AtribusiOnet className="border-t border-border pt-4" />
    </div>
  );
}
