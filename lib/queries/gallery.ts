import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItemRow, GalleryItemView } from "@/types/content";
import { GALLERY_ITEM_TYPES, type GalleryItemType } from "@/types/content";
import { logQueryError } from "./errors";

const GALLERY_COLUMNS =
  "id, item_type, title_i18n, caption_i18n, storage_path, poster_path, instagram_url, external_url, linked_project_id, featured, published, sort_order, updated_at" as const;

type GallerySelect = Pick<
  GalleryItemRow,
  | "id"
  | "item_type"
  | "title_i18n"
  | "caption_i18n"
  | "storage_path"
  | "poster_path"
  | "instagram_url"
  | "external_url"
  | "linked_project_id"
  | "featured"
  | "published"
  | "sort_order"
  | "updated_at"
>;

function toView(row: GallerySelect, locale: string): GalleryItemView {
  return {
    id: row.id,
    itemType: GALLERY_ITEM_TYPES.includes(row.item_type as GalleryItemType)
      ? (row.item_type as GalleryItemType)
      : "image",
    title: getLocalizedValue(row.title_i18n, locale),
    caption: getLocalizedValue(row.caption_i18n, locale),
    storagePath: row.storage_path,
    posterPath: row.poster_path,
    instagramUrl: row.instagram_url,
    externalUrl: row.external_url,
    linkedProjectId: row.linked_project_id,
    linkedProjectSlug: null,
    linkedProjectTitle: "",
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

/** Fills in the linked project title/slug so gallery cards can link onwards. */
async function attachProjectLinks(items: GalleryItemView[]): Promise<GalleryItemView[]> {
  const ids = [
    ...new Set(items.map((item) => item.linkedProjectId).filter((id): id is string => Boolean(id))),
  ];
  if (ids.length === 0) return items;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title_i18n")
    .in("id", ids);

  if (error) {
    logQueryError("attachProjectLinks", error);
    return items;
  }

  const index = new Map(
    ((data ?? []) as { id: string; slug: string; title_i18n: unknown }[]).map((row) => [
      row.id,
      { slug: row.slug, title: getLocalizedValue(row.title_i18n, "en") },
    ]),
  );

  return items.map((item) => {
    const link = item.linkedProjectId ? index.get(item.linkedProjectId) : undefined;
    return link
      ? { ...item, linkedProjectSlug: link.slug, linkedProjectTitle: link.title }
      : item;
  });
}

/** Published gallery items. RLS hides everything else from anonymous visitors. */
export async function getGalleryItems(
  locale: string,
  options: { limit?: number; featuredOnly?: boolean } = {},
): Promise<GalleryItemView[]> {
  const supabase = await createClient();

  let query = supabase
    .from("gallery_items")
    .select(GALLERY_COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options.featuredOnly) query = query.eq("featured", true);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;

  if (error) {
    logQueryError("getGalleryItems", error);
    return [];
  }

  const items = ((data ?? []) as GallerySelect[]).map((row) => toView(row, locale));
  return attachProjectLinks(items);
}

/** Admin listing: includes drafts, localized in the admin's chosen language. */
export const getAdminGalleryItems = cache(
  async (locale = "en"): Promise<GalleryItemView[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery_items")
      .select(GALLERY_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      logQueryError("getAdminGalleryItems", error);
      return [];
    }

    const items = ((data ?? []) as GallerySelect[]).map((row) => toView(row, locale));
    return attachProjectLinks(items);
  },
);

export async function getAdminGalleryItem(id: string): Promise<GalleryItemRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("getAdminGalleryItem", error);
    return null;
  }

  return (data as GalleryItemRow | null) ?? null;
}

export async function getGalleryStoragePaths(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("storage_path, poster_path");

  if (error) {
    logQueryError("getGalleryStoragePaths", error);
    return [];
  }

  return ((data ?? []) as { storage_path: string | null; poster_path: string | null }[])
    .flatMap((row) => [row.storage_path, row.poster_path])
    .filter((value): value is string => Boolean(value));
}