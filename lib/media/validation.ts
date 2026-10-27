export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const ALLOWED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
] as const;

/** Mirrors `file_size_limit` on the `raid-media` storage bucket. */
export const MAX_UPLOAD_BYTES = 262_144_000; // 250 MB

export const MAX_IMAGE_BYTES = 15_000_000; // 15 MB
export const MAX_VIDEO_BYTES = 250_000_000; // 250 MB

export type MediaKind = "image" | "video";

export function isImageMime(mime: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function isVideoMime(mime: string): boolean {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

export function isAllowedMime(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function humanFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${
    units[unit]
  }`;
}

export type FileValidationResult =
  | { ok: true; kind: MediaKind }
  | { ok: false; reason: "type" | "size"; limit?: string };

/**
 * Client-side pre-flight check so an obviously unsupported file never leaves the
 * browser. The storage bucket re-validates the same constraints server-side.
 *
 * Returns a machine-readable reason rather than a message: the caller owns the
 * wording, which has to be localized.
 */
export function validateMediaFile(file: {
  type: string;
  size: number;
}): FileValidationResult {
  if (!isAllowedMime(file.type)) {
    return { ok: false, reason: "type" };
  }

  const limit = isVideoMime(file.type) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return { ok: false, reason: "size", limit: humanFileSize(limit) };
  }

  return { ok: true, kind: isVideoMime(file.type) ? "video" : "image" };
}