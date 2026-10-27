import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n/config";
import { getPublishedProjects } from "@/lib/queries/projects";
import { buildAlternateLanguages } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

/**
 * Generates dynamic sitemap.xml with full multilingual hreflang mapping
 * across all public pages, categories, and published portfolio case studies.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/work", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/gallery", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate static page entries for every supported locale
  for (const route of staticRoutes) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: buildAlternateLanguages(route.path),
        },
      });
    }
  }

  // Fetch dynamic projects from DB (using default locale to get slugs)
  try {
    const projects = await getPublishedProjects("en");

    for (const project of projects) {
      const subpath = `/work/${project.slug}`;
      const projectDate = project.publishedAt
        ? new Date(project.publishedAt)
        : new Date();

      for (const locale of LOCALES) {
        sitemapEntries.push({
          url: `${siteUrl}/${locale}${subpath}`,
          lastModified: projectDate,
          changeFrequency: "monthly",
          priority: project.featured ? 0.9 : 0.7,
          alternates: {
            languages: buildAlternateLanguages(subpath),
          },
        });
      }
    }
  } catch (error) {
    // If database is not reachable during build/request, static routes are still preserved
    console.error("[sitemap] Failed to fetch dynamic projects:", error);
  }

  return sitemapEntries;
}
