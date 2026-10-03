import { revalidatePath } from "next/cache";
import type { TargetHalaman } from "./proses-screening";

// Every cached page that shows an Ulasan or its counts. Called whenever an
// Ulasan goes live, changes its live revision, or is removed. /cari is
// rendered per request and needs nothing; the noindex rule on these pages
// follows the count, so it flips on the next render.
export function revalidasiHalamanUlasan({ prodiSlug, kampusSlug }: TargetHalaman) {
  revalidatePath(`/prodi/${prodiSlug}`);
  revalidatePath(`/kampus/${kampusSlug}`);
  revalidatePath(`/kampus/${kampusSlug}/ulasan`);
  revalidatePath(`/kampus/${kampusSlug}/prodi`);
  revalidatePath("/");
}
