import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, updatedAt } from "./columns";
import {
  batasBiaya,
  jenisBiaya,
  kategoriJalur,
  periodeBiaya,
  statusFakta,
  tesJalur,
} from "./enums";
import { kampus, prodi } from "./katalog";

// Biaya & Masuk facts (ADR 0006). Every fact has a Sumber and its own Tahun
// Akademik, and is shown only once a second Moderator has marked it Diperiksa.

// An official document or page backing one or more facts. One folder under
// data/fakta/ per Sumber; `kode` is that folder's name and the import key.
export const sumber = pgTable(
  "sumber",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kode: text("kode").notNull().unique(),
    // NULL for a national source, e.g. the KIP Kuliah guidelines.
    kampusId: integer("kampus_id").references(() => kampus.id, { onDelete: "restrict" }),
    url: text("url").notNull(),
    judul: text("judul").notNull(),
    penerbit: text("penerbit").notNull(),
    diaksesPada: date("diakses_pada").notNull(),
    // Wayback Machine copy. NULL = "tanpa arsip": the checking Moderator must
    // record why it was accepted anyway (alasan_tanpa_arsip).
    arsipUrl: text("arsip_url"),
    alasanTanpaArsip: text("alasan_tanpa_arsip"),
    dimasukkanOleh: text("dimasukkan_oleh").references(() => users.id, { onDelete: "set null" }),
    // Why the checker last sent the Draf facts back, if they did.
    catatanPemeriksa: text("catatan_pemeriksa"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("sumber_kampus_id_idx").on(t.kampusId),
    check("sumber_arsip_url_check", sql`${t.arsipUrl} LIKE 'https://web.archive.org/%'`),
  ],
);

// Columns every fact shares: its Sumber, Tahun Akademik and Status Fakta.
const kolomFakta = () => ({
  sumberId: integer("sumber_id")
    .notNull()
    .references(() => sumber.id, { onDelete: "restrict" }),
  // First year of the Tahun Akademik: 2026 means 2026/2027.
  tahunAkademik: smallint("tahun_akademik").notNull(),
  status: statusFakta("status").notNull().default("draf"),
  dimasukkanOleh: text("dimasukkan_oleh").references(() => users.id, { onDelete: "set null" }),
  diperiksaOleh: text("diperiksa_oleh").references(() => users.id, { onDelete: "set null" }),
  diperiksaAt: timestamp("diperiksa_at", { withTimezone: true }),
  // Ditarik: one Moderator takes a shown fact down, always with a reason.
  ditarikOleh: text("ditarik_oleh").references(() => users.id, { onDelete: "set null" }),
  ditarikAt: timestamp("ditarik_at", { withTimezone: true }),
  alasanDitarik: text("alasan_ditarik"),
  createdAt: createdAt(),
});

// Diperiksa (and later Ditarik) needs a time and a checker other than the one
// who entered it; `<>` is NULL (so passes) once either user is deleted.
// Ditarik needs a time and a reason, and only a Ditarik fact has them.
type KolomCek = "tahunAkademik" | "status" | "diperiksaOleh" | "diperiksaAt" | "dimasukkanOleh" | "ditarikAt" | "alasanDitarik";
const cekFakta = (tabel: string, t: Record<KolomCek, AnyPgColumn>) => [
  check(`${tabel}_tahun_akademik_check`, sql`${t.tahunAkademik} BETWEEN 2000 AND 2100`),
  check(
    `${tabel}_status_check`,
    sql`(${t.status} = 'draf' AND ${t.diperiksaOleh} IS NULL AND ${t.diperiksaAt} IS NULL)
      OR (${t.status} <> 'draf' AND ${t.diperiksaAt} IS NOT NULL AND ${t.diperiksaOleh} <> ${t.dimasukkanOleh})`,
  ),
  check(
    `${tabel}_ditarik_check`,
    sql`(${t.status} = 'ditarik') = (${t.ditarikAt} IS NOT NULL AND ${t.alasanDitarik} IS NOT NULL)
      AND (${t.status} = 'ditarik' OR (${t.ditarikAt} IS NULL AND ${t.alasanDitarik} IS NULL))`,
  ),
];

// Uniqueness among facts that still count: a Ditarik fact doesn't block its correction.
const belumDitarik = (t: { status: AnyPgColumn }) => sql`${t.status} <> 'ditarik'`;

