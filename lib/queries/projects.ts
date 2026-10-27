import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type {
  ProjectMediaRow,
  ProjectRow,
  ProjectSectionRow,
} from "@/types/content";
import {
  ASPECT_RATIOS,
  MEDIA_TYPES,
  PROJECT_SECTION_TYPES,
  PROJECT_STATUSES,
  type AspectRatio,
  type MediaType,
  type ProjectCardView,
  type ProjectDetailView,
  type ProjectMediaView,
  type ProjectSectionType,
  type ProjectSectionView,
  type ProjectStatus,
} from "@/types/content";
import { getCategories } from "./categories";
import { logQueryError } from "./errors";

const PROJECT_COLUMNS =
  "id, slug, title_i18n, summary_i18n, client_name, year, cover_type, cover_media_path, cover_poster_path, status, featured, sort_order, published_at, updated_at" as const;

const MEDIA_COLUMNS =
  "id, project_id, media_type, storage_path, poster_path, external_url, alt_i18n, caption_i18n, aspect_ratio, autoplay, muted, loop, featured, sort_order" as const;

const SECTION_COLUMNS =
  "id, project_id, section_type, heading_i18n, body_i18n, metadata, sort_order" as const;

type ProjectSelect = Pick<
  ProjectRow,
  | "id"
  | "slug"
  | "title_i18n"
  | "summary_i18n"
  | "client_name"
  | "year"
  | "cover_type"
  | "cover_media_path"
  | "cover_poster_path"
  | "status"
  | "featured"
  | "sort_order"
  | "published_at"
  | "updated_at"
>;

type CategoryLink = { project_id: string; category_id: string };

/** Groups category ids by project id so cards can be assembled with one extra query. */
async function getCategoryLinks(
  projectIds: string[],
): Promise<Map<string, string[]>> {
  const grouped = new Map<string, string[]>();
  if (projectIds.length === 0) return grouped;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_categories")
    .select("project_id, category_id")
    .in("project_id", projectIds);

  if (error) {
    logQueryError("getCategoryLinks", error);
    return grouped;
  }

  for (const link of (data ?? []) as CategoryLink[]) {
    const list = grouped.get(link.project_id);
    if (list) list.push(link.category_id);
    else grouped.set(link.project_id, [link.category_id]);
  }

  return grouped;
}

function toCard(row: ProjectSelect, locale: string): ProjectCardView {
  return {
    id: row.id,
    slug: row.slug,
    title: getLocalizedValue(row.title_i18n, locale),
    summary: getLocalizedValue(row.summary_i18n, locale),
    clientName: row.client_name,
    year: row.year,
    coverType: row.cover_type,
    coverMediaPath: row.cover_media_path,
    coverPosterPath: row.cover_poster_path,
    status: PROJECT_STATUSES.includes(row.status as ProjectStatus)
      ? (row.status as ProjectStatus)
      : "draft",
    featured: row.featured,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    categories: [],
  };
}

/**
 * Cards are assembled from two queries rather than a PostgREST embed: it keeps
 * the SQL obvious and the types exact, and the number of round trips is two
 * regardless of how many projects are on screen.
 */
async function buildCards(
  rows: ProjectSelect[],
  locale: string,
  categoryIndex: Map<string, { slug: string; name: string }>,
): Promise<ProjectCardView[]> {
  const links = await getCategoryLinks(rows.map((row) => row.id));

  return rows.map((row) => {
    const ids = links.get(row.id) ?? [];

    return {
      ...toCard(row, locale),
      categories: ids
        .map((id) => {
          const category = categoryIndex.get(id);
          return category ? { id, slug: category.slug, name: category.name } : null;
        })
        .filter(
          (value): value is { id: string; slug: string; name: string } => Boolean(value),
        ),
    };
  });
}

