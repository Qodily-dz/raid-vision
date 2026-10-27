import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getGalleryItems } from "@/lib/queries/gallery";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import GalleryBrowser from "@/components/gallery/gallery-browser";

import { buildAlternateLanguages } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLd from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return {
    title: dict.gallery.title,
    description: dict.gallery.intro,
    alternates: {
      canonical: `${siteUrl}/${locale}/gallery`,
      languages: buildAlternateLanguages("/gallery"),
    },
    openGraph: {
      title: dict.gallery.title,
      description: dict.gallery.intro,
      url: `${siteUrl}/${locale}/gallery`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.gallery.title,
      description: dict.gallery.intro,
    },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const items = await getGalleryItems(locale);

  const breadcrumbs = buildBreadcrumbSchema(
    [
      { name: dict.nav.home, path: "" },
      { name: dict.gallery.title, path: "/gallery" },
    ],
    locale,
  );

  return (
    <>
      <JsonLd schema={breadcrumbs} />

      <PageHeader
        number="02"
        kicker={dict.nav.gallery}
        title={dict.gallery.title}
        intro={dict.gallery.intro}
      />

      <section className="shell-wide py-16 sm:py-24">
        <GalleryBrowser items={items} locale={locale} />
      </section>
    </>
  );
}