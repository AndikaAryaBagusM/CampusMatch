"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Copies a link to the clipboard and says so for a moment.
export function TombolSalin({ teks, label = "Salin tautan", className }: { teks: string; label?: string; className?: string }) {
  const [disalin, setDisalin] = useState(false);

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2000);
    } catch {
      // No clipboard access (old browser, blocked permission): show the link to copy by hand.
      window.prompt("Salin tautan ini:", teks);
    }
  }

  return (
    <button
      type="button"
      onClick={salin}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold ring-1 ring-foreground/40 transition-colors hover:bg-secondary",
        className,
      )}
    >
      {disalin ? <Check className="size-4 text-success" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      <span aria-live="polite">{disalin ? "Tersalin" : label}</span>
    </button>
  );
}
