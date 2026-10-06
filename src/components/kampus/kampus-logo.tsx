import { cn } from "@/lib/utils";
import { getKampusMedia } from "@/lib/kampus-media";

const KECIL = new Set(["dan", "di", "&", "-"]);

// "Universitas Gadjah Mada" -> "UGM": first letters of the words, up to three.
export function inisialKampus(nama: string): string {
  return nama
    .replace(/[()"'.,]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !KECIL.has(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// Stable hue per NPSN (FNV-1a), so a Kampus always gets the same colour.
function hue(npsn: string): number {
  let h = 2166136261;
  for (const c of npsn) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 360;
}

const UKURAN = {
  sm: "size-10 text-base rounded-sm",
  md: "size-14 text-2xl rounded-sm",
  lg: "size-16 text-3xl rounded-sm sm:size-20 sm:text-4xl",
};

// The Kampus logo when we have one (see getKampusMedia), otherwise a route-plate monogram.
// Monogram background is oklch L 0.45, which keeps white text above 4.5:1 for any hue.
export function KampusLogo({
  kampus,
  size = "md",
  className,
}: {
  kampus: { npsn: string; nama: string };
  size?: keyof typeof UKURAN;
  className?: string;
}) {
  const { logoUrl } = getKampusMedia(kampus);
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos will come from varied origins
      <img src={logoUrl} alt={`Logo ${kampus.nama}`} className={cn("shrink-0 bg-card object-contain", UKURAN[size], className)} />
    );
  }
  return (
    <span
      aria-hidden
      style={{ backgroundColor: `oklch(0.45 0.12 ${hue(kampus.npsn)})` }}
      className={cn("inline-flex shrink-0 items-center justify-center font-plate leading-none font-bold tracking-wide text-white", UKURAN[size], className)}
    >
      {inisialKampus(kampus.nama)}
    </span>
  );
}
