import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, caraMasuk } from "@/auth";
import { kontainer, Panel } from "@/components/panel";
import { RuteMasuk } from "@/components/ulasan/rute-masuk";
import { jalurAman } from "@/lib/sesi";
import { param } from "@/lib/url";
import { masukGoogle } from "./actions";
import { FormEmail } from "./form-email";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

// Auth.js error codes that reach this page via ?error=.
const PESAN_ERROR: Record<string, string> = {
  Verification: "Tautan masuk sudah kedaluwarsa atau sudah dipakai. Minta tautan baru.",
  OAuthAccountNotLinked: "Email ini sudah terdaftar dengan cara masuk lain. Masuk dengan cara yang sama seperti sebelumnya.",
};

export default async function MasukPage(props: PageProps<"/masuk">) {
  const sp = await props.searchParams;
  const callbackUrl = jalurAman(param(sp.callbackUrl), "/akun");
  if ((await auth())?.user) redirect(callbackUrl);
  const error = param(sp.error);
  const cara = caraMasuk();

  return (
    <div className={`${kontainer} grid max-w-4xl gap-6 py-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start`}>
      <Panel lembar className="md:order-2">
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Masuk ke CampusMatch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masuk untuk menulis atau melaporkan ulasan. Membaca ulasan tidak perlu masuk.
        </p>
        {error ? (
          <p role="alert" className="mt-4 rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
            {PESAN_ERROR[error] ?? "Gagal masuk. Coba lagi."}
          </p>
        ) : null}

        {cara.google ? (
          <form action={masukGoogle} className="mt-6">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="h-11 w-full rounded-sm bg-card font-semibold ring-1 ring-foreground/10 transition-colors hover:bg-secondary"
            >
              Masuk dengan Google
            </button>
          </form>
        ) : null}

        {cara.google && cara.email ? (
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau lewat email
            <span className="h-px flex-1 bg-border" />
          </div>
        ) : null}

        {cara.email ? (
          <div className={cara.google ? undefined : "mt-6"}>
            <FormEmail callbackUrl={callbackUrl} />
            <p className="mt-3 text-xs text-muted-foreground">Kami kirim tautan sekali pakai. Tidak perlu kata sandi.</p>
          </div>
        ) : null}

        {!cara.google && !cara.email ? (
          <p className="mt-6 rounded-sm bg-secondary p-3 text-sm">Masuk belum tersedia. Coba lagi nanti.</p>
        ) : null}

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Dengan masuk, kamu menyetujui{" "}
          <Link href="/ketentuan" className="font-semibold text-primary hover:underline">
            Ketentuan Layanan
          </Link>{" "}
          dan{" "}
          <Link href="/privasi" className="font-semibold text-primary hover:underline">
            Kebijakan Privasi
          </Link>{" "}
          CampusMatch. Teks ulasan diperiksa otomatis dengan Claude API dari Anthropic. Akun hanya untuk usia 18 tahun ke
          atas.
        </p>
      </Panel>

      <RuteMasuk keterangan="Kamu di sini. Akun hanya untuk usia 18 tahun ke atas." className="md:order-1" />
    </div>
  );
}
