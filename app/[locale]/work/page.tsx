import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getPublishedProjects } from "@/lib/queries/projects";
import { getCategories } from "@/lib/queries/categories";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import ProjectBrowser from "@/components/projects/project-browser";

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
    title: dict.work.title,
    description: dict.work.intro,
    alternates: {
      canonical: `${siteUrl}/${locale}/work`,
      languages: buildAlternateLanguages("/work"),
    },
    openGraph: {
      title: dict.work.title,
      description: dict.work.intro,
      url: `${siteUrl}/${locale}/work`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.work.title,
      description: dict.work.intro,
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [projects, categories] = await Promise.all([
    getPublishedProjects(locale),
    getCategories(locale),
  ]);

  const breadcrumbs = buildBreadcrumbSchema(
    [
      { name: dict.nav.home, path: "" },
      { name: dict.work.title, path: "/work" },
    ],
    locale,
  );

  return (
    <>
      <JsonLd schema={breadcrumbs} />

      <PageHeader
        number="01"
        kicker={dict.nav.work}
        title={dict.work.title}
        intro={dict.work.intro}
      />

      <section className="shell-wide pb-24">
        <ProjectBrowser projects={projects} categories={categories} locale={locale} />
      </section>
    </>
  );
}