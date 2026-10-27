export const MEDIA_BUCKET = "raid-media";

export const MEDIA_FOLDERS = {
  site: "site",
  projects: "projects",
  gallery: "gallery",
  services: "services",
} as const;

/**
 * Builds the public URL for an object in the `raid-media` bucket.
 *
 * Records store relative paths (for example `projects/<id>/cover.jpg`) so the
 * storage host is never hardcoded in the database.
 */
export function getPublicMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "";

  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export function isExternalMedia(value: string | null | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

/** Strips characters that are awkward in URLs or on disk. */
export function slugifyFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Builds a collision-proof storage path inside the given folder.
 * The original filename is kept for readability in the media library.
 */
export function buildStoragePath(
  folder: string,
  filename: string,
  id?: string,
): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot > -1 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = slugifyFilename(dot > -1 ? filename.slice(0, dot) : filename) || "file";
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  const parts = [folder];
  if (id) parts.push(id);
  parts.push(`${base}-${unique}${ext ? `.${ext}` : ""}`);

  return parts.join("/");
}