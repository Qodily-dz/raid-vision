"use client";

import { useActionState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/state";
import Field from "@/components/ui/field";
import SubmitButton from "@/components/ui/submit-button";

/**
 * Requests a recovery email.
 *
 * The action always reports success, whether or not the address exists, so this
 * screen cannot be used to discover which emails have accounts.
 */
export default function ForgotPasswordForm() {
  const dict = getDictionary("en");
  const [state, formAction] = useActionState(requestPasswordResetAction, idleState);

  if (state.ok) {
    return (
      <p role="status" className="border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
        {dict.admin.resetSent}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.code === "error" ? (
        <p role="alert" className="border border-violet/40 bg-violet/5 p-3 text-sm">
          {dict.common.error}
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

      <SubmitButton pendingLabel={dict.admin.resetSend} className="btn btn-violet">
        {dict.admin.resetSend}
      </SubmitButton>
    </form>
  );
}