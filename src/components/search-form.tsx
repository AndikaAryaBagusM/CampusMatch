import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_QUERY_LENGTH } from "@/lib/search";

// Plain GET form to /cari: works without client JavaScript.
export function SearchForm({
  defaultValue,
  size = "lg",
  autoFocus,
  className,
}: {
  defaultValue?: string;
  size?: "lg" | "sm";
  autoFocus?: boolean;
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <form
      action="/cari"
      method="get"
      role="search"
      className={cn(
        "flex w-full items-center gap-1 rounded-sm bg-white ring-2 ring-foreground focus-within:ring-[3px] focus-within:ring-pengulas",
        lg ? "p-1.5 pl-4 shadow-[0_6px_16px_-8px_rgb(19_32_26/0.45)]" : "p-1 pl-3",
        className,
      )}
    >
      <Search aria-hidden className={cn("shrink-0 text-foreground", lg ? "size-5" : "size-4")} />
      <label htmlFor={lg ? "q-besar" : "q-kecil"} className="sr-only">
        Cari Jurusan, Kampus atau Prodi
      </label>
      <input
        id={lg ? "q-besar" : "q-kecil"}
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={MAX_QUERY_LENGTH}
        autoFocus={autoFocus}
        placeholder={lg ? "Jurusan, Kampus atau Prodi" : "Cari Jurusan, Kampus, Prodi"}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-2 text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          lg ? "h-12 text-base sm:text-lg" : "h-8 text-sm",
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-[3px] bg-foreground font-bold text-background transition-colors hover:bg-jade focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pengulas",
          lg ? "h-12 px-6 text-base" : "h-8 px-3.5 text-sm",
        )}
      >
        Cari
      </button>
    </form>
  );
}
