"use client";

import type { CategoryRow } from "@/types/content";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/lib/actions/categories";
import FormShell from "./form-shell";
import I18nField from "./i18n-field";
import AdminActionForm from "./action-form";
import { AdminPanel } from "./primitives";

function i18nRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

export default function CategoryForm({ category }: { category?: CategoryRow | null }) {
  const editing = Boolean(category);
  return (
    <FormShell action={editing ? updateCategoryAction : createCategoryAction} redirectTo="/admin/categories" submitLabel={editing ? "Save category" : "Create category"} aside={editing ? <AdminActionForm action={deleteCategoryAction} fields={{ id: category!.id }} label="Delete category" tone="danger" confirm="Delete this category? Projects will lose this classification." /> : <span className="text-xs text-ink-faint">Name and slug are required.</span>}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <AdminPanel title="Category" description="Use a short label that helps visitors scan the archive.">
          <div className="flex flex-col gap-6">
            <I18nField name="name" label="Name" value={i18nRecord(category?.name_i18n)} required maxLength={80} />
            <label className="flex flex-col gap-2"><span className="kicker">Slug</span><input name="slug" className="input" defaultValue={category?.slug ?? ""} placeholder="music-videos" required maxLength={80} /></label>
          </div>
        </AdminPanel>
        <AdminPanel title="Visibility" description="Inactive categories stay out of public filters.">
          <div className="flex flex-col gap-5">
            <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="active" type="checkbox" defaultChecked={category?.active ?? true} className="h-4 w-4 accent-violet" /> Active</label>
            <label className="flex flex-col gap-2"><span className="kicker">Sort order</span><input name="sortOrder" type="number" min={0} className="input" defaultValue={category?.sort_order ?? 0} /></label>
          </div>
        </AdminPanel>
      </div>
    </FormShell>
  );
}
