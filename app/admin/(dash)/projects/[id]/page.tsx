import { notFound } from "next/navigation";
import { getAdminProject, getAdminProjectCategoryIds, getAllCategories } from "@/lib/queries/projects";
import { AdminPageHeader } from "@/components/admin/primitives";
import ProjectForm from "@/components/admin/project-form";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    getAdminProject(id),
    getAllCategories("en"),
  ]);

  if (!project) notFound();

  const categoryIds = await getAdminProjectCategoryIds(project.id);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={project.title_i18n && typeof project.title_i18n === "object" ? "Edit project" : "Project"}
        subtitle={project.slug}
      />
      <ProjectForm project={project} categories={categories} categoryIds={categoryIds} />
    </div>
  );
}
