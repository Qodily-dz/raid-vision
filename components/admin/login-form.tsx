"use client";

import { useActionState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loginAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/state";
import Field from "@/components/ui/field";
import SubmitButton from "@/components/ui/submit-button";

/**
 * Sign-in form. The `next` field is validated server-side as a relative path, so
 * a crafted link cannot bounce an operator to another origin.
 */
export default function LoginForm({ next }: { next: string }) {
  const dict = getDictionary("en");
  const [state, formAction] = useActionState(loginAction, idleState);

  // A rate limit is reported by the action as a generic failure, so both the
  // missing-field and bad-credential cases stay intentionally vague.
  const message =
    state.code === "required"
      ? dict.admin.loginMissing
      : state.code && !state.ok
        ? dict.admin.loginError
        : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {message ? (
        <p role="alert" className="border border-violet/40 bg-violet/5 p-3 text-sm text-ink">
          {message}
        </p>
      ) : null}

      <Field label={dict.admin.email} name="email" required>
        {({ id, name, describedBy }) => (
          <input
            id={id}
            name={name}
            type="email"
            className="input"
            required
            autoComplete="username"
            autoFocus
            dir="ltr"
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Field label={dict.admin.password} name="password" required>
        {({ id, name, describedBy }) => (
          <input
            id={id}
            name={name}
            type="password"
            className="input"
            required
            autoComplete="current-password"
            dir="ltr"
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <div className="flex flex-col gap-4 pt-2">
        <SubmitButton pendingLabel={dict.admin.signingIn} className="btn btn-violet">
          {dict.admin.loginAction}
        </SubmitButton>

        <Link
          href="/admin/forgot-password"
          className="kicker text-ink-faint transition-colors hover:text-ink"
        >
          {dict.admin.forgotPassword}
        </Link>
      </div>
    </form>
  );
}
