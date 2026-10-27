/**
 * Values stored in `*_i18n` JSONB columns follow `{ "en": "...", "fr": "...", "ar": "..." }`.
 *
 * Resolution order: requested locale -> English -> first non-empty translation.
 */
export type I18nValue = string | null | undefined;

export function getLocalizedValue(
  field: unknown,
  locale: string,
): string {
  if (typeof field === "string") return field;
  if (!field || typeof field !== "object" || Array.isArray(field)) return "";

  const record = field as Record<string, unknown>;
  const pick = (key: string): string => {
    const value = record[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const requested = pick(locale);
  if (requested) return requested;

  const english = pick("en");
  if (english) return english;

  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

/** True when at least one translation exists for the field. */
export function hasTranslation(field: unknown): boolean {
  if (typeof field === "string") return field.trim().length > 0;
  if (!field || typeof field !== "object" || Array.isArray(field)) return false;
  return Object.values(field as Record<string, unknown>).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

/** Returns only the `{ en, fr, ar }` keys that actually carry content. */
export function toI18nObject(value: string): Record<string, string> {
  const trimmed = value.trim();
  return trimmed ? { en: trimmed } : {};
}

export function mergeI18n(
  existing: unknown,
  locale: string,
  value: string,
): Record<string, string> {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, string>) }
      : {};

  const trimmed = value.trim();
  if (trimmed) base[locale] = trimmed;
  else delete base[locale];

  return base;
}