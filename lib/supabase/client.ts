import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Browser client used by interactive admin UI.
 *
 * All Raid VISION application tables live in the `raid_db` schema, so the client
 * is pinned to it instead of relying on the default `public` search path.
 */
export function createClient() {
  return createBrowserClient<Database, "raid_db">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: "raid_db" },
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
      },
    },
  );
}