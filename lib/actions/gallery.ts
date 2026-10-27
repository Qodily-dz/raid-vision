"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { LOCALES } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/slug";
import { GALLERY_ITEM_TYPES, type GalleryItemType } from "@/types/content";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const bool = (formData: FormData, key: string) =>
  formData.get(key) === "on" || formData.get(key) === "true";

const optional = (value: string): string | null => (value ? value : null);

function collectI18n(formData: FormData, field: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of LOCALES) {
    const value = str(formData, `${field}_${locale}`);
    if (value) result[locale] = value.slice(0, 4000);
  }
  return result;
}

function parseItemType(value: string): GalleryItemType {
  return GALLERY_ITEM_TYPES.includes(value as GalleryItemType)
    ? (value as GalleryItemType)
    : "image";
}

/**
 * Instagram permalinks are validated but never fetched: Raid VISION does not
 * scrape Instagram and never asks for account credentials.
 */
function isInstagramPermalink(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return (
      host === "instagram.com" &&
      /\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function createGalleryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const itemType = parseItemType(str(formData, "itemType"));
  const storagePath = optional(str(formData, "storagePath"));
  const posterPath = optional(str(formData, "posterPath"));
  const instagramUrl = optional(str(formData, "instagramUrl"));
  const externalUrl = optional(str(formData, "externalUrl"));

  if (itemType === "instagram" && (!instagramUrl || !isInstagramPermalink(instagramUrl))) {
    return fail("required", { instagramUrl: true });
  }

  if (itemType !== "instagram") {
    if (!storagePath) return fail("required", { storagePath: true });
  }

  if (externalUrl && !isSafeHttpUrl(externalUrl)) {
    return fail("required", { externalUrl: true });
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("gallery_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const top = (last ?? [])[0]?.sort_order;
  const nextOrder = typeof top === "number" ? top + 1 : 0;

  const { error } = await supabase.from("gallery_items").insert({
    item_type: itemType,
    title_i18n: collectI18n(formData, "title"),
    caption_i18n: collectI18n(formData, "caption"),
    storage_path: storagePath,
    poster_path: posterPath,
    instagram_url: itemType === "instagram" ? instagramUrl : null,
    external_url: externalUrl,
    linked_project_id: isUuid(str(formData, "linkedProjectId"))
      ? str(formData, "linkedProjectId")
      : null,
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    sort_order: nextOrder,
  });

  if (error) {
    console.error("[raid-vision] createGalleryItem:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created" });
}

export async function updateGalleryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const itemType = parseItemType(str(formData, "itemType"));
  const storagePath = optional(str(formData, "storagePath"));
  const posterPath = optional(str(formData, "posterPath"));
  const instagramUrl = optional(str(formData, "instagramUrl"));
  const externalUrl = optional(str(formData, "externalUrl"));

  if (itemType === "instagram" && (!instagramUrl || !isInstagramPermalink(instagramUrl))) {
    return fail("required", { instagramUrl: true });
  }

  if (externalUrl && !isSafeHttpUrl(externalUrl)) {
    return fail("required", { externalUrl: true });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("gallery_items")
    .update({
      item_type: itemType,
      title_i18n: collectI18n(formData, "title"),
      caption_i18n: collectI18n(formData, "caption"),
      storage_path: storagePath,
      poster_path: posterPath,
      instagram_url: itemType === "instagram" ? instagramUrl : null,
      external_url: externalUrl,
      linked_project_id: isUuid(str(formData, "linkedProjectId"))
        ? str(formData, "linkedProjectId")
        : null,
      featured: bool(formData, "featured"),
      published: bool(formData, "published"),
    })
    .eq("id", id);

  if (error) {
    console.error("[raid-vision] updateGalleryItem:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

export async function toggleGalleryPublishAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("published")
    .eq("id", id)
    .single();

  if (error || !data) return fail("notFound");

  const next = !data.published;

  const { error: updateError } = await supabase
    .from("gallery_items")
    .update({ published: next })
    .eq("id", id);

  if (updateError) return fail("error");

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: next ? "published" : "unpublished" });
}

export async function deleteGalleryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();

  const { data: row } = await supabase
    .from("gallery_items")
    .select("storage_path, poster_path")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return fail("error");

  if (row) {
    const paths = [row.storage_path, row.poster_path].filter(
      (value): value is string => Boolean(value),
    );
    if (paths.length) await supabase.storage.from("raid-media").remove(paths);
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted" });
}

export async function reorderGalleryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const direction = str(formData, "direction");
  if (!isUuid(id) || (direction !== "up" && direction !== "down")) return fail("error");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("id")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) return fail("error");

  const ids = (data as { id: string }[]).map((row) => row.id);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return ok();

  [ids[index], ids[target]] = [ids[target], ids[index]];

  for (const [position, rowId] of ids.entries()) {
    const { error: updateError } = await supabase
      .from("gallery_items")
      .update({ sort_order: position })
      .eq("id", rowId);
    if (updateError) return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}