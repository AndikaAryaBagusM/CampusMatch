import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EyeOff, Lock, Trash2 } from "lucide-react";
import { withDb } from "@/db";
import { isianDariInfoBiaya } from "@/components/info-biaya/isian-info-biaya";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { K } from "@/lib/info-biaya/estimasi";
import { getInfoBiayaSaya } from "@/lib/info-biaya/layanan";
import { requirePengulas } from "@/lib/sesi";
import { getProdiTujuan, getUlasanSaya } from "@/lib/ulasan/kueri";
import { FormInfoBiaya } from "./form-info-biaya";

export const metadata: Metadata = {
  title: "Bagikan info biaya",
  robots: { index: false, follow: false },
};

// The standalone Info Biaya flow (ADR 0010): no Ulasan needed. Pre-filled from
// the Pengulas's existing Info Biaya, or the Status Pengulas and tahun masuk
// of their Ulasan for this Prodi.
export default async function InfoBiayaPage({ params }: PageProps<"/prodi/[slug]/info-biaya">) {
  const { slug } = await params;
  const pengulas = await requirePengulas(`/prodi/${slug}/info-biaya`);
  const data = await withDb(async (db) => {
    const prodi = await getProdiTujuan(db, slug);
    if (!prodi) return null;
    const [ada, ulasan] = await Promise.all([getInfoBiayaSaya(db, pengulas.id, prodi.id), getUlasanSaya(db, pengulas.id, prodi.id)]);
    return { prodi, ada, ulasan };
  });
  if (!data) notFound();
  const { prodi, ada, ulasan } = data;
  const namaProdi = `${prodi.jenjang} ${prodi.nama}`;
  const awal = ada
    ? isianDariInfoBiaya(ada)
    : ulasan
      ? { statusPengulas: ulasan.statusPengulas, tahunMasuk: String(ulasan.tahunMasuk) }
      : {};

  return (
    <div className={`${kontainer} pb-6`}>
      <PageBreadcrumb
        items={[
          { label: prodi.kampusNama, href: `/kampus/${prodi.kampusSlug}` },
          { label: namaProdi, href: `/prodi/${prodi.slug}` },
          { label: "Info biaya" },
        ]}
      />
      <div className="rounded-md bg-pengulas px-5 py-6 text-pengulas-foreground sm:px-7 sm:py-8">
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">{ada ? "Ubah info biayamu" : "Bagikan info biaya"}</h1>
        <p className="mt-1 text-sm sm:text-base">
          {namaProdi}, {prodi.kampusNama}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <FormInfoBiaya prodiSlug={prodi.slug} awal={awal} edit={!!ada} />
        <aside>
          <Panel>
            <h2 className="font-bold">Bagaimana info ini dipakai</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex gap-2">
                <EyeOff className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Jawabanmu tidak pernah ditampilkan sendiri, juga tidak di ulasanmu. Calon mahasiswa hanya melihat Estimasi
                Pengulas: gabungan dari minimal {K} Pengulas, terpisah dari data resmi.
              </li>
              <li className="flex gap-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Info biaya bisa menunjukkan keadaan ekonomi keluargamu, jadi kami memperlakukannya sebagai data pribadi
                spesifik dan tidak memakainya untuk Promosi.
              </li>
              <li className="flex gap-2">
                <Trash2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Kamu bisa menghapusnya kapan saja di Akun. Info dari angkatan yang lebih dari lima tahun lalu kami hapus
                otomatis.
              </li>
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
