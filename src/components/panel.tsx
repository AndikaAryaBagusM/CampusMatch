import { cn } from "@/lib/utils";

// A section of a timetable board, set straight on the enamel ground: a heavy
// ink rule, the heading hanging from it, then ruled rows. `lembar` puts it on
// a lighter sheet instead, for forms and account tools that need a container.
export function Panel({
  title,
  action,
  children,
  className,
  id,
  lembar = false,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
  lembar?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        lembar ? "rounded-md bg-card p-5 ring-1 ring-foreground/10 sm:p-6" : "scroll-mt-28 border-t-[3px] border-foreground pt-3",
        className,
      )}
    >
      {title || action ? (
        <div
          className={cn(
            "mb-3 flex flex-wrap items-baseline justify-between gap-2",
            lembar && "mb-4 border-b-2 border-foreground pb-2",
          )}
        >
          {title ? <h2 className="text-lg leading-tight font-bold">{title}</h2> : null}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const kontainer = "mx-auto w-full max-w-6xl px-4 sm:px-6";
