import { getAdminGalleryItems } from "@/lib/queries/gallery";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  const items = await getAdminGalleryItems("en");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Gallery" subtitle="Manage the visual notebook that supports the main portfolio." />
      {items.length === 0 ? (
        <AdminEmpty title="No gallery items yet" body="Add images, clips or social references after the media workflow is connected." />
      ) : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="admin-table min-w-[44rem]">
            <thead><tr><th>Title</th><th>Type</th><th>Visibility</th><th>Project</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><p className="text-sm text-ink">{item.title || "Untitled item"}</p><p className="mt-1 text-xs text-ink-faint">{item.caption || "No caption"}</p></td>
                  <td><AdminBadge>{item.itemType}</AdminBadge></td>
                  <td><AdminBadge tone={item.published ? "good" : "neutral"}>{item.published ? "Published" : "Draft"}</AdminBadge></td>
                  <td className="text-sm text-ink-dim">{item.linkedProjectTitle || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
