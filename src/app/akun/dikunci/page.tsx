import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { kontainer, Panel } from "@/components/panel";
import { kontakEmail } from "@/lib/kontak";
import { requireSesi } from "@/lib/sesi";
import { keluar } from "../actions";

export const metadata: Metadata = {
  title: "Akun dikunci",
  robots: { index: false, follow: false },
};

// An existing account whose holder declared they are under 18 (ADR 0008).
export default async function AkunDikunciPage() {
  const pengguna = await requireSesi("/akun/dikunci");
  if (!pengguna.dikunciAt) redirect("/akun");
  const email = kontakEmail();

  return (
    <div className={`${kontainer} max-w-xl py-10`}>
      <Panel lembar>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Akunmu dikunci</h1>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Akun CampusMatch hanya untuk usia 18 tahun ke atas, jadi akunmu tidak bisa dipakai lagi. Ulasan yang pernah kamu
            tulis tetap tampil tanpa namamu.
          </p>
          <p>
            Untuk menghapus akun beserta ulasanmu, kirim email ke{" "}
            {email ? (
              <a href={`mailto:${email}?subject=${encodeURIComponent("Hapus akun")}`} className="font-semibold text-primary hover:underline">
                {email}
              </a>
            ) : (
              "email kontak CampusMatch"
            )}{" "}
            dari alamat email akun ini.
          </p>
        </div>
        <form action={keluar} className="mt-5">
          <button type="submit" className="text-sm font-semibold text-primary hover:underline">
            Keluar
          </button>
        </form>
      </Panel>
    </div>
  );
}
