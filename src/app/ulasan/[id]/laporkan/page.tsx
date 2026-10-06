import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { withDb } from "@/db";
import { kampus, prodi, ulasan } from "@/db/schema";
import { kontainer, Panel } from "@/components/panel";
import { kontakEmail, mailtoTakedown } from "@/lib/kontak";
import { requirePengulas } from "@/lib/sesi";
import { getUlasanTerlapor } from "@/lib/ulasan/laporan";
import { FormLaporan } from "./form-laporan";

export const metadata: Metadata = {
  title: "Laporkan ulasan",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LaporkanPage({ params }: PageProps<"/ulasan/[id]/laporkan">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  await requirePengulas(`/ulasan/${id}/laporkan`);

  const data = await withDb(async (db) => {
    const [target, [halaman]] = await Promise.all([
      getUlasanTerlapor(db, id),
      db
        .select({ prodiSlug: prodi.slug, prodiNama: prodi.nama, jenjang: prodi.jenjang, kampusNama: kampus.nama })
        .from(ulasan)
        .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
        .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
        .where(eq(ulasan.id, id)),
    ]);
    return target && halaman ? { target, halaman } : null;
  });
  if (!data) notFound();
  const { target, halaman } = data;
  const email = kontakEmail();

  return (
    <div className={`${kontainer} max-w-xl py-10`}>
      <Panel lembar>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight">Laporkan ulasan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          “{target.judul}”, ulasan untuk {halaman.jenjang} {halaman.prodiNama}, {halaman.kampusNama}.
        </p>
        <p className="mt-3 text-sm">
          Ulasan tetap tampil sampai tim kami memeriksanya. Identitasmu tidak ditunjukkan kepada penulis ulasan.
        </p>
        <div className="mt-6">
          <FormLaporan ulasanId={target.id} kembaliKe={`/prodi/${halaman.prodiSlug}`} />
        </div>
        {email ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Mewakili Kampus atau orang yang disebut dalam ulasan?{" "}
            <a href={mailtoTakedown(email)} className="font-semibold text-primary hover:underline">
              Hubungi kami
            </a>
            .
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
