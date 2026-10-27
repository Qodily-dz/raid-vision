"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { LOCALES } from "@/lib/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import { isUuid, slugify } from "@/lib/validation/slug";
import { PRICE_TYPES, type PriceType } from "@/types/content";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const bool = (formData: FormData, key: string) =>
  formData.get(key) === "on" || formData.get(key) === "true";

const intOrZero = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

function collectI18n(formData: FormData, field: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of LOCALES) {
    const value = str(formData, `${field}_${locale}`);
    if (value) result[locale] = value.slice(0, 6000);
  }
  return result;
}

function parsePriceType(value: string): PriceType {
  return PRICE_TYPES.includes(value as PriceType) ? (value as PriceType) : "custom_quote";
}

function parsePrice(value: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(/[\s,]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100) / 100;
}

type ServiceFields = {
  slug: string;
  name_i18n: Record<string, string>;
  short_description_i18n: Record<string, string>;
  description_i18n: Record<string, string>;
  price_type: PriceType;
  price: number | null;
  max_price: number | null;
  currency: string;
  unit_i18n: Record<string, string>;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

function readServiceFields(formData: FormData): ServiceFields {
  return {
    slug: slugify(str(formData, "slug")),
    name_i18n: collectI18n(formData, "name"),
    short_description_i18n: collectI18n(formData, "shortDescription"),
    description_i18n: collectI18n(formData, "description"),
    price_type: parsePriceType(str(formData, "priceType")),
    price: parsePrice(str(formData, "price")),
    max_price: parsePrice(str(formData, "maxPrice")),
    currency: (str(formData, "currency") || "DZD").toUpperCase().slice(0, 8),
    unit_i18n: collectI18n(formData, "unit"),
    featured: bool(formData, "featured"),
    active: bool(formData, "active"),
    sort_order: intOrZero(str(formData, "sortOrder")),
  };
}

function validate(fields: ServiceFields): Record<string, true> | null {
  const errors: Record<string, true> = {};

  if (!getLocalizedValue(fields.name_i18n, "en") && !Object.keys(fields.name_i18n).length) {
    errors.name = true;
  }
  if (!fields.slug) errors.slug = true;
  if (fields.price_type === "range" && (fields.price === null || fields.max_price === null)) {
    errors.price = true;
  }
  if (
    fields.price !== null &&
    fields.max_price !== null &&
    fields.max_price < fields.price
  ) {
    errors.maxPrice = true;
  }

  return Object.keys(errors).length ? errors : null;
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const fields = readServiceFields(formData);
  const errors = validate(fields);
  if (errors) return fail("required", errors);

  const supabase = await createClient();

  const { data: clash } = await supabase
    .from("services")
    .select("id")
    .eq("slug", fields.slug)
    .maybeSingle();

  if (clash) return fail("slugTaken", { slug: true });

  const { data, error } = await supabase
    .from("services")
    .insert(fields)
    .select("id")
    .single();

  if (error) {
    console.error("[raid-vision] createService:", error);
    return fail("error");
  }

  await replaceFeatures(data.id, formData);
  await replacePackages(data.id, formData);

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "created", redirectTo: "/admin/services" });
}

export async function updateServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const fields = readServiceFields(formData);
  const errors = validate(fields);
  if (errors) return fail("required", errors);

  const supabase = await createClient();

  const { data: clash } = await supabase
    .from("services")
    .select("id")
    .eq("slug", fields.slug)
    .neq("id", id)
    .maybeSingle();

  if (clash) return fail("slugTaken", { slug: true });

  const { error } = await supabase.from("services").update(fields).eq("id", id);

  if (error) {
    console.error("[raid-vision] updateService:", error);
    return fail("error");
  }

  await replaceFeatures(id, formData);
  await replacePackages(id, formData);

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

export async function deleteServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) return fail("error");

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted" });
}

export async function reorderServicesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const direction = str(formData, "direction");
  if (!isUuid(id) || (direction !== "up" && direction !== "down")) return fail("error");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
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
      .from("services")
      .update({ sort_order: position })
      .eq("id", rowId);
    if (updateError) return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}

/* -------------------------------------------------------------------------- */
/* Deliverables and packages                                                  */
/* -------------------------------------------------------------------------- */

/** Features and packages are edited as repeated form rows in one submission. */
async function replaceFeatures(serviceId: string, formData: FormData) {
  const supabase = await createClient();
  const labels = formData.getAll("feature").map((value) => String(value).trim()).filter(Boolean);

  const { data: current } = await supabase
    .from("service_features")
    .select("id")
    .eq("service_id", serviceId);

  const currentIds = ((current ?? []) as { id: string }[]).map((row) => row.id);

  if (currentIds.length) {
    await supabase.from("service_features").delete().eq("service_id", serviceId);
  }

  if (labels.length === 0) return;

  await supabase.from("service_features").insert(
    labels.map((label, index) => ({
      service_id: serviceId,
      label_i18n: { en: label },
      sort_order: index,
    })),
  );
}

async function replacePackages(serviceId: string, formData: FormData) {
  const supabase = await createClient();

  const names = formData.getAll("packageName").map((value) => String(value).trim());
  const descriptions = formData.getAll("packageDescription").map((value) =>
    String(value).trim(),
  );
  const prices = formData.getAll("packagePrice").map((value) => String(value).trim());
  const featured = formData.getAll("packageFeatured").map((value) => String(value));

  const rows = names
    .map((name, index) => ({ name, index }))
    .filter((row) => row.name)
    .map((row) => ({
      service_id: serviceId,
      name_i18n: { en: row.name },
      description_i18n: {
        en: descriptions[row.index] ?? "",
      },
      price: parsePrice(prices[row.index] ?? ""),
      currency: (str(formData, "currency") || "DZD").toUpperCase().slice(0, 8),
      featured: featured[row.index] === "on",
      active: true,
      sort_order: row.index,
    }));

  const { data: current } = await supabase
    .from("service_packages")
    .select("id")
    .eq("service_id", serviceId);

  const currentIds = ((current ?? []) as { id: string }[]).map((row) => row.id);
  if (currentIds.length) {
    await supabase.from("service_packages").delete().eq("service_id", serviceId);
  }

  if (rows.length) await supabase.from("service_packages").insert(rows);
}