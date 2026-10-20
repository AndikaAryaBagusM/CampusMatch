import type { PaketSumber } from "./baca";

const kunci = (npsn: string | null, tahunAkademik: number, nama: string) =>
  `${npsn ?? "nasional"}|${tahunAkademik}|${nama.toLowerCase()}`;

// Import order for many Sumber folders: a folder comes after the folders that
// define the Jalur Masuk its Biaya point at, and after the national Sumber
// whose Beasiswa it takes part in. Otherwise national Sumber first, then by
// kode. References to names no folder defines are left for the import to
// check (they may already be in the database).
export function urutkanPaket(paket: PaketSumber[]): PaketSumber[] {
  const pemilik = new Map<string, string>();
  for (const p of paket) {
    for (const j of p.jalur) pemilik.set(kunci(p.meta.npsn, j.tahunAkademik, j.nama), p.kode);
    if (!p.meta.npsn) for (const b of p.beasiswa) pemilik.set(kunci(null, b.tahunAkademik, b.nama), p.kode);
  }

  const butuh = new Map<string, Set<string>>();
  for (const p of paket) {
    const kunciDipakai = [
      ...p.biaya.filter((b) => b.jalur).map((b) => kunci(p.meta.npsn, b.tahunAkademik, b.jalur!)),
      ...p.beasiswa.filter((b) => b.ikutNasional).map((b) => kunci(null, b.tahunAkademik, b.nama)),
    ];
    const set = new Set<string>();
    for (const k of kunciDipakai) {
      const kode = pemilik.get(k);
      if (kode && kode !== p.kode) set.add(kode);
    }
    butuh.set(p.kode, set);
  }

  const urutanAwal = (a: PaketSumber, b: PaketSumber) =>
    Number(!!a.meta.npsn) - Number(!!b.meta.npsn) || a.kode.localeCompare(b.kode);
  const sisa = [...paket].sort(urutanAwal);
  const hasil: PaketSumber[] = [];
  const selesai = new Set<string>();
  while (sisa.length) {
    const i = sisa.findIndex((p) => [...butuh.get(p.kode)!].every((k) => selesai.has(k)));
    if (i < 0) throw new Error(`These Sumber point at each other's Jalur Masuk: ${sisa.map((p) => p.kode).join(", ")}`);
    const [p] = sisa.splice(i, 1);
    hasil.push(p);
    selesai.add(p.kode);
  }
  return hasil;
}
