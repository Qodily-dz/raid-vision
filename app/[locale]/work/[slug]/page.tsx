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

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const project = await getProjectBySlug(locale, slug);

  if (!project) {
    return { title: getDictionary(locale).project.missing };
  }

  const cover = getPublicMediaUrl(project.coverPosterPath);
  const canonical = `${siteUrl}/${locale}/work/${project.slug}`;

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      url: canonical,
      images: cover ? [{ url: cover, width: 1200, height: 630 }] : undefined,
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

  const project = await getProjectBySlug(locale, slug);

  // A draft or archived project is invisible to anonymous visitors through RLS,
  // so this 404 is the same answer whether the slug never existed or is hidden.
  if (!project) notFound();

  const [nextProject, related] = await Promise.all([
    getNextProject(locale, slug),
    getRelatedProjects(locale, project),
  ]);

  return <CaseStudy project={project} locale={locale} nextProject={nextProject} related={related} />;
}
