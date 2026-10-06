// Schema smoke test: valid inserts across every table, the constraints we rely
// on, and real interactive transactions. Creates its own rows and removes them.
// Run against a Neon dev branch only: `npm run db:smoke`.
import { config } from "dotenv";

config({ path: ".env.local" });

import { eq, inArray, like } from "drizzle-orm";
import { withDb, type Db } from "../src/db";
import {
  accounts,
  infoBiaya,
  jurusan,
  kampus,
  kodeProdiJurusan,
  kodeRiasec,
  kota,
  laporan,
  prodi,
  sessions,
  ulasan,
  ulasanRevisi,
  users,
  verificationTokens,
  verifikasiKampus,
} from "../src/db/schema";

if (process.env.DB_ENV !== "development") {
  console.error(
    "Refusing to run: DB_ENV must be 'development' (point .env.local at a Neon dev branch).",
  );
  process.exit(1);
}

const tag = `smoke-${Date.now()}`;
let failures = 0;

function pass(label: string) {
  console.log(`  ok   ${label}`);
}
function fail(label: string, detail: string) {
  failures++;
  console.error(`  FAIL ${label}: ${detail}`);
}

function pgCode(err: unknown): string | undefined {
  // Drizzle wraps driver errors; the Postgres error is on .cause.
  const e = err as { code?: string; cause?: { code?: string } };
  return e.cause?.code ?? e.code;
}

// 23505 unique, 23514 check, 23503 foreign key, 23001 restrict, 22P02 invalid enum input.
async function expectReject(label: string, code: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    fail(label, "was accepted");
  } catch (err) {
    const got = pgCode(err);
    if (got === code) pass(label);
    else fail(label, `expected SQLSTATE ${code}, got ${got ?? String(err)}`);
  }
}

const revisiValues = (ulasanId: string, nomor: number) => ({
  ulasanId,
  nomor,
  judul: `${tag} judul`,
  isi: "x".repeat(160),
  bintang: 4,
  aspekKurikulum: 4,
  aspekDosen: 4,
  aspekFasilitas: 3,
  aspekSuasanaBelajar: 5,
  aspekOrganisasi: 3,
  aspekBiayaKualitas: 4,
  rekomendasi: true,
});

