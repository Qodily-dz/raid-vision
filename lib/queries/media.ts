import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/media/storage";
import { logQueryError } from "./errors";

export type MediaObject = {
  name: string;
  size: number | null;
  updatedAt: string | null;
  folder: string;
};

/**
 * Lists objects in the `raid-media` bucket. Storage RLS allows this only for an
 * authenticated administrator.
 */
export async function listMediaObjects(limit = 300): Promise<MediaObject[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list("", { limit, sortBy: { column: "updated_at", order: "desc" } });

  if (error) {
    logQueryError("listMediaObjects", error);
    return [];
  }

  const topLevel = (data ?? []).filter((entry) => entry.id);

  // Projects live one folder deeper, so list the known folders too.
  const folders = topLevel
    .filter((entry) => entry.id && !entry.name.includes("."))
    .map((entry) => entry.name);

  const nested = await Promise.all(
    folders.map(async (folder) => {
      const result = await supabase.storage.from(MEDIA_BUCKET).list(folder, { limit });
      if (result.error) {
        logQueryError(`listMediaObjects.${folder}`, result.error);
        return [];
      }
      return (result.data ?? [])
        .filter((entry) => entry.id)
        .map((entry) => ({ ...entry, path: `${folder}/${entry.name}` }));
    }),
  );

  const files = [
    ...topLevel
      .filter((entry) => entry.name.includes("."))
      .map((entry) => ({ ...entry, path: entry.name })),
    ...nested.flat(),
  ];

  return files
    .map((file) => ({
      name: file.path,
      size: file.metadata?.size ?? null,
      updatedAt: file.updated_at ?? null,
      folder: file.path.split("/")[0] ?? "",
    }))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

/** Every storage path currently referenced anywhere in the CMS. */
export async function getReferencedMediaPaths(): Promise<Set<string>> {
  const supabase = await createClient();

  const [projects, media, gallery, settings] = await Promise.all([
    supabase.from("projects").select("cover_media_path, cover_poster_path"),
    supabase.from("project_media").select("storage_path, poster_path"),
    supabase.from("gallery_items").select("storage_path, poster_path"),
    supabase.from("site_settings").select(
      "hero_video_path, hero_poster_path, showreel_video_path, showreel_poster_path",
    ),
  ]);

  const referenced = new Set<string>();

  for (const row of projects.data ?? []) {
    const value = row as { cover_media_path: string | null; cover_poster_path: string | null };
    if (value.cover_media_path) referenced.add(value.cover_media_path);
    if (value.cover_poster_path) referenced.add(value.cover_poster_path);
  }

  for (const row of media.data ?? []) {
    const value = row as { storage_path: string | null; poster_path: string | null };
    if (value.storage_path) referenced.add(value.storage_path);
    if (value.poster_path) referenced.add(value.poster_path);
  }

  for (const row of gallery.data ?? []) {
    const value = row as { storage_path: string | null; poster_path: string | null };
    if (value.storage_path) referenced.add(value.storage_path);
    if (value.poster_path) referenced.add(value.poster_path);
  }

  const settingsRow = (settings.data ?? [])[0] as
    | {
        hero_video_path: string | null;
        hero_poster_path: string | null;
        showreel_video_path: string | null;
        showreel_poster_path: string | null;
      }
    | undefined;

  if (settingsRow) {
    for (const value of Object.values(settingsRow)) {
      if (value) referenced.add(value);
    }
  }

  return referenced;
}