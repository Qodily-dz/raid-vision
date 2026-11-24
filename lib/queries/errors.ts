/**
 * Query failures are logged on the server with enough context to debug them,
 * while public pages fall back to an empty result instead of crashing. Nothing
 * internal is ever surfaced to a visitor.
 */
export function logQueryError(scope: string, error: unknown) {
  if (!error) return;

  // A fresh Supabase project does not have the application schema until the
  // first migration is applied. Public pages already render their empty-state
  // fallback in that situation, so do not turn the expected setup state into
  // a Next.js error-overlay issue during local development.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "PGRST205"
  ) {
    return;
  }

  console.error(`[raid-vision] ${scope}:`, error);
}
