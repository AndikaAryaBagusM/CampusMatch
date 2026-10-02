import { relations } from "drizzle-orm";
import { users } from "./auth";
import {
  jurusan,
  kampus,
  kodeProdiJurusan,
  kota,
  prodi,
  verifikasiKampus,
} from "./katalog";
import { kodeRiasec } from "./riasec";
import { laporan, ulasan, ulasanRevisi } from "./ulasan";

export * from "./auth";
export * from "./enums";
export * from "./katalog";
export * from "./riasec";
export * from "./ulasan";

export const kotaRelations = relations(kota, ({ many }) => ({
  kampus: many(kampus),
}));

export const kampusRelations = relations(kampus, ({ one, many }) => ({
  kota: one(kota, { fields: [kampus.kotaId], references: [kota.id] }),
  prodi: many(prodi),
}));

export const prodiRelations = relations(prodi, ({ one, many }) => ({
  kampus: one(kampus, { fields: [prodi.kampusId], references: [kampus.id] }),
  kodeProdiJurusan: one(kodeProdiJurusan, {
    fields: [prodi.kodeProdi],
    references: [kodeProdiJurusan.kodeProdi],
  }),
  jurusanOverride: one(jurusan, {
    fields: [prodi.jurusanOverrideId],
    references: [jurusan.id],
  }),
  ulasan: many(ulasan),
}));

export const jurusanRelations = relations(jurusan, ({ many }) => ({
  kodeRiasec: many(kodeRiasec),
  kodeProdi: many(kodeProdiJurusan),
}));

export const kodeProdiJurusanRelations = relations(
  kodeProdiJurusan,
  ({ one }) => ({
    jurusan: one(jurusan, {
      fields: [kodeProdiJurusan.jurusanId],
      references: [jurusan.id],
    }),
  }),
);

export const kodeRiasecRelations = relations(kodeRiasec, ({ one }) => ({
  jurusan: one(jurusan, {
    fields: [kodeRiasec.jurusanId],
    references: [jurusan.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  ulasan: many(ulasan),
  verifikasiKampus: many(verifikasiKampus),
}));

export const verifikasiKampusRelations = relations(
  verifikasiKampus,
  ({ one }) => ({
    user: one(users, {
      fields: [verifikasiKampus.userId],
      references: [users.id],
    }),
    kampus: one(kampus, {
      fields: [verifikasiKampus.kampusId],
      references: [kampus.id],
    }),
  }),
);

export const ulasanRelations = relations(ulasan, ({ one, many }) => ({
  pengulas: one(users, { fields: [ulasan.pengulasId], references: [users.id] }),
  prodi: one(prodi, { fields: [ulasan.prodiId], references: [prodi.id] }),
  revisiTerbit: one(ulasanRevisi, {
    fields: [ulasan.revisiTerbitId],
    references: [ulasanRevisi.id],
    relationName: "revisiTerbit",
  }),
  revisi: many(ulasanRevisi, { relationName: "revisi" }),
  laporan: many(laporan),
}));

export const ulasanRevisiRelations = relations(ulasanRevisi, ({ one }) => ({
  ulasan: one(ulasan, {
    fields: [ulasanRevisi.ulasanId],
    references: [ulasan.id],
    relationName: "revisi",
  }),
}));

export const laporanRelations = relations(laporan, ({ one }) => ({
  ulasan: one(ulasan, { fields: [laporan.ulasanId], references: [ulasan.id] }),
  revisi: one(ulasanRevisi, {
    fields: [laporan.revisiId],
    references: [ulasanRevisi.id],
  }),
}));
