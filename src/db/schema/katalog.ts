import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, updatedAt } from "./columns";
import { AKREDITASI, bentukKampus, jenjang } from "./enums";

// A kabupaten or kota as published in the exports, e.g. "Kab. Sleman".
export const kota = pgTable(
  "kota",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nama: text("nama").notNull(),
    provinsi: text("provinsi").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [unique("kota_nama_provinsi_unique").on(t.nama, t.provinsi)],
);

export const kampus = pgTable(
  "kampus",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Trimmed; keeps leading zeros.
    npsn: varchar("npsn", { length: 10 }).notNull().unique(),
    nama: text("nama").notNull(),
    slug: text("slug").notNull().unique(),
    bentuk: bentukKampus("bentuk").notNull(),
    kotaId: integer("kota_id")
      .notNull()
      .references(() => kota.id, { onDelete: "restrict" }),
    akreditasi: text("akreditasi"),
    // Member of the Daftar Kampus Unggulan.
    unggulan: boolean("unggulan").notNull().default(false),
    // Campus email domain (e.g. "ugm.ac.id"), used for Terverifikasi.
    domainEmail: text("domain_email"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("kampus_kota_id_idx").on(t.kotaId),
    index("kampus_nama_trgm_idx").using("gin", t.nama.op("gin_trgm_ops")),
    check(
      "kampus_akreditasi_check",
      sql`${t.akreditasi} IN (${sql.raw(AKREDITASI.map((a) => `'${a}'`).join(", "))})`,
    ),
  ],
);

export const jurusan = pgTable(
  "jurusan",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nama: text("nama").notNull().unique(),
    slug: text("slug").notNull().unique(),
    deskripsi: text("deskripsi"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("jurusan_nama_trgm_idx").using("gin", t.nama.op("gin_trgm_ops"))],
);

// Kode Prodi -> Jurusan mapping (ADR 0001).
export const kodeProdiJurusan = pgTable("kode_prodi_jurusan", {
  kodeProdi: varchar("kode_prodi", { length: 10 }).primaryKey(),
  jurusanId: integer("jurusan_id")
    .notNull()
    .references(() => jurusan.id, { onDelete: "restrict" }),
  diubahOleh: text("diubah_oleh").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// Effective Jurusan = jurusanOverrideId ?? kode_prodi_jurusan.jurusan_id.
export const prodi = pgTable(
  "prodi",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "restrict" }),
    kodeProdi: varchar("kode_prodi", { length: 10 }).notNull(),
    nama: text("nama").notNull(),
    jenjang: jenjang("jenjang").notNull(),
    bidang: text("bidang"),
    slug: text("slug").notNull().unique(),
    jurusanOverrideId: integer("jurusan_override_id").references(
      () => jurusan.id,
      { onDelete: "set null" },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Importer upsert key; Kampus + Kode Prodi + Jenjang alone is not unique (ADR 0003).
    unique("prodi_kampus_kode_jenjang_nama_unique").on(
      t.kampusId,
      t.kodeProdi,
      t.jenjang,
      t.nama,
    ),
    // Target of biaya_prodi_fk, so a Biaya's Prodi belongs to the Biaya's Kampus.
    unique("prodi_id_kampus_unique").on(t.id, t.kampusId),
    index("prodi_kode_prodi_idx").on(t.kodeProdi),
    index("prodi_nama_trgm_idx").using("gin", t.nama.op("gin_trgm_ops")),
  ],
);

// A Pengulas proved a link to a Kampus with a campus email (Terverifikasi).
export const verifikasiKampus = pgTable(
  "verifikasi_kampus",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kampusId] })],
);

// One row per catalogue import; the latest row's tanggal_data is the
// catalogue's as-of date (ADR 0003).
export const imporKatalog = pgTable("impor_katalog", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  // Date the official exports were downloaded.
  tanggalData: date("tanggal_data").notNull(),
  // Source file names and their sha256.
  sumber: jsonb("sumber").$type<{ file: string; sha256: string }[]>().notNull(),
  jumlahKota: integer("jumlah_kota").notNull(),
  jumlahKampus: integer("jumlah_kampus").notNull(),
  jumlahProdi: integer("jumlah_prodi").notNull(),
  // Provenance of the Daftar Kampus Unggulan (sumber and tanggal_ambil in
  // data/top-100-kampus.csv). Copied from the previous row when the CSV is absent,
  // so the latest row always describes the current unggulan flags.
  unggulanSumber: text("unggulan_sumber"),
  unggulanTanggalAmbil: date("unggulan_tanggal_ambil"),
  createdAt: createdAt(),
});
