import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import AuthShell from "@/components/admin/auth-shell";
import ForgotPasswordForm from "@/components/admin/forgot-password-form";

export const metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage() {
  const dict = getDictionary("en");

  return (
    <AuthShell
      kicker={dict.admin.loginSubtitle}
      title={dict.admin.resetTitle}
      body={dict.admin.resetBody}
    >
      <ForgotPasswordForm />

      <Link href="/admin/login" className="kicker mt-8 inline-block text-ink-faint hover:text-ink">
        ← {dict.admin.signIn}
      </Link>
    </AuthShell>
  );
}