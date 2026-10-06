import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { expect, test } from "vitest";

// ADR 0009: Promosi shows only on the home page, Jurusan pages and search
// (plus the Moderator preview). Never on Tes Minat results, the
// Perbandingan, Ulasan, Prodi or Kampus pages, or account pages.
const BOLEH = ["page.tsx", "jurusan/[slug]/page.tsx", "cari/page.tsx", "moderasi/promosi/[id]/page.tsx"];

function berkas(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? berkas(p) : /\.(tsx?|jsx?)$/.test(n) ? [p] : [];
  });
}

test("KotakPromosi is used only where Promosi may appear", () => {
  const app = join(process.cwd(), "src", "app");
  const pemakai = berkas(app)
    .filter((f) => !f.endsWith(".test.ts") && readFileSync(f, "utf8").includes("components/promosi/kotak-promosi"))
    .map((f) => relative(app, f).split(sep).join("/"))
    .sort();
  expect(pemakai).toEqual([...BOLEH].sort());
});
