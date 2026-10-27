/**
 * Query failures are logged on the server with enough context to debug them,
 * while public pages fall back to an empty result instead of crashing. Nothing
 * internal is ever surfaced to a visitor.
 */
export function logQueryError(scope: string, error: unknown) {
  if (!error) return;
  console.error(`[raid-vision] ${scope}:`, error);
}