async function run(db: Db) {
  console.log("Valid inserts");
  const [k] = await db
    .insert(kota)
    .values({ nama: "Kab. Smoke", provinsi: `Prov. ${tag}`, slug: `${tag}-kota` })
    .returning();
  const [kp] = await db
    .insert(kampus)
    .values({
      npsn: tag.slice(-10),
      nama: `Universitas ${tag}`,
      slug: `${tag}-kampus`,
      bentuk: "Universitas",
      kotaId: k.id,
      akreditasi: "Unggul",
    })
    .returning();
  const [j] = await db
    .insert(jurusan)
    .values({ nama: `Jurusan ${tag}`, slug: `${tag}-jurusan` })
    .returning();
  await db.insert(kodeRiasec).values([
    { jurusanId: j.id, urutan: 1, tipe: "I" },
    { jurusanId: j.id, urutan: 2, tipe: "R" },
  ]);
  const kode = tag.slice(-10);
  await db.insert(kodeProdiJurusan).values({ kodeProdi: kode, jurusanId: j.id });
  const [p] = await db
    .insert(prodi)
    .values({
      kampusId: kp.id,
      kodeProdi: kode,
      nama: "Informatika",
      jenjang: "S1",
      slug: `${tag}-prodi`,
    })
    .returning();
  const [u1, u2] = await db
    .insert(users)
    .values([{ email: `${tag}-1@example.test` }, { email: `${tag}-2@example.test` }])
    .returning();
  await db.insert(accounts).values({
    userId: u1.id,
    type: "oauth",
    provider: "google",
    providerAccountId: tag,
  });
  await db.insert(sessions).values({
    sessionToken: tag,
    userId: u1.id,
    expires: new Date(Date.now() + 3600_000),
  });
  await db.insert(verificationTokens).values({
    identifier: `${tag}@example.test`,
    token: tag,
    expires: new Date(Date.now() + 3600_000),
  });
  await db.insert(verifikasiKampus).values({
    userId: u1.id,
    kampusId: kp.id,
    domain: `${tag}.ac.id`,
    verifiedAt: new Date(),
  });
  pass("kota, kampus, jurusan, kode_riasec, kode_prodi_jurusan, prodi, users, accounts, sessions, verification_tokens, verifikasi_kampus");

  console.log("Ulasan insert order (one transaction)");
  const { ulasanA, revisiA } = await db.transaction(async (tx) => {
    const [a] = await tx
      .insert(ulasan)
      .values({ pengulasId: u1.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2019 })
      .returning();
    const [r] = await tx.insert(ulasanRevisi).values(revisiValues(a.id, 1)).returning();
    await tx
      .update(ulasanRevisi)
      .set({ status: "terbit", tingkatRisiko: "rendah" })
      .where(eq(ulasanRevisi.id, r.id));
    await tx.update(ulasan).set({ revisiTerbitId: r.id }).where(eq(ulasan.id, a.id));
    return { ulasanA: a, revisiA: r };
  });
  pass("ulasan (NULL pointer) -> ulasan_revisi -> UPDATE revisi_terbit_id");

  const [ulasanB] = await db
    .insert(ulasan)
    .values({ pengulasId: u2.id, prodiId: p.id, statusPengulas: "mahasiswa_aktif", tahunMasuk: 2023 })
    .returning();
  const [revisiB] = await db.insert(ulasanRevisi).values(revisiValues(ulasanB.id, 1)).returning();
  await db.insert(laporan).values({
    ulasanId: ulasanA.id,
    revisiId: revisiA.id,
    alasan: "hinaan",
    ipHash: "0".repeat(64),
  });
  pass("second ulasan + revisi, laporan");

  await db.insert(infoBiaya).values({
    userId: u1.id,
    prodiId: p.id,
    statusPengulas: "alumni",
    tahunMasuk: 2023,
    kategoriJalur: "snbt",
    tes: ["utbk"],
    biayaSemester: 5_000_000,
    disetujuiAt: new Date(),
  });
  pass("info_biaya");

  console.log("Transaction rollback");
  const rollbackNpsn = `rb${tag.slice(-8)}`;
  try {
    await db.transaction(async (tx) => {
      await tx.insert(kampus).values({
        npsn: rollbackNpsn,
        nama: "rollback",
        slug: `${tag}-rollback`,
        bentuk: "Institut",
        kotaId: k.id,
      });
      throw new Error("deliberate");
    });
  } catch {
    // expected
  }
  const left = await db.select().from(kampus).where(eq(kampus.npsn, rollbackNpsn));
  if (left.length === 0) pass("throw inside db.transaction leaves no rows");
  else fail("transaction rollback", "row survived");

  console.log("Constraints that must reject");
  await expectReject("pointer to another Ulasan's revision", "23503", () =>
    db.update(ulasan).set({ revisiTerbitId: revisiB.id }).where(eq(ulasan.id, ulasanA.id)),
  );
  await expectReject("second live Ulasan for same Pengulas + Prodi", "23505", () =>
    db.insert(ulasan).values({ pengulasId: u1.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2019 }),
  );
  await expectReject("jenjang S2", "22P02", () =>
    db.insert(prodi).values({
      kampusId: kp.id,
      kodeProdi: kode,
      nama: "Magister",
      jenjang: "S2" as "S1", // deliberately invalid Jenjang
      slug: `${tag}-s2`,
    }),
  );
  await expectReject("akreditasi 'Sangat Baik'", "23514", () =>
    db.update(kampus).set({ akreditasi: "Sangat Baik" }).where(eq(kampus.id, kp.id)),
  );
  await expectReject("bintang 6", "23514", () =>
    db.insert(ulasanRevisi).values({ ...revisiValues(ulasanA.id, 2), bintang: 6 }),
  );
  await expectReject("duplicate npsn", "23505", () =>
    db.insert(kampus).values({
      npsn: kp.npsn,
      nama: "dup",
      slug: `${tag}-dup`,
      bentuk: "Akademi",
      kotaId: k.id,
    }),
  );
  await expectReject("duplicate RIASEC type in one Jurusan", "23505", () =>
    db.insert(kodeRiasec).values({ jurusanId: j.id, urutan: 3, tipe: "I" }),
  );
  await expectReject("second Info Biaya for same Pengulas + Prodi", "23505", () =>
    db.insert(infoBiaya).values({ userId: u1.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2023, beasiswa: "lain", disetujuiAt: new Date() }),
  );
  await expectReject("Info Biaya with no answer", "23514", () =>
    db.insert(infoBiaya).values({ userId: u2.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2023, disetujuiAt: new Date() }),
  );
  await expectReject("UKT above Rp50 juta", "23514", () =>
    db.insert(infoBiaya).values({ userId: u2.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2023, biayaSemester: 60_000_000, disetujuiAt: new Date() }),
  );
  // ON DELETE RESTRICT raises restrict_violation (23001), not foreign_key_violation.
  await expectReject("delete a Kampus that still has Prodi", "23001", () =>
    db.delete(kampus).where(eq(kampus.id, kp.id)),
  );

  console.log("Soft delete and cascade");
  await db.update(ulasan).set({ dihapusAt: new Date() }).where(eq(ulasan.id, ulasanB.id));
  const [ulasanC] = await db
    .insert(ulasan)
    .values({ pengulasId: u2.id, prodiId: p.id, statusPengulas: "alumni", tahunMasuk: 2023 })
    .returning();
  pass("new Ulasan allowed after soft delete");

  await db.delete(ulasan).where(inArray(ulasan.id, [ulasanA.id, ulasanB.id, ulasanC.id]));
  const revLeft = await db.select().from(ulasanRevisi).where(inArray(ulasanRevisi.ulasanId, [ulasanA.id, ulasanB.id]));
  const lapLeft = await db.select().from(laporan).where(eq(laporan.ulasanId, ulasanA.id));
  if (revLeft.length === 0 && lapLeft.length === 0)
    pass("hard delete of Ulasan cascades to revisions and Laporan");
  else fail("cascade", `${revLeft.length} revisions, ${lapLeft.length} laporan left`);
}

