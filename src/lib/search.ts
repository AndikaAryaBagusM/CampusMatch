import { and, asc, desc, eq, ilike, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import type { Db } from "@/db";
import { jurusan, kampus, kodeProdiJurusan, prodi } from "@/db/schema";

// Name search over the catalogue with pg_trgm. Postgres ships no Indonesian
// text-search configuration, and catalogue names are a few words long, so we
// match substrings (ILIKE) and typos (word similarity, `<%`) instead of
// stemming. Both are served by the gin_trgm_ops indexes on `nama`.

export const MIN_QUERY_LENGTH = 2;

export type SearchOptions = {
  limit?: number;
  // Restrict Kampus and Prodi to the Daftar Kampus Unggulan.
  unggulanOnly?: boolean;
};

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Exact name first, then prefix, then closest word match, then any extra
// tie-breaks, then shortest name.
function rank(col: AnyColumn, q: string, ...tieBreaks: SQL[]) {
  return [
    desc(sql`lower(${col}) = lower(${q})`),
    desc(sql`${col} ILIKE ${escapeLike(q) + "%"}`),
    desc(sql`word_similarity(${q}, ${col})`),
    ...tieBreaks,
    asc(sql`length(${col})`),
  ];
}

function matches(col: AnyColumn, q: string) {
  return or(ilike(col, `%${escapeLike(q)}%`), sql`${q} <% ${col}`);
}

export async function searchKatalog(db: Db, query: string, options: SearchOptions = {}) {
  const q = query.replace(/\s+/g, " ").trim();
  const { limit = 10, unggulanOnly = false } = options;
  if (q.length < MIN_QUERY_LENGTH) return { jurusan: [], kampus: [], prodi: [] };

  // Prodi per Jurusan, using the effective Jurusan (override, else Kode Prodi mapping),
  // so equally good matches list the Jurusan with more Prodi first.
  const jumlahProdi = db
    .select({
      jurusanId: sql<number>`coalesce(${prodi.jurusanOverrideId}, ${kodeProdiJurusan.jurusanId})`.as("jurusan_id"),
      jumlah: sql<number>`count(*)::int`.as("jumlah"),
    })
    .from(prodi)
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .groupBy(sql`1`)
    .as("jumlah_prodi");

  const [jurusanRows, kampusRows, prodiRows] = await Promise.all([
    db
      .select({
        id: jurusan.id,
        nama: jurusan.nama,
        slug: jurusan.slug,
        jumlahProdi: sql<number>`coalesce(${jumlahProdi.jumlah}, 0)`,
      })
      .from(jurusan)
      .leftJoin(jumlahProdi, eq(jumlahProdi.jurusanId, jurusan.id))
      .where(matches(jurusan.nama, q))
      .orderBy(...rank(jurusan.nama, q, desc(sql`coalesce(${jumlahProdi.jumlah}, 0)`)))
      .limit(limit),
    db
      .select({ id: kampus.id, nama: kampus.nama, slug: kampus.slug, akreditasi: kampus.akreditasi })
      .from(kampus)
      .where(and(matches(kampus.nama, q), unggulanOnly ? eq(kampus.unggulan, true) : undefined))
      .orderBy(...rank(kampus.nama, q), desc(kampus.unggulan))
      .limit(limit),
    db
      .select({
        id: prodi.id,
        nama: prodi.nama,
        slug: prodi.slug,
        jenjang: prodi.jenjang,
        kampusNama: kampus.nama,
      })
      .from(prodi)
      .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
      .where(and(matches(prodi.nama, q), unggulanOnly ? eq(kampus.unggulan, true) : undefined))
      .orderBy(...rank(prodi.nama, q), desc(kampus.unggulan), asc(kampus.nama))
      .limit(limit),
  ]);

  return { jurusan: jurusanRows, kampus: kampusRows, prodi: prodiRows };
}

export type SearchResults = Awaited<ReturnType<typeof searchKatalog>>;
