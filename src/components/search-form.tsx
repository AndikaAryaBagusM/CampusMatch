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
        "flex w-full items-center gap-1 rounded-full bg-white ring-1 ring-input focus-within:ring-2 focus-within:ring-primary",
        lg ? "p-1.5 pl-5 shadow-sm" : "p-1 pl-3.5",
        className,
      )}
    >
      <Search aria-hidden className={cn("shrink-0 text-muted-foreground", lg ? "size-5" : "size-4")} />
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
          "min-w-0 flex-1 bg-transparent px-2 text-foreground outline-none placeholder:text-muted-foreground",
          lg ? "h-11 text-base" : "h-8 text-sm",
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-full bg-primary font-medium text-primary-foreground transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          lg ? "h-11 px-6 text-base" : "h-8 px-4 text-sm",
        )}
      >
        Cari
      </button>
    </form>
  );
}
