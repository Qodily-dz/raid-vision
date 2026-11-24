import { notFound } from "next/navigation";
import { getAdminGalleryItem } from "@/lib/queries/gallery";
import { getAdminProjects } from "@/lib/queries/projects";
import { AdminPageHeader } from "@/components/admin/primitives";
import GalleryForm from "@/components/admin/gallery-form";

export const metadata = { title: "Edit gallery item" };

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, projects] = await Promise.all([getAdminGalleryItem(id), getAdminProjects()]);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Edit gallery item" subtitle={item.item_type} />
      <GalleryForm item={item} projects={projects} />
    </div>
  );
}
