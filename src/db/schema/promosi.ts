import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, updatedAt } from "./columns";
import { jenisPromosi, statusPromosi } from "./enums";
import { jurusan, kampus } from "./katalog";

// A paid, labelled placement (ADR 0009) by a Kampus or a bimbel (ADR 0012).
// A Kampus's shows its catalogue data and links only to its CampusMatch page;
// a bimbel's shows its name and text and links to one reviewed https address.
// Neither ever changes Ulasan, Bintang or the order of any list.
export const promosi = pgTable(
  "promosi",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    jenis: jenisPromosi("jenis").notNull().default("kampus"),
    kampusId: integer("kampus_id").references(() => kampus.id, { onDelete: "restrict" }),
    // A bimbel's name and the address its Promosi leads to.
    namaPengiklan: text("nama_pengiklan"),
    tautan: text("tautan"),
    // Written by the Pengiklan, checked by two Moderators.
    teks: text("teks"),
    diBeranda: boolean("di_beranda").notNull().default(false),
    // Inclusive, in Asia/Jakarta.
    mulai: date("mulai").notNull(),
    selesai: date("selesai").notNull(),
    status: statusPromosi("status").notNull().default("draf"),
    // E.g. the contract reference; never shown publicly.
    catatanInternal: text("catatan_internal"),
    dimasukkanOleh: text("dimasukkan_oleh").references(() => users.id, { onDelete: "set null" }),
    diaktifkanOleh: text("diaktifkan_oleh").references(() => users.id, { onDelete: "set null" }),
    diaktifkanAt: timestamp("diaktifkan_at", { withTimezone: true }),
    dihentikanOleh: text("dihentikan_oleh").references(() => users.id, { onDelete: "set null" }),
    dihentikanAt: timestamp("dihentikan_at", { withTimezone: true }),
    alasanDihentikan: text("alasan_dihentikan"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("promosi_kampus_id_idx").on(t.kampusId),
    check("promosi_tanggal_check", sql`${t.selesai} >= ${t.mulai}`),
    check("promosi_teks_check", sql`${t.teks} IS NULL OR length(${t.teks}) BETWEEN 1 AND 140`),
    // Explicit IS NOT NULLs: a check that comes out NULL counts as passed.
    check(
      "promosi_jenis_check",
      sql`(${t.jenis} = 'kampus' AND ${t.kampusId} IS NOT NULL AND ${t.namaPengiklan} IS NULL AND ${t.tautan} IS NULL)
        OR (${t.jenis} = 'bimbel' AND ${t.kampusId} IS NULL AND ${t.namaPengiklan} IS NOT NULL AND ${t.teks} IS NOT NULL
          AND ${t.tautan} IS NOT NULL AND length(${t.namaPengiklan}) BETWEEN 1 AND 80
          AND ${t.tautan} LIKE 'https://%' AND length(${t.tautan}) <= 500)`,
    ),
    // Aktif (and later dihentikan) needs an activator other than the one who
    // entered it; `<>` is NULL (so passes) once either user is deleted.
    check(
      "promosi_status_check",
      sql`(${t.status} = 'draf' AND ${t.diaktifkanOleh} IS NULL AND ${t.diaktifkanAt} IS NULL)
        OR (${t.status} <> 'draf' AND ${t.diaktifkanAt} IS NOT NULL AND ${t.diaktifkanOleh} <> ${t.dimasukkanOleh})`,
    ),
    check(
      "promosi_dihentikan_check",
      sql`(${t.status} = 'dihentikan') = (${t.dihentikanAt} IS NOT NULL AND ${t.alasanDihentikan} IS NOT NULL)`,
    ),
  ],
);

// The Jurusan a Promosi was bought for: it shows on their pages and on
// searches that match them.
export const promosiJurusan = pgTable(
  "promosi_jurusan",
  {
    promosiId: integer("promosi_id")
      .notNull()
      .references(() => promosi.id, { onDelete: "cascade" }),
    jurusanId: integer("jurusan_id")
      .notNull()
      .references(() => jurusan.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.promosiId, t.jurusanId] }), index("promosi_jurusan_jurusan_id_idx").on(t.jurusanId)],
);

// Clicks per Promosi per day, in total only: nothing about who clicked.
export const promosiKlik = pgTable(
  "promosi_klik",
  {
    promosiId: integer("promosi_id")
      .notNull()
      .references(() => promosi.id, { onDelete: "cascade" }),
    tanggal: date("tanggal").notNull(),
    jumlah: integer("jumlah").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.promosiId, t.tanggal] })],
);
