import Link from "next/link";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

// A plain link: the target page asks for login, so catalogue pages stay static.
export function TombolTulis({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-deep",
        className,
      )}
    >
      <PenLine className="size-4" aria-hidden />
      Tulis ulasan
    </Link>
  );
}
