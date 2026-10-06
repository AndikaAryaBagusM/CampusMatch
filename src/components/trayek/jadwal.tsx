import { cn } from "@/lib/utils";

// Timetable rows for result lists, like the columns of a departure board: the
// destination on the left, then fixed columns of facts with figures in plate
// type. From md the columns line up under a row of column heads; on phones the
// facts wrap onto one line under the name, each with its own label.
//
// `kolom` is the grid template shared by the heads and every row of a list.

// `tipis` drops the heavy top rule when the list's own heading already has one.
// Text columns are left-aligned; `kanan` lists the figure columns, which align
// right as in a timetable.
export function KepalaJadwal({
  kolom,
  judul,
  kanan = [],
  tipis,
}: {
  kolom: string;
  judul: React.ReactNode[];
  kanan?: number[];
  tipis?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "hidden gap-x-4 px-1 py-2 font-plate text-sm font-semibold tracking-wide text-muted-foreground uppercase md:grid",
        !tipis && "border-t-[3px] border-foreground",
      )}
      style={{ gridTemplateColumns: kolom }}
    >
      {judul.map((j, i) => (
        <span key={i} className={kanan.includes(i) ? "text-right" : undefined}>
          {j}
        </span>
      ))}
    </div>
  );
}

export function DaftarJadwal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border border-t-[3px] border-b border-t-foreground border-b-border md:border-t md:border-t-border", className)}>
      {children}
    </ul>
  );
}

export function BarisJadwal({ kolom, children, className }: { kolom: string; children: React.ReactNode; className?: string }) {
  return (
    <li
      className={cn("grid grid-cols-1 gap-x-4 gap-y-2 px-1 py-3.5 md:items-center md:[grid-template-columns:var(--kolom)]", className)}
      style={{ "--kolom": kolom } as React.CSSProperties}
    >
      {children}
    </li>
  );
}

// The facts after the destination: one wrapping line on phones, separate grid
// cells from md.
export function SelJadwal({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pl-[3.25rem] text-sm md:contents md:pl-0">{children}</div>;
}

// A fact cell. `angka` sets a figure in plate type, right-aligned; `kanan`
// right-aligns a figure that carries its own markup.
export function Sel({
  label,
  angka,
  kanan,
  children,
  className,
}: {
  label: string;
  angka?: boolean;
  kanan?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", (angka || kanan) && "md:text-right", className)}>
      <span className="text-muted-foreground md:sr-only">{label}: </span>
      <span className={cn(angka && "tabular font-plate text-base font-bold md:text-lg")}>{children}</span>
    </div>
  );
}
