"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { LOCALES } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { isUuid, slugify } from "@/lib/validation/slug";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const bool = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";

function collectI18n(formData: FormData, field: string): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [`${locale}`, str(formData, `${field}_${locale}`).slice(0, 300)]).filter(([, value]) => value),
  );
}

function readFields(formData: FormData) {
  return {
    slug: slugify(str(formData, "slug")),
    name_i18n: collectI18n(formData, "name"),
    sort_order: Number.parseInt(str(formData, "sortOrder"), 10) || 0,
    active: bool(formData, "active"),
  };
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const fields = readFields(formData);
  if (!fields.slug || Object.keys(fields.name_i18n).length === 0) return fail("required");

  const supabase = await createClient();
  const { data: clash } = await supabase.from("categories").select("id").eq("slug", fields.slug).maybeSingle();
  if (clash) return fail("slugTaken", { slug: true });

  const { error } = await supabase.from("categories").insert(fields);
  if (error) return fail("error");
  revalidateAdmin();
  revalidatePublic();
  return ok({ code: "created", redirectTo: "/admin/categories" });
}

export async function updateCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const id = str(formData, "id");
  const fields = readFields(formData);
  if (!isUuid(id)) return fail("notFound");
  if (!fields.slug || Object.keys(fields.name_i18n).length === 0) return fail("required");

  const supabase = await createClient();
  const { data: clash } = await supabase.from("categories").select("id").eq("slug", fields.slug).neq("id", id).maybeSingle();
  if (clash) return fail("slugTaken", { slug: true });

  const { error } = await supabase.from("categories").update(fields).eq("id", id);
  if (error) return fail("error");
  revalidateAdmin();
  revalidatePublic();
  return ok();
}

export async function deleteCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail("error");
  revalidateAdmin();
  revalidatePublic();
  return ok({ code: "deleted" });
}

export async function reorderCategoriesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const id = str(formData, "id");
  const direction = str(formData, "direction");
  if (!isUuid(id) || (direction !== "up" && direction !== "down")) return fail("error");

  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id").order("sort_order").order("slug");
  if (error || !data?.length) return fail("error");
  const ids = data.map((row) => row.id as string);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return ok();
  [ids[index], ids[target]] = [ids[target], ids[index]];
  for (const [position, categoryId] of ids.entries()) {
    const { error: updateError } = await supabase.from("categories").update({ sort_order: position }).eq("id", categoryId);
    if (updateError) return fail("error");
  }
  revalidateAdmin();
  revalidatePublic();
  return ok();
}
