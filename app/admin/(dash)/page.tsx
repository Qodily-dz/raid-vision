import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAdminCounts, getRecentInquiries } from "@/lib/queries/inquiries";
import { getAdminProjects } from "@/lib/queries/projects";
import {
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminStat,
} from "@/components/admin/primitives";

export const metadata = { title: "Overview" };

/** Formats an ISO timestamp in the dashboard's fixed locale. */
function stamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function OverviewPage() {
  const dict = getDictionary("en");

  const [counts, projects, inquiries] = await Promise.all([
    getAdminCounts(),
    getAdminProjects(),
    getRecentInquiries(5),
  ]);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        title={dict.admin.overview.title}
        subtitle={dict.admin.overview.subtitle}
        actions={
          <Link href="/admin/projects/new" className="btn btn-violet">
            {dict.admin.overview.quickCreateProject}
          </Link>
        }
      />

      {/* ------------------------------------------------------------ Counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStat
          label={dict.admin.overview.totalProjects}
          value={counts.totalProjects}
          href="/admin/projects"
        />
        <AdminStat
          label={dict.admin.overview.publishedProjects}
          value={counts.publishedProjects}
        />
        <AdminStat label={dict.admin.overview.draftProjects} value={counts.draftProjects} />
        <AdminStat
          label={dict.admin.overview.galleryItems}
          value={counts.galleryItems}
          href="/admin/gallery"
        />
        <AdminStat
          label={dict.admin.overview.activeServices}
          value={counts.activeServices}
          href="/admin/services"
        />
        <AdminStat
          label={dict.admin.overview.newInquiries}
          value={counts.newInquiries}
          href="/admin/messages"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* -------------------------------------------------------- Projects */}
        <AdminPanel
          title={dict.admin.overview.recentProjects}
          actions={
            <Link href="/admin/projects" className="kicker text-ink-dim hover:text-ink">
              {dict.admin.overview.viewAllProjects} →
            </Link>
          }
        >
          {recentProjects.length === 0 ? (
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
            <ul className="flex flex-col divide-y divide-ink/10">
              {recentProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="truncate text-sm transition-colors hover:text-violet"
                    >
                      {project.title || "—"}
                    </Link>
                    <p className="kicker mt-1 text-ink-faint">{stamp(project.updatedAt)}</p>
                  </div>
                  <AdminBadge
                    tone={
                      project.status === "published"
                        ? "good"
                        : project.status === "archived"
                          ? "neutral"
                          : "warn"
                    }
                  >
                    {dict.admin.projects.status[project.status as "draft" | "published" | "archived"] ??
                      project.status}
                  </AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        {/* ------------------------------------------------------- Inquiries */}
        <AdminPanel
          title={dict.admin.overview.recentInquiries}
          actions={
            <Link href="/admin/messages" className="kicker text-ink-dim hover:text-ink">
              {dict.admin.overview.viewAllMessages} →
            </Link>
          }
        >
          {inquiries.length === 0 ? (
            <AdminEmpty title={dict.admin.inquiries.emptyTitle} body={dict.admin.inquiries.emptyBody} />
          ) : (
            <ul className="flex flex-col divide-y divide-ink/10">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/messages/${inquiry.id}`}
                        className="truncate text-sm transition-colors hover:text-violet"
                      >
                        {inquiry.name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-ink-faint">{inquiry.email}</p>
                    </div>
                    {inquiry.status === "new" ? (
                      <AdminBadge tone="brand">{dict.admin.inquiries.unread}</AdminBadge>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-dim">
                    {inquiry.message}
                  </p>
                  <p className="kicker mt-2 text-ink-faint">{stamp(inquiry.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}