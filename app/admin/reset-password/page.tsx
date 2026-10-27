import { getDictionary } from "@/lib/i18n/get-dictionary";
import AuthShell from "@/components/admin/auth-shell";
import ResetPasswordForm from "@/components/admin/reset-password-form";

export const metadata = { title: "Choose a new password" };

/**
 * Landing screen for the recovery link.
 *
 * Supabase sends the visitor here with the recovery token still in the URL
 * fragment; `/admin/auth/callback` exchanges it for a session before this page
 * is shown, so reaching this route without a session means the link expired.
 */
export default async function ResetPasswordPage() {
  const dict = getDictionary("en");

  return (
    <AuthShell
      kicker={dict.admin.loginSubtitle}
      title={dict.admin.resetNewTitle}
      body={dict.admin.resetInvalid}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}