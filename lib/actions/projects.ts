"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { LOCALES } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { isUuid, slugify } from "@/lib/validation/slug";
import {
  ASPECT_RATIOS,
  MEDIA_TYPES,
  PROJECT_SECTION_TYPES,
  PROJECT_STATUSES,
  type AspectRatio,
  type MediaType,
  type ProjectSectionType,
  type ProjectStatus,
} from "@/types/content";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

/* -------------------------------------------------------------------------- */
/* Parsing helpers — every value coming from the browser is re-validated       */
/* -------------------------------------------------------------------------- */

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const bool = (formData: FormData, key: string) =>
  formData.get(key) === "on" || formData.get(key) === "true";

const optional = (value: string): string | null => (value ? value : null);

const intOrZero = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

function collectI18n(formData: FormData, field: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of LOCALES) {
    const value = str(formData, `${field}_${locale}`);
    if (value) result[locale] = value.slice(0, 8000);
  }
  return result;
}

function parseStatus(value: string): ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : "draft";
}

function parseSectionType(value: string): ProjectSectionType {
  return PROJECT_SECTION_TYPES.includes(value as ProjectSectionType)
    ? (value as ProjectSectionType)
    : "custom";
}

function parseMediaType(value: string): MediaType {
  return MEDIA_TYPES.includes(value as MediaType) ? (value as MediaType) : "image";
}

function parseAspect(value: string): AspectRatio {
  return ASPECT_RATIOS.includes(value as AspectRatio) ? (value as AspectRatio) : "16:9";
}

function parseYear(value: string): number | null {
  if (!value) return null;
  const year = Number.parseInt(value, 10);
  if (!Number.isFinite(year) || year < 1990 || year > 2100) return null;
  return year;
}

/* -------------------------------------------------------------------------- */
/* Project records                                                            */
/* -------------------------------------------------------------------------- */

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const titleI18n = collectI18n(formData, "title");
  const fallbackTitle = getLocalizedValue(titleI18n, "en");
  const rawSlug = str(formData, "slug");
  const slug = slugify(rawSlug || fallbackTitle);

  if (!fallbackTitle && !Object.keys(titleI18n).length) {
    return fail("required", { title: true });
  }
  if (!slug) return fail("required", { slug: true });

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return fail("slugTaken", { slug: true });

  const status = parseStatus(str(formData, "status"));
  const publishedAtInput = str(formData, "publishedAt");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      slug,
      title_i18n: titleI18n,
      summary_i18n: collectI18n(formData, "summary"),
      client_name: optional(str(formData, "clientName").slice(0, 160)),
      year: parseYear(str(formData, "year")),
      cover_type: str(formData, "coverType") === "video" ? "video" : "image",
      cover_media_path: optional(str(formData, "coverMediaPath")),
      cover_poster_path: optional(str(formData, "coverPosterPath")),
      status,
      featured: bool(formData, "featured"),
      sort_order: intOrZero(str(formData, "sortOrder")),
      seo_title_i18n: collectI18n(formData, "seoTitle"),
      seo_description_i18n: collectI18n(formData, "seoDescription"),
      published_at:
        status === "published"
          ? publishedAtInput || new Date().toISOString()
          : publishedAtInput || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[raid-vision] createProject:", error);
    return fail("error");
  }

  await syncProjectCategories(data.id, formData.getAll("categoryIds").map(String));
  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created", redirectTo: `/admin/projects/${data.id}` });
}

export async function updateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const titleI18n = collectI18n(formData, "title");
  const fallbackTitle = getLocalizedValue(titleI18n, "en");
  const rawSlug = str(formData, "slug");
  const slug = slugify(rawSlug || fallbackTitle);

  if (!fallbackTitle && !Object.keys(titleI18n).length) {
    return fail("required", { title: true });
  }
  if (!slug) return fail("required", { slug: true });

  const supabase = await createClient();

  const { data: clash } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();

  if (clash) return fail("slugTaken", { slug: true });

  const status = parseStatus(str(formData, "status"));
  const publishedAtInput = str(formData, "publishedAt");

  const { error } = await supabase
    .from("projects")
    .update({
      slug,
      title_i18n: titleI18n,
      summary_i18n: collectI18n(formData, "summary"),
      client_name: optional(str(formData, "clientName").slice(0, 160)),
      year: parseYear(str(formData, "year")),
      cover_type: str(formData, "coverType") === "video" ? "video" : "image",
      cover_media_path: optional(str(formData, "coverMediaPath")),
      cover_poster_path: optional(str(formData, "coverPosterPath")),
      status,
      featured: bool(formData, "featured"),
      sort_order: intOrZero(str(formData, "sortOrder")),
      seo_title_i18n: collectI18n(formData, "seoTitle"),
      seo_description_i18n: collectI18n(formData, "seoDescription"),
      published_at:
        status === "published"
          ? publishedAtInput || new Date().toISOString()
          : publishedAtInput || null,
    })
    .eq("id", id);

  if (error) {
    console.error("[raid-vision] updateProject:", error);
    return fail("error");
  }

  await syncProjectCategories(id, formData.getAll("categoryIds").map(String));
  revalidateAdmin();
  revalidatePublic();

  return ok();
}

