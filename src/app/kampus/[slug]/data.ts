import { cache } from "react";
import { withDb } from "@/db";
import { countProdiPerJenjang, countUlasanKampus, getInfoKatalog, getKampus } from "@/lib/katalog";

// Everything the Kampus header needs, in one pool and one round of parallel
// queries. cache() shares it between generateMetadata and the page.
export const loadKampus = cache((slug: string) =>
  withDb(async (db) => {
    const [kampus, prodiPerJenjang, jumlahUlasan, info] = await Promise.all([
      getKampus(db, slug),
      countProdiPerJenjang(db, slug),
      countUlasanKampus(db, slug),
      getInfoKatalog(db),
    ]);
    return kampus ? { kampus, prodiPerJenjang, jumlahUlasan, info } : null;
  }),
);
