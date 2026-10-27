export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that render right-to-left. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

export const LOCALE_COOKIE = "raid_locale";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Reading direction for a locale. Arabic is RTL, French and English are LTR. */
export function getDirection(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";
}

export function localePath(locale: Locale, path = "") {
  const clean = path.replace(/^\/+/, "");
  return `/${locale}${clean ? `/${clean}` : ""}`;
}

/** Swaps the locale segment of the current pathname, preserving the rest. */
export function switchLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${nextLocale}`;
  if (isLocale(segments[0])) segments[0] = nextLocale;
  else segments.unshift(nextLocale);
  return `/${segments.join("/")}`;
}