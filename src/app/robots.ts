import type { MetadataRoute } from "next";

// Crawlers skip Promosi click links (so they don't inflate the counts), the
// account and Moderator areas, and the noindex writing pages (each crawl of
// those is a server render for a page no search result shows).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/promosi/", "/moderasi/", "/akun/", "/kampus/*/tulis", "/prodi/*/tulis"],
    },
  };
}
