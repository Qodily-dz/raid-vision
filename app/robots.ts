import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

/**
 * Generates /robots.txt
 * Instructs search crawlers to index all public multilingual routes while
 * completely excluding the private administrative backend and internal API routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
