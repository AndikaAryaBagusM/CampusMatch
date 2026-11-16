import { date, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// Page views per day, in total only (decisions.md 17t): the page's path, where
// the visit came from as one of a few fixed groups, and a count. Nothing about
// who visited: no IP, no cookie, no identifier.
export const kunjunganHarian = pgTable(
  "kunjungan_harian",
  {
    tanggal: date("tanggal").notNull(),
    jalur: text("jalur").notNull(),
    asal: text("asal").notNull(),
    jumlah: integer("jumlah").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.tanggal, t.jalur, t.asal] })],
);
