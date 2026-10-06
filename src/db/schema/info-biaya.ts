import { sql } from "drizzle-orm";
import { bigint, check, index, integer, pgTable, smallint, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { createdAt, updatedAt } from "./columns";
import { beasiswaPengulas, kategoriJalur, statusPengulas, tesJalur } from "./enums";
import { prodi } from "./katalog";
import { BATAS_INFO_BIAYA } from "../../lib/info-biaya/label";

// Info Biaya (ADR 0010): one Pengulas's own answers about what they paid and
// how they got into one Prodi. Personal financial data: never shown on its own,
// only as the Estimasi Pengulas, and kept apart from the official facts.
export const infoBiaya = pgTable(
  "info_biaya",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prodiId: integer("prodi_id")
      .notNull()
      .references(() => prodi.id, { onDelete: "cascade" }),
    statusPengulas: statusPengulas("status_pengulas").notNull(),
    tahunMasuk: smallint("tahun_masuk").notNull(),
    kategoriJalur: kategoriJalur("kategori_jalur"),
    tes: tesJalur("tes").array(),
    // Whole rupiah. UKT at a public Kampus, SPP at a private one.
    biayaSemester: bigint("biaya_semester", { mode: "number" }),
    // Shown only to Moderators checking entries; never public.
    kelompokUkt: smallint("kelompok_ukt"),
    // 0 means "tidak ada".
    uangPangkal: bigint("uang_pangkal", { mode: "number" }),
    // Other one-off fees at entry, registration included, as one total.
    biayaLainMasuk: bigint("biaya_lain_masuk", { mode: "number" }),
    beasiswa: beasiswaPengulas("beasiswa"),
    // When the Pengulas last ticked the consent box.
    disetujuiAt: timestamp("disetujui_at", { withTimezone: true }).notNull(),
    // Kesampingkan: a Moderator keeps the entry out of the Estimasi, with a reason.
    dikesampingkanOleh: text("dikesampingkan_oleh").references(() => users.id, { onDelete: "set null" }),
    dikesampingkanAt: timestamp("dikesampingkan_at", { withTimezone: true }),
    alasanDikesampingkan: text("alasan_dikesampingkan"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("info_biaya_user_prodi_unique").on(t.userId, t.prodiId),
    index("info_biaya_prodi_tahun_idx").on(t.prodiId, t.tahunMasuk),
    check("info_biaya_tahun_masuk_check", sql`${t.tahunMasuk} BETWEEN 1950 AND 2100`),
    check(
      "info_biaya_jumlah_check",
      sql`(${t.biayaSemester} IS NULL OR ${t.biayaSemester} BETWEEN 0 AND ${sql.raw(String(BATAS_INFO_BIAYA.biayaSemester))})
        AND (${t.uangPangkal} IS NULL OR ${t.uangPangkal} BETWEEN 0 AND ${sql.raw(String(BATAS_INFO_BIAYA.uangPangkal))})
        AND (${t.biayaLainMasuk} IS NULL OR ${t.biayaLainMasuk} BETWEEN 0 AND ${sql.raw(String(BATAS_INFO_BIAYA.biayaLainMasuk))})
        AND (${t.kelompokUkt} IS NULL OR ${t.kelompokUkt} BETWEEN 1 AND ${sql.raw(String(BATAS_INFO_BIAYA.kelompokUkt))})`,
    ),
    check(
      "info_biaya_ada_jawaban_check",
      sql`num_nonnulls(${t.kategoriJalur}, ${t.tes}, ${t.biayaSemester}, ${t.uangPangkal}, ${t.biayaLainMasuk}, ${t.beasiswa}) > 0`,
    ),
    check(
      "info_biaya_dikesampingkan_check",
      sql`(${t.dikesampingkanAt} IS NULL) = (${t.alasanDikesampingkan} IS NULL)`,
    ),
  ],
);
