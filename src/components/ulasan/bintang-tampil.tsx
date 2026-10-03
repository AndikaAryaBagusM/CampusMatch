import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Read-only stars; fractional averages fill the last star partly.
export function BintangTampil({ nilai, className }: { nilai: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${nilai.toLocaleString("id-ID")} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isi = Math.max(0, Math.min(1, nilai - (n - 1)));
        return (
          <span key={n} className="relative inline-block size-4">
            <Star className="absolute inset-0 size-4 fill-current text-input" aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${isi * 100}%` }}>
              <Star className="size-4 fill-current text-amber-400" aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}
