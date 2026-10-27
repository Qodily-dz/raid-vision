import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type {
  ServiceFeatureRow,
  ServicePackageRow,
  ServiceRow,
  ServiceView,
} from "@/types/content";
import { PRICE_TYPES, type PriceType } from "@/types/content";
import { logQueryError } from "./errors";

const SERVICE_COLUMNS =
  "id, slug, name_i18n, short_description_i18n, description_i18n, price_type, price, max_price, currency, unit_i18n, featured, active, sort_order" as const;

type ServiceSelect = Pick<
  ServiceRow,
  | "id"
  | "slug"
  | "name_i18n"
  | "short_description_i18n"
  | "description_i18n"
  | "price_type"
  | "price"
  | "max_price"
  | "currency"
  | "unit_i18n"
  | "featured"
  | "active"
  | "sort_order"
>;

type ServiceExtras = {
  features: ServiceFeatureRow[];
  packages: ServicePackageRow[];
};

async function loadExtras(serviceIds: string[]): Promise<Map<string, ServiceExtras>> {
  const result = new Map<string, ServiceExtras>();
  if (serviceIds.length === 0) return result;

  for (const id of serviceIds) {
    result.set(id, { features: [], packages: [] });
  }

  const supabase = await createClient();

  const [features, packages] = await Promise.all([
    supabase
      .from("service_features")
      .select("*")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("service_packages")
      .select("*")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
  ]);

  if (features.error) logQueryError("loadExtras.features", features.error);
  if (packages.error) logQueryError("loadExtras.packages", packages.error);

  for (const row of (features.data ?? []) as ServiceFeatureRow[]) {
    result.get(row.service_id)?.features.push(row);
  }

  for (const row of (packages.data ?? []) as ServicePackageRow[]) {
    result.get(row.service_id)?.packages.push(row);
  }

  return result;
}

function toView(
  row: ServiceSelect,
  locale: string,
  extras: ServiceExtras | undefined,
): ServiceView {
  return {
    id: row.id,
    slug: row.slug,
    name: getLocalizedValue(row.name_i18n, locale),
    shortDescription: getLocalizedValue(row.short_description_i18n, locale),
    description: getLocalizedValue(row.description_i18n, locale),
    priceType: PRICE_TYPES.includes(row.price_type as PriceType)
      ? (row.price_type as PriceType)
      : "custom_quote",
    price: row.price,
    maxPrice: row.max_price,
    currency: row.currency,
    unit: getLocalizedValue(row.unit_i18n, locale),
    featured: row.featured,
    active: row.active,
    sortOrder: row.sort_order,
    features: (extras?.features ?? []).map((feature) => ({
      id: feature.id,
      label: getLocalizedValue(feature.label_i18n, locale),
      sortOrder: feature.sort_order,
    })),
    packages: (extras?.packages ?? []).map((item) => ({
      id: item.id,
      name: getLocalizedValue(item.name_i18n, locale),
      description: getLocalizedValue(item.description_i18n, locale),
      price: item.price,
      currency: item.currency,
      featured: item.featured,
      active: item.active,
      sortOrder: item.sort_order,
    })),
  };
}

/** Active services for the public site. */
export async function getServices(locale: string): Promise<ServiceView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    logQueryError("getServices", error);
    return [];
  }

  const rows = (data ?? []) as ServiceSelect[];
  if (rows.length === 0) return [];

  const extras = await loadExtras(rows.map((row) => row.id));
  return rows.map((row) => toView(row, locale, extras.get(row.id)));
}

export async function getServiceBySlug(
  locale: string,
  slug: string,
): Promise<ServiceView | null> {
  const services = await getServices(locale);
  return services.find((service) => service.slug === slug) ?? null;
}

/** Lightweight list for the contact form's service selector. */
export async function getServiceOptions(
  locale: string,
): Promise<{ id: string; name: string }[]> {
  const services = await getServices(locale);
  return services.map((service) => ({ id: service.id, name: service.name }));
}

/** All services for the admin editor, including hidden ones. */
export const getAdminServices = cache(
  async (locale = "en"): Promise<ServiceView[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .select(SERVICE_COLUMNS)
      .order("sort_order", { ascending: true });

    if (error) {
      logQueryError("getAdminServices", error);
      return [];
    }

    const rows = (data ?? []) as ServiceSelect[];
    if (rows.length === 0) return [];

    const extras = await loadExtras(rows.map((row) => row.id));
    return rows.map((row) => toView(row, locale, extras.get(row.id)));
  },
);

export async function getAdminService(id: string): Promise<ServiceRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();

  if (error) {
    logQueryError("getAdminService", error);
    return null;
  }

  return (data as ServiceRow | null) ?? null;
}