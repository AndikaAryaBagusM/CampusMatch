import { revalidatePath } from "next/cache";
import { withDb } from "@/db";
import { BATAS, kunciIp, pakaiBatas } from "@/lib/batas-laju";
import { hashIpPemanggil } from "@/lib/ip";
import { tandaiMembantu } from "@/lib/ulasan/membantu";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// A reader marks an Ulasan as Membantu (no account needed, decisions.md 17s).
// One mark per Ulasan per ip_hash; the raw IP is never stored.
export async function POST(_request: Request, { params }: RouteContext<"/api/ulasan/[id]/membantu">) {
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ galat: "Ulasan tidak ditemukan." }, { status: 404 });

  const ipHash = await hashIpPemanggil();
  const hasil = await withDb(async (db) => {
    if (!(await pakaiBatas(db, kunciIp(ipHash, "membantu"), BATAS.membantuIp))) return "batas" as const;
    return tandaiMembantu(db, { ulasanId: id, ipHash });
  });
  if (hasil === "batas") return Response.json({ galat: "Terlalu banyak. Coba lagi nanti." }, { status: 429 });
  if (!hasil) return Response.json({ galat: "Ulasan tidak ditemukan." }, { status: 404 });

  // The count is part of the cached pages that show this Ulasan.
  if (hasil.baru) {
    revalidatePath(`/prodi/${hasil.prodiSlug}`);
    revalidatePath(`/kampus/${hasil.kampusSlug}/ulasan`);
  }
  return Response.json({ jumlah: hasil.jumlah });
}
