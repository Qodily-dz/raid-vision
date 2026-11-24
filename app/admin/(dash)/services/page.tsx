import { getAdminServices } from "@/lib/queries/services";
import { formatPrice } from "@/components/services/service-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";
import Link from "next/link";
import AdminActionForm from "@/components/admin/action-form";
import { reorderServicesAction } from "@/lib/actions/services";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const services = await getAdminServices("en");
  const dict = getDictionary("en");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Services" subtitle="Shape the offer around clear outcomes, deliverables and pricing." actions={<Link href="/admin/services/new" className="btn btn-violet">New service</Link>} />
      {services.length === 0 ? (
        <AdminEmpty title="No services yet" body="Create the service packages that should appear in the enquiry flow." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.id} className="admin-card">
              <div className="flex items-start justify-between gap-4">
                <div><p className="kicker text-ink-faint">{service.slug}</p><h2 className="display mt-2 text-3xl"><Link href={`/admin/services/${service.id}`} className="hover:text-violet">{service.name}</Link></h2></div>
                <AdminBadge tone={service.active ? "good" : "neutral"}>{service.active ? "Active" : "Hidden"}</AdminBadge>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">{service.shortDescription || "No short description"}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-ink-faint">
                <div className="flex flex-wrap items-center gap-4">
                <span>{formatPrice(service, dict) ?? "On request"}</span>
                <span>{service.features.length} deliverables</span>
                <span>{service.packages.length} packages</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/services/${service.id}`} className="btn btn-outline">Edit</Link>
                  <AdminActionForm action={reorderServicesAction} fields={{ id: service.id, direction: "up" }} label="↑" className={index === 0 ? "hidden" : undefined} />
                  <AdminActionForm action={reorderServicesAction} fields={{ id: service.id, direction: "down" }} label="↓" className={index === services.length - 1 ? "hidden" : undefined} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
