import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import type { UlasanPublik } from "@/lib/katalog";
import { UlasanCard } from "./ulasan-card";

const ulasan = (ubah: Partial<UlasanPublik> = {}): UlasanPublik => ({
  id: "3f0c6a8e-1111-4222-8333-944445555666",
  statusPengulas: "alumni",
  tahunMasuk: 2019,
  judul: "Judul",
  isi: "Isi",
  bintang: 4,
  rekomendasi: true,
  terbitAt: new Date("2026-10-03T07:00:00Z"),
  prodiNama: "S1 Informatika",
  prodiSlug: "kampus-s1-informatika",
  ...ubah,
});

test("Ulasan text is escaped plain text: no HTML, no markdown", () => {
  const html = renderToStaticMarkup(
    <UlasanCard
      ulasan={ulasan({
        judul: "<img src=x onerror=alert(1)>",
        isi: "<script>alert('x')</script> **tebal** [tautan](https://contoh.id) &amp;",
      })}
    />,
  );
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;script&gt;alert(&#x27;x&#x27;)&lt;/script&gt;");
  expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  expect(html).toContain("**tebal** [tautan](https://contoh.id) &amp;amp;");
  expect(html).not.toContain("<strong>");
  expect(html).not.toContain('href="https://contoh.id"');
});

test("line breaks are kept in the text and shown with whitespace-pre-line", () => {
  const html = renderToStaticMarkup(<UlasanCard ulasan={ulasan({ isi: "Baris satu\nBaris dua\n\nParagraf baru" })} />);
  expect(html).toMatch(/<p class="[^"]*whitespace-pre-line[^"]*">Baris satu\nBaris dua\n\nParagraf baru<\/p>/);
});

test("shows only Status Pengulas and tahun masuk about the writer", () => {
  const html = renderToStaticMarkup(<UlasanCard ulasan={ulasan()} />);
  expect(html).toContain("Alumni, masuk 2019");
  expect(html).not.toMatch(/<img|avatar|@/i);
});

test("Laporkan links to the login-protected page", () => {
  const html = renderToStaticMarkup(<UlasanCard ulasan={ulasan()} />);
  expect(html).toContain('href="/ulasan/3f0c6a8e-1111-4222-8333-944445555666/laporkan"');
  expect(html).toContain('rel="nofollow"');
});
