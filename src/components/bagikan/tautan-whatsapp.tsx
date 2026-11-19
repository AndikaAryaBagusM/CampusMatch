import { MessageCircle } from "lucide-react";
import { tautanWhatsApp } from "@/lib/situs";
import { cn } from "@/lib/utils";

// Opens WhatsApp with the message ready; the visitor picks who gets it. A
// plain link, so it works on a cached page and without JavaScript.
export function TautanWhatsApp({
  pesan,
  children,
  className,
  utama,
}: {
  pesan: string;
  children: React.ReactNode;
  className?: string;
  utama?: boolean;
}) {
  return (
    <a
      href={tautanWhatsApp(pesan)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold transition-colors",
        utama ? "bg-jade text-on-jade hover:bg-jade-deep" : "ring-1 ring-foreground/40 hover:bg-secondary",
        className,
      )}
    >
      <MessageCircle className="size-4" aria-hidden />
      {children}
    </a>
  );
}