export const jalurMasuk = pgTable(
  "jalur_masuk",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "restrict" }),
    nama: text("nama").notNull(),
    kategori: kategoriJalur("kategori").notNull(),
    tes: tesJalur("tes").array().notNull(),
    // Only when the Sumber states them.
    pendaftaranBuka: date("pendaftaran_buka"),
    pendaftaranTutup: date("pendaftaran_tutup"),
    ...kolomFakta(),
  },
  (t) => [
    uniqueIndex("jalur_masuk_kampus_tahun_nama_unique").on(t.kampusId, t.tahunAkademik, t.nama).where(belumDitarik(t)),
    // Target of biaya_jalur_masuk_fk.
    unique("jalur_masuk_id_kampus_unique").on(t.id, t.kampusId),
    index("jalur_masuk_sumber_id_idx").on(t.sumberId),
    check(
      "jalur_masuk_pendaftaran_check",
      sql`${t.pendaftaranBuka} IS NULL OR ${t.pendaftaranTutup} IS NULL OR ${t.pendaftaranBuka} <= ${t.pendaftaranTutup}`,
    ),
    ...cekFakta("jalur_masuk", t),
  ],
);

// One published amount. It belongs to a Prodi only when the Kampus publishes
// it per Prodi (prodi_id set); a Kampus-wide amount is never copied to each Prodi.
export const biaya = pgTable(
  "biaya",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "restrict" }),
    prodiId: integer("prodi_id"),
    jenis: jenisBiaya("jenis").notNull(),
    jalurMasukId: integer("jalur_masuk_id"),
    // E.g. "Kelompok III" or "Jaket almamater".
    label: text("label"),
    // Whole rupiah.
    jumlah: bigint("jumlah", { mode: "number" }).notNull(),
    batas: batasBiaya("batas"),
    periode: periodeBiaya("periode").notNull(),
    ...kolomFakta(),
  },
  (t) => [
    // The Prodi and the Jalur Masuk must belong to the same Kampus.
    foreignKey({
      name: "biaya_prodi_fk",
      columns: [t.prodiId, t.kampusId],
      foreignColumns: [prodi.id, prodi.kampusId],
    }),
    foreignKey({
      name: "biaya_jalur_masuk_fk",
      columns: [t.jalurMasukId, t.kampusId],
      foreignColumns: [jalurMasuk.id, jalurMasuk.kampusId],
    }),
    index("biaya_kampus_id_idx").on(t.kampusId),
    index("biaya_prodi_id_idx").on(t.prodiId),
    index("biaya_sumber_id_idx").on(t.sumberId),
    check("biaya_jumlah_check", sql`${t.jumlah} >= 0`),
    check(
      "biaya_periode_check",
      sql`(${t.jenis} NOT IN ('ukt', 'spp') OR ${t.periode} = 'per_semester')
        AND (${t.jenis} NOT IN ('uang_pangkal', 'pendaftaran') OR ${t.periode} = 'sekali')`,
    ),
    ...cekFakta("biaya", t),
  ],
);

// A Kampus's own Beasiswa (kampus_id set), or a national scheme recorded once
// (kampus_id NULL) and linked to each Kampus through beasiswa_kampus.
export const beasiswa = pgTable(
  "beasiswa",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kampusId: integer("kampus_id").references(() => kampus.id, { onDelete: "restrict" }),
    nama: text("nama").notNull(),
    penyelenggara: text("penyelenggara").notNull(),
    // Who it is for, and what it covers, as the Sumber states.
    sasaran: text("sasaran").notNull(),
    cakupan: text("cakupan").notNull(),
    url: text("url"),
    ...kolomFakta(),
  },
  (t) => [
    // One index for a Kampus's own Beasiswa and one for national ones, because
    // NULL kampus_id values never collide in a plain unique index.
    uniqueIndex("beasiswa_kampus_nama_tahun_unique").on(t.kampusId, t.nama, t.tahunAkademik).where(sql`${t.kampusId} IS NOT NULL AND ${belumDitarik(t)}`),
    uniqueIndex("beasiswa_nasional_nama_tahun_unique").on(t.nama, t.tahunAkademik).where(sql`${t.kampusId} IS NULL AND ${belumDitarik(t)}`),
    index("beasiswa_sumber_id_idx").on(t.sumberId),
    ...cekFakta("beasiswa", t),
  ],
);

// A Kampus takes part in a national Beasiswa in a Tahun Akademik.
export const beasiswaKampus = pgTable(
  "beasiswa_kampus",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    beasiswaId: integer("beasiswa_id")
      .notNull()
      .references(() => beasiswa.id, { onDelete: "restrict" }),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "restrict" }),
    ...kolomFakta(),
  },
  (t) => [
    uniqueIndex("beasiswa_kampus_unique").on(t.beasiswaId, t.kampusId, t.tahunAkademik).where(belumDitarik(t)),
    index("beasiswa_kampus_kampus_id_idx").on(t.kampusId),
    index("beasiswa_kampus_sumber_id_idx").on(t.sumberId),
    ...cekFakta("beasiswa_kampus", t),
  ],
);
