import { siteUrl } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n/config";

export const SEO_KEYWORDS = [
  "Raid VISION",
  "Filmmaker",
  "Director of Photography",
  "Video Production",
  "Cinematography",
  "Commercial Video",
  "Music Video Director",
  "Documentary Film",
  "Film Editing",
  "Color Grading",
  "Post-Production",
  "Creative Direction",
  "Visual Storyteller",
  "Algeria Filmmaker",
  "صانع أفلام",
  "إخراج سينمائي",
  "إنتاج مرئي",
  "تصوير سينمائي",
  "مونتاج فيديو",
  "Réalisateur",
  "Directeur de la Photographie",
  "Production Vidéo",
  "Étalonnage",
];

export const ROBOTS_DIRECTIVES = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
  },
};

/**
 * Builds standard multilingual hreflang alternates for a given path.
 *
 * @param path - subpath beginning with '/' (e.g. '/work' or '/work/music-video') or empty string '' for homepage
 */
export function buildAlternateLanguages(path: string = ""): Record<string, string> {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    languages[locale] = `${siteUrl}/${locale}${cleanPath}`;
  }

  // English serves as the fallback default for any other locale.
  languages["x-default"] = `${siteUrl}/en${cleanPath}`;

  return languages;
}
