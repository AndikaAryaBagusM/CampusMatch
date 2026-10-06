import Link from "next/link";
import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Beranda › … › current page, drawn as the route travelled so far: short line
// segments between stops, ending at the current stop. Items without href are
// plain text.
export function PageBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb className="py-4">
      <BreadcrumbList className="gap-2 text-foreground/80">
        <BreadcrumbItem>
          <Link
            href="/"
            className="inline-flex size-7 items-center justify-center rounded-sm bg-jade text-on-jade transition-colors hover:bg-jade-deep"
          >
            <House className="size-4" aria-hidden />
            <span className="sr-only">Beranda</span>
          </Link>
        </BreadcrumbItem>
        {items.map((item, i) => (
          <BreadcrumbFragment key={`${item.label}-${i}`} item={item} last={i === items.length - 1} />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbFragment({ item, last }: { item: { label: string; href?: string }; last: boolean }) {
  return (
    <>
      <BreadcrumbSeparator>
        <span className="block h-1 w-4 rounded-full bg-jade/60" />
      </BreadcrumbSeparator>
      <BreadcrumbItem className="min-w-0">
        {last ? (
          <BreadcrumbPage className="inline-flex items-center gap-1.5 font-bold">
            <span aria-hidden className="size-3 shrink-0 rounded-full border-[3px] border-jade bg-white" />
            {item.label}
          </BreadcrumbPage>
        ) : item.href ? (
          <Link href={item.href} className="font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
        )}
      </BreadcrumbItem>
    </>
  );
}
