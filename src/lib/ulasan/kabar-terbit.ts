import { eq, sql } from "drizzle-orm";
import { withDb } from "@/db";
import { kampus, prodi, ulasan, ulasanRevisi, users } from "@/db/schema";
import { kirimEmail } from "@/lib/email";
import { urlSitus } from "@/lib/situs";

export type KabarTerbit = { prodiNama: string; kampusNama: string; prodiSlug: string; adaTeks: boolean };

// The one email a Pengulas gets about an Ulasan: it is live, here is the link
// to share, and (for ratings only) where to add the story.
export function isiKabarTerbit({ prodiNama, kampusNama, prodiSlug, adaTeks }: KabarTerbit) {
  const halaman = urlSitus(`/prodi/${prodiSlug}`);
  return {
    judul: "Ulasanmu sudah tampil di CampusMatch",
    isi: [
      `Terima kasih. ${adaTeks ? "Ulasanmu" : "Penilaianmu"} untuk ${prodiNama}, ${kampusNama} sudah tampil tanpa nama:`,
      halaman,
      "",
      ...(adaTeks
        ? []
        : [
            "Kamu baru mengisi bintang. Cerita singkat tentang kuliahmu paling membantu calon mahasiswa, dan bisa ditambahkan kapan saja:",
            urlSitus(`/prodi/${prodiSlug}/tulis`),
            "",
          ]),
      "Kenal teman seangkatan atau dari Prodi lain? Teruskan tautan ini supaya mereka ikut menulis:",
      urlSitus("/cari?tulis=1"),
      "",
      "Email ini dikirim sekali karena kamu mengirim ulasan. Kamu bisa mengubah atau menghapus ulasanmu di halaman Akun.",
    ].join("\n"),
  };
}

// Never throws: the Ulasan is already live, and a failed email must not undo
// or repeat anything.
export async function kabariTerbit(ulasanId: string) {
  try {
    const row = await withDb(async (db) => {
      const [r] = await db
        .select({
          email: users.email,
          prodiNama: sql<string>`${prodi.jenjang} || ' ' || ${prodi.nama}`,
          kampusNama: kampus.nama,
          prodiSlug: prodi.slug,
          adaTeks: sql<boolean>`${ulasanRevisi.isi} IS NOT NULL`,
        })
        .from(ulasan)
        .innerJoin(ulasanRevisi, eq(ulasan.revisiTerbitId, ulasanRevisi.id))
        .innerJoin(users, eq(ulasan.pengulasId, users.id))
        .innerJoin(prodi, eq(ulasan.prodiId, prodi.id))
        .innerJoin(kampus, eq(prodi.kampusId, kampus.id))
        .where(eq(ulasan.id, ulasanId))
        .limit(1);
      return r;
    });
    if (!row?.email) return;
    await kirimEmail({ ke: row.email, ...isiKabarTerbit(row) });
  } catch (e) {
    console.error("Kabar terbit tidak terkirim", { ulasanId, e });
  }
}
