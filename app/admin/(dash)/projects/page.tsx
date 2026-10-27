import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAdminProjects } from "@/lib/queries/projects";
import Link from "next/link";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const dict = getDictionary("en");
  const projects = await getAdminProjects();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={dict.admin.projects.title}
        actions={
          <Link href="/admin/projects/new" className="btn btn-violet">
            {dict.admin.projects.new}
          </Link>
        }
      />

      {projects.length === 0 ? (
        <AdminEmpty
          title={dict.admin.projects.emptyTitle}
          body={dict.admin.projects.emptyBody}
          action={
            <Link href="/admin/projects/new" className="btn btn-outline">
              {dict.admin.projects.new}
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="min-w-full divide-y divide-ink/10">
            <thead className="bg-ink/[0.03]">
              <tr>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnTitle}
                </th>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnStatus}
                </th>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnYear}
                </th>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnCategories}
                </th>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnFeatured}
                </th>
                <th className="px-4 py-3 text-start text-[0.65rem] uppercase tracking-[0.15em] text-ink-faint">
                  {dict.admin.projects.columnUpdated}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 bg-black">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="block truncate text-sm font-medium transition-colors hover:text-violet"
                    >
                      {project.title || "—"}
                    </Link>
                    <p className="truncate text-xs text-ink-faint">{project.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge
                      tone={
                        project.status === "published"
                          ? "good"
                          : project.status === "archived"
                            ? "neutral"
                            : "warn"
                      }
                    >
                      {dict.admin.projects.status[project.status]}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-dim">
                    {project.year ?? "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-ink-dim">
                    {project.categories.map((c) => c.name).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-dim">
                    {project.featured ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.65rem] text-ink-faint">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(project.updatedAt))}
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