/**
 * Publishing is deliberately separate from editing: the case study, media and
 * translations are usually finished long before the film goes live.
 */
export async function setProjectStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const status = parseStatus(str(formData, "status"));
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      status,
      published_at:
        status === "published"
          ? new Date().toISOString()
          : undefined,
    })
    .eq("id", id);

  if (error) {
    console.error("[raid-vision] setProjectStatus:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: status === "published" ? "published" : "unpublished" });
}

export async function toggleProjectFeaturedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("featured")
    .eq("id", id)
    .single();

  if (error || !data) return fail("notFound");

  const { error: updateError } = await supabase
    .from("projects")
    .update({ featured: !data.featured })
    .eq("id", id);

  if (updateError) return fail("error");

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

export async function deleteProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("[raid-vision] deleteProject:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted", redirectTo: "/admin/projects" });
}

/** Copies the project record; sections and media are left for the owner to redo. */
export async function duplicateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { data: source, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !source) return fail("notFound");

  const baseSlug = slugify(`${source.slug}-copy`);
  let slug = baseSlug;
  let counter = 2;

  for (;;) {
    const { data: clash } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const { data: created, error: insertError } = await supabase
    .from("projects")
    .insert({
      slug,
      title_i18n: source.title_i18n,
      summary_i18n: source.summary_i18n,
      client_name: source.client_name,
      year: source.year,
      cover_type: source.cover_type,
      cover_media_path: source.cover_media_path,
      cover_poster_path: source.cover_poster_path,
      // A copy always starts unpublished so a half-finished duplicate cannot
      // appear on the public site by accident.
      status: "draft",
      featured: false,
      sort_order: source.sort_order + 1,
      seo_title_i18n: source.seo_title_i18n,
      seo_description_i18n: source.seo_description_i18n,
      published_at: null,
    })
    .select("id")
    .single();

  if (insertError || !created) return fail("error");

  const { data: links } = await supabase
    .from("project_categories")
    .select("category_id")
    .eq("project_id", id);

  if (links?.length) {
    await supabase
      .from("project_categories")
      .insert(links.map((link) => ({ project_id: created.id, category_id: link.category_id })));
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created", redirectTo: `/admin/projects/${created.id}` });
}

/* -------------------------------------------------------------------------- */
/* Ordering, categories                                                       */
/* -------------------------------------------------------------------------- */

export async function reorderProjectsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const direction = str(formData, "direction");
  if (!isUuid(id) || (direction !== "up" && direction !== "down")) return fail("error");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) return fail("error");

  const ids = data.map((row) => row.id as string);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return ok();

  const reordered = [...ids];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  // Two passes of half the rows keeps every pair unique for the unique index on
  // (sort_order) that is not present, so a plain bulk write is safe.
  const updates = reordered.map((projectId, position) => ({
    id: projectId,
    sort_order: position + 1,
  }));

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("projects")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id);

    if (updateError) {
      console.error("[raid-vision] reorderProjects:", updateError);
      return fail("error");
    }
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

async function syncProjectCategories(projectId: string, categoryIds: string[]) {
  const valid = [...new Set(categoryIds.filter(isUuid))];
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("project_categories")
    .select("category_id")
    .eq("project_id", projectId);

  const currentIds = ((current ?? []) as { category_id: string }[]).map(
    (row) => row.category_id,
  );

  const toAdd = valid.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !valid.includes(id));

  if (toAdd.length) {
    await supabase
      .from("project_categories")
      .insert(toAdd.map((category_id) => ({ project_id: projectId, category_id })));
  }

  if (toRemove.length) {
    await supabase
      .from("project_categories")
      .delete()
      .eq("project_id", projectId)
      .in("category_id", toRemove);
  }
}

/* -------------------------------------------------------------------------- */
/* Case study sections                                                        */
/* -------------------------------------------------------------------------- */

export async function createSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const projectId = str(formData, "projectId");
  if (!isUuid(projectId)) return fail("notFound");

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("project_sections")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder =
    ((last ?? [])[0]?.sort_order as number | undefined) !== undefined
      ? ((last ?? [])[0].sort_order as number) + 1
      : 0;

  const { error } = await supabase.from("project_sections").insert({
    project_id: projectId,
    section_type: parseSectionType(str(formData, "sectionType")),
    heading_i18n: collectI18n(formData, "heading"),
    body_i18n: collectI18n(formData, "body"),
    metadata: {},
    sort_order: nextOrder,
  });

  if (error) {
    console.error("[raid-vision] createSection:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created" });
}

