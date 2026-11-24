import { notFound } from "next/navigation";
import { getAdminProject, getAdminProjectCategoryIds, getAdminProjectMedia, getAdminProjectSections, getAllCategories } from "@/lib/queries/projects";
import { AdminPageHeader } from "@/components/admin/primitives";
import ProjectForm from "@/components/admin/project-form";
import ProjectContentEditor from "@/components/admin/project-content-editor";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, categories, sections, media] = await Promise.all([
    getAdminProject(id),
    getAllCategories("en"),
    getAdminProjectSections(id),
    getAdminProjectMedia(id),
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
      <ProjectContentEditor projectId={project.id} sections={sections} media={media} />
    </div>
  );
}
