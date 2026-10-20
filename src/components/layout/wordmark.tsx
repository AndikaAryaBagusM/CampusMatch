import Image from "next/image";
import { cn } from "@/lib/utils";

// The CampusMatch logo (design/logos/export): a C that is also a speech
// bubble, the pink dot in its opening, and the name in Overpass ExtraBold.
// `inverted` is the white version for dark backgrounds such as the footer.
export function Wordmark({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <Image
      src={inverted ? "/merek/logo-horizontal-dark.svg" : "/merek/logo-horizontal.svg"}
      alt="CampusMatch"
      width={525}
      height={100}
      loading="eager"
      className={cn("h-8 w-auto sm:h-9", className)}
    />
  );
}