export async function updateSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const sectionType = parseSectionType(str(formData, "sectionType"));
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { error } = await supabase
    .from("project_sections")
    .update({
      section_type: sectionType,
      heading_i18n: collectI18n(formData, "heading"),
      body_i18n: collectI18n(formData, "body"),
    })
    .eq("id", id);

  if (error) {
    console.error("[raid-vision] updateSection:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

export async function deleteSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();
  const { error } = await supabase.from("project_sections").delete().eq("id", id);

  if (error) return fail("error");

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted" });
}

export async function moveSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return moveOrdered("project_sections", formData);
}

/* -------------------------------------------------------------------------- */
/* Project media                                                              */
/* -------------------------------------------------------------------------- */

export async function createMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const projectId = str(formData, "projectId");
  if (!isUuid(projectId)) return fail("notFound");

  const mediaType = parseMediaType(str(formData, "mediaType"));
  const storagePath = optional(str(formData, "storagePath"));
  const externalUrl = optional(str(formData, "externalUrl"));

  if (mediaType === "external_video") {
    if (!externalUrl || !/^https?:\/\//i.test(externalUrl)) {
      return fail("required", { externalUrl: true });
    }
  } else if (!storagePath) {
    return fail("required", { storagePath: true });
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("project_media")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const top = (last ?? [])[0]?.sort_order;
  const nextOrder = typeof top === "number" ? top + 1 : 0;

  const { error } = await supabase.from("project_media").insert({
    project_id: projectId,
    media_type: mediaType,
    storage_path: mediaType === "external_video" ? null : storagePath,
    poster_path: optional(str(formData, "posterPath")),
    external_url: mediaType === "external_video" ? externalUrl : null,
    alt_i18n: collectI18n(formData, "alt"),
    caption_i18n: collectI18n(formData, "caption"),
    aspect_ratio: parseAspect(str(formData, "aspectRatio")),
    autoplay: bool(formData, "autoplay") && mediaType !== "image",
    muted: bool(formData, "muted"),
    loop: bool(formData, "loop"),
    featured: bool(formData, "featured"),
    sort_order: nextOrder,
  });

  if (error) {
    console.error("[raid-vision] createMedia:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created" });
}

export async function updateMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const mediaType = parseMediaType(str(formData, "mediaType"));
  const storagePath = optional(str(formData, "storagePath"));
  const externalUrl = optional(str(formData, "externalUrl"));

  if (mediaType === "external_video" && (!externalUrl || !/^https?:\/\//i.test(externalUrl))) {
    return fail("required", { externalUrl: true });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("project_media")
    .update({
      media_type: mediaType,
      storage_path: mediaType === "external_video" ? null : storagePath,
      poster_path: optional(str(formData, "posterPath")),
      external_url: mediaType === "external_video" ? externalUrl : null,
      alt_i18n: collectI18n(formData, "alt"),
      caption_i18n: collectI18n(formData, "caption"),
      aspect_ratio: parseAspect(str(formData, "aspectRatio")),
      autoplay: bool(formData, "autoplay") && mediaType !== "image",
      muted: bool(formData, "muted"),
      loop: bool(formData, "loop"),
      featured: bool(formData, "featured"),
    })
    .eq("id", id);

  if (error) return fail("error");

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

export async function deleteMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  // Remove the files too, otherwise storage fills up with orphans.
  const { data: row } = await supabase
    .from("project_media")
    .select("storage_path, poster_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("project_media").delete().eq("id", id);
  if (error) return fail("error");

  if (row) {
    const paths = [row.storage_path, row.poster_path].filter(
      (value): value is string => Boolean(value),
    );
    if (paths.length) {
      await supabase.storage.from("raid-media").remove(paths);
    }
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted" });
}

export async function moveMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return moveOrdered("project_media", formData);
}

/* -------------------------------------------------------------------------- */
/* Shared ordering helper                                                     */
/* -------------------------------------------------------------------------- */

async function moveOrdered(
  table: "project_sections" | "project_media",
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const projectId = str(formData, "projectId");
  const direction = str(formData, "direction");

  if (!isUuid(id) || !isUuid(projectId)) return fail("notFound");
  if (direction !== "up" && direction !== "down") return fail("error");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return fail("error");

  const ids = (data as { id: string }[]).map((row) => row.id);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return ok();

  [ids[index], ids[target]] = [ids[target], ids[index]];

  for (const [position, rowId] of ids.entries()) {
    const { error: updateError } = await supabase
      .from(table)
      .update({ sort_order: position })
      .eq("id", rowId);

    if (updateError) {
      console.error(`[raid-vision] moveOrdered(${table}):`, updateError);
      return fail("error");
    }
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}