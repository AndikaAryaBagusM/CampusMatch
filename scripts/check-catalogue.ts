// Read-only checks of the imported catalogue, plus sample searches.
//
//   npm run catalogue:check [-- "query" "another query"]
import { config } from "dotenv";

config({ path: ".env.local" });

import { desc, sql } from "drizzle-orm";
import { withDb } from "../src/db";
import { imporKatalog } from "../src/db/schema";
import { searchKatalog } from "../src/lib/search";

const queries = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["Manajemen", "Teknik Informatika", "informatka"];

async function main() {
  await withDb(async (db) => {
    const one = async (q: ReturnType<typeof sql>) => (await db.execute(q)).rows[0] as Record<string, unknown>;

    console.log("Row counts");
    console.log(
      await one(sql`SELECT
        (SELECT count(*) FROM kota)::int AS kota,
        (SELECT count(*) FROM kampus)::int AS kampus,
        (SELECT count(*) FROM kampus WHERE akreditasi IS NULL)::int AS kampus_akreditasi_null,
        (SELECT count(*) FROM kampus WHERE unggulan)::int AS kampus_unggulan,
        (SELECT count(*) FROM prodi)::int AS prodi,
        (SELECT count(*) FROM jurusan)::int AS jurusan,
        (SELECT count(*) FROM kode_prodi_jurusan)::int AS kode_prodi_jurusan`),
    );

    console.log("\nProdi by Jenjang");
    const byJenjang = await db.execute(sql`SELECT jenjang, count(*)::int AS n FROM prodi GROUP BY 1 ORDER BY 1`);
    for (const r of byJenjang.rows) console.log(`  ${r.jenjang}  ${r.n}`);

    console.log("\nMust all be 0");
    console.log(
      await one(sql`SELECT
        (SELECT count(*) FROM prodi WHERE jenjang::text NOT IN ('S1', 'D3', 'D4'))::int AS prodi_not_s1_d3_d4,
        (SELECT count(*) FROM (SELECT 1 FROM prodi GROUP BY kampus_id, kode_prodi, jenjang, nama HAVING count(*) > 1) d)::int AS duplicate_prodi_keys,
        (SELECT count(*) FROM (SELECT 1 FROM kampus GROUP BY npsn HAVING count(*) > 1) d)::int AS duplicate_npsn,
        (SELECT count(*) FROM (SELECT 1 FROM kota GROUP BY nama, provinsi HAVING count(*) > 1) d)::int AS duplicate_kota,
        (SELECT count(*) FROM kampus WHERE npsn <> btrim(npsn))::int AS untrimmed_npsn`),
    );

    const [latest] = await db.select().from(imporKatalog).orderBy(desc(imporKatalog.id)).limit(1);
    console.log("\nLatest import:", latest ? `${latest.tanggalData} (row ${latest.id}, at ${latest.createdAt.toISOString()})` : "none");

    for (const q of queries) {
      const r = await searchKatalog(db, q, { limit: 5 });
      console.log(`\nSearch "${q}"`);
      console.log(`  jurusan: ${r.jurusan.map((j) => `${j.nama} (${j.jumlahProdi})`).join(" | ") || "(none)"}`);
      console.log(`  kampus:  ${r.kampus.map((k) => k.nama).join(" | ") || "(none)"}`);
      console.log(`  prodi:   ${r.prodi.map((p) => `${p.jenjang} ${p.nama} – ${p.kampusNama}`).join(" | ") || "(none)"}`);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
