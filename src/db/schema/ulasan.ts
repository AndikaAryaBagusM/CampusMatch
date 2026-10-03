import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, updatedAt } from "./columns";
import {
  aksiModerasi,
  alasanLaporan,
  statusLaporan,
  statusPengulas,
  statusUlasan,
  tingkatRisiko,
} from "./enums";
import { prodi } from "./katalog";

// An Ulasan is the identity (one Pengulas, one Prodi). Its content lives in
// ulasan_revisi, so an edit can be screened while the previous revision stays
// live. Publicly shown = revisi_terbit_id IS NOT NULL AND dihapus_at IS NULL.
export const ulasan = pgTable(
  "ulasan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pengulasId: text("pengulas_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    prodiId: integer("prodi_id")
      .notNull()
      .references(() => prodi.id, { onDelete: "restrict" }),
    statusPengulas: statusPengulas("status_pengulas").notNull(),
    tahunMasuk: smallint("tahun_masuk").notNull(),
    revisiTerbitId: uuid("revisi_terbit_id"),
    dihapusAt: timestamp("dihapus_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // The live pointer can only reference one of this Ulasan's own revisions.
    // NO ACTION (not SET NULL): on a composite key SET NULL would also null ulasan.id.
    foreignKey({
      name: "ulasan_revisi_terbit_fk",
      columns: [t.id, t.revisiTerbitId],
      foreignColumns: [ulasanRevisi.ulasanId, ulasanRevisi.id],
    }),
    uniqueIndex("ulasan_pengulas_prodi_aktif_unique")
      .on(t.pengulasId, t.prodiId)
      .where(sql`${t.dihapusAt} IS NULL`),
    index("ulasan_prodi_id_idx").on(t.prodiId),
    check("ulasan_tahun_masuk_check", sql`${t.tahunMasuk} BETWEEN 1950 AND 2100`),
  ],
);

const nilai = (name: string) => smallint(name).notNull();
const aspekKolom = [
  "bintang",
  "aspek_kurikulum",
  "aspek_dosen",
  "aspek_fasilitas",
  "aspek_suasana_belajar",
  "aspek_organisasi",
  "aspek_biaya_kualitas",
] as const;

export const ulasanRevisi = pgTable(
  "ulasan_revisi",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ulasanId: uuid("ulasan_id")
      .notNull()
      .references((): AnyPgColumn => ulasan.id, { onDelete: "cascade" }),
    nomor: smallint("nomor").notNull(),
    judul: text("judul").notNull(),
    isi: text("isi").notNull(),
    bintang: nilai("bintang"),
    aspekKurikulum: nilai("aspek_kurikulum"),
    aspekDosen: nilai("aspek_dosen"),
    aspekFasilitas: nilai("aspek_fasilitas"),
    aspekSuasanaBelajar: nilai("aspek_suasana_belajar"),
    aspekOrganisasi: nilai("aspek_organisasi"),
    aspekBiayaKualitas: nilai("aspek_biaya_kualitas"),
    rekomendasi: boolean("rekomendasi").notNull(),
    status: statusUlasan("status").notNull().default("menunggu"),
    tingkatRisiko: tingkatRisiko("tingkat_risiko"),
    alasanScreening: text("alasan_screening"),
    // Model id that produced tingkat_risiko, e.g. "claude-haiku-4-5-20251001".
    modelScreening: text("model_screening"),
    // Failed Screening rounds (ADR 0002); the third sends the revision to Ditinjau.
    percobaanScreening: smallint("percobaan_screening").notNull().default(0),
    discreeningAt: timestamp("discreening_at", { withTimezone: true }),
    diputuskanOleh: text("diputuskan_oleh").references(() => users.id, {
      onDelete: "set null",
    }),
    diputuskanAt: timestamp("diputuskan_at", { withTimezone: true }),
    alasanModerator: text("alasan_moderator"),
    createdAt: createdAt(),
  },
  (t) => [
    unique("ulasan_revisi_ulasan_nomor_unique").on(t.ulasanId, t.nomor),
    // Target of ulasan_revisi_terbit_fk.
    unique("ulasan_revisi_ulasan_id_id_unique").on(t.ulasanId, t.id),
    index("ulasan_revisi_status_idx").on(t.status),
    ...aspekKolom.map((kolom) =>
      check(
        `ulasan_revisi_${kolom}_check`,
        sql`${sql.identifier(kolom)} BETWEEN 1 AND 5`,
      ),
    ),
  ],
);

export const laporan = pgTable(
  "laporan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ulasanId: uuid("ulasan_id")
      .notNull()
      .references(() => ulasan.id, { onDelete: "cascade" }),
    // The revision that was live when it was reported.
    revisiId: uuid("revisi_id")
      .notNull()
      .references(() => ulasanRevisi.id, { onDelete: "cascade" }),
    alasan: alasanLaporan("alasan").notNull(),
    catatan: text("catatan"),
    pelaporId: text("pelapor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // HMAC-SHA256(ip, IP_HASH_SECRET) in hex. Never a plain hash: IPv4 is easy to reverse.
    ipHash: text("ip_hash"),
    status: statusLaporan("status").notNull().default("baru"),
    ditanganiOleh: text("ditangani_oleh").references(() => users.id, {
      onDelete: "set null",
    }),
    ditanganiAt: timestamp("ditangani_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("laporan_status_idx").on(t.status),
    index("laporan_ulasan_id_idx").on(t.ulasanId),
    // One open Laporan per reporter per Ulasan.
    uniqueIndex("laporan_ulasan_pelapor_baru_unique")
      .on(t.ulasanId, t.pelaporId)
      .where(sql`${t.status} = 'baru'`),
  ],
);

// Append-only log of what happened to an Ulasan: Screening results and
// Moderator decisions. Shown to Moderators as the Ulasan's history.
export const riwayatModerasi = pgTable(
  "riwayat_moderasi",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ulasanId: uuid("ulasan_id")
      .notNull()
      .references(() => ulasan.id, { onDelete: "cascade" }),
    revisiId: uuid("revisi_id").references(() => ulasanRevisi.id, {
      onDelete: "cascade",
    }),
    laporanId: uuid("laporan_id").references(() => laporan.id, {
      onDelete: "set null",
    }),
    aksi: aksiModerasi("aksi").notNull(),
    // NULL for automatic Screening entries.
    oleh: text("oleh").references(() => users.id, { onDelete: "set null" }),
    alasan: text("alasan"),
    createdAt: createdAt(),
  },
  (t) => [index("riwayat_moderasi_ulasan_id_idx").on(t.ulasanId)],
);
