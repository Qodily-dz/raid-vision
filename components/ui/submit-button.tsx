"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

/**
 * Submit button that reflects the pending state of its own form via
 * `useFormStatus`, so the button disables itself without extra plumbing.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={
        className ??
        "btn btn-violet w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      }
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
