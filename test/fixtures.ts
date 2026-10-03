import type { Db } from "@/db";
import { kampus, kota, prodi, users } from "@/db/schema";
import type { DataUlasan } from "@/lib/ulasan/skema";

let n = 0;
const unik = () => `${Date.now().toString(36)}${(n++).toString(36)}`;

// A Kota, a Kampus with two Prodi, and the given users.
export async function buatKatalog(db: Db) {
  const s = unik();
  const [k] = await db.insert(kota).values({ nama: `Kota ${s}`, provinsi: "Prov. Uji", slug: `kota-${s}` }).returning();
  const [kp] = await db
    .insert(kampus)
    .values({ npsn: s.slice(-10), nama: `Universitas ${s}`, slug: `kampus-${s}`, bentuk: "Universitas", kotaId: k.id })
    .returning();
  const [p1, p2] = await db
    .insert(prodi)
    .values([
      { kampusId: kp.id, kodeProdi: "55201", nama: "Informatika", jenjang: "S1", slug: `informatika-${s}` },
      { kampusId: kp.id, kodeProdi: "61201", nama: "Manajemen", jenjang: "S1", slug: `manajemen-${s}` },
    ])
    .returning();
  return { kampus: kp, prodi: [p1, p2] as const };
}

export async function buatPengguna(db: Db, email = `${unik()}@contoh.id`) {
  const [u] = await db.insert(users).values({ email }).returning();
  return u;
}

export const dataUlasan = (ubah: Partial<DataUlasan> = {}): DataUlasan => ({
  bintang: 4,
  aspekKurikulum: 4,
  aspekDosen: 5,
  aspekFasilitas: 3,
  aspekSuasanaBelajar: 4,
  aspekOrganisasi: 3,
  aspekBiayaKualitas: 4,
  rekomendasi: true,
  judul: "Kurikulumnya relevan",
  isi: "Materi kuliah mengikuti kebutuhan industri dan dosen mudah ditemui di luar kelas. ".repeat(3),
  statusPengulas: "mahasiswa_aktif",
  tahunMasuk: 2023,
  ...ubah,
});
