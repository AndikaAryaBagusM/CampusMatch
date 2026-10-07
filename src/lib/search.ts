import { and, asc, desc, eq, ilike, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import type { Db } from "@/db";
import { jurusan, kampus, kodeProdiJurusan, kota, prodi } from "@/db/schema";

// Name search over the catalogue with pg_trgm. Postgres ships no Indonesian
// text-search configuration, and catalogue names are a few words long, so we
// match substrings (ILIKE) and typos (word similarity, `<%`) instead of
// stemming. Both are served by the gin_trgm_ops indexes on `nama`.

export const MIN_QUERY_LENGTH = 2;
// Trigram matching is not free; longer input is cut before any SQL runs.
export const MAX_QUERY_LENGTH = 100;

export const SEARCH_TYPES = ["jurusan", "kampus", "prodi"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export type SearchOptions = {
  limit?: number;
  offset?: number;
  // Which result types to query; defaults to all three.
  types?: readonly SearchType[];
  // Restrict Kampus and Prodi to the Daftar Kampus Unggulan.
  unggulanOnly?: boolean;
  // Let Prodi results match on their Kampus name too, word by word, so
  // "Informatika Gadjah Mada" or just "Gadjah Mada" finds the Prodi.
  prodiByKampus?: boolean;
};

// The Jurusan a Prodi belongs to: its Moderator override, else its Kode Prodi
// mapping. NULL when unmapped. Needs prodi LEFT JOIN kode_prodi_jurusan.
export const jurusanEfektif = sql<number | null>`coalesce(${prodi.jurusanOverrideId}, ${kodeProdiJurusan.jurusanId})`;

// Collapses whitespace, trims and caps the length.
export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH).trim();
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Exact name first, then prefix, then closest word match, then any extra
// tie-breaks, then shortest name, then alphabetical. The Daftar Kampus Unggulan
// never affects this order.
function rank(col: AnyColumn, q: string, ...tieBreaks: SQL[]) {
  return [
    desc(sql`lower(${col}) = lower(${q})`),
    desc(sql`${col} ILIKE ${escapeLike(q) + "%"}`),
    desc(sql`word_similarity(${q}, ${col})`),
    ...tieBreaks,
    asc(sql`length(${col})`),
    asc(col),
  ];
}

function matches(col: AnyColumn, q: string) {
  return or(ilike(col, `%${escapeLike(q)}%`), sql`${q} <% ${col}`);
}

export async function searchKatalog(db: Db, query: string, options: SearchOptions = {}) {
  const q = normalizeQuery(query);
  const { limit = 10, offset = 0, types = SEARCH_TYPES, unggulanOnly = false, prodiByKampus = false } = options;
  if (q.length < MIN_QUERY_LENGTH) return { jurusan: [], kampus: [], prodi: [] };

  // Every query word in the Prodi or its Kampus name; ranked on both together.
  const prodiKampus = sql`${prodi.nama} || ' ' || ${kampus.nama}`;
  const semuaKata = and(...q.split(" ").map((w) => sql`${prodiKampus} ILIKE ${"%" + escapeLike(w) + "%"}`));
  const prodiWhere = prodiByKampus
    ? or(matches(prodi.nama, q), matches(kampus.nama, q), semuaKata)
    : matches(prodi.nama, q);
  const prodiOrder = prodiByKampus
    ? [
        desc(sql`lower(${prodi.nama}) = lower(${q}) or lower(${kampus.nama}) = lower(${q})`),
        desc(sql`coalesce(${semuaKata}, false)`),
        desc(sql`word_similarity(${q}, ${prodiKampus})`),
        asc(kampus.nama),
        asc(sql`length(${prodi.nama})`),
        asc(prodi.nama),
      ]
    : [...rank(prodi.nama, q), asc(kampus.nama)];

  // Prodi per Jurusan, using the effective Jurusan, so equally good matches list
  // the Jurusan with more Prodi first.
  const jumlahProdi = db
    .select({
      jurusanId: sql<number>`${jurusanEfektif}`.as("jurusan_id"),
      jumlah: sql<number>`count(*)::int`.as("jumlah"),
    })
    .from(prodi)
    .leftJoin(kodeProdiJurusan, eq(prodi.kodeProdi, kodeProdiJurusan.kodeProdi))
    .groupBy(sql`1`)
    .as("jumlah_prodi");

  const [jurusanRows, kampusRows, prodiRows] = await Promise.all([
    types.includes("jurusan")
      ? db
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
          .limit(limit)
          .offset(offset)
      : [],
    types.includes("kampus")
      ? db
          .select({
            id: kampus.id,
            npsn: kampus.npsn,
            nama: kampus.nama,
            slug: kampus.slug,
            bentuk: kampus.bentuk,
            akreditasi: kampus.akreditasi,
            unggulan: kampus.unggulan,
            kotaNama: kota.nama,
          })
          .from(kampus)
          .innerJoin(kota, eq(kampus.kotaId, kota.id))
          .where(and(matches(kampus.nama, q), unggulanOnly ? eq(kampus.unggulan, true) : undefined))
          .orderBy(...rank(kampus.nama, q))
          .limit(limit)
          .offset(offset)
      : [],
    types.includes("prodi")
      ? db
          .select({
            id: prodi.id,
            nama: prodi.nama,
            slug: prodi.slug,
            jenjang: prodi.jenjang,
            kampusNama: kampus.nama,
            kampusSlug: kampus.slug,
            kampusNpsn: kampus.npsn,
            unggulan: kampus.unggulan,
          })
          .from(prodi)
          .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
          .where(and(prodiWhere, unggulanOnly ? eq(kampus.unggulan, true) : undefined))
          .orderBy(...prodiOrder)
          .limit(limit)
          .offset(offset)
      : [],
  ]);

  return { jurusan: jurusanRows, kampus: kampusRows, prodi: prodiRows };
}

export type SearchResults = Awaited<ReturnType<typeof searchKatalog>>;
