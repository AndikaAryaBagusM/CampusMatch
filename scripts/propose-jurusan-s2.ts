// Adds the S2 Kode Prodi (imported only for Kampus with a Peringkat QS, ADR 0013)
// to data/jurusan-mapping.csv, for review like every other row (decisions.md 4d).
// No Jurusan is created for S2 and no Prodi is renamed: an S2 Kode joins an
// existing Jurusan only when at least 70% of its Prodi are published under that
// Jurusan's name (ignoring "Magister", a leading "Ilmu" and "dan"). Otherwise
// `jurusan` is left blank: those Prodi stay unmapped and are found on their
// Kampus page and in search under the name their Kampus publishes.
// Kode already in the CSV are left as they are. Run it again after a new import.
//
//   npm run catalogue:propose-jurusan-s2 [-- --dry-run]
import { appendFileSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { clean, loadExports, MAPPING_FILE, readRows } from "./catalogue/exports";

const AGREEMENT_THRESHOLD = 0.7;
const KOLOM = ["kode_prodi", "jenjang", "bidang", "jumlah_prodi", "nama_teratas", "kesepakatan", "perlu_cek", "jurusan_usulan", "jurusan"];

// "Magister Ilmu Kesehatan Masyarakat" and "Kesehatan Masyarakat" compare equal.
function kunciNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(magister|program studi|prodi|s2|dan)\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^ilmu /, "");
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const baris = readRows(MAPPING_FILE, KOLOM);
  const adaKode = new Set(baris.map((r) => clean(r.kode_prodi)));
  const jurusanPerKunci = new Map<string, string>();
  for (const r of baris) {
    const nama = clean(r.jurusan);
    if (nama && !jurusanPerKunci.has(kunciNama(nama))) jurusanPerKunci.set(kunciNama(nama), nama);
  }

  const perKode = new Map<string, { nama: string[]; bidang: Map<string, number> }>();
  for (const p of loadExports().prodi) {
    if (p.jenjang !== "S2" || adaKode.has(p.kodeProdi)) continue;
    const g = perKode.get(p.kodeProdi) ?? { nama: [], bidang: new Map<string, number>() };
    g.nama.push(p.nama);
    if (p.bidang) g.bidang.set(p.bidang, (g.bidang.get(p.bidang) ?? 0) + 1);
    perKode.set(p.kodeProdi, g);
  }

  const urut = <K>(m: Map<K, number>) => [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
  const baru = [...perKode]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kode, g]) => {
      const cocok = new Map<string, number>();
      for (const n of g.nama) {
        const j = jurusanPerKunci.get(kunciNama(n));
        if (j) cocok.set(j, (cocok.get(j) ?? 0) + 1);
      }
      const [jurusan, jumlah] = urut(cocok)[0] ?? ["", 0];
      const kesepakatan = jumlah / g.nama.length;
      const dipetakan = kesepakatan >= AGREEMENT_THRESHOLD;
      const namaTeratas = urut(g.nama.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map<string, number>()));
      return {
        kode_prodi: kode,
        jenjang: "S2",
        bidang: urut(g.bidang).map(([b]) => b).join(";"),
        jumlah_prodi: g.nama.length,
        nama_teratas: namaTeratas.slice(0, 3).map(([n, k]) => `${n} (${k})`).join("; "),
        kesepakatan: `${Math.round(kesepakatan * 100)}%`,
        perlu_cek: dipetakan && kesepakatan < 1 ? "ya" : "",
        jurusan_usulan: dipetakan ? jurusan : "",
        jurusan: dipetakan ? jurusan : "",
      };
    });

  const dipetakan = baru.filter((r) => r.jurusan);
  const prodiDipetakan = dipetakan.reduce((s, r) => s + r.jumlah_prodi, 0);
  const prodiSemua = baru.reduce((s, r) => s + r.jumlah_prodi, 0);
  console.log(`${baru.length} new S2 Kode Prodi (${prodiSemua} Prodi)`);
  console.log(`  ${dipetakan.length} mapped to an existing Jurusan (${prodiDipetakan} Prodi), ${dipetakan.filter((r) => r.perlu_cek).length} of them perlu_cek`);
  console.log(`  ${baru.length - dipetakan.length} left blank (${prodiSemua - prodiDipetakan} Prodi, shown under their own names)`);
  if (dryRun || baru.length === 0) return;

  // Same CSV shape and line endings as the file the team edits.
  const eol = readFileSync(MAPPING_FILE, "utf8").includes("\r\n") ? "\r\n" : "\n";
  const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(baru, { header: KOLOM, skipHeader: true }));
  appendFileSync(MAPPING_FILE, csv.split("\n").filter(Boolean).map((l) => l + eol).join(""));
  console.log(`Appended to ${MAPPING_FILE}. Review the S2 rows, then run: npm run catalogue:load-jurusan -- --dry-run`);
}

main();
