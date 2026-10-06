// Sends a plain-text email through Resend, with the same key and sender as
// the sign-in emails (AUTH_RESEND_KEY, AUTH_EMAIL_FROM).

export class EmailTidakTersedia extends Error {}

export async function kirimEmail({ ke, judul, isi }: { ke: string; judul: string; isi: string }) {
  const key = process.env.AUTH_RESEND_KEY;
  if (!key) {
    // Local development without Resend: show the email in the server log.
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[email ke ${ke}] ${judul}\n${isi}\n`);
      return;
    }
    throw new EmailTidakTersedia("Pengiriman email belum tersedia.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM || "CampusMatch <onboarding@resend.dev>",
      to: [ke],
      subject: judul,
      text: isi,
    }),
  });
  if (!res.ok) throw new EmailTidakTersedia(`Email gagal dikirim (${res.status}).`);
}
