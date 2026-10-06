import { ATRIBUSI_ONET, ATRIBUSI_ONET_EN } from "@/lib/riasec/item";
import { cn } from "@/lib/utils";

// The notice the O*NET Tools Developer License requires on every page that
// uses the adapted Interest Profiler (ADR 0004): the English original, then
// Indonesian. Keep the English wording verbatim.
export function AtribusiOnet({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-1.5 text-xs leading-relaxed text-muted-foreground", className)}>
      <p lang="en">{ATRIBUSI_ONET_EN}</p>
      <p>{ATRIBUSI_ONET}</p>
      <p>
        Kode RIASEC Jurusan diturunkan dari O*NET 31.0 Database oleh USDOL/ETA, dipakai di bawah{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          CC BY 4.0
        </a>
        . Perubahan oleh CampusMatch: setiap Jurusan dipetakan ke beberapa pekerjaan O*NET, nilai minatnya dirata-ratakan,
        lalu ditinjau tim kami.
      </p>
      <p>
        Sumber:{" "}
        <a href="https://www.onetcenter.org/IP.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          O*NET® Interest Profiler
        </a>{" "}
        ·{" "}
        <a href="https://www.onetcenter.org/license_toolsdev.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          O*NET Tools Developer License
        </a>
      </p>
    </div>
  );
}
