"use client";

import { useActionState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { updatePasswordAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/state";
import Field from "@/components/ui/field";
import SubmitButton from "@/components/ui/submit-button";

/** Sets a new password for the recovered session. */
export default function ResetPasswordForm() {
  const dict = getDictionary("en");
  const [state, formAction] = useActionState(updatePasswordAction, idleState);
  const fields = state.fields ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.code === "error" && !fields.confirm ? (
        <p role="alert" className="border border-violet/40 bg-violet/5 p-3 text-sm">
          {dict.common.error}
        </p>
      ) : null}

      <Field
        label={dict.admin.password}
        name="password"
        required
        hint={dict.admin.passwordHint}
        error={fields.password ? dict.common.required : undefined}
      >
        {({ id, name, describedBy, invalid }) => (
          <input
            id={id}
            name={name}
            type="password"
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
            dir="ltr"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>

      <Field
        label={dict.admin.confirmPassword}
        name="confirm"
        required
        error={fields.confirm ? dict.admin.passwordMismatch : undefined}
      >
        {({ id, name, describedBy, invalid }) => (
          <input
            id={id}
            name={name}
            type="password"
            className="input"
            required
            autoComplete="new-password"
            dir="ltr"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>

      <SubmitButton pendingLabel={dict.admin.resetNewAction} className="btn btn-violet">
        {dict.admin.resetNewAction}
      </SubmitButton>
    </form>
  );
}