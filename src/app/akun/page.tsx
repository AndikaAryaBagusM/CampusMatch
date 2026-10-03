import type { Metadata } from "next";
import Link from "next/link";
import { kontainer, Panel } from "@/components/panel";
import { isModerator } from "@/lib/moderator";
import { requirePengulas } from "@/lib/sesi";
import { keluar } from "./actions";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

export default async function AkunPage() {
  const pengulas = await requirePengulas("/akun");

  return (
    <div className={`${kontainer} max-w-3xl space-y-6 py-10`}>
      <Panel
        title="Akun"
        action={
          <form action={keluar}>
            <button type="submit" className="text-sm font-medium text-primary hover:underline">
              Keluar
            </button>
          </form>
        }
      >
        <p className="text-sm">
          Masuk sebagai <span className="font-medium">{pengulas.email ?? pengulas.name}</span>
        </p>
        {isModerator(pengulas.email) ? (
          <Link href="/moderasi" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
            Buka Antrean Moderasi
          </Link>
        ) : null}
      </Panel>
    </div>
  );
}