async function cleanup(db: Db) {
  // Children before parents; cascades remove accounts, sessions, verifikasi, info_biaya, kode_riasec.
  const ours = (
    await db.select({ id: users.id }).from(users).where(like(users.email, `${tag}-%`))
  ).map((u) => u.id);
  if (ours.length) await db.delete(ulasan).where(inArray(ulasan.pengulasId, ours));
  await db.delete(prodi).where(eq(prodi.slug, `${tag}-prodi`));
  await db.delete(kodeProdiJurusan).where(eq(kodeProdiJurusan.kodeProdi, tag.slice(-10)));
  await db.delete(kampus).where(eq(kampus.slug, `${tag}-kampus`));
  await db.delete(jurusan).where(eq(jurusan.slug, `${tag}-jurusan`));
  await db.delete(kota).where(eq(kota.slug, `${tag}-kota`));
  if (ours.length) await db.delete(users).where(inArray(users.id, ours));
  await db.delete(verificationTokens).where(eq(verificationTokens.token, tag));
}

async function main() {
  await withDb(async (db) => {
    try {
      await run(db);
    } catch (err) {
      failures++;
      console.error("Unexpected error:", err);
    } finally {
      await cleanup(db);
      console.log("Cleaned up test rows");
    }
  });

  if (failures) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
  }
  console.log("\nAll schema checks passed");
}

main();
