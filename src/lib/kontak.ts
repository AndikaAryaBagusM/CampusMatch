// The address for Laporan and takedown requests (KONTAK_EMAIL). The full
// takedown process is still open (docs/legal-todo.md item 3).
export function kontakEmail(): string | null {
  return process.env.KONTAK_EMAIL?.trim() || null;
}

export function mailtoTakedown(email: string, perihal = "Laporan atau permintaan hapus ulasan") {
  return `mailto:${email}?subject=${encodeURIComponent(perihal)}`;
}
