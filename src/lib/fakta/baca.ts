import { z } from "zod";
import { batasBiaya, jenisBiaya, jenjang, kategoriJalur, periodeBiaya, tesJalur } from "@/db/schema/enums";
import { parseTahunAkademik } from "./tahun-akademik";

// Reads one Sumber folder (data/fakta/<kode>/, see data/fakta/README.md) into
// typed facts. Pure: the CLI reads the files, and matching Prodi and Jalur
// Masuk against the database happens in impor.ts. Messages are for the
// Moderator running the import, so they name the file and row.

export type Jenjang = (typeof jenjang.enumValues)[number];
export type JenisBiaya = (typeof jenisBiaya.enumValues)[number];
export type BatasBiaya = (typeof batasBiaya.enumValues)[number];
export type PeriodeBiaya = (typeof periodeBiaya.enumValues)[number];
export type KategoriJalur = (typeof kategoriJalur.enumValues)[number];
export type TesJalur = (typeof tesJalur.enumValues)[number];

export type Baris = Record<string, string>;

export type MetaSumber = {
  // NULL for a national source (only national Beasiswa).
  npsn: string | null;
  url: string;
  judul: string;
  penerbit: string;
  diaksesPada: string;
  arsipUrl: string | null;
};

// `baris` is the line in the CSV (the header is line 1).
export type JalurBaru = {
  baris: number;
  tahunAkademik: number;
  nama: string;
  kategori: KategoriJalur;
  tes: TesJalur[];
  pendaftaranBuka: string | null;
  pendaftaranTutup: string | null;
};

export type ProdiDiminta = { nama: string; jenjang: Jenjang | null; slug: string | null };

export type BiayaBaru = {
  baris: number;
  tahunAkademik: number;
  jenis: JenisBiaya;
  // NULL: the Kampus publishes this amount for the whole Kampus.
  prodi: ProdiDiminta | null;
  jalur: string | null;
  label: string | null;
  jumlah: number;
  batas: BatasBiaya | null;
  periode: PeriodeBiaya;
};

export type BeasiswaBaru = {
  baris: number;
  tahunAkademik: number;
  nama: string;
  // True: this Kampus takes part in the national Beasiswa called `nama`.
  ikutNasional: boolean;
  penyelenggara: string;
  sasaran: string;
  cakupan: string;
  url: string | null;
};

export type PaketSumber = {
  kode: string;
  meta: MetaSumber;
  jalur: JalurBaru[];
  biaya: BiayaBaru[];
  beasiswa: BeasiswaBaru[];
};

export const KOLOM = {
  jalur: ["tahun_akademik", "nama", "kategori", "tes", "pendaftaran_buka", "pendaftaran_tutup"],
  biaya: ["tahun_akademik", "jenis", "prodi", "jenjang", "prodi_slug", "jalur", "label", "jumlah", "batas", "periode"],
  beasiswa: ["tahun_akademik", "nama", "ikut_skema_nasional", "penyelenggara", "sasaran", "cakupan", "url"],
} as const;

export const KODE_SUMBER = /^[a-z0-9][a-z0-9-]*$/;

const http = z.url({ protocol: /^https?$/, error: "must be an http(s) URL" });

const skemaMeta = z.strictObject({
  npsn: z.string().trim().min(1).nullable().default(null),
  url: http,
  judul: z.string().trim().min(1),
  penerbit: z.string().trim().min(1),
  diakses_pada: z.iso.date(),
  arsip_url: z
    .string()
    .trim()
    .startsWith("https://web.archive.org/", "must be a Wayback Machine link (https://web.archive.org/...)")
    .nullable()
    .default(null),
});

const PERIODE_BAWAAN: Record<JenisBiaya, PeriodeBiaya | null> = {
  ukt: "per_semester",
  spp: "per_semester",
  uang_pangkal: "sekali",
  pendaftaran: "sekali",
  lain: null,
};

const teks = (r: Baris, kolom: string) => (r[kolom] ?? "").replace(/\s+/g, " ").trim();

// "Rp 7.500.000", "7.500.000" or "7500000" -> 7500000. Decimals and words are refused.
export function parseRupiah(value: string): number | null {
  const angka = value.trim().replace(/^rp\.?\s*/i, "").replace(/[.\s]/g, "");
  if (!/^\d+$/.test(angka)) return null;
  const n = Number(angka);
  return Number.isSafeInteger(n) ? n : null;
}

