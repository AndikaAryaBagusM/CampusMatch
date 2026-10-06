import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { kontainer, Panel } from "@/components/panel";
import { RuteMasuk } from "@/components/ulasan/rute-masuk";
import { jalurAman, requireSesi } from "@/lib/sesi";
import { param } from "@/lib/url";
import { nyatakanUsia } from "./actions";

export const metadata: Metadata = {
  title: "Konfirmasi usia",
  robots: { index: false, follow: false },
};

// Every account needs this once, new or existing (ADR 0008).
export default async function UsiaPage(props: PageProps<"/akun/usia">) {
  const sp = await props.searchParams;
  const kembali = jalurAman(param(sp.callbackUrl), "/akun");
  const pengguna = await requireSesi(`/akun/usia?callbackUrl=${encodeURIComponent(kembali)}`);
  if (pengguna.dikunciAt) redirect("/akun/dikunci");
  if (pengguna.usia18At) redirect(kembali);

  return (
    <div className={`${kontainer} grid max-w-4xl gap-6 py-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start`}>
      <Panel lembar className="md:order-2">
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Satu pertanyaan dulu</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Akun CampusMatch hanya untuk orang berusia 18 tahun atau lebih. Kalau kamu belum 18 tahun, kamu tetap bisa membaca
          ulasan dan mengerjakan Tes Minat tanpa akun; hasilnya bisa kamu simpan lewat tautan hasil.
        </p>
        <form action={nyatakanUsia} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={kembali} />
          <button
            type="submit"
            name="jawaban"
            value="dewasa"
            className="h-11 rounded-sm bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Saya berusia 18 tahun atau lebih
          </button>
          <button
            type="submit"
            name="jawaban"
            value="belum"
            className="h-11 rounded-sm bg-card px-5 font-semibold ring-1 ring-foreground/10 hover:bg-secondary"
          >
            Saya belum 18 tahun
          </button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Kalau kamu belum 18 tahun dan belum pernah menulis ulasan, akunmu langsung dihapus dan tidak ada data yang kami
          simpan.
        </p>
      </Panel>
      <RuteMasuk keterangan="Kamu di sini: satu pertanyaan lagi, tentang usiamu." className="md:order-1" />
    </div>
  );
}
