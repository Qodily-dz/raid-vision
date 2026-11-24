"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { idleState, type ActionState } from "@/lib/actions/state";
import { cn } from "@/lib/utils";

type AdminAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const feedback: Record<string, string> = {
  saved: "Saved",
  created: "Created",
  deleted: "Deleted",
  published: "Published",
  unpublished: "Moved to draft",
  error: "Something went wrong",
  notFound: "Record not found",
};

/** Small server-action form for row-level admin controls. */
export default function AdminActionForm({
  action,
  fields,
  children,
  label,
  tone = "outline",
  confirm,
  className,
}: {
  action: AdminAction;
  fields?: Record<string, string>;
  children?: React.ReactNode;
  label?: string;
  tone?: "outline" | "danger" | "violet";
  confirm?: string;
  className?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const next = await action(prev, formData);
      if (next.ok) router.refresh();
      return next;
    },
    idleState,
  );

  return (
    <form
      action={formAction}
      className={cn("flex flex-wrap items-center gap-2", className)}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {Object.entries(fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      {label ? (
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "btn disabled:cursor-wait disabled:opacity-60",
            tone === "danger"
              ? "border-violet/50 text-violet hover:bg-violet hover:text-black"
              : tone === "violet"
                ? "btn-violet"
                : "btn-outline",
          )}
        >
          {pending ? "Working…" : label}
        </button>
      ) : null}
      {state.code ? (
        <span aria-live="polite" className={cn("kicker", state.ok ? "text-emerald-300" : "text-violet")}>
          {feedback[state.code] ?? state.code}
        </span>
      ) : null}
    </form>
  );
}
