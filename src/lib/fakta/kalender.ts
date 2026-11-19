// A Google Calendar link for a Jalur Masuk's registration deadline: an all-day
// event the visitor adds to their own calendar. Reminders without an account
// (ADR 0008) and without CampusMatch storing anything about who asked.

const padat = (isoDate: string) => isoDate.replaceAll("-", "");

// The day after an ISO date; an all-day event's end date is exclusive.
function besok(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function tautanKalender({
  judul,
  tanggal,
  keterangan,
}: {
  judul: string;
  // "2027-03-15", a Postgres date.
  tanggal: string;
  keterangan: string;
}): string {
  const qs = new URLSearchParams({
    action: "TEMPLATE",
    text: judul,
    dates: `${padat(tanggal)}/${padat(besok(tanggal))}`,
    details: keterangan,
  });
  return `https://calendar.google.com/calendar/render?${qs}`;
}

// The reminder for one Jalur Masuk: its closing date when the Sumber states
// one, otherwise its opening date. null when it has no dates.
export function pengingatJalur(
  jalur: { nama: string; pendaftaranBuka: string | null; pendaftaranTutup: string | null; sumber: { url: string } },
  kampusNama: string,
): string | null {
  const tanggal = jalur.pendaftaranTutup ?? jalur.pendaftaranBuka;
  if (!tanggal) return null;
  const tutup = jalur.pendaftaranTutup !== null;
  return tautanKalender({
    judul: `${tutup ? "Batas pendaftaran" : "Pendaftaran dibuka"}: ${jalur.nama}, ${kampusNama}`,
    tanggal,
    keterangan: `Dicatat CampusMatch dari sumber resmi. Jadwal bisa berubah, periksa lagi di: ${jalur.sumber.url}`,
  });
}
