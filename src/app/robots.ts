import type { MetadataRoute } from "next";

// Crawlers skip Promosi click links (so they don't inflate the counts) and the
// account and Moderator areas.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: ["/promosi/", "/moderasi/", "/akun/"] } };
}
