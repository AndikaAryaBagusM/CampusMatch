import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// Fixed-window rate-limit counters. kunci is e.g. "ip:<hmac>:ulasan" or
// "user:<id>:laporan"; mulai is the start of the window. Never holds a raw IP.
export const batasLaju = pgTable(
  "batas_laju",
  {
    kunci: text("kunci").notNull(),
    mulai: timestamp("mulai", { withTimezone: true }).notNull(),
    jumlah: integer("jumlah").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.kunci, t.mulai] })],
);