function tanggalSah(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function pilih<T extends string>(value: string, sah: readonly T[]): T | null {
  const v = value.toLowerCase() as T;
  return sah.includes(v) ? v : null;
}

export function bacaPaket(
  kode: string,
  meta: unknown,
  berkas: { jalur?: Baris[]; biaya?: Baris[]; beasiswa?: Baris[] },
): { paket: PaketSumber | null; galat: string[] } {
  const galat: string[] = [];
  if (!KODE_SUMBER.test(kode)) galat.push(`Folder name "${kode}" must be lowercase letters, digits and dashes.`);

  const m = skemaMeta.safeParse(meta);
  if (!m.success)
    for (const issue of m.error.issues) galat.push(`sumber.json ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  const metaSumber: MetaSumber | null = m.success
    ? {
        npsn: m.data.npsn,
        url: m.data.url,
        judul: m.data.judul,
        penerbit: m.data.penerbit,
        diaksesPada: m.data.diakses_pada,
        arsipUrl: m.data.arsip_url,
      }
    : null;

  const jalur = bacaJalur(berkas.jalur ?? [], galat);
  const biaya = bacaBiaya(berkas.biaya ?? [], galat);
  const beasiswa = bacaBeasiswa(berkas.beasiswa ?? [], galat);

  if (jalur.length + biaya.length + beasiswa.length === 0) galat.push("No facts: add jalur.csv, biaya.csv or beasiswa.csv.");
  if (metaSumber && metaSumber.npsn === null) {
    if (jalur.length || biaya.length) galat.push("A national Sumber (no npsn) can only hold beasiswa.csv.");
    for (const b of beasiswa)
      if (b.ikutNasional) galat.push(`beasiswa.csv row ${b.baris}: ikut_skema_nasional needs a Kampus Sumber (set npsn).`);
  }

  if (galat.length || !metaSumber) return { paket: null, galat };
  return { paket: { kode, meta: metaSumber, jalur, biaya, beasiswa }, galat };
}

function bacaTahun(r: Baris, catat: (pesan: string) => void): number | null {
  const ta = parseTahunAkademik(teks(r, "tahun_akademik"));
  if (ta === null) catat(`tahun_akademik "${teks(r, "tahun_akademik")}" must look like 2026/2027`);
  return ta;
}

function bacaJalur(rows: Baris[], galat: string[]): JalurBaru[] {
  const hasil: JalurBaru[] = [];
  const kunci = new Set<string>();
  rows.forEach((r, i) => {
    const baris = i + 2;
    const sebelum = galat.length;
    const catat = (pesan: string) => galat.push(`jalur.csv row ${baris}: ${pesan}`);

    const tahunAkademik = bacaTahun(r, catat);
    const nama = teks(r, "nama");
    if (!nama) catat("nama is empty");
    const kategori = pilih(teks(r, "kategori"), kategoriJalur.enumValues);
    if (!kategori) catat(`kategori must be one of ${kategoriJalur.enumValues.join(", ")}`);

    const tesMentah = teks(r, "tes").split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    const tes = [...new Set(tesMentah.map((t) => pilih(t, tesJalur.enumValues)))];
    if (tesMentah.length === 0) catat("tes is empty (separate several with ;)");
    if (tes.includes(null)) catat(`tes must be from ${tesJalur.enumValues.join(", ")}, separated by ;`);

    const tanggal = (kolom: string) => {
      const v = teks(r, kolom);
      if (v && !tanggalSah(v)) catat(`${kolom} "${v}" must be a date as YYYY-MM-DD`);
      return v || null;
    };
    const pendaftaranBuka = tanggal("pendaftaran_buka");
    const pendaftaranTutup = tanggal("pendaftaran_tutup");
    if (pendaftaranBuka && pendaftaranTutup && pendaftaranBuka > pendaftaranTutup)
      catat("pendaftaran_buka is after pendaftaran_tutup");

    const k = `${tahunAkademik}|${nama.toLowerCase()}`;
    if (kunci.has(k)) catat(`"${nama}" appears twice for the same tahun_akademik`);
    kunci.add(k);

    if (galat.length === sebelum)
      hasil.push({
        baris,
        tahunAkademik: tahunAkademik!,
        nama,
        kategori: kategori!,
        tes: tes as TesJalur[],
        pendaftaranBuka,
        pendaftaranTutup,
      });
  });
  return hasil;
}

function bacaBiaya(rows: Baris[], galat: string[]): BiayaBaru[] {
  const hasil: BiayaBaru[] = [];
  rows.forEach((r, i) => {
    const baris = i + 2;
    const sebelum = galat.length;
    const catat = (pesan: string) => galat.push(`biaya.csv row ${baris}: ${pesan}`);

    const tahunAkademik = bacaTahun(r, catat);
    const jenis = pilih(teks(r, "jenis"), jenisBiaya.enumValues);
    if (!jenis) catat(`jenis must be one of ${jenisBiaya.enumValues.join(", ")}`);

    const namaProdi = teks(r, "prodi");
    const slug = teks(r, "prodi_slug") || null;
    const jenjangTeks = teks(r, "jenjang").toUpperCase();
    const jenjangProdi = jenjang.enumValues.find((j) => j === jenjangTeks) ?? null;
    if (jenjangTeks && !jenjangProdi) catat(`jenjang must be one of ${jenjang.enumValues.join(", ")}`);
    let prodi: ProdiDiminta | null = null;
    if (namaProdi || slug) {
      if (!slug && !jenjangProdi) catat("jenjang is needed when prodi is set (or give prodi_slug)");
      prodi = { nama: namaProdi, jenjang: jenjangProdi, slug };
    }

    const jumlah = parseRupiah(teks(r, "jumlah"));
    if (jumlah === null) catat(`jumlah "${teks(r, "jumlah")}" must be whole rupiah, e.g. 7500000 or 7.500.000`);

    const batasTeks = teks(r, "batas");
    const batas = batasTeks ? pilih(batasTeks, batasBiaya.enumValues) : null;
    if (batasTeks && !batas) catat(`batas must be empty, ${batasBiaya.enumValues.join(" or ")}`);

    const periodeTeks = teks(r, "periode");
    let periode = periodeTeks ? pilih(periodeTeks, periodeBiaya.enumValues) : jenis ? PERIODE_BAWAAN[jenis] : null;
    if (periodeTeks && !periode) catat(`periode must be ${periodeBiaya.enumValues.join(" or ")}`);
    else if (!periode && jenis) catat(`periode is needed for jenis ${jenis}`);
    if (jenis && periode && PERIODE_BAWAAN[jenis] && PERIODE_BAWAAN[jenis] !== periode) {
      catat(`jenis ${jenis} is always ${PERIODE_BAWAAN[jenis]}`);
      periode = null;
    }

    if (galat.length === sebelum)
      hasil.push({
        baris,
        tahunAkademik: tahunAkademik!,
        jenis: jenis!,
        prodi,
        jalur: teks(r, "jalur") || null,
        label: teks(r, "label") || null,
        jumlah: jumlah!,
        batas,
        periode: periode!,
      });
  });
  return hasil;
}

function bacaBeasiswa(rows: Baris[], galat: string[]): BeasiswaBaru[] {
  const hasil: BeasiswaBaru[] = [];
  const kunci = new Set<string>();
  rows.forEach((r, i) => {
    const baris = i + 2;
    const sebelum = galat.length;
    const catat = (pesan: string) => galat.push(`beasiswa.csv row ${baris}: ${pesan}`);

    const tahunAkademik = bacaTahun(r, catat);
    const nama = teks(r, "nama");
    if (!nama) catat("nama is empty");
    const ikut = teks(r, "ikut_skema_nasional").toLowerCase();
    if (ikut && ikut !== "ya") catat('ikut_skema_nasional must be empty or "ya"');
    const ikutNasional = ikut === "ya";

    const penyelenggara = teks(r, "penyelenggara");
    const sasaran = teks(r, "sasaran");
    const cakupan = teks(r, "cakupan");
    const url = teks(r, "url") || null;
    if (!ikutNasional) {
      if (!penyelenggara) catat("penyelenggara is empty");
      if (!sasaran) catat("sasaran (who it is for) is empty");
      if (!cakupan) catat("cakupan (what it covers) is empty");
    }
    if (url && !http.safeParse(url).success) catat(`url "${url}" must be an http(s) URL`);

    const k = `${tahunAkademik}|${nama.toLowerCase()}`;
    if (kunci.has(k)) catat(`"${nama}" appears twice for the same tahun_akademik`);
    kunci.add(k);

    if (galat.length === sebelum)
      hasil.push({ baris, tahunAkademik: tahunAkademik!, nama, ikutNasional, penyelenggara, sasaran, cakupan, url });
  });
  return hasil;
}
