import Link from "next/link";
import { cn } from "@/lib/utils";

// A route drawn as a line with stops (halte), like a KRL or TransJakarta line
// map. Every line diagrams a real sequence or grouping; it never stands for
// geography or a ranking.
//
// Hovering or focusing a stop lights the route up to that stop and dims the
// rest (the .rute rules in globals.css).

export type Halte = {
  label: React.ReactNode;
  keterangan?: React.ReactNode;
  href?: string;
  // lewat: already passed (filled), kini: where the visitor is, nanti: ahead.
  keadaan?: "lewat" | "kini" | "nanti";
  sisipan?: React.ReactNode;
};

// tegak: always vertical. md: horizontal from md up. selalu: always horizontal,
// scrolling sideways on narrow screens.
type Arah = "tegak" | "md" | "selalu";

const OL: Record<Arah, string> = {
  tegak: "",
  md: "md:flex",
  selalu: "flex w-max min-w-full",
};
const LI: Record<Arah, string> = {
  tegak: "pb-6 pl-10 last:pb-0",
  md: "pb-6 pl-10 last:pb-0 md:flex-1 md:pt-10 md:pb-0 md:pl-0 md:pr-4",
  selalu: "w-36 shrink-0 grow pt-10 pr-4 sm:w-40",
};
const GARIS: Record<Arah, string> = {
  tegak: "top-[14px] left-[9px] h-full w-(--garis)",
  md: "top-[14px] left-[9px] h-full w-(--garis) md:top-[9px] md:left-3 md:h-(--garis) md:w-full",
  selalu: "top-[9px] left-3 h-(--garis) w-full",
};
const TITIK: Record<Arah, { biasa: string; kini: string }> = {
  tegak: { biasa: "top-0.5 left-0", kini: "-top-0.5 -left-1" },
  md: { biasa: "top-0.5 left-0 md:top-0", kini: "-top-0.5 -left-1 md:-top-1" },
  selalu: { biasa: "top-0 left-0", kini: "-top-1 -left-1" },
};

export function GarisRute({
  halte,
  warna = "var(--pengulas)",
  arah = "tegak",
  diJade = false,
  animasi = false,
  label,
  className,
}: {
  halte: Halte[];
  warna?: string;
  arah?: Arah;
  // Set on the jade band: light secondary text.
  diJade?: boolean;
  // Draw the line in once on load (vertical lines only).
  animasi?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <ol aria-label={label} className={cn("rute", OL[arah], className)}>
      {halte.map((h, i) => {
        const terakhir = i === halte.length - 1;
        const kini = h.keadaan === "kini";
        const isi = (
          <>
            <span className={cn("block leading-snug font-bold", h.href && "decoration-2 underline-offset-4 group-hover/halte:underline")}>
              {h.label}
            </span>
            {h.keterangan ? (
              <span className={cn("mt-0.5 block text-sm leading-snug", diJade ? "text-on-jade-muted" : "text-muted-foreground")}>
                {h.keterangan}
              </span>
            ) : null}
          </>
        );
        return (
          <li key={i} aria-current={kini ? "step" : undefined} className={cn("group/halte relative", LI[arah])}>
            {!terakhir ? (
              <span
                aria-hidden
                className={cn(
                  "rute-garis absolute rounded-full",
                  GARIS[arah],
                  // Upcoming segments: a washed line on the ground; on jade, the light
                  // on-jade tint, since a translucent colour turns muddy there.
                  (h.keadaan === "nanti" || halte[i + 1]?.keadaan === "nanti") && !diJade && "opacity-45",
                  animasi && arah === "tegak" && "rute-tumbuh",
                )}
                style={{
                  background: diJade && (h.keadaan === "nanti" || halte[i + 1]?.keadaan === "nanti") ? "var(--on-jade-muted)" : warna,
                  animationDelay: animasi ? `${i * 50}ms` : undefined,
                }}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "rute-redup absolute z-10 rounded-full",
                // The current stop is an interchange marker: larger, ringed in the line colour.
                kini ? cn(TITIK[arah].kini, "size-8 border-[6px]") : cn(TITIK[arah].biasa, "size-6 border-[3px] border-foreground"),
              )}
              style={{ background: h.keadaan === "lewat" ? warna : "#ffffff", borderColor: kini ? warna : undefined }}
            />
            <div className="rute-redup">
              {h.href ? (
                <Link href={h.href} className="block rounded-sm focus-visible:outline-offset-4">
                  {isi}
                </Link>
              ) : (
                isi
              )}
              {h.sisipan ? <div className="mt-3">{h.sisipan}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
