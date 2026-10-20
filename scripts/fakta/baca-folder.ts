import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { bacaPaket, KOLOM, type Baris, type PaketSumber } from "../../src/lib/fakta/baca";
import { readRows } from "../catalogue/exports";

// Reads one Sumber folder (data/fakta/README.md). Returns the parsed paket, or
// the errors that stop it from being imported.
export function bacaFolder(folder: string): { kode: string; paket: PaketSumber | null; galat: string[] } {
  const kode = basename(folder);
  if (!existsSync(folder) || !statSync(folder).isDirectory()) return { kode, paket: null, galat: [`${folder} is not a folder.`] };
  if (kode.startsWith("_"))
    return { kode, paket: null, galat: [`${kode} is an example folder (starts with _); copy it to a new name first.`] };

  const metaPath = join(folder, "sumber.json");
  if (!existsSync(metaPath)) return { kode, paket: null, galat: [`${metaPath} not found.`] };
  let meta: unknown;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  } catch (e) {
    return { kode, paket: null, galat: [`${metaPath} is not valid JSON: ${(e as Error).message}`] };
  }
  const csv = (nama: keyof typeof KOLOM): Baris[] | undefined => {
    const path = join(folder, `${nama}.csv`);
    return existsSync(path) ? readRows(path, [...KOLOM[nama]]) : undefined;
  };
  const { paket, galat } = bacaPaket(kode, meta, { jalur: csv("jalur"), biaya: csv("biaya"), beasiswa: csv("beasiswa") });
  return { kode, paket, galat };
}
