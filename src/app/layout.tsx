import type { Metadata } from "next";
import { Barlow_Condensed, Overpass } from "next/font/google";
import { BilahBandingkan } from "@/components/perbandingan/bilah-bandingkan";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

// Overpass descends from highway signage lettering; Barlow Condensed sets the
// route plates (codes and figures).
const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CampusMatch: pilih Jurusan dan Kampus",
    template: "%s | CampusMatch",
  },
  description:
    "Cari Jurusan, Kampus dan Prodi di Indonesia dengan data katalog resmi Kemenristekdikti dan ulasan dari mahasiswa dan alumni.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${overpass.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:font-semibold focus:text-background"
        >
          Langsung ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <BilahBandingkan />
      </body>
    </html>
  );
}
