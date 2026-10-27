import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Cache invalidation for CMS mutations.
 *
 * Imported only by server actions: `next/cache` is unavailable in client
 * components, so the pure action state lives in `./state` instead.
 */

/** Public pages that read a given content type. */
export function revalidatePublic(locale?: string) {
  revalidatePath("/", "layout");
  if (locale) revalidatePath(`/${locale}`, "layout");
}

export function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}
