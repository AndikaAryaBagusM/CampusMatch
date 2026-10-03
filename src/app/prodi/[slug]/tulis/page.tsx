import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Hourglass } from "lucide-react";
import { withDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { kontainer, Panel } from "@/components/panel";
import { PanduanUlasan } from "@/components/ulasan/panduan-ulasan";
import { requirePengulas } from "@/lib/sesi";
import { getProdiTujuan, getUlasanSaya, type UlasanSaya } from "@/lib/ulasan/kueri";
import type { IsianUlasan } from "@/lib/ulasan/skema";
import { sedangDiperiksa } from "@/lib/ulasan/status";
import { FormUlasan } from "./form-ulasan";

export const metadata: Metadata = {
  title: "Tulis ulasan",
  robots: { index: false, follow: false },
};

// Prompts from decisions.md 9, shown beside the text field.
const PERTANYAAN = [
  "Apakah materi kuliah relevan dan tertata?",
  "Bagaimana dosen mengajar dan membimbing?",
  "Apakah fasilitas dan laboratorium memadai?",
  "Bagaimana suasana belajar dan teman seangkatan?",
  "Apakah administrasi dan jadwal berjalan lancar?",
  "Sepadankah biaya dengan yang kamu dapat?",
];

// The newest revision pre-fills an edit, so a rejected Ulasan can be fixed.
function isianDari(u: UlasanSaya): IsianUlasan {
  const r = u.revisi;
  return {
    bintang: String(r.bintang),
    aspekKurikulum: String(r.aspek_kurikulum),
    aspekDosen: String(r.aspek_dosen),
    aspekFasilitas: String(r.aspek_fasilitas),
    aspekSuasanaBelajar: String(r.aspek_suasana_belajar),
    aspekOrganisasi: String(r.aspek_organisasi),
    aspekBiayaKualitas: String(r.aspek_biaya_kualitas),
    rekomendasi: r.rekomendasi ? "ya" : "tidak",
    judul: r.judul,
    isi: r.isi,
    statusPengulas: u.statusPengulas,
    tahunMasuk: String(u.tahunMasuk),
  };
}

export default async function TulisUlasanPage({ params }: PageProps<"/prodi/[slug]/tulis">) {
  const { slug } = await params;
  const pengulas = await requirePengulas(`/prodi/${slug}/tulis`);
  const data = await withDb(async (db) => {
    const prodi = await getProdiTujuan(db, slug);
    return prodi ? { prodi, ada: await getUlasanSaya(db, pengulas.id, prodi.id) } : null;
  });
  if (!data) notFound();
  const { prodi, ada } = data;
  const namaProdi = `${prodi.jenjang} ${prodi.nama}`;

  return (
    <div className={`${kontainer} pb-6`}>
      <PageBreadcrumb
        items={[
          { label: prodi.kampusNama, href: `/kampus/${prodi.kampusSlug}` },
          { label: namaProdi, href: `/prodi/${prodi.slug}` },
          { label: "Tulis ulasan" },
        ]}
      />
      <div className="rounded-xl bg-gradient-to-br from-secondary to-blue-100 px-5 py-8 text-center sm:py-10">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          {ada ? "Ubah ulasanmu" : "Bagaimana kuliahmu?"}
        </h1>
        <p className="mt-1 text-sm sm:text-base">
          {namaProdi}, {prodi.kampusNama}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          {ada && sedangDiperiksa(ada.revisi.status) ? (
            <Panel>
              <EmptyState icon={Hourglass} title="Ulasanmu sedang diperiksa">
                Kamu bisa mengubahnya lagi setelah pemeriksaan selesai.{" "}
                <Link href="/akun" className="font-medium text-primary hover:underline">
                  Lihat status di Akun
                </Link>
                .
              </EmptyState>
            </Panel>
          ) : (
            <FormUlasan prodiSlug={prodi.slug} awal={ada ? isianDari(ada) : {}} edit={!!ada} />
          )}
        </div>
        <aside className="space-y-6">
          <PanduanUlasan />
          <Panel>
            <h2 className="font-medium">Yang bisa kamu ceritakan</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {PERTANYAAN.map((p) => (
                <li key={p} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
