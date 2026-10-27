"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FieldRenderProps = {
  id: string;
  name: string;
  describedBy: string | undefined;
  invalid: boolean;
};

type FieldProps = {
  label: string;
  name: string;
  /**
   * Receives the ids and validity so the control can be wired up correctly.
   * Apply the design-system control class yourself — `input`, `textarea` or
   * `select` from `globals.css` — since the rendered element varies per field.
   */
  children: (props: FieldRenderProps) => ReactNode;
  required?: boolean;
  optional?: string;
  error?: string;
  hint?: string;
  className?: string;
};

/**
 * Label + control + hint/error, wired for assistive technology.
 *
 * The control is passed as a function so the generated ids are guaranteed to
 * line up with `htmlFor`, `aria-describedby` and `aria-invalid`. Errors are real
 * text announced via `role="alert"`, never colour alone.
 */
export default function Field({
  label,
  name,
  children,
  required,
  optional,
  error,
  hint,
  className,
}: FieldProps) {
  const uid = useId();
  const id = `${name}-${uid}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex items-baseline gap-2">
        <span className="kicker">{label}</span>
        {required ? (
          <span aria-hidden="true" className="text-violet">
            *
          </span>
        ) : optional ? (
          <span className="font-mono text-[0.6rem] tracking-[0.15em] text-ink-faint">
            {optional}
          </span>
        ) : null}
      </label>

      {children({ id, name, describedBy, invalid: Boolean(error) })}

      {hint && !error ? (
        <p id={hintId} className="text-xs leading-relaxed text-ink-faint">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-violet">
          {error}
        </p>
      ) : null}
    </div>
  );
}