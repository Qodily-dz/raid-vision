import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server client bound to the signed-in user's cookie session.
 *
 * Authorization is enforced by Row Level Security in `raid_db`, so the same
 * client is safe to use for both public reads and CMS writes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

  return createServerClient<Database, "raid_db">(
    supabaseUrl,
    supabaseKey,
    {
      db: { schema: "raid_db" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // `proxy.ts` refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}