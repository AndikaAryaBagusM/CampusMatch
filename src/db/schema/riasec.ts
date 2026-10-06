import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
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

const skor = (name: string) => smallint(name).notNull();
const kolomSkor = ["skor_r", "skor_i", "skor_a", "skor_s", "skor_e", "skor_c"] as const;

// A Profil RIASEC saved to an account (decisions.md 17g): only the six scores
// (0–10 ticked activities per type) and the date, never the item answers.
// Every saved one is kept as history until its owner deletes it.
export const profilMinat = pgTable(
  "profil_minat",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skorR: skor("skor_r"),
    skorI: skor("skor_i"),
    skorA: skor("skor_a"),
    skorS: skor("skor_s"),
    skorE: skor("skor_e"),
    skorC: skor("skor_c"),
    createdAt: createdAt(),
  },
  (t) => [
    index("profil_minat_user_id_idx").on(t.userId),
    ...kolomSkor.map((kolom) => check(`profil_minat_${kolom}_check`, sql`${sql.identifier(kolom)} BETWEEN 0 AND 10`)),
  ],
);
