import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { kontainer, Panel } from "@/components/panel";
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

  return (
    <div className={`${kontainer} max-w-md py-10`}>
      <Panel>
        <h1 className="text-2xl font-medium tracking-tight">Masuk ke CampusMatch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masuk untuk menulis atau melaporkan ulasan. Membaca ulasan tidak perlu masuk.
        </p>
        {error ? (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {PESAN_ERROR[error] ?? "Gagal masuk. Coba lagi."}
          </p>
        ) : null}

        <form action={masukGoogle} className="mt-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-white font-medium ring-1 ring-border transition-colors hover:bg-secondary"
          >
            Masuk dengan Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          atau lewat email
          <span className="h-px flex-1 bg-border" />
        </div>

        <FormEmail callbackUrl={callbackUrl} />
        <p className="mt-3 text-xs text-muted-foreground">Kami kirim tautan sekali pakai. Tidak perlu kata sandi.</p>
      </Panel>
    </div>
  );
}
