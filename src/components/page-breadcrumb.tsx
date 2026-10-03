import Link from "next/link";
import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Beranda › … › current page. Items without href are plain text.
export function PageBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb className="py-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" className="transition-colors hover:text-foreground">
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
      <BreadcrumbSeparator />
      <BreadcrumbItem className="min-w-0">
        {last ? (
          <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
        ) : item.href ? (
          <Link href={item.href} className="transition-colors hover:text-foreground">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
        )}
      </BreadcrumbItem>
    </>
  );
}
