import { cache } from "react";
import { withDb } from "@/db";
import { getFaktaKampus } from "@/lib/fakta/kueri";
import {
  countProdiPerJenjang,
  countUlasanKampus,
  getInfoKatalog,
  getKampus,
  getRingkasanUlasan,
  listUlasanTerbit,
} from "@/lib/katalog";

// Everything a Kampus page needs, in one pool and one round of parallel
// queries. cache() shares it between generateMetadata and the page, so both
// must pass the same arguments. `ulasanTampil` is how many newest Terbit
// Ulasan the page shows.
export const loadKampus = cache((slug: string, ulasanTampil: number) =>
  withDb(async (db) => {
    const [kampus, prodiPerJenjang, jumlahUlasan, info, ringkasan, ulasan] = await Promise.all([
      getKampus(db, slug),
      countProdiPerJenjang(db, slug),
      countUlasanKampus(db, slug),
      getInfoKatalog(db),
      getRingkasanUlasan(db, { kampusSlug: slug }),
      listUlasanTerbit(db, { kampusSlug: slug }, ulasanTampil),
    ]);
    if (!kampus) return null;
    const fakta = await getFaktaKampus(db, kampus.id);
    return { kampus, prodiPerJenjang, jumlahUlasan, info, ringkasan, ulasan, fakta };
  }),
);
