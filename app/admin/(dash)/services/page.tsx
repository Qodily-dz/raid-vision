import { getAdminServices } from "@/lib/queries/services";
import { formatPrice } from "@/components/services/service-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const services = await getAdminServices("en");
  const dict = getDictionary("en");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Services" subtitle="Shape the offer around clear outcomes, deliverables and pricing." />
      {services.length === 0 ? (
        <AdminEmpty title="No services yet" body="Create the service packages that should appear in the enquiry flow." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="admin-card">
              <div className="flex items-start justify-between gap-4">
                <div><p className="kicker text-ink-faint">{service.slug}</p><h2 className="display mt-2 text-3xl">{service.name}</h2></div>
                <AdminBadge tone={service.active ? "good" : "neutral"}>{service.active ? "Active" : "Hidden"}</AdminBadge>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">{service.shortDescription || "No short description"}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-faint">
                <span>{formatPrice(service, dict) ?? "On request"}</span>
                <span>{service.features.length} deliverables</span>
                <span>{service.packages.length} packages</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
