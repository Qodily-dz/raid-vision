import { getDictionary } from "@/lib/i18n/get-dictionary";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCounts } from "@/lib/queries/inquiries";
import { logoutAction } from "@/lib/actions/auth";
import AdminNav from "@/components/admin/admin-nav";

/**
 * Protected dashboard chrome.
 *
 * The route group holds every page that requires an active administrator, so the
 * check lives in exactly one place. `assertAdmin` in every server action remains
 * the real gate — this layout is about not rendering the shell to strangers.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = getDictionary("en");
  const admin = await requireAdmin();

  // Head counts only, so the sidebar badge costs one round trip per row count.
  const counts = await getAdminCounts();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AdminNav
        items={[
          { href: "/admin", label: dict.admin.nav.overview, exact: true },
          { href: "/admin/projects", label: dict.admin.nav.projects },
          { href: "/admin/gallery", label: dict.admin.nav.gallery },
          { href: "/admin/services", label: dict.admin.nav.services },
          { href: "/admin/messages", label: dict.admin.nav.messages, badge: counts.newInquiries },
          { href: "/admin/media", label: dict.admin.nav.media },
          { href: "/admin/settings", label: dict.admin.nav.settings },
        ]}
        footer={
          <div className="flex flex-col gap-4 border-t border-ink/10 pt-4">
            <div>
              <p className="truncate text-sm text-ink">
                {admin.profile.display_name || admin.user.email}
              </p>
              <p className="kicker mt-1 text-ink-faint">{admin.role}</p>
            </div>

            <form action={logoutAction}>
              <button type="submit" className="kicker text-ink-dim transition-colors hover:text-violet">
                {dict.admin.nav.signOut} →
              </button>
            </form>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="kicker text-ink-faint transition-colors hover:text-ink"
            >
              {dict.admin.projects.preview} ↗
            </a>
          </div>
        }
      />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">
        {children}
        <p className="mt-16 text-xs leading-relaxed text-ink-faint">
          {dict.admin.common.permissionsNotice}
        </p>
      </main>
    </div>
  );
}
