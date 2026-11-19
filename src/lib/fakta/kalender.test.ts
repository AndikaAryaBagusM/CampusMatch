import { expect, test } from "vitest";
import { pengingatJalur, tautanKalender } from "./kalender";

test("an all-day event ends the day after, across a month end", () => {
  const url = new URL(tautanKalender({ judul: "Batas", tanggal: "2027-02-28", keterangan: "x" }));
  expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
  expect(url.searchParams.get("dates")).toBe("20270228/20270301");
  expect(url.searchParams.get("text")).toBe("Batas");
});

const jalur = (buka: string | null, tutup: string | null) => ({
  nama: "SIMAK",
  pendaftaranBuka: buka,
  pendaftaranTutup: tutup,
  sumber: { url: "https://contoh.ac.id/jadwal" },
});

test("the reminder is for the closing date, else the opening date, else none", () => {
  const tutup = new URL(pengingatJalur(jalur("2027-03-01", "2027-03-15"), "Universitas Uji")!);
  expect(tutup.searchParams.get("dates")).toBe("20270315/20270316");
  expect(tutup.searchParams.get("text")).toBe("Batas pendaftaran: SIMAK, Universitas Uji");
  expect(tutup.searchParams.get("details")).toContain("https://contoh.ac.id/jadwal");

  const buka = new URL(pengingatJalur(jalur("2027-03-01", null), "Universitas Uji")!);
  expect(buka.searchParams.get("dates")).toBe("20270301/20270302");
  expect(buka.searchParams.get("text")).toContain("Pendaftaran dibuka");

  expect(pengingatJalur(jalur(null, null), "Universitas Uji")).toBeNull();
});
