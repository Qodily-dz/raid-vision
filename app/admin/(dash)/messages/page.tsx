import { getAdminInquiries } from "@/lib/queries/inquiries";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";
import AdminActionForm from "@/components/admin/action-form";
import { deleteInquiryAction, updateInquiryStatusAction } from "@/lib/actions/inquiries";

export const metadata = { title: "Messages" };

export default async function MessagesAdminPage() {
  const inquiries = await getAdminInquiries();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Messages" subtitle="Every project enquiry in one place, newest first." />
      {inquiries.length === 0 ? (
        <AdminEmpty title="No enquiries yet" body="New project enquiries will appear here after the public form is connected to the database." />
      ) : (
        <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.8fr)_auto] lg:items-start">
              <div><div className="flex items-center gap-3"><h2 className="text-sm font-medium">{inquiry.name}</h2><AdminBadge tone={inquiry.status === "new" ? "brand" : "neutral"}>{inquiry.status}</AdminBadge></div><a href={`mailto:${inquiry.email}`} className="mt-1 block text-xs text-ink-faint hover:text-violet">{inquiry.email}</a></div>
              <p className="max-w-2xl text-sm leading-relaxed text-ink-dim">{inquiry.message}</p>
              <div className="flex flex-col gap-3 text-start lg:text-end">
                <div className="font-mono text-[0.65rem] text-ink-faint">{inquiry.projectDate || "No date"}<br />{inquiry.budget || "No budget"}</div>
                <AdminActionForm action={updateInquiryStatusAction} fields={{ id: inquiry.id }} label="Update" className="lg:justify-end">
                  <select name="status" defaultValue={inquiry.status} className="select min-w-32">
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </AdminActionForm>
                <AdminActionForm action={deleteInquiryAction} fields={{ id: inquiry.id }} label="Delete" tone="danger" className="lg:justify-end" confirm="Delete this enquiry? This cannot be undone." />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
