import { cn } from "@/lib/utils";

// A route plate, as painted on an angkot or a corridor sign: a short code in
// condensed capitals on a solid colour. Every colour it is given keeps white
// text above 4.5:1 (see the Bidang colours and the Kampus monogram hues).
export function Plat({
  children,
  warna = "var(--foreground)",
  ukuran = "md",
  className,
  ...props
}: {
  children: React.ReactNode;
  warna?: string;
  ukuran?: "sm" | "md" | "lg";
  className?: string;
} & Omit<React.ComponentProps<"span">, "children" | "className">) {
  return (
    <span
      {...props}
      style={{ backgroundColor: warna, ...props.style }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm font-plate leading-none font-bold tracking-wide whitespace-nowrap text-white uppercase",
        ukuran === "sm" && "h-5 min-w-5 px-1 text-xs",
        ukuran === "md" && "h-7 min-w-7 px-1.5 text-base",
        ukuran === "lg" && "h-10 min-w-10 px-2 text-2xl",
        className,
      )}
    >
      {children}
    </span>
  );
}
