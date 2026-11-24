import { getAdminProjects } from "@/lib/queries/projects";
import { AdminPageHeader } from "@/components/admin/primitives";
import GalleryForm from "@/components/admin/gallery-form";

export const metadata = { title: "New gallery item" };

export default async function NewGalleryPage() {
  const projects = await getAdminProjects();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="New gallery item" subtitle="Add a visual note, a moving image or a social reference to the notebook." />
      <GalleryForm projects={projects} />
    </div>
  );
}
