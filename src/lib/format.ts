// Indonesian formatting for dates and numbers.

const tanggal = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const angka = new Intl.NumberFormat("id-ID");

// "2026-10-02" (a Postgres date) -> "2 Oktober 2026".
export function formatTanggal(isoDate: string): string {
  return tanggal.format(new Date(`${isoDate}T00:00:00Z`));
}

// "Prov. D.I. Yogyakarta" (as in the exports) -> "D.I. Yogyakarta".
export function formatProvinsi(provinsi: string): string {
  return provinsi.replace(/^Prov\.\s*/, "");
}

// 27195 -> "27.195".
export function formatAngka(n: number): string {
  return angka.format(n);
}

const waktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

// A timestamp -> "3 Okt 2026, 14.05" in WIB.
export function formatWaktu(d: Date | string): string {
  return waktu.format(typeof d === "string" ? new Date(d) : d);
}

const hari = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

// A timestamp -> "3 Oktober 2026" in WIB.
export function formatHari(d: Date | string): string {
  return hari.format(typeof d === "string" ? new Date(d) : d);
}
