"use client";

import { useState } from "react";
import type { ServiceFeatureRow, ServicePackageRow, ServiceRow } from "@/types/content";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "@/lib/actions/services";
import FormShell from "./form-shell";
import I18nField from "./i18n-field";
import AdminActionForm from "./action-form";
import { AdminPanel } from "./primitives";

function i18nRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

type FeatureDraft = { key: string; label: string };
type PackageDraft = { key: string; name: string; description: string; price: string; featured: boolean };

function featureDrafts(rows: ServiceFeatureRow[]): FeatureDraft[] {
  return rows.map((row) => ({ key: row.id, label: i18nRecord(row.label_i18n).en ?? "" }));
}

function packageDrafts(rows: ServicePackageRow[]): PackageDraft[] {
  return rows.map((row) => ({
    key: row.id,
    name: i18nRecord(row.name_i18n).en ?? "",
    description: i18nRecord(row.description_i18n).en ?? "",
    price: row.price === null ? "" : String(row.price),
    featured: row.featured,
  }));
}

export default function ServiceForm({
  service,
  features = [],
  packages = [],
}: {
  service?: ServiceRow | null;
  features?: ServiceFeatureRow[];
  packages?: ServicePackageRow[];
}) {
  const editing = Boolean(service);
  const action = editing ? updateServiceAction : createServiceAction;
  const [featureRows, setFeatureRows] = useState<FeatureDraft[]>(() => featureDrafts(features));
  const [packageRows, setPackageRows] = useState<PackageDraft[]>(() => packageDrafts(packages));

  return (
    <FormShell
      action={action}
      redirectTo="/admin/services"
      submitLabel={editing ? "Save service" : "Create service"}
      aside={
        editing ? (
          <AdminActionForm
            action={deleteServiceAction}
            fields={{ id: service!.id }}
            label="Delete service"
            tone="danger"
            confirm="Delete this service and its packages? This cannot be undone."
          />
        ) : (
          <span className="text-xs text-ink-faint">English name and slug are required.</span>
        )
      }
    >
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <AdminPanel title="Offer" description="Make the service easy to understand before visitors compare prices.">
            <div className="flex flex-col gap-6">
              <I18nField name="name" label="Service name" value={i18nRecord(service?.name_i18n)} required maxLength={160} />
              <I18nField name="shortDescription" label="Short description" value={i18nRecord(service?.short_description_i18n)} multiline rows={3} maxLength={500} />
              <I18nField name="description" label="Full description" value={i18nRecord(service?.description_i18n)} multiline rows={6} maxLength={3000} />
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="kicker">Slug</span>
                  <input name="slug" className="input" defaultValue={service?.slug ?? ""} placeholder="creative-direction" required maxLength={120} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="kicker">Sort order</span>
                  <input name="sortOrder" type="number" min={0} className="input" defaultValue={service?.sort_order ?? 0} />
                </label>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Deliverables"
            description="The concrete things a client receives from this service."
            actions={<button type="button" className="btn btn-outline" onClick={() => setFeatureRows((rows) => [...rows, { key: crypto.randomUUID(), label: "" }])}>Add deliverable</button>}
          >
            <div className="flex flex-col gap-3">
              {featureRows.length === 0 ? <p className="text-sm text-ink-faint">No deliverables added yet.</p> : null}
              {featureRows.map((row, index) => (
                <div key={row.key} className="flex items-center gap-3">
                  <span className="font-mono text-[0.65rem] text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
                  <input name="feature" className="input" value={row.label} onChange={(event) => setFeatureRows((rows) => rows.map((item) => item.key === row.key ? { ...item, label: event.target.value } : item))} placeholder="Creative direction and treatment" />
                  <button type="button" className="btn btn-outline shrink-0" onClick={() => setFeatureRows((rows) => rows.filter((item) => item.key !== row.key))}>Remove</button>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Packages"
            description="Optional tiers that give clients a clearer starting point."
            actions={<button type="button" className="btn btn-outline" onClick={() => setPackageRows((rows) => [...rows, { key: crypto.randomUUID(), name: "", description: "", price: "", featured: false }])}>Add package</button>}
          >
            <div className="flex flex-col gap-5">
              {packageRows.length === 0 ? <p className="text-sm text-ink-faint">No packages added yet.</p> : null}
              {packageRows.map((row, index) => (
                <div key={row.key} className="border-s border-ink/15 ps-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="kicker text-violet">Package {index + 1}</span>
                    <button type="button" className="btn btn-outline" onClick={() => setPackageRows((rows) => rows.filter((item) => item.key !== row.key))}>Remove</button>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2"><span className="kicker">Name</span><input name="packageName" className="input" value={row.name} onChange={(event) => setPackageRows((rows) => rows.map((item) => item.key === row.key ? { ...item, name: event.target.value } : item))} placeholder="Essential edit" /></label>
                    <label className="flex flex-col gap-2"><span className="kicker">Price</span><input name="packagePrice" className="input" inputMode="decimal" value={row.price} onChange={(event) => setPackageRows((rows) => rows.map((item) => item.key === row.key ? { ...item, price: event.target.value } : item))} placeholder="45000" /></label>
                    <label className="flex flex-col gap-2 sm:col-span-2"><span className="kicker">Description</span><textarea name="packageDescription" className="textarea" rows={3} value={row.description} onChange={(event) => setPackageRows((rows) => rows.map((item) => item.key === row.key ? { ...item, description: event.target.value } : item))} placeholder="A focused package for a single deliverable." /></label>
                    <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="packageFeatured" value={String(index)} type="checkbox" checked={row.featured} onChange={(event) => setPackageRows((rows) => rows.map((item) => item.key === row.key ? { ...item, featured: event.target.checked } : item))} className="h-4 w-4 accent-violet" /> Feature this package</label>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPanel title="Pricing" description="Be clear about how clients should read the number. ">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2"><span className="kicker">Price type</span><select name="priceType" className="select" defaultValue={service?.price_type ?? "custom_quote"}><option value="fixed">Fixed price</option><option value="from">Starting from</option><option value="range">Price range</option><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="custom_quote">Custom quote</option></select></label>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <label className="flex flex-col gap-2"><span className="kicker">Price</span><input name="price" className="input" inputMode="decimal" defaultValue={service?.price ?? ""} placeholder="0" /></label>
                <label className="flex flex-col gap-2"><span className="kicker">Maximum price</span><input name="maxPrice" className="input" inputMode="decimal" defaultValue={service?.max_price ?? ""} placeholder="Optional" /></label>
              </div>
              <label className="flex flex-col gap-2"><span className="kicker">Currency</span><input name="currency" className="input" defaultValue={service?.currency ?? "DZD"} maxLength={8} /></label>
              <I18nField name="unit" label="Unit label" value={i18nRecord(service?.unit_i18n)} hint="Examples: per project, per day, per deliverable." maxLength={80} />
            </div>
          </AdminPanel>

          <AdminPanel title="Visibility" description="Control where this service appears. ">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="active" type="checkbox" defaultChecked={service?.active ?? true} className="h-4 w-4 accent-violet" /> Show on the public site</label>
              <label className="flex items-center gap-3 text-sm text-ink-dim"><input name="featured" type="checkbox" defaultChecked={service?.featured ?? false} className="h-4 w-4 accent-violet" /> Feature in the service highlights</label>
            </div>
          </AdminPanel>
        </div>
      </div>
    </FormShell>
  );
}
