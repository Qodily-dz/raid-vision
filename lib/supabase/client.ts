import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Browser client used by interactive admin UI.
 *
 * All Raid VISION application tables live in the `raid_db` schema, so the client
 * is pinned to it instead of relying on the default `public` search path.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

  return createBrowserClient<Database, "raid_db">(
    supabaseUrl,
    supabaseKey,
    {
      db: { schema: "raid_db" },
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
      },
    },
  );
}