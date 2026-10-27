import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAdminContext } from "@/lib/auth/admin";
import LoginForm from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;
  const dict = getDictionary("en");

  // An already-authenticated administrator has no business on this screen.
  if (await getAdminContext()) redirect("/admin");

  // Only same-origin relative paths are honoured, matching the action's check.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,45,32,0.12),transparent_60%)]"
      />

      <div className="relative w-full max-w-sm">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="display text-4xl transition-colors group-hover:text-violet">
            Raid
          </span>
          <span className="display text-4xl text-ink-dim">VISION</span>
        </Link>

        <p className="kicker mt-6">{dict.admin.loginSubtitle}</p>

        {reset === "success" ? (
          <p
            role="status"
            className="mt-6 border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm"
          >
            {dict.admin.resetUpdated}
          </p>
        ) : null}

        <div className="mt-8">
          <LoginForm next={target} />
        </div>

        <p className="mt-10 text-xs leading-relaxed text-ink-faint">
          {dict.admin.common.permissionsNotice}
        </p>
      </div>
    </main>
  );
}