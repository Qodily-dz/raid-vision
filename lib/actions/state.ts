/**
 * Result of a CMS mutation. `code` is a translation key the admin UI resolves,
 * so server actions stay independent of the interface language.
 *
 * This module is deliberately free of server-only imports: client components
 * need `ActionState` and `idleState` to type their `useActionState` calls, and
 * pulling `next/cache` in through this file would drag server code into the
 * browser bundle.
 */
export type ActionCode =
  | "saved"
  | "created"
  | "deleted"
  | "published"
  | "unpublished"
  | "error"
  | "unauthorized"
  | "notFound"
  | "slugTaken"
  | "required"
  | "duplicateSlug";

export type ActionState = {
  ok: boolean;
  code?: ActionCode;
  /** Field-level problems keyed by form field name. */
  fields?: Record<string, true>;
  /** Set when the mutation should move the operator somewhere else. */
  redirectTo?: string;
};

export const idleState: ActionState = { ok: false };

export function fail(
  code: ActionCode,
  fields?: Record<string, true>,
): ActionState {
  return { ok: false, code, ...(fields ? { fields } : {}) };
}

export function ok(extra: Partial<ActionState> = {}): ActionState {
  return { ok: true, code: "saved", ...extra };
}
