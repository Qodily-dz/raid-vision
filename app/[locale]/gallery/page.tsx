import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getGalleryItems } from "@/lib/queries/gallery";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import GalleryBrowser from "@/components/gallery/gallery-browser";

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
    alternates: { canonical: `${siteUrl}/${locale}/gallery` },
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

  return (
    <>
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