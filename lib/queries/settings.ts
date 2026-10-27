import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow, SiteSettingsView } from "@/types/content";
import { AVAILABILITY_STATUSES, type AvailabilityStatus } from "@/types/content";
import { logQueryError } from "./errors";

/** Fallbacks keep the site presentable before the owner saves settings once. */
const DEFAULTS: SiteSettingsView = {
  brandName: "Raid VISION",
  ownerName: "Raid",
  tagline: "",
  shortIntro: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  whatsappUrl: "",
  social: { instagram: null, youtube: null, vimeo: null, tiktok: null },
  heroVideoPath: null,
  heroPosterPath: null,
  showreelVideoPath: null,
  showreelPosterPath: null,
  availabilityStatus: "available",
  defaultCurrency: "DZD",
  seoTitle: "",
  seoDescription: "",
};

/** Single-row configuration, localized. Deduplicated per request. */
export const getSiteSettings = cache(
  async (locale: string): Promise<SiteSettingsView> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();

    if (error) {
      logQueryError("getSiteSettings", error);
      return DEFAULTS;
    }

    if (!data) return DEFAULTS;

    const row = data as SiteSettingsRow;

    return {
      brandName: row.brand_name || DEFAULTS.brandName,
      ownerName: row.owner_name ?? "",
      tagline: getLocalizedValue(row.tagline_i18n, locale),
      shortIntro: getLocalizedValue(row.short_intro_i18n, locale),
      bio: getLocalizedValue(row.bio_i18n, locale),
      location: getLocalizedValue(row.location_i18n, locale),
      email: row.email ?? "",
      phone: row.phone ?? "",
      whatsappUrl: row.whatsapp_url ?? "",
      social: {
        instagram: row.instagram_url,
        youtube: row.youtube_url,
        vimeo: row.vimeo_url,
        tiktok: row.tiktok_url,
      },
      heroVideoPath: row.hero_video_path,
      heroPosterPath: row.hero_poster_path,
      showreelVideoPath: row.showreel_video_path,
      showreelPosterPath: row.showreel_poster_path,
      availabilityStatus: AVAILABILITY_STATUSES.includes(
        row.availability_status as AvailabilityStatus,
      )
        ? (row.availability_status as AvailabilityStatus)
        : "available",
      defaultCurrency: row.default_currency || DEFAULTS.defaultCurrency,
      seoTitle: getLocalizedValue(row.seo_title_i18n, locale),
      seoDescription: getLocalizedValue(row.seo_description_i18n, locale),
    };
  },
);

/** Raw row for the admin settings form, where all locales must be editable. */
export const getRawSiteSettings = cache(async (): Promise<SiteSettingsRow | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error) {
    logQueryError("getRawSiteSettings", error);
    return null;
  }

  return (data as SiteSettingsRow | null) ?? null;
});

/** Every storage path referenced by site settings, used by the media library. */
export async function getSiteMediaPaths(): Promise<string[]> {
  const row = await getRawSiteSettings();
  if (!row) return [];

  return [
    row.hero_video_path,
    row.hero_poster_path,
    row.showreel_video_path,
    row.showreel_poster_path,
  ].filter((value): value is string => Boolean(value));
}

export { DEFAULTS as SITE_SETTINGS_DEFAULTS };