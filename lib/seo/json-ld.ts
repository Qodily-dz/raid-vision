import { siteUrl } from "@/lib/utils";
import type { SiteSettingsView, ProjectDetailView, ServiceView } from "@/types/content";

/**
 * Builds Schema.org Person & ProfessionalService structured data.
 */
export function buildPersonAndBusinessSchema(settings: SiteSettingsView, locale: string) {
  const sameAs = [
    settings.social.instagram,
    settings.social.vimeo,
    settings.social.youtube,
    settings.social.tiktok,
  ].filter((item): item is string => Boolean(item));

  return {
    "@context": "https://schema.org",
    "@type": ["Person", "ProfessionalService"],
    "@id": `${siteUrl}/#identity`,
    name: settings.ownerName || "Raid",
    alternateName: settings.brandName || "Raid VISION",
    jobTitle: "Filmmaker & Director of Photography",
    description:
      settings.seoDescription ||
      settings.shortIntro ||
      settings.tagline ||
      "Filmmaker, director of photography, and visual storyteller specializing in cinematic commercials, music videos, and documentaries.",
    url: `${siteUrl}/${locale}`,
    image: settings.heroPosterPath ? `${siteUrl}/api/og` : undefined,
    sameAs,
    email: settings.email ? `mailto:${settings.email}` : undefined,
    telephone: settings.phone || undefined,
    address: settings.location
      ? {
          "@type": "PostalAddress",
          addressLocality: settings.location,
        }
      : undefined,
    knowsAbout: [
      "Cinematography",
      "Directing",
      "Film Editing",
      "Color Grading",
      "Commercial Production",
      "Music Videos",
      "Post-Production",
    ],
    priceRange: "$$$",
  };
}

/**
 * Builds Schema.org WebSite structured data.
 */
export function buildWebsiteSchema(settings: SiteSettingsView, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/${locale}`,
    name: settings.brandName || "Raid VISION",
    description: settings.seoDescription || settings.shortIntro,
    inLanguage: locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-US",
    publisher: {
      "@id": `${siteUrl}/#identity`,
    },
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; path?: string }>,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path ? `${siteUrl}/${locale}${item.path}` : `${siteUrl}/${locale}`,
    })),
  };
}

/**
 * Builds Schema.org VideoObject structured data.
 */
export function buildVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  contentUrl,
  embedUrl,
  uploadDate,
}: {
  name: string;
  description?: string;
  thumbnailUrl?: string | null;
  contentUrl?: string | null;
  embedUrl?: string | null;
  uploadDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: description || name,
    thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : [`${siteUrl}/favicon.ico`],
    uploadDate: uploadDate || new Date().toISOString(),
    contentUrl: contentUrl || undefined,
    embedUrl: embedUrl || undefined,
  };
}

/**
 * Builds Schema.org CreativeWork / Movie structured data for project case studies.
 */
export function buildProjectSchema(
  project: ProjectDetailView,
  locale: string,
  thumbnailUrl?: string | null,
) {
  const genres = project.categories?.map((c) => c.name) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.seoTitle || project.title,
    description: project.seoDescription || project.summary || project.title,
    url: `${siteUrl}/${locale}/work/${project.slug}`,
    image: thumbnailUrl || undefined,
    dateCreated: project.year ? `${project.year}-01-01` : undefined,
    datePublished: project.publishedAt || undefined,
    genre: genres.length > 0 ? genres : undefined,
    creator: {
      "@id": `${siteUrl}/#identity`,
    },
    author: {
      "@id": `${siteUrl}/#identity`,
    },
    ...(project.clientName ? { sponsor: { "@type": "Organization", name: project.clientName } } : {}),
  };
}

/**
 * Builds Schema.org OfferCatalog structured data for services and pricing packages.
 */
export function buildServiceCatalogSchema(services: ServiceView[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Filmmaking & Video Production",
    provider: {
      "@id": `${siteUrl}/#identity`,
    },
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Video Production Services",
      itemListElement: services.map((service) => ({
        "@type": "OfferCatalog",
        name: service.name,
        description: service.shortDescription || service.description,
        itemListElement: service.packages
          .filter((pkg) => pkg.active)
          .map((pkg) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: pkg.name,
              description: pkg.description,
            },
            price: pkg.price !== null ? pkg.price : undefined,
            priceCurrency: pkg.currency || service.currency || "USD",
            url: `${siteUrl}/${locale}/services#${service.slug}`,
          })),
      })),
    },
  };
}
