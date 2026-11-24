"use client";

import { useState } from "react";
import type { GalleryItemRow, ProjectCardView } from "@/types/content";
import { createGalleryItemAction, deleteGalleryItemAction, updateGalleryItemAction } from "@/lib/actions/gallery";
import { GALLERY_ITEM_TYPES } from "@/types/content";
import FormShell from "./form-shell";
import I18nField from "./i18n-field";
import MediaField from "./media-field";
import AdminActionForm from "./action-form";
import { AdminPanel } from "./primitives";

function i18nRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export default function GalleryForm({
  item,
  projects,
}: {
  item?: GalleryItemRow | null;
  projects: ProjectCardView[];
}) {
  const editing = Boolean(item);
  const action = editing ? updateGalleryItemAction : createGalleryItemAction;
  const [itemType, setItemType] = useState<(typeof GALLERY_ITEM_TYPES)[number]>(
    GALLERY_ITEM_TYPES.includes(item?.item_type as (typeof GALLERY_ITEM_TYPES)[number])
      ? (item?.item_type as (typeof GALLERY_ITEM_TYPES)[number])
      : "image",
  );

  return (
    <FormShell
      action={action}
      redirectTo="/admin/gallery"
      submitLabel={editing ? "Save gallery item" : "Create gallery item"}
      aside={
        editing ? (
          <AdminActionForm
            action={deleteGalleryItemAction}
            fields={{ id: item!.id }}
            label="Delete item"
            tone="danger"
            confirm="Delete this gallery item and its uploaded files? This cannot be undone."
          />
        ) : (
          <span className="text-xs text-ink-faint">Images and videos need an uploaded file. Instagram items need a permalink.</span>
        )
      }
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <AdminPanel title="Story" description="Give the visual context without making the caption do too much work.">
            <div className="flex flex-col gap-6">
              <I18nField name="title" label="Title" value={i18nRecord(item?.title_i18n)} maxLength={160} />
              <I18nField name="caption" label="Caption" value={i18nRecord(item?.caption_i18n)} multiline rows={5} maxLength={800} />
              <label className="flex max-w-sm flex-col gap-2"><span className="kicker">Item type</span><select name="itemType" className="select" value={itemType} onChange={(event) => setItemType(event.target.value as (typeof GALLERY_ITEM_TYPES)[number])}><option value="image">Image</option><option value="video">Video</option><option value="instagram">Instagram post or reel</option></select></label>
            </div>
          </AdminPanel>

          <AdminPanel title="Media" description="Store the file in the shared media bucket, or point to a social post.">
            {itemType === "instagram" ? (
              <label className="flex flex-col gap-2"><span className="kicker">Instagram permalink</span><input name="instagramUrl" type="url" className="input" defaultValue={item?.instagram_url ?? ""} placeholder="https://www.instagram.com/p/..." required /></label>
            ) : (
              <MediaField name="storagePath" label={itemType === "video" ? "Video file" : "Image file"} value={item?.storage_path} posterName="posterPath" posterValue={item?.poster_path} folder={item ? `gallery/${item.id}` : "gallery"} accept={itemType === "video" ? "video" : "image"} hint="Use an image with a clear focal point and a video with a poster frame." />
            )}
            <label className="mt-6 flex flex-col gap-2"><span className="kicker">External link <span className="text-ink-faint">(optional)</span></span><input name="externalUrl" type="url" className="input" defaultValue={item?.external_url ?? ""} placeholder="https://..." /></label>
          </AdminPanel>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPanel title="Placement" description="Connect the visual to a case study when it belongs to one.">
            <label className="flex flex-col gap-2"><span className="kicker">Linked project</span><select name="linkedProjectId" className="select" defaultValue={item?.linked_project_id ?? ""}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title || project.slug}</option>)}</select></label>
          </AdminPanel>

          <AdminPanel title="Visibility" description="Keep unfinished items private while you build the notebook.">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="published" type="checkbox" defaultChecked={item?.published ?? false} className="h-4 w-4 accent-violet" /> Show on the public gallery</label>
              <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="featured" type="checkbox" defaultChecked={item?.featured ?? false} className="h-4 w-4 accent-violet" /> Feature in the gallery highlights</label>
            </div>
          </AdminPanel>
        </div>
      </div>
    </FormShell>
  );
}
