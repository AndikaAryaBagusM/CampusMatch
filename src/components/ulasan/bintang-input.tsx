import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// 1–5 star rating as a native radio group: works without JavaScript and with
// arrow keys. Radios come 5..1 in the DOM and the row is reversed, so
// "checked ~ label" colours the chosen star and every star before it.
export function BintangInput({
  name,
  label,
  defaultValue,
  invalid,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  invalid?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex flex-row-reverse justify-end gap-0.5 rounded-sm text-input",
        "[&>input:checked~label]:text-star [&>label:hover]:text-star/70 [&>label:hover~label]:text-star/70",
        "has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
      )}
    >
      {[5, 4, 3, 2, 1].map((n) => {
        const id = `${name}-${n}`;
        return [
          <input
            key={`i${n}`}
            id={id}
            type="radio"
            name={name}
            value={n}
            required
            defaultChecked={defaultValue === String(n)}
            className="sr-only"
          />,
          <label key={`l${n}`} htmlFor={id} className="cursor-pointer p-0.5 transition-colors">
            <Star className="size-7 fill-current" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">
              {n} dari 5 bintang
            </span>
          </label>,
        ];
      })}
    </div>
  );
}
