// Imports Kota, Kampus and Prodi (D3, D4, S1) from the official exports in
// data/raw/, plus the Daftar Kampus Unggulan if data/top-100-kampus.csv exists.
// Idempotent: upserts on the schema's unique keys, never deletes.
//
//   npm run catalogue:import -- --dry-run
//   npm run catalogue:import -- --as-of 2026-09-21 [--allow-production]
import { config } from "dotenv";

config({ path: ".env.local" });

import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { withDb, type Db } from "../src/db";
import { imporKatalog, kampus, kota, prodi } from "../src/db/schema";
import { clean, loadExports, loadUnggulan, UNGGULAN_FILE, type Catalogue } from "./catalogue/exports";
import { guardDatabase } from "./catalogue/guard";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function argValue(name: string): string | undefined {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i === -1) return undefined;
  return args[i].includes("=") ? args[i].split("=")[1] : args[i + 1];
}

function parseAsOf(): string | null {
  const v = argValue("--as-of");
  if (!v) return null;
  const d = new Date(`${v}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
    console.error(`--as-of must be a real date in YYYY-MM-DD form, got "${v}".`);
    process.exit(1);
  }
  return v;
}

function chunk<T>(rows: T[], size = 1000): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

// Appends -2, -3, … until the slug is not taken, then reserves it.
function freeSlug(slug: string, taken: Set<string>): string {
  let s = slug;
  for (let n = 2; taken.has(s); n++) s = `${slug}-${n}`;
  taken.add(s);
  return s;
}

function printPlan(cat: Catalogue) {
  const byJenjang = cat.prodi.reduce<Record<string, number>>((m, p) => ((m[p.jenjang] = (m[p.jenjang] ?? 0) + 1), m), {});
  console.log("Rows from the exports");
  console.log(`  kota    ${cat.kota.length}`);
  console.log(`  kampus  ${cat.kampus.length} (akreditasi NULL: ${cat.kampus.filter((k) => !k.akreditasi).length})`);
  console.log(`  prodi   ${cat.prodi.length} (${Object.entries(byJenjang).map(([j, n]) => `${j} ${n}`).join(", ")})`);
}

// Checks the Unggulan CSV against the export and notes problems in the report.
function checkUnggulan(cat: Catalogue) {
  const unggulan = loadUnggulan();
  if (!unggulan) {
    console.log(`\nDaftar Kampus Unggulan: skipped, ${UNGGULAN_FILE} not found`);
    return null;
  }
  const byNpsn = new Map(cat.kampus.map((k) => [k.npsn, k]));
  const npsns = new Set<string>();
  for (const r of unggulan.rows) {
    const k = byNpsn.get(r.npsn);
    if (!k) cat.report.note("Unggulan npsn not in the export (ignored)", `${r.npsn} ${r.nama}`);
    else {
      npsns.add(r.npsn);
      if (r.nama && clean(r.nama).toLowerCase() !== k.nama.toLowerCase())
        cat.report.note("Unggulan name differs from the export (npsn used)", `${r.npsn}: CSV "${r.nama}" vs export "${k.nama}"`);
    }
  }
  console.log(`\nDaftar Kampus Unggulan: ${unggulan.rows.length} rows in ${UNGGULAN_FILE}, ${npsns.size} matched`);
  console.log(`  sumber "${unggulan.sumber}", tanggal_ambil ${unggulan.tanggalAmbil}`);
  return { npsns, source: unggulan.source, sumber: unggulan.sumber, tanggalAmbil: unggulan.tanggalAmbil };
}

async function importAll(tx: Tx, cat: Catalogue, unggulan: ReturnType<typeof checkUnggulan>, asOf: string) {
  const stats: Record<string, { inserted: number; updated: number; unchanged: number }> = {};

  // Kota: upsert on (nama, provinsi); nothing to update.
  const kotaDb = await tx.select().from(kota);
  const kotaId = new Map(kotaDb.map((k) => [`${k.nama}|${k.provinsi}`, k.id]));
  const kotaSlugs = new Set(kotaDb.map((k) => k.slug));
  const newKota = cat.kota
    .filter((k) => !kotaId.has(k.key))
    .map((k) => ({ nama: k.nama, provinsi: k.provinsi, slug: freeSlug(k.slug, kotaSlugs) }));
  for (const batch of chunk(newKota)) {
    const rows = await tx.insert(kota).values(batch).onConflictDoNothing().returning();
    for (const k of rows) kotaId.set(`${k.nama}|${k.provinsi}`, k.id);
  }
  stats.kota = { inserted: newKota.length, updated: 0, unchanged: cat.kota.length - newKota.length };

  // Kampus: upsert on npsn; slug, unggulan and domain_email are never overwritten.
  const kampusDb = await tx.select().from(kampus);
  const kampusByNpsn = new Map(kampusDb.map((k) => [k.npsn, k]));
  const kampusSlugs = new Set(kampusDb.map((k) => k.slug));
  const kampusUpserts = [];
  let kampusInserted = 0;
  for (const k of cat.kampus) {
    const values = { npsn: k.npsn, nama: k.nama, bentuk: k.bentuk, kotaId: kotaId.get(k.kotaKey)!, akreditasi: k.akreditasi };
    const prev = kampusByNpsn.get(k.npsn);
    if (!prev) {
      kampusInserted++;
      kampusUpserts.push({ ...values, slug: freeSlug(k.slug, kampusSlugs) });
    } else if (prev.nama !== values.nama || prev.bentuk !== values.bentuk || prev.kotaId !== values.kotaId || prev.akreditasi !== values.akreditasi) {
      kampusUpserts.push({ ...values, slug: prev.slug });
    }
  }
  const kampusId = new Map(kampusDb.map((k) => [k.npsn, k.id]));
  for (const batch of chunk(kampusUpserts)) {
    const rows = await tx
      .insert(kampus)
      .values(batch)
      .onConflictDoUpdate({
        target: kampus.npsn,
        set: {
          nama: sql`excluded.nama`,
          bentuk: sql`excluded.bentuk`,
          kotaId: sql`excluded.kota_id`,
          akreditasi: sql`excluded.akreditasi`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: kampus.id, npsn: kampus.npsn });
    for (const k of rows) kampusId.set(k.npsn, k.id);
  }
  stats.kampus = {
    inserted: kampusInserted,
    updated: kampusUpserts.length - kampusInserted,
    unchanged: cat.kampus.length - kampusUpserts.length,
  };

  // Prodi: upsert on (kampus_id, kode_prodi, jenjang, nama); only bidang is updated.
  const prodiDb = await tx
    .select({ kampusId: prodi.kampusId, kodeProdi: prodi.kodeProdi, jenjang: prodi.jenjang, nama: prodi.nama, bidang: prodi.bidang, slug: prodi.slug })
    .from(prodi);
  const prodiKey = (p: { kampusId: number; kodeProdi: string; jenjang: string; nama: string }) =>
    `${p.kampusId}|${p.kodeProdi}|${p.jenjang}|${p.nama}`;
  const prodiByKey = new Map(prodiDb.map((p) => [prodiKey(p), p]));
  const prodiSlugs = new Set(prodiDb.map((p) => p.slug));
  const prodiUpserts = [];
  const seenKeys = new Set<string>();
  let prodiInserted = 0;
  for (const p of cat.prodi) {
    const values = { kampusId: kampusId.get(p.npsn)!, kodeProdi: p.kodeProdi, jenjang: p.jenjang, nama: p.nama, bidang: p.bidang };
    const key = prodiKey(values);
    seenKeys.add(key);
    const prev = prodiByKey.get(key);
    if (!prev) {
      prodiInserted++;
      prodiUpserts.push({ ...values, slug: freeSlug(p.slug, prodiSlugs) });
    } else if (prev.bidang !== values.bidang) {
      prodiUpserts.push({ ...values, slug: prev.slug });
    }
  }
  for (const batch of chunk(prodiUpserts)) {
    await tx
      .insert(prodi)
      .values(batch)
      .onConflictDoUpdate({
        target: [prodi.kampusId, prodi.kodeProdi, prodi.jenjang, prodi.nama],
        set: { bidang: sql`excluded.bidang`, updatedAt: sql`now()` },
      });
  }
  stats.prodi = {
    inserted: prodiInserted,
    updated: prodiUpserts.length - prodiInserted,
    unchanged: cat.prodi.length - prodiUpserts.length,
  };

  // Rows from earlier imports that the export no longer lists are kept (Ulasan may point at them).
  const exportNpsn = new Set(cat.kampus.map((k) => k.npsn));
  const staleKampus = kampusDb.filter((k) => !exportNpsn.has(k.npsn)).length;
  const staleProdi = prodiDb.filter((p) => !seenKeys.has(prodiKey(p))).length;

  // Daftar Kampus Unggulan: the CSV is the whole list.
  let unggulanChange = "skipped";
  if (unggulan) {
    const list = [...unggulan.npsns];
    const on = list.length
      ? await tx
          .update(kampus)
          .set({ unggulan: true })
          .where(and(inArray(kampus.npsn, list), eq(kampus.unggulan, false)))
          .returning({ id: kampus.id })
      : [];
    const off = await tx
      .update(kampus)
      .set({ unggulan: false })
      .where(list.length ? and(eq(kampus.unggulan, true), not(inArray(kampus.npsn, list))) : eq(kampus.unggulan, true))
      .returning({ id: kampus.id });
    unggulanChange = `${on.length} added, ${off.length} removed, ${list.length} in list`;
  }

  // Unggulan provenance: from the CSV, or carried over from the previous import
  // when the CSV is absent (the flags were left untouched above).
  const [previous] = unggulan
    ? []
    : await tx
        .select({ sumber: imporKatalog.unggulanSumber, tanggalAmbil: imporKatalog.unggulanTanggalAmbil })
        .from(imporKatalog)
        .orderBy(desc(imporKatalog.id))
        .limit(1);

  await tx.insert(imporKatalog).values({
    tanggalData: asOf,
    sumber: unggulan ? [...cat.sources, unggulan.source] : cat.sources,
    jumlahKota: cat.kota.length,
    jumlahKampus: cat.kampus.length,
    jumlahProdi: cat.prodi.length,
    unggulanSumber: unggulan ? unggulan.sumber : (previous?.sumber ?? null),
    unggulanTanggalAmbil: unggulan ? unggulan.tanggalAmbil : (previous?.tanggalAmbil ?? null),
  });

  return { stats, staleKampus, staleProdi, unggulanChange };
}

async function main() {
  const asOf = parseAsOf();
  if (!dryRun && !asOf) {
    console.error("--as-of YYYY-MM-DD is required (the date the exports were downloaded).");
    process.exit(1);
  }

  const cat = loadExports();
  printPlan(cat);
  const unggulan = checkUnggulan(cat);
  cat.report.print();

  if (dryRun) {
    console.log("\nDry run: nothing was written.");
    return;
  }

  guardDatabase(args);
  const started = Date.now();
  const result = await withDb((db) => db.transaction((tx) => importAll(tx, cat, unggulan, asOf!)));

  console.log("\nImported (as of " + asOf + ")");
  for (const [table, s] of Object.entries(result.stats))
    console.log(`  ${table.padEnd(7)} inserted ${s.inserted}, updated ${s.updated}, unchanged ${s.unchanged}`);
  console.log(`  unggulan ${result.unggulanChange}`);
  console.log(`  in the database but not in this export (kept): kampus ${result.staleKampus}, prodi ${result.staleProdi}`);
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
