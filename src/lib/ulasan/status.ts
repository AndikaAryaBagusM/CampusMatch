import type { statusUlasan, tingkatRisiko } from "@/db/schema";

export type StatusUlasan = (typeof statusUlasan.enumValues)[number];
export type TingkatRisiko = (typeof tingkatRisiko.enumValues)[number];

// After this many failed Screening rounds a revision goes to a Moderator (ADR 0002).
export const MAKS_PUTARAN_SCREENING = 3;
export const ALASAN_SCREENING_GAGAL = "Screening gagal";

export type Peristiwa =
  | { jenis: "screening"; tingkatRisiko: TingkatRisiko }
  | { jenis: "screening_gagal" }
  | { jenis: "setujui" }
  | { jenis: "tolak"; alasan: string }
  | { jenis: "turunkan"; alasan: string };

export type Keadaan = { status: StatusUlasan; percobaan: number };

export class TransisiTidakSah extends Error {
  constructor(dari: StatusUlasan, peristiwa: Peristiwa["jenis"]) {
    super(`Transisi tidak sah: ${peristiwa} dari ${dari}`);
    this.name = "TransisiTidakSah";
  }
}

// The only legal moves of one revision's Status Ulasan. Only a "screening"
// event with Tingkat Risiko rendah, or a Moderator's "setujui", reaches terbit:
// a failed Screening never does (fail-closed).
export function transisi(dari: Keadaan, peristiwa: Peristiwa): Keadaan {
  const tolak = () => {
    throw new TransisiTidakSah(dari.status, peristiwa.jenis);
  };
  switch (peristiwa.jenis) {
    case "screening":
      if (dari.status !== "menunggu") tolak();
      return { status: peristiwa.tingkatRisiko === "rendah" ? "terbit" : "ditinjau", percobaan: dari.percobaan };
    case "screening_gagal": {
      if (dari.status !== "menunggu") tolak();
      const percobaan = dari.percobaan + 1;
      return { status: percobaan >= MAKS_PUTARAN_SCREENING ? "ditinjau" : "menunggu", percobaan };
    }
    case "setujui":
      if (dari.status !== "ditinjau") tolak();
      return { status: "terbit", percobaan: dari.percobaan };
    case "tolak":
      if (dari.status !== "ditinjau" || !peristiwa.alasan.trim()) tolak();
      return { status: "ditolak", percobaan: dari.percobaan };
    case "turunkan":
      if (dari.status !== "terbit" || !peristiwa.alasan.trim()) tolak();
      return { status: "ditolak", percobaan: dari.percobaan };
  }
}

// A revision still being checked blocks a further edit (decisions.md 10).
export const sedangDiperiksa = (status: StatusUlasan) => status === "menunggu" || status === "ditinjau";
