"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { LOCALES } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { AVAILABILITY_STATUSES, type AvailabilityStatus } from "@/types/content";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const optional = (value: string): string | null => (value ? value.slice(0, 2000) : null);

function collectI18n(formData: FormData, field: string, max = 20000): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of LOCALES) {
    const value = str(formData, `${field}_${locale}`);
    if (value) result[locale] = value.slice(0, max);
  }
  return result;
}

/** Only http(s) links are accepted so the admin UI never renders `javascript:`. */
function safeLink(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isSafeEmail(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) ? trimmed : null;
}

/** Updates the single `raid_db.site_settings` row. */
export async function updateSiteSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const brandName = str(formData, "brandName").slice(0, 120);
  if (!brandName) return fail("required", { brandName: true });

  const availabilityRaw = str(formData, "availabilityStatus");
  const availabilityStatus = AVAILABILITY_STATUSES.includes(
    availabilityRaw as AvailabilityStatus,
  )
    ? (availabilityRaw as AvailabilityStatus)
    : "available";

  const email = str(formData, "email");
  if (email && !isSafeEmail(email)) return fail("required", { email: true });

  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      brand_name: brandName,
      owner_name: optional(str(formData, "ownerName")),
      tagline_i18n: collectI18n(formData, "tagline", 400),
      short_intro_i18n: collectI18n(formData, "shortIntro", 2000),
      bio_i18n: collectI18n(formData, "bio"),
      location_i18n: collectI18n(formData, "location", 400),
      email: isSafeEmail(email),
      phone: optional(str(formData, "phone")),
      whatsapp_url: safeLink(str(formData, "whatsappUrl")),
      instagram_url: safeLink(str(formData, "instagramUrl")),
      youtube_url: safeLink(str(formData, "youtubeUrl")),
      vimeo_url: safeLink(str(formData, "vimeoUrl")),
      tiktok_url: safeLink(str(formData, "tiktokUrl")),
      hero_video_path: optional(str(formData, "heroVideoPath")),
      hero_poster_path: optional(str(formData, "heroPosterPath")),
      showreel_video_path: optional(str(formData, "showreelVideoPath")),
      showreel_poster_path: optional(str(formData, "showreelPosterPath")),
      availability_status: availabilityStatus,
      default_currency: (str(formData, "defaultCurrency") || "DZD").toUpperCase().slice(0, 8),
      seo_title_i18n: collectI18n(formData, "seoTitle", 200),
      seo_description_i18n: collectI18n(formData, "seoDescription", 400),
    })
    .eq("singleton", true);

  if (error) {
    console.error("[raid-vision] updateSiteSettings:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok();
}