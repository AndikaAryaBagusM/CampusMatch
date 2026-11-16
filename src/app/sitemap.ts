import type { MetadataRoute } from "next";
import { withDb } from "@/db";
import { listSlugSitemap } from "@/lib/katalog";
import { urlSitus } from "@/lib/situs";

// Regenerated at most once a day: the catalogue only changes on import, and a
// Prodi page joins the list once it has an Ulasan or checked fees.
export const revalidate = 86400;

// Every page a search engine may index, well under the 50,000-URL limit of one
// sitemap. Prodi pages without Ulasan or fees are noindex and stay out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slug = await withDb(listSlugSitemap);
  return [
    { url: urlSitus("/"), changeFrequency: "daily", priority: 1 },
    { url: urlSitus("/tes-minat"), changeFrequency: "monthly", priority: 0.8 },
    { url: urlSitus("/kota"), changeFrequency: "monthly", priority: 0.5 },
    ...slug.jurusan.map((s) => ({ url: urlSitus(`/jurusan/${s}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...slug.prodi.map((s) => ({ url: urlSitus(`/prodi/${s}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...slug.kampus.map((s) => ({ url: urlSitus(`/kampus/${s}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...slug.kota.map((s) => ({ url: urlSitus(`/kota/${s}`), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
