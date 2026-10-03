"use server";

import { withDb } from "@/db";
import { BATAS, kunciIp, kunciPengulas, pakaiSemuaBatas } from "@/lib/batas-laju";
import { hashIpPemanggil } from "@/lib/ip";
import { requirePengulas } from "@/lib/sesi";
import { buatLaporan, LaporanSudahAda, skemaLaporan, TidakBisaDilaporkan } from "@/lib/ulasan/laporan";

export type StatusLaporan = { ok: true } | { ok: false; pesan: string } | null;

export async function kirimLaporan(_prev: StatusLaporan, formData: FormData): Promise<StatusLaporan> {
  const ulasanId = String(formData.get("ulasanId") ?? "");
  const pelapor = await requirePengulas(`/ulasan/${ulasanId}/laporkan`);

  const parsed = skemaLaporan.safeParse({ alasan: formData.get("alasan"), catatan: formData.get("catatan") ?? "" });
  if (!parsed.success) return { ok: false, pesan: parsed.error.issues[0].message };

  const ipHash = await hashIpPemanggil();
  return withDb(async (db) => {
    const boleh = await pakaiSemuaBatas(db, [
      [kunciPengulas(pelapor.id, "laporan"), BATAS.laporanPengulas],
      [kunciIp(ipHash, "laporan"), BATAS.laporanIp],
    ]);
    if (!boleh) return { ok: false, pesan: "Terlalu banyak laporan hari ini. Coba lagi besok." };
    try {
      await buatLaporan(db, { ulasanId, pelaporId: pelapor.id, ipHash, ...parsed.data });
      return { ok: true };
    } catch (e) {
      if (e instanceof LaporanSudahAda || e instanceof TidakBisaDilaporkan) return { ok: false, pesan: e.message };
      throw e;
    }
  });
}
