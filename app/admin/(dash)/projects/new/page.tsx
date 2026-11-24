import { getAllCategories } from "@/lib/queries/projects";
import { AdminPageHeader } from "@/components/admin/primitives";
import ProjectForm from "@/components/admin/project-form";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const categories = await getAllCategories("en");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="New project"
        subtitle="Create the opening record for a new case study."
      />
      <ProjectForm categories={categories} />
    </div>
  );
}
