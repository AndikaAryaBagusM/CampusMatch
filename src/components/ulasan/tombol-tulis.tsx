import Link from "next/link";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

// A plain link: the target page asks for login, so catalogue pages stay static.
// Pink, the Pengulas line's colour, wherever writing starts.
// Pink, the Pengulas line's colour, wherever writing starts.
export function TombolTulis({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-pengulas px-5 text-sm font-bold text-pengulas-foreground transition-colors hover:bg-pengulas-ink",
        className,
      )}
    >
      <PenLine className="size-4" aria-hidden />
      Tulis ulasan
    </Link>
  );
}
