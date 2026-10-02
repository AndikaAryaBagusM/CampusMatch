import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  primaryKey,
  smallint,
  unique,
} from "drizzle-orm/pg-core";
import { createdAt } from "./columns";
import { riasecTipe } from "./enums";
import { jurusan } from "./katalog";

// Kode RIASEC of a Jurusan: 2–3 ordered types. The minimum of 2 is checked in the app.
export const kodeRiasec = pgTable(
  "kode_riasec",
  {
    jurusanId: integer("jurusan_id")
      .notNull()
      .references(() => jurusan.id, { onDelete: "cascade" }),
    urutan: smallint("urutan").notNull(),
    tipe: riasecTipe("tipe").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.jurusanId, t.urutan] }),
    unique("kode_riasec_jurusan_tipe_unique").on(t.jurusanId, t.tipe),
    check("kode_riasec_urutan_check", sql`${t.urutan} BETWEEN 1 AND 3`),
  ],
);
