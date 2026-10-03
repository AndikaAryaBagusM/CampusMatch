import type { TingkatRisiko } from "@/lib/ulasan/status";

// The cheap pass before the model (ADR 0002). It can only raise the risk,
// never lower it, so a miss here costs nothing: the model still decides.
// Patterns target private information and promotion, which are easy to match
// reliably; insults and SARA are left to the model, where context matters.
const POLA: { pola: RegExp; alasan: string }[] = [
  { pola: /(?:\+62|\b62|\b0)[\s.-]?8\d[\d\s.-]{6,12}\d/, alasan: "Memuat nomor telepon." },
  { pola: /[\w.+-]+@[\w-]+\.[\w.]+/, alasan: "Memuat alamat email." },
  { pola: /\bhttps?:\/\/|\bwww\.|\b[\w-]+\.(?:com|id|net|org|co\.id|ly|me)\/\S*/i, alasan: "Memuat tautan." },
  { pola: /\b(?:wa\.me|whatsapp|chat wa|hubungi wa|dm (?:aku|saya|ig)|cek bio)\b/i, alasan: "Ajakan menghubungi di luar CampusMatch." },
  { pola: /\b(?:joki|jasa skripsi|jasa tugas|kode promo|diskon \d+)/i, alasan: "Tampak seperti promosi." },
  { pola: /(?:^|\s)@[a-z0-9_.]{3,}/i, alasan: "Memuat akun media sosial." },
];

export type TemuanDaftarKata = { tingkatRisiko: TingkatRisiko; alasan: string } | null;

export function periksaDaftarKata(teks: string): TemuanDaftarKata {
  const temuan = POLA.filter((p) => p.pola.test(teks)).map((p) => p.alasan);
  return temuan.length ? { tingkatRisiko: "perlu_dicek", alasan: temuan.join(" ") } : null;
}

const URUTAN: Record<TingkatRisiko, number> = { rendah: 0, perlu_dicek: 1, melanggar: 2 };

export function lebihKetat(a: TingkatRisiko, b: TingkatRisiko): TingkatRisiko {
  return URUTAN[a] >= URUTAN[b] ? a : b;
}
