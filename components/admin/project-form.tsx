"use client";

import { useState } from "react";
import type { ProjectRow } from "@/types/content";
import type { CategoryView } from "@/types/content";
import { createProjectAction, updateProjectAction } from "@/lib/actions/projects";
import FormShell from "./form-shell";
import I18nField from "./i18n-field";
import MediaField from "./media-field";
import { AdminPanel } from "./primitives";

function i18nRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function dateTimeInput(value: string | null | undefined): string {
  return value ? value.slice(0, 16) : "";
}

export default function ProjectForm({
  project,
  categories,
  categoryIds = [],
}: {
  project?: ProjectRow | null;
  categories: CategoryView[];
  categoryIds?: string[];
}) {
  const isEditing = Boolean(project);
  const action = isEditing ? updateProjectAction : createProjectAction;
  const [coverType, setCoverType] = useState<"image" | "video">(
    project?.cover_type === "video" ? "video" : "image",
  );

  return (
    <FormShell
      action={action}
      redirectTo="/admin/projects"
      submitLabel={isEditing ? "Save project" : "Create project"}
      aside={
        <span className="text-xs text-ink-faint">
          Required: English title. Translations can be added before publishing.
        </span>
      }
    >
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <AdminPanel title="Identity" description="The information visitors see first.">
            <div className="flex flex-col gap-6">
              <I18nField
                name="title"
                label="Project title"
                value={i18nRecord(project?.title_i18n)}
                required
                maxLength={160}
              />
              <I18nField
                name="summary"
                label="Short summary"
                value={i18nRecord(project?.summary_i18n)}
                multiline
                rows={4}
                maxLength={800}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="kicker">Slug</span>
                  <input
                    name="slug"
                    className="input"
                    defaultValue={project?.slug ?? ""}
                    placeholder="project-name"
                    maxLength={120}
                  />
                  <span className="text-xs text-ink-faint">Leave blank to generate it from the English title.</span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="kicker">Client / artist</span>
                  <input
                    name="clientName"
                    className="input"
                    defaultValue={project?.client_name ?? ""}
                    maxLength={160}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="kicker">Year</span>
                  <input
                    name="year"
                    type="number"
                    min={1990}
                    max={2100}
                    className="input"
                    defaultValue={project?.year ?? ""}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="kicker">Sort order</span>
                  <input
                    name="sortOrder"
                    type="number"
                    min={0}
                    className="input"
                    defaultValue={project?.sort_order ?? 0}
                  />
                </label>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Cover media" description="Give the project one strong opening frame.">
            <div className="flex flex-col gap-8">
              <label className="flex max-w-sm flex-col gap-2">
                <span className="kicker">Cover type</span>
                <select
                  name="coverType"
                  className="select"
                  value={coverType}
                  onChange={(event) => setCoverType(event.target.value as "image" | "video")}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>

              <MediaField
                name="coverMediaPath"
                label="Cover file"
                value={project?.cover_media_path}
                folder={project ? `projects/${project.id}` : "projects"}
                accept={coverType}
                posterName="coverPosterPath"
                posterValue={project?.cover_poster_path}
                hint="Use a still that reads well at both desktop and mobile widths."
              />
            </div>
          </AdminPanel>

          <AdminPanel title="Search preview" description="Optional metadata for search and sharing.">
            <div className="flex flex-col gap-6">
              <I18nField
                name="seoTitle"
                label="SEO title"
                value={i18nRecord(project?.seo_title_i18n)}
                maxLength={160}
              />
              <I18nField
                name="seoDescription"
                label="SEO description"
                value={i18nRecord(project?.seo_description_i18n)}
                multiline
                rows={3}
                maxLength={320}
              />
            </div>
          </AdminPanel>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPanel title="Publishing" description="Drafts stay private until you are ready.">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="kicker">Status</span>
                <select name="status" className="select" defaultValue={project?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm text-ink-dim">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={project?.featured ?? false}
                  className="h-4 w-4 accent-violet"
                />
                Feature on the homepage
              </label>

              <label className="flex flex-col gap-2">
                <span className="kicker">Publish date</span>
                <input
                  name="publishedAt"
                  type="datetime-local"
                  className="input"
                  defaultValue={dateTimeInput(project?.published_at)}
                />
              </label>
            </div>
          </AdminPanel>

          <AdminPanel title="Categories" description="Use categories to help people scan the archive.">
            {categories.length > 0 ? (
              <div className="flex flex-col gap-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 text-sm text-ink-dim">
                    <input
                      name="categoryIds"
                      value={category.id}
                      type="checkbox"
                      defaultChecked={categoryIds.includes(category.id)}
                      className="h-4 w-4 accent-violet"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-faint">Add categories in Supabase before assigning them here.</p>
            )}
          </AdminPanel>

          <AdminPanel title="Next layer" description="The project editor is ready for sections and media blocks next.">
            <p className="text-sm leading-relaxed text-ink-dim">
              Add the cover first, then build the case study with a brief, process, credits and supporting media.
            </p>
          </AdminPanel>
        </div>
      </div>
    </FormShell>
  );
}
