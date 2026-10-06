import { and, eq, isNull, ne, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { beasiswa, beasiswaKampus, biaya, jalurMasuk, kampus, prodi, sumber } from "@/db/schema";
import type { PaketSumber } from "./baca";
import { cocokkanProdi } from "./cocok-prodi";
import { drafSumber } from "./kolom";
import { formatTahunAkademik } from "./tahun-akademik";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Writes one Sumber and its facts as Draf (ADR 0006). Ditarik facts are
// ignored when checking for duplicates and resolving names. Everything is checked
// before anything is written, and it all runs in one transaction. Importing
// the same kode again replaces its Draf facts, so the Moderator can fix the
// CSV and re-run; once any of its facts is Diperiksa, re-importing is refused.

export class FaktaDitolak extends Error {
  constructor(readonly galat: string[]) {
    super(galat.join("\n"));
    this.name = "FaktaDitolak";
  }
}

export type HasilImpor = {
  sumberId: number;
  baru: boolean;
  // Why the checker sent the previous import back, if they did.
  catatanSebelumnya: string | null;
  jumlah: { jalur: number; biaya: number; beasiswa: number; beasiswaKampus: number };
};

// Fact counts of a Sumber per Status Fakta, over every fact table.
export async function hitungStatusFakta(tx: Tx | Db, sumberId: number) {
  const { rows } = await tx.execute<{ status: "draf" | "diperiksa" | "ditarik"; n: number }>(sql`
    SELECT status, count(*)::int AS n FROM (
      SELECT status FROM jalur_masuk WHERE sumber_id = ${sumberId}
      UNION ALL SELECT status FROM biaya WHERE sumber_id = ${sumberId}
      UNION ALL SELECT status FROM beasiswa WHERE sumber_id = ${sumberId}
      UNION ALL SELECT status FROM beasiswa_kampus WHERE sumber_id = ${sumberId}
    ) f GROUP BY status`);
  const hasil = { draf: 0, diperiksa: 0, ditarik: 0 };
  for (const r of rows) hasil[r.status] = Number(r.n);
  return hasil;
}

// Deletes a Sumber's Draf facts (never Diperiksa ones). Refused while facts of
// another Sumber point at them: a Biaya at one of its Jalur Masuk, or a Kampus
// taking part in one of its national Beasiswa.
export async function hapusDraf(tx: Tx, sumberId: number) {
  const { rows } = await tx.execute<{ kode: string }>(sql`
    SELECT s.kode FROM biaya b JOIN sumber s ON s.id = b.sumber_id
      WHERE b.sumber_id <> ${sumberId}
        AND b.jalur_masuk_id IN (SELECT id FROM jalur_masuk WHERE sumber_id = ${sumberId} AND status = 'draf')
    UNION
    SELECT s.kode FROM beasiswa_kampus bk JOIN sumber s ON s.id = bk.sumber_id
      WHERE bk.sumber_id <> ${sumberId}
        AND bk.beasiswa_id IN (SELECT id FROM beasiswa WHERE sumber_id = ${sumberId} AND status = 'draf')`);
  if (rows.length)
    throw new FaktaDitolak([
      `Facts of other Sumber point at this Sumber's Draf Jalur Masuk or Beasiswa: ${rows.map((r) => r.kode).join(", ")}. Remove those first.`,
    ]);
  await tx.delete(biaya).where(drafSumber(biaya, sumberId));
  await tx.delete(beasiswaKampus).where(drafSumber(beasiswaKampus, sumberId));
  await tx.delete(beasiswa).where(drafSumber(beasiswa, sumberId));
  await tx.delete(jalurMasuk).where(drafSumber(jalurMasuk, sumberId));
}

const kunci = (tahunAkademik: number, nama: string) => `${tahunAkademik}|${nama.toLowerCase()}`;

export async function imporSumber(db: Db, paket: PaketSumber, moderatorId: string): Promise<HasilImpor> {
  const { kode, meta } = paket;
  return db.transaction(async (tx) => {
    const galat: string[] = [];

    // --- Kampus and the existing Sumber -------------------------------------
    let kampusId: number | null = null;
    if (meta.npsn) {
      const [k] = await tx.select({ id: kampus.id }).from(kampus).where(eq(kampus.npsn, meta.npsn));
      if (!k) throw new FaktaDitolak([`sumber.json npsn: no Kampus with NPSN ${meta.npsn}`]);
      kampusId = k.id;
    }
    const [lama] = await tx.select().from(sumber).where(eq(sumber.kode, kode)).for("update");
    if (lama) {
      if (lama.kampusId !== kampusId) throw new FaktaDitolak([`Sumber "${kode}" already exists for another Kampus.`]);
      const status = await hitungStatusFakta(tx, lama.id);
      // Shown or withdrawn facts are history: a correction is a new Sumber.
      if (status.diperiksa + status.ditarik > 0)
        throw new FaktaDitolak([
          `Sumber "${kode}" already has ${status.diperiksa + status.ditarik} Diperiksa or Ditarik fact(s) and can't be re-imported. Record changes as a new Sumber.`,
        ]);
    }
    const bukanIni = lama ? ne(sumber.id, lama.id) : undefined;

    // --- Jalur Masuk: new ones, plus those of other Sumber Biaya may point at ---
    const jalurLain = kampusId
      ? await tx
          .select({ id: jalurMasuk.id, nama: jalurMasuk.nama, tahunAkademik: jalurMasuk.tahunAkademik, kode: sumber.kode })
          .from(jalurMasuk)
          .innerJoin(sumber, eq(jalurMasuk.sumberId, sumber.id))
          .where(and(eq(jalurMasuk.kampusId, kampusId), ne(jalurMasuk.status, "ditarik"), bukanIni))
      : [];
    const jalurLainPerKunci = new Map(jalurLain.map((j) => [kunci(j.tahunAkademik, j.nama), j]));
    for (const j of paket.jalur) {
      const ada = jalurLainPerKunci.get(kunci(j.tahunAkademik, j.nama));
      if (ada)
        galat.push(`jalur.csv row ${j.baris}: "${j.nama}" ${formatTahunAkademik(j.tahunAkademik)} is already recorded by Sumber "${ada.kode}"`);
    }
    const jalurPaket = new Set(paket.jalur.map((j) => kunci(j.tahunAkademik, j.nama)));

    // --- Biaya: match Prodi and Jalur Masuk ----------------------------------
    const daftarProdi =
      kampusId && paket.biaya.some((b) => b.prodi)
        ? await tx.select({ id: prodi.id, nama: prodi.nama, jenjang: prodi.jenjang, slug: prodi.slug }).from(prodi).where(eq(prodi.kampusId, kampusId))
        : [];
    const prodiId = new Map<number, number>();
    for (const b of paket.biaya) {
      if (b.prodi) {
        const hasil = cocokkanProdi(b.prodi, daftarProdi);
        if (hasil.ok) prodiId.set(b.baris, hasil.prodi.id);
        else galat.push(`biaya.csv row ${b.baris}: ${hasil.pesan}`);
      }
      if (b.jalur) {
        const k = kunci(b.tahunAkademik, b.jalur);
        if (!jalurPaket.has(k) && !jalurLainPerKunci.has(k))
          galat.push(
            `biaya.csv row ${b.baris}: no Jalur Masuk "${b.jalur}" for ${formatTahunAkademik(b.tahunAkademik)} in jalur.csv or in an earlier Sumber of this Kampus`,
          );
      }
    }

    // --- Beasiswa: duplicates, and the national schemes Kampus take part in ---
    const beasiswaLain = await tx
      .select({ id: beasiswa.id, nama: beasiswa.nama, tahunAkademik: beasiswa.tahunAkademik, kode: sumber.kode })
      .from(beasiswa)
      .innerJoin(sumber, eq(beasiswa.sumberId, sumber.id))
      .where(and(kampusId ? eq(beasiswa.kampusId, kampusId) : isNull(beasiswa.kampusId), ne(beasiswa.status, "ditarik"), bukanIni));
    const beasiswaLainPerKunci = new Map(beasiswaLain.map((b) => [kunci(b.tahunAkademik, b.nama), b]));
    const nasional = paket.beasiswa.some((b) => b.ikutNasional)
      ? await tx
          .select({ id: beasiswa.id, nama: beasiswa.nama, tahunAkademik: beasiswa.tahunAkademik })
          .from(beasiswa)
          .where(and(isNull(beasiswa.kampusId), ne(beasiswa.status, "ditarik")))
      : [];
    const nasionalPerKunci = new Map(nasional.map((b) => [kunci(b.tahunAkademik, b.nama), b.id]));
    const ikutLain = kampusId
      ? await tx
          .select({ beasiswaId: beasiswaKampus.beasiswaId, tahunAkademik: beasiswaKampus.tahunAkademik, kode: sumber.kode })
          .from(beasiswaKampus)
          .innerJoin(sumber, eq(beasiswaKampus.sumberId, sumber.id))
          .where(and(eq(beasiswaKampus.kampusId, kampusId), ne(beasiswaKampus.status, "ditarik"), bukanIni))
      : [];
    const nasionalId = new Map<number, number>();
    for (const b of paket.beasiswa) {
      const k = kunci(b.tahunAkademik, b.nama);
      if (b.ikutNasional) {
        const id = nasionalPerKunci.get(k);
        const ta = formatTahunAkademik(b.tahunAkademik);
        if (!id) galat.push(`beasiswa.csv row ${b.baris}: no national Beasiswa "${b.nama}" for ${ta}; import its national Sumber first`);
        else {
          const ada = ikutLain.find((x) => x.beasiswaId === id && x.tahunAkademik === b.tahunAkademik);
          if (ada) galat.push(`beasiswa.csv row ${b.baris}: taking part in "${b.nama}" ${ta} is already recorded by Sumber "${ada.kode}"`);
          else nasionalId.set(b.baris, id);
        }
      } else {
        const ada = beasiswaLainPerKunci.get(k);
        if (ada)
          galat.push(`beasiswa.csv row ${b.baris}: "${b.nama}" ${formatTahunAkademik(b.tahunAkademik)} is already recorded by Sumber "${ada.kode}"`);
      }
    }

    if (galat.length) throw new FaktaDitolak(galat);

    // --- Write --------------------------------------------------------------
    const nilaiSumber = {
      kampusId,
      url: meta.url,
      judul: meta.judul,
      penerbit: meta.penerbit,
      diaksesPada: meta.diaksesPada,
      arsipUrl: meta.arsipUrl,
      alasanTanpaArsip: null,
      catatanPemeriksa: null,
      dimasukkanOleh: moderatorId,
    };
    let sumberId: number;
    if (lama) {
      await hapusDraf(tx, lama.id);
      await tx.update(sumber).set(nilaiSumber).where(eq(sumber.id, lama.id));
      sumberId = lama.id;
    } else {
      [{ id: sumberId }] = await tx.insert(sumber).values({ kode, ...nilaiSumber }).returning({ id: sumber.id });
    }
    const fakta = { sumberId, dimasukkanOleh: moderatorId };

    const jalurId = new Map(jalurLain.map((j) => [kunci(j.tahunAkademik, j.nama), j.id]));
    if (paket.jalur.length) {
      const baru = await tx
        .insert(jalurMasuk)
        .values(
          paket.jalur.map((j) => ({
            kampusId: kampusId!,
            tahunAkademik: j.tahunAkademik,
            nama: j.nama,
            kategori: j.kategori,
            tes: j.tes,
            pendaftaranBuka: j.pendaftaranBuka,
            pendaftaranTutup: j.pendaftaranTutup,
            ...fakta,
          })),
        )
        .returning({ id: jalurMasuk.id, nama: jalurMasuk.nama, tahunAkademik: jalurMasuk.tahunAkademik });
      for (const j of baru) jalurId.set(kunci(j.tahunAkademik, j.nama), j.id);
    }

    if (paket.biaya.length)
      await tx.insert(biaya).values(
        paket.biaya.map((b) => ({
          kampusId: kampusId!,
          prodiId: prodiId.get(b.baris) ?? null,
          jenis: b.jenis,
          jalurMasukId: b.jalur ? jalurId.get(kunci(b.tahunAkademik, b.jalur))! : null,
          label: b.label,
          jumlah: b.jumlah,
          batas: b.batas,
          periode: b.periode,
          tahunAkademik: b.tahunAkademik,
          ...fakta,
        })),
      );

    const milikSendiri = paket.beasiswa.filter((b) => !b.ikutNasional);
    if (milikSendiri.length)
      await tx.insert(beasiswa).values(
        milikSendiri.map((b) => ({
          kampusId,
          nama: b.nama,
          penyelenggara: b.penyelenggara,
          sasaran: b.sasaran,
          cakupan: b.cakupan,
          url: b.url,
          tahunAkademik: b.tahunAkademik,
          ...fakta,
        })),
      );
    const ikut = paket.beasiswa.filter((b) => b.ikutNasional);
    if (ikut.length)
      await tx.insert(beasiswaKampus).values(
        ikut.map((b) => ({ beasiswaId: nasionalId.get(b.baris)!, kampusId: kampusId!, tahunAkademik: b.tahunAkademik, ...fakta })),
      );

    return {
      sumberId,
      baru: !lama,
      catatanSebelumnya: lama?.catatanPemeriksa ?? null,
      jumlah: { jalur: paket.jalur.length, biaya: paket.biaya.length, beasiswa: milikSendiri.length, beasiswaKampus: ikut.length },
    };
  });
}
