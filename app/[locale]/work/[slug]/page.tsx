import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import {
  getNextProject,
  getProjectBySlug,
  getRelatedProjects,
} from "@/lib/queries/projects";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { siteUrl } from "@/lib/utils";
import CaseStudy from "@/components/projects/case-study";

import { buildAlternateLanguages } from "@/lib/seo/metadata";
import { buildProjectSchema, buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLd from "@/components/seo/json-ld";

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const project = await getProjectBySlug(locale, slug);

  if (!project) {
    return { title: getDictionary(locale).project.missing };
  }

  const cover = getPublicMediaUrl(project.coverPosterPath) || getPublicMediaUrl(project.coverMediaPath);
  const canonical = `${siteUrl}/${locale}/work/${project.slug}`;

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    alternates: {
      canonical,
      languages: buildAlternateLanguages(`/work/${project.slug}`),
    },
    openGraph: {
      type: "article",
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      url: canonical,
      images: cover ? [{ url: cover, width: 1200, height: 630, alt: project.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const project = await getProjectBySlug(locale, slug);

  // A draft or archived project is invisible to anonymous visitors through RLS,
  // so this 404 is the same answer whether the slug never existed or is hidden.
  if (!project) notFound();

  const [nextProject, related] = await Promise.all([
    getNextProject(locale, slug),
    getRelatedProjects(locale, project),
  ]);

  const cover = getPublicMediaUrl(project.coverPosterPath) || getPublicMediaUrl(project.coverMediaPath);
  const projectSchema = buildProjectSchema(project, locale, cover);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { name: dict.nav.home, path: "" },
      { name: dict.nav.work, path: "/work" },
      { name: project.title, path: `/work/${project.slug}` },
    ],
    locale,
  );

  return (
    <>
      <JsonLd schema={projectSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <CaseStudy project={project} locale={locale} nextProject={nextProject} related={related} />
    </>
  );
}
