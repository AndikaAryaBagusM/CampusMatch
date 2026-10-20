import Image from "next/image";
import { cn } from "@/lib/utils";

// The CampusMatch logo (design/logo): the C-shaped speech bubble and the name.
// `inverted` is the white version for dark backgrounds such as the footer.
export function Wordmark({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <Image
      src={inverted ? "/merek/logo-horizontal-dark.svg" : "/merek/logo-horizontal.svg"}
      alt="CampusMatch"
      width={248}
      height={48}
      loading="eager"
      className={cn("h-8 w-auto sm:h-9", className)}
    />
  );
}
