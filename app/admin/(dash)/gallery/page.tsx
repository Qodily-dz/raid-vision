import { getAdminGalleryItems } from "@/lib/queries/gallery";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";
import Link from "next/link";
import AdminActionForm from "@/components/admin/action-form";
import { deleteGalleryItemAction, reorderGalleryAction, toggleGalleryPublishAction } from "@/lib/actions/gallery";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  const items = await getAdminGalleryItems("en");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Gallery" subtitle="Manage the visual notebook that supports the main portfolio." actions={<Link href="/admin/gallery/new" className="btn btn-violet">New gallery item</Link>} />
      {items.length === 0 ? (
        <AdminEmpty title="No gallery items yet" body="Add images, clips or social references after the media workflow is connected." />
      ) : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="admin-table min-w-[44rem]">
            <thead><tr><th>Title</th><th>Type</th><th>Visibility</th><th>Project</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td><Link href={`/admin/gallery/${item.id}`} className="text-sm text-ink hover:text-violet">{item.title || "Untitled item"}</Link><p className="mt-1 text-xs text-ink-faint">{item.caption || "No caption"}</p></td>
                  <td><AdminBadge>{item.itemType}</AdminBadge></td>
                  <td><AdminBadge tone={item.published ? "good" : "neutral"}>{item.published ? "Published" : "Draft"}</AdminBadge></td>
                  <td className="text-sm text-ink-dim">{item.linkedProjectTitle || "—"}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/gallery/${item.id}`} className="btn btn-outline">Edit</Link>
                      <AdminActionForm action={toggleGalleryPublishAction} fields={{ id: item.id }} label={item.published ? "Unpublish" : "Publish"} tone={item.published ? "outline" : "violet"} />
                      <AdminActionForm action={reorderGalleryAction} fields={{ id: item.id, direction: "up" }} label="↑" className={index === 0 ? "hidden" : undefined} />
                      <AdminActionForm action={reorderGalleryAction} fields={{ id: item.id, direction: "down" }} label="↓" className={index === items.length - 1 ? "hidden" : undefined} />
                      <AdminActionForm action={deleteGalleryItemAction} fields={{ id: item.id }} label="Delete" tone="danger" confirm="Delete this gallery item and its uploaded files? This cannot be undone." />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
