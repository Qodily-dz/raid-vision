import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, CategoryView } from "@/types/content";
import { logQueryError } from "./errors";

/** Active categories, ordered as the owner arranged them. Deduplicated per request. */
export const getCategories = cache(
  async (locale: string): Promise<CategoryView[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name_i18n, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true });

    if (error) {
      logQueryError("getCategories", error);
      return [];
    }

    return ((data ?? []) as Pick<CategoryRow, "id" | "slug" | "name_i18n">[]).map(
      (row): CategoryView => ({
        id: row.id,
        slug: row.slug,
        name: getLocalizedValue(row.name_i18n, locale),
      }),
    );
  },
);

/**
 * Category slug -> id map, used to resolve the public `?category=` filter into
 * the join table without trusting the visitor with raw ids.
 */
export const getCategoryIdBySlug = cache(
  async (): Promise<Record<string, string>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug")
      .eq("active", true);

    if (error) {
      logQueryError("getCategoryIdBySlug", error);
      return {};
    }

    return Object.fromEntries(
      ((data ?? []) as { id: string; slug: string }[]).map((row) => [
        row.slug,
        row.id,
      ]),
    );
  },
);

export async function getCategoryBySlug(slug: string): Promise<CategoryView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_i18n")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    logQueryError("getCategoryBySlug", error);
    return null;
  }

  if (!data) return null;

  const row = data as Pick<CategoryRow, "id" | "slug" | "name_i18n">;
  return { id: row.id, slug: row.slug, name: getLocalizedValue(row.name_i18n, "en") };
}