import { cn } from "@/lib/utils";

// White content card on the grey page background, as in every design frame.
export function Panel({
  title,
  action,
  children,
  className,
  id,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-xl bg-white p-5 ring-1 ring-border sm:p-6", className)}>
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          {title ? <h2 className="text-lg font-medium">{title}</h2> : null}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const kontainer = "mx-auto w-full max-w-6xl px-4 sm:px-6";
