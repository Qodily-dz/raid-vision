"use client";

import { useState } from "react";
import type { ProjectMediaRow, ProjectSectionRow } from "@/types/content";
import { ASPECT_RATIOS, MEDIA_TYPES, PROJECT_SECTION_TYPES } from "@/types/content";
import { createMediaAction, deleteMediaAction, moveMediaAction, updateMediaAction } from "@/lib/actions/projects";
import { createSectionAction, deleteSectionAction, moveSectionAction, updateSectionAction } from "@/lib/actions/projects";
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

function label(value: string) {
  return value.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function SectionForm({ projectId, section }: { projectId: string; section?: ProjectSectionRow }) {
  const editing = Boolean(section);
  const action = editing ? updateSectionAction : createSectionAction;

  return (
    <FormShell action={action} submitLabel={editing ? "Save section" : "Add section"} className="border border-ink/10 bg-ink/[0.02] p-5" aside={section ? <AdminActionForm action={deleteSectionAction} fields={{ id: section.id }} label="Delete" tone="danger" confirm="Delete this section? This cannot be undone." /> : <span className="text-xs text-ink-faint">Add the structure before the polish.</span>}>
      <input type="hidden" name={editing ? "id" : "projectId"} value={editing ? section!.id : projectId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2"><span className="kicker">Section type</span><select name="sectionType" className="select" defaultValue={section?.section_type ?? "overview"}>{PROJECT_SECTION_TYPES.map((type) => <option key={type} value={type}>{label(type)}</option>)}</select></label>
      </div>
      <I18nField name="heading" label="Heading" value={i18nRecord(section?.heading_i18n)} maxLength={160} />
      <I18nField name="body" label="Body" value={i18nRecord(section?.body_i18n)} multiline rows={7} maxLength={10000} />
    </FormShell>
  );
}

function ProjectMediaForm({ projectId, media }: { projectId: string; media?: ProjectMediaRow }) {
  const editing = Boolean(media);
  const [mediaType, setMediaType] = useState<(typeof MEDIA_TYPES)[number]>(
    MEDIA_TYPES.includes(media?.media_type as (typeof MEDIA_TYPES)[number])
      ? (media?.media_type as (typeof MEDIA_TYPES)[number])
      : "image",
  );
  const action = editing ? updateMediaAction : createMediaAction;

  return (
    <FormShell action={action} submitLabel={editing ? "Save media" : "Add media"} className="border border-ink/10 bg-ink/[0.02] p-5" aside={media ? <AdminActionForm action={deleteMediaAction} fields={{ id: media.id }} label="Delete" tone="danger" confirm="Delete this media block and its uploaded file? This cannot be undone." /> : <span className="text-xs text-ink-faint">Add a supporting frame, clip or embed.</span>}>
      <input type="hidden" name={editing ? "id" : "projectId"} value={editing ? media!.id : projectId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2"><span className="kicker">Media type</span><select name="mediaType" className="select" value={mediaType} onChange={(event) => setMediaType(event.target.value as (typeof MEDIA_TYPES)[number])}><option value="image">Image</option><option value="video">Video</option><option value="external_video">External video</option></select></label>
        <label className="flex flex-col gap-2"><span className="kicker">Aspect ratio</span><select name="aspectRatio" className="select" defaultValue={media?.aspect_ratio ?? "16:9"}>{ASPECT_RATIOS.map((ratio) => <option key={ratio} value={ratio}>{ratio}</option>)}</select></label>
      </div>
      {mediaType === "external_video" ? <label className="flex flex-col gap-2"><span className="kicker">Video URL</span><input name="externalUrl" type="url" className="input" defaultValue={media?.external_url ?? ""} placeholder="https://www.youtube.com/..." required /></label> : <MediaField name="storagePath" label="Media file" value={media?.storage_path} posterName={mediaType === "video" ? "posterPath" : undefined} posterValue={media?.poster_path} folder={`projects/${projectId}`} accept={mediaType === "video" ? "video" : "image"} />}
      <I18nField name="alt" label="Alt text" value={i18nRecord(media?.alt_i18n)} maxLength={180} />
      <I18nField name="caption" label="Caption" value={i18nRecord(media?.caption_i18n)} multiline rows={3} maxLength={500} />
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="autoplay" type="checkbox" defaultChecked={media?.autoplay ?? false} className="h-4 w-4 accent-violet" /> Autoplay</label>
        <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="muted" type="checkbox" defaultChecked={media?.muted ?? true} className="h-4 w-4 accent-violet" /> Muted</label>
        <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="loop" type="checkbox" defaultChecked={media?.loop ?? true} className="h-4 w-4 accent-violet" /> Loop</label>
        <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="featured" type="checkbox" defaultChecked={media?.featured ?? false} className="h-4 w-4 accent-violet" /> Feature this block</label>
      </div>
    </FormShell>
  );
}

export default function ProjectContentEditor({ projectId, sections, media }: { projectId: string; sections: ProjectSectionRow[]; media: ProjectMediaRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <AdminPanel title="Case study sections" description="Build the narrative behind the project. Each section can be translated and reordered.">
        <div className="flex flex-col gap-5">
          <SectionForm projectId={projectId} />
          {sections.map((section, index) => <div key={section.id} className="flex flex-col gap-3"><SectionForm projectId={projectId} section={section} /><div className="flex gap-2"><AdminActionForm action={moveSectionAction} fields={{ id: section.id, projectId, direction: "up" }} label="Move up" className={index === 0 ? "hidden" : undefined} /><AdminActionForm action={moveSectionAction} fields={{ id: section.id, projectId, direction: "down" }} label="Move down" className={index === sections.length - 1 ? "hidden" : undefined} /></div></div>)}
        </div>
      </AdminPanel>

      <AdminPanel title="Supporting media" description="Add the frames, clips and embeds that make the case study feel complete.">
        <div className="flex flex-col gap-5">
          <ProjectMediaForm projectId={projectId} />
          {media.map((item, index) => <div key={item.id} className="flex flex-col gap-3"><ProjectMediaForm projectId={projectId} media={item} /><div className="flex gap-2"><AdminActionForm action={moveMediaAction} fields={{ id: item.id, projectId, direction: "up" }} label="Move up" className={index === 0 ? "hidden" : undefined} /><AdminActionForm action={moveMediaAction} fields={{ id: item.id, projectId, direction: "down" }} label="Move down" className={index === media.length - 1 ? "hidden" : undefined} /></div></div>)}
        </div>
      </AdminPanel>
    </div>
  );
}
