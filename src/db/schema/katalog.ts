import { sql } from "drizzle-orm";
import {
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
  uniqueIndex,
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
    // Campus email domain (e.g. "ugm.ac.id"), used for Terverifikasi; its
    // subdomains (mail.ugm.ac.id) count too. From data/domain-kampus.csv.
    domainEmail: text("domain_email"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("kampus_kota_id_idx").on(t.kotaId),
    // One domain belongs to one Kampus.
    uniqueIndex("kampus_domain_email_unique").on(t.domainEmail).where(sql`${t.domainEmail} IS NOT NULL`),
    index("kampus_nama_trgm_idx").using("gin", t.nama.op("gin_trgm_ops")),
    check(
      "kampus_akreditasi_check",
      sql`${t.akreditasi} IN (${sql.raw(AKREDITASI.map((a) => `'${a}'`).join(", "))})`,
    ),
  ],
);

// One Kampus's place in one edition of the QS World University Rankings
// (ADR 0011), as QS publishes it: an exact rank ("276"), a shared rank
// ("=191") or a band ("851-900", "1401+"). Loaded from data/raw/ by
// `npm run kampus:load-qs`. A sourced third-party fact with no link to Ulasan,
// Bintang or any score.
export const peringkatQs = pgTable(
  "peringkat_qs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "restrict" }),
    // Edition year in QS's own title, e.g. 2027 for "QS World University Rankings 2027".
    edisi: integer("edisi").notNull(),
    // Exactly as published.
    peringkat: text("peringkat").notNull(),
    // Numeric bounds of `peringkat`, for ordering; max is NULL for an open band ("1401+").
    peringkatMin: integer("peringkat_min").notNull(),
    peringkatMax: integer("peringkat_max"),
    // The name QS lists the Kampus under, e.g. "Gadjah Mada University".
    namaQs: text("nama_qs").notNull(),
    sumberUrl: text("sumber_url").notNull(),
    tanggalAmbil: date("tanggal_ambil").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("peringkat_qs_kampus_edisi_unique").on(t.kampusId, t.edisi),
    index("peringkat_qs_edisi_idx").on(t.edisi),
    check(
      "peringkat_qs_bounds_check",
      sql`${t.peringkatMin} > 0 AND (${t.peringkatMax} IS NULL OR ${t.peringkatMax} >= ${t.peringkatMin})`,
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

// Every Moderator change to the Jurusan mapping (decisions.md 17m): a Kode
// Prodi remapped (jenis 'kode') or one Prodi moved by an override (jenis
// 'prodi'). A NULL Jurusan means unmapped, or an override cleared.
export const riwayatJurusan = pgTable(
  "riwayat_jurusan",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    jenis: text("jenis", { enum: ["kode", "prodi"] }).notNull(),
    kodeProdi: varchar("kode_prodi", { length: 10 }).notNull(),
    prodiId: integer("prodi_id").references(() => prodi.id, { onDelete: "cascade" }),
    jurusanLamaId: integer("jurusan_lama_id").references(() => jurusan.id, { onDelete: "set null" }),
    jurusanBaruId: integer("jurusan_baru_id").references(() => jurusan.id, { onDelete: "set null" }),
    alasan: text("alasan").notNull(),
    oleh: text("oleh").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("riwayat_jurusan_kode_prodi_idx").on(t.kodeProdi),
    check("riwayat_jurusan_jenis_check", sql`${t.jenis} IN ('kode', 'prodi') AND (${t.jenis} = 'prodi') = (${t.prodiId} IS NOT NULL)`),
    check("riwayat_jurusan_alasan_check", sql`length(trim(${t.alasan})) > 0`),
  ],
);

// A Pengulas proved a link to a Kampus with a campus email (Terverifikasi,
// decisions.md 17o). Only the domain is kept, never the address.
export const verifikasiKampus = pgTable(
  "verifikasi_kampus",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kampusId] })],
);

// A pending link sent to a campus address. The address itself is not kept;
// the link's token proves access to the mailbox. Stored as its sha256.
export const tokenVerifikasiKampus = pgTable(
  "token_verifikasi_kampus",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kampusId: integer("kampus_id")
      .notNull()
      .references(() => kampus.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("token_verifikasi_kampus_user_id_idx").on(t.userId)],
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
  createdAt: createdAt(),
});
