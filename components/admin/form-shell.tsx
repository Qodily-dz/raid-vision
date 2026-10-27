"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { idleState, type ActionCode, type ActionState } from "@/lib/actions/state";
import { cn } from "@/lib/utils";

const CODE_LABEL: Record<ActionCode, string> = {
  saved: "Saved",
  created: "Created",
  deleted: "Deleted",
  published: "Published",
  unpublished: "Moved to draft",
  error: "Something went wrong",
  unauthorized: "Not authorised",
  notFound: "Record not found",
  slugTaken: "That slug is already in use",
  required: "Fill in the required fields",
  duplicateSlug: "Could not create a unique slug",
};

type FormShellProps = {
  /** Server action bound to the form. */
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  /** Where to go after a successful write that did not set `redirectTo`. */
  redirectTo?: string;
  submitLabel: string;
  /** Extra buttons rendered beside the primary one. */
  aside?: React.ReactNode;
  /** Change label to "Save and publish". */
  submitVariant?: "violet" | "outline";
  className?: string;
};

/**
 * Standard dashboard form wrapper.
 *
 * Owns the whole mutation cycle: pending state, success/failure messaging, and
 * the redirect that some actions request. Every admin form goes through this so
 * feedback behaves identically everywhere.
 */
export default function FormShell({
  action,
  children,
  redirectTo,
  submitLabel,
  aside,
  submitVariant = "violet",
  className,
}: FormShellProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const next = await action(prev, formData);

      // A successful mutation may ask the operator to move elsewhere. The
      // action's own target wins; `redirectTo` is the form-level fallback.
      const destination = next.redirectTo ?? redirectTo;
      if (next.ok && destination) {
        router.push(destination);
        router.refresh();
      }

      return next;
    },
    idleState,
  );

  // Warn before losing edits. Tracked from real input events, not from the
  // action state, so a pristine form never nags.
  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const markDirty = () => {
      dirtyRef.current = true;
    };
    const markClean = () => {
      dirtyRef.current = false;
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current && !state.ok) event.preventDefault();
    };

    form.addEventListener("input", markDirty);
    form.addEventListener("submit", markClean);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("submit", markClean);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={cn("flex flex-col gap-6", className)}>
      {children}

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-4 border-t border-ink/10 bg-black/95 px-5 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "btn disabled:cursor-wait disabled:opacity-60",
              submitVariant === "violet" ? "btn-violet" : "btn-outline",
            )}
          >
            {pending ? getDictionary("en").admin.projects.saving : submitLabel}
          </button>

          {aside}

          <p
            aria-live="polite"
            role="status"
            className={cn(
              "kicker",
              state.ok ? "text-emerald-300" : state.code ? "text-violet" : "text-ink-faint",
            )}
          >
            {state.code ? CODE_LABEL[state.code] : ""}
          </p>
        </div>
      </div>
    </form>
  );
}
