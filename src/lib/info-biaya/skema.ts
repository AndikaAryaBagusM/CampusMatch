import { z } from "zod";
import { parseRupiah } from "@/lib/fakta/baca";
import { formatRupiah } from "@/lib/fakta/label";
import { TAHUN_MIN } from "@/lib/ulasan/skema";
import { BATAS_INFO_BIAYA, BEASISWA, KATEGORI_JALUR, TES } from "./label";

// The answer fields; at least one must be filled.
export const KOLOM_JAWABAN = ["jalur", "tes", "biayaSemester", "kelompokUkt", "uangPangkal", "tanpaUangPangkal", "biayaLainMasuk", "beasiswa"] as const;

export type IsianInfoBiaya = Partial<Record<Exclude<(typeof KOLOM_JAWABAN)[number], "tes"> | "statusPengulas" | "tahunMasuk" | "setuju", string>> & {
  tes?: string[];
};

const kosong = (v: unknown) => v === undefined || v === null || v === "";

const rupiah = (maks: number, nama: string) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (kosong(v?.trim())) return null;
      const n = parseRupiah(v!);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: `Tulis ${nama} dalam rupiah, tanpa desimal.` });
        return z.NEVER;
      }
      if (n > maks) {
        ctx.addIssue({ code: "custom", message: `${nama[0].toUpperCase()}${nama.slice(1)} paling banyak ${formatRupiah(maks)}.` });
        return z.NEVER;
      }
      return n;
    });

const pilihan = <T extends readonly [string, ...string[]]>(sah: T) =>
  z
    .union([z.enum(sah), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null));

// Server-side check of the Info Biaya fields, shared by the standalone form and
// the optional section of the Ulasan form. No free text anywhere (ADR 0010).
export function skemaInfoBiaya(tahunIni = new Date().getFullYear()) {
  return z
    .object({
      statusPengulas: z.enum(["mahasiswa_aktif", "alumni"], { error: "Pilih status kamu." }),
      tahunMasuk: z.coerce
        .number({ error: "Isi tahun masuk." })
        .int("Isi tahun masuk.")
        .min(TAHUN_MIN, `Tahun masuk paling awal ${TAHUN_MIN}.`)
        .max(tahunIni, "Tahun masuk tidak boleh di masa depan."),
      jalur: pilihan(KATEGORI_JALUR),
      tes: z
        .array(z.enum(TES))
        .optional()
        .transform((v) => (v?.length ? [...new Set(v)] : null)),
      biayaSemester: rupiah(BATAS_INFO_BIAYA.biayaSemester, "biaya per semester"),
      kelompokUkt: z
        .string()
        .optional()
        .transform((v, ctx) => {
          if (kosong(v?.trim())) return null;
          const n = Number(v);
          if (!Number.isInteger(n) || n < 1 || n > BATAS_INFO_BIAYA.kelompokUkt) {
            ctx.addIssue({ code: "custom", message: `Kelompok UKT berupa angka 1 sampai ${BATAS_INFO_BIAYA.kelompokUkt}.` });
            return z.NEVER;
          }
          return n;
        }),
      uangPangkal: rupiah(BATAS_INFO_BIAYA.uangPangkal, "uang pangkal"),
      tanpaUangPangkal: z.string().optional(),
      biayaLainMasuk: rupiah(BATAS_INFO_BIAYA.biayaLainMasuk, "biaya lain saat masuk"),
      beasiswa: pilihan(BEASISWA),
      setuju: z.literal("1", { error: "Centang persetujuan untuk menyimpan info biaya." }),
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- setuju is only checked, never stored
    .transform(({ tanpaUangPangkal, uangPangkal, setuju, ...d }) => ({
      ...d,
      uangPangkal: tanpaUangPangkal === "1" ? 0 : uangPangkal,
    }))
    .refine(
      (d) => [d.jalur, d.tes, d.biayaSemester, d.uangPangkal, d.biayaLainMasuk, d.beasiswa].some((v) => v !== null),
      { message: "Isi minimal satu jawaban.", path: ["jalur"] },
    );
}

export type DataInfoBiaya = z.output<ReturnType<typeof skemaInfoBiaya>>;

// FormData -> plain strings (and the tes list), kept to re-fill the form.
export function bacaIsianInfoBiaya(formData: FormData): IsianInfoBiaya {
  const isian: IsianInfoBiaya = {};
  for (const k of [...KOLOM_JAWABAN, "statusPengulas", "tahunMasuk", "setuju"] as const) {
    if (k === "tes") continue;
    const v = formData.get(k);
    if (typeof v === "string") isian[k] = v;
  }
  isian.tes = formData.getAll("tes").filter((v): v is string => typeof v === "string");
  return isian;
}

// Whether the optional section of the Ulasan form was touched at all.
export function adaJawaban(isian: IsianInfoBiaya): boolean {
  return KOLOM_JAWABAN.some((k) => (k === "tes" ? (isian.tes?.length ?? 0) > 0 : !kosong(isian[k]?.trim())));
}

export type GalatInfoBiaya = Partial<Record<string, string>>;

// The first message per field, for the form.
export function galatDari(error: z.ZodError): GalatInfoBiaya {
  return Object.fromEntries(Object.entries(z.flattenError(error).fieldErrors).map(([k, v]) => [k, (v as string[] | undefined)?.[0]]));
}