async function loadCategoryIndex(
  locale: string,
): Promise<Map<string, { slug: string; name: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_i18n");

  if (error) {
    logQueryError("loadCategoryIndex", error);
    return new Map();
  }

  return new Map(
    ((data ?? []) as { id: string; slug: string; name_i18n: unknown }[]).map(
      (row) => [row.id, { slug: row.slug, name: getLocalizedValue(row.name_i18n, locale) }],
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* Public queries — Row Level Security already hides drafts and archived work */
/* -------------------------------------------------------------------------- */

export async function getPublishedProjects(
  locale: string,
): Promise<ProjectCardView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    logQueryError("getPublishedProjects", error);
    return [];
  }

  const rows = (data ?? []) as ProjectSelect[];
  if (rows.length === 0) return [];

  return buildCards(rows, locale, await loadCategoryIndex(locale));
}

export async function getFeaturedProjects(
  locale: string,
  limit = 4,
): Promise<ProjectCardView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("status", "published")
    .eq("featured", true)
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    logQueryError("getFeaturedProjects", error);
    return [];
  }

  const rows = (data ?? []) as ProjectSelect[];
  if (rows.length === 0) return [];

  return buildCards(rows, locale, await loadCategoryIndex(locale));
}

/** Single published project with its case-study sections and media. */
export async function getProjectBySlug(
  locale: string,
  slug: string,
): Promise<ProjectDetailView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_COLUMNS}, seo_title_i18n, seo_description_i18n`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    logQueryError("getProjectBySlug", error);
    return null;
  }

  if (!data) return null;

  const row = data as ProjectSelect & {
    seo_title_i18n: unknown;
    seo_description_i18n: unknown;
  };

  const [sections, media, categoryIndex] = await Promise.all([
    getProjectSections(locale, row.id),
    getProjectMedia(locale, row.id),
    loadCategoryIndex(locale),
  ]);

  const categoryIds = (await getCategoryLinks([row.id])).get(row.id) ?? [];

  const card: ProjectCardView = {
    id: row.id,
    slug: row.slug,
    title: getLocalizedValue(row.title_i18n, locale),
    summary: getLocalizedValue(row.summary_i18n, locale),
    clientName: row.client_name,
    year: row.year,
    coverType: row.cover_type,
    coverMediaPath: row.cover_media_path,
    coverPosterPath: row.cover_poster_path,
    status: PROJECT_STATUSES.includes(row.status as ProjectStatus)
      ? (row.status as ProjectStatus)
      : "draft",
    featured: row.featured,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    categories: categoryIds
      .map((id) => {
        const category = categoryIndex.get(id);
        return category ? { id, slug: category.slug, name: category.name } : null;
      })
      .filter((value): value is { id: string; slug: string; name: string } =>
        Boolean(value),
      ),
  };

  return {
    ...card,
    seoTitle: getLocalizedValue(row.seo_title_i18n, locale),
    seoDescription: getLocalizedValue(row.seo_description_i18n, locale),
    sections,
    media,
    storagePaths: [
      row.cover_media_path,
      row.cover_poster_path,
      ...media.flatMap((item) => [item.storagePath, item.posterPath]),
    ].filter((value): value is string => Boolean(value)),
  };
}

export async function getProjectSections(
  locale: string,
  projectId: string,
): Promise<ProjectSectionView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_sections")
    .select(SECTION_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    logQueryError("getProjectSections", error);
    return [];
  }

  return ((data ?? []) as Pick<
    ProjectSectionRow,
    "id" | "section_type" | "heading_i18n" | "body_i18n" | "metadata" | "sort_order"
  >[]).map((row): ProjectSectionView => {
    const type = PROJECT_SECTION_TYPES.includes(
      row.section_type as ProjectSectionType,
    )
      ? (row.section_type as ProjectSectionType)
      : "custom";

    const metadata =
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};

    return {
      id: row.id,
      sectionType: type,
      heading: getLocalizedValue(row.heading_i18n, locale),
      body: getLocalizedValue(row.body_i18n, locale),
      metadata,
      sortOrder: row.sort_order,
    };
  });
}

export async function getProjectMedia(
  locale: string,
  projectId: string,
): Promise<ProjectMediaView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_media")
    .select(MEDIA_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    logQueryError("getProjectMedia", error);
    return [];
  }

  return ((data ?? []) as Pick<
    ProjectMediaRow,
    | "id"
    | "media_type"
    | "storage_path"
    | "poster_path"
    | "external_url"
    | "alt_i18n"
    | "caption_i18n"
    | "aspect_ratio"
    | "autoplay"
    | "muted"
    | "loop"
    | "featured"
    | "sort_order"
  >[]).map((row): ProjectMediaView => {
    const mediaType = MEDIA_TYPES.includes(row.media_type as MediaType)
      ? (row.media_type as MediaType)
      : "image";
    const aspectRatio = ASPECT_RATIOS.includes(row.aspect_ratio as AspectRatio)
      ? (row.aspect_ratio as AspectRatio)
      : "16:9";

    return {
      id: row.id,
      mediaType,
      storagePath: row.storage_path,
      posterPath: row.poster_path,
      externalUrl: row.external_url,
      alt: getLocalizedValue(row.alt_i18n, locale),
      caption: getLocalizedValue(row.caption_i18n, locale),
      aspectRatio,
      autoplay: row.autoplay,
      muted: row.muted,
      loop: row.loop,
      featured: row.featured,
      sortOrder: row.sort_order,
    };
  });
}

/**
 * The next published project in sort order, used at the bottom of a case study.
 */
export async function getNextProject(
  locale: string,
  currentSlug: string,
): Promise<ProjectCardView | null> {
  const projects = await getPublishedProjects(locale);
  if (projects.length < 2) return null;

  const index = projects.findIndex((project) => project.slug === currentSlug);
  if (index === -1) return projects[0];

  return projects[(index + 1) % projects.length];
}

/** Related work: same first category, excluding the current project. */
export async function getRelatedProjects(
  locale: string,
  project: ProjectCardView,
  limit = 3,
): Promise<ProjectCardView[]> {
  const projects = await getPublishedProjects(locale);
  const slug = project.categories[0]?.slug;

  if (slug) {
    const sameCategory = projects.filter(
      (candidate) =>
        candidate.slug !== project.slug &&
        candidate.categories.some((category) => category.slug === slug),
    );
    if (sameCategory.length > 0) return sameCategory.slice(0, limit);
  }

  return projects.filter((candidate) => candidate.slug !== project.slug).slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Admin queries — require an authenticated active administrator              */
/* -------------------------------------------------------------------------- */

export type AdminProjectRow = ProjectRow & {
  categories: { id: string; slug: string; name: string }[];
};

export const getAdminProjects = cache(async (): Promise<ProjectCardView[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    logQueryError("getAdminProjects", error);
    return [];
  }

  const rows = (data ?? []) as ProjectSelect[];
  if (rows.length === 0) return [];

  return buildCards(rows, "en", await loadCategoryIndex("en"));
});

export async function getAdminProject(id: string): Promise<ProjectRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("getAdminProject", error);
    return null;
  }

  return (data as ProjectRow | null) ?? null;
}

export async function getAdminProjectSections(
  projectId: string,
): Promise<ProjectSectionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    logQueryError("getAdminProjectSections", error);
    return [];
  }

  return (data ?? []) as ProjectSectionRow[];
}

export async function getAdminProjectMedia(
  projectId: string,
): Promise<ProjectMediaRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    logQueryError("getAdminProjectMedia", error);
    return [];
  }

  return (data ?? []) as ProjectMediaRow[];
}

export async function getAdminProjectCategoryIds(
  projectId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_categories")
    .select("category_id")
    .eq("project_id", projectId);

  if (error) {
    logQueryError("getAdminProjectCategoryIds", error);
    return [];
  }

  return ((data ?? []) as { category_id: string }[]).map((row) => row.category_id);
}

/** Every category including inactive ones, for the admin filter editor. */
export async function getAllCategories(locale = "en") {
  return getCategories(locale);
}

export async function getProjectStoragePaths(projectId: string): Promise<string[]> {
  const [media, project] = await Promise.all([
    getAdminProjectMedia(projectId),
    getAdminProject(projectId),
  ]);

  return [
    project?.cover_media_path,
    project?.cover_poster_path,
    ...media.flatMap((item) => [item.storage_path, item.poster_path]),
  ].filter((value): value is string => Boolean(value));
}