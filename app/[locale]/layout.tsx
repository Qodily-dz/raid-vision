import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSiteSettings } from "@/lib/queries/settings";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { siteUrl } from "@/lib/utils";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import { fontVariables } from "@/lib/fonts";
import { SEO_KEYWORDS, ROBOTS_DIRECTIVES, buildAlternateLanguages } from "@/lib/seo/metadata";
import { buildPersonAndBusinessSchema, buildWebsiteSchema } from "@/lib/seo/json-ld";
import JsonLd from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);
  const settings = await getSiteSettings(locale);
  const ogImage = getPublicMediaUrl(settings.heroPosterPath);

  const title = settings.seoTitle || `${settings.brandName} — ${dict.home.frames[0]}`;
  const description =
    settings.seoDescription ||
    settings.shortIntro ||
    `${settings.ownerName} — filmmaker, video editor and visual storyteller.`;

  const canonical = `${siteUrl}/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${settings.brandName}`,
    },
    description,
    keywords: SEO_KEYWORDS,
    authors: [{ name: settings.ownerName || settings.brandName, url: siteUrl }],
    creator: settings.ownerName || settings.brandName,
    publisher: settings.brandName,
    category: "Filmmaking & Video Production",
    applicationName: settings.brandName,
    alternates: {
      canonical,
      languages: buildAlternateLanguages(""),
    },
    robots: ROBOTS_DIRECTIVES,
    openGraph: {
      type: "website",
      siteName: settings.brandName,
      title,
      description,
      url: canonical,
      locale: dict.htmlLang,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // An unknown prefix is not a page: send the visitor to a real locale.
  if (!isLocale(locale)) {
    redirect(`/${DEFAULT_LOCALE}`);
  }

  const dict = getDictionary(locale);
  const settings = await getSiteSettings(locale);
  const personSchema = buildPersonAndBusinessSchema(settings, locale);
  const websiteSchema = buildWebsiteSchema(settings, locale);

  return (
    <html lang={dict.htmlLang} dir={dict.dir} className={fontVariables}>
      <head>
        <JsonLd schema={personSchema} />
        <JsonLd schema={websiteSchema} />
      </head>
      <body className="min-h-dvh bg-black text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-violet focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          {dict.skipToContent}
        </a>

        <div className="flex min-h-dvh flex-col">
          <SiteHeader locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} settings={settings} />
        </div>
      </body>
    </html>
  );
}