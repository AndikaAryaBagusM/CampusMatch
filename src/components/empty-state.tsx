import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// A stop not yet served: a hollow station ring around the icon.
export function EmptyState({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-4 py-8 text-center", className)}>
      <span className="mb-1 inline-flex size-12 items-center justify-center rounded-full border-[3px] border-dashed border-input bg-background text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="font-bold">{title}</p>
      {children ? <div className="max-w-md text-sm leading-relaxed text-muted-foreground">{children}</div> : null}
    </div>
  );
}
