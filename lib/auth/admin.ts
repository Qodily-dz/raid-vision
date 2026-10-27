import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole, AdminUserRow } from "@/types/content";
import { logQueryError } from "@/lib/queries/errors";

export type AdminContext = {
  user: User;
  profile: AdminUserRow;
  role: AdminRole;
};

/**
 * Returns the current administrator, or null when the visitor is anonymous or
 * their account is not an active administrator.
 *
 * The check runs against `raid_db.admin_users` through Row Level Security, so it
 * is authoritative — a server action must never rely on the route alone.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, display_name, role, active, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logQueryError("getAdminContext", error);
    return null;
  }

  const profile = data as AdminUserRow | null;
  if (!profile?.active) return null;

  return {
    user,
    profile,
    role: profile.role === "owner" ? "owner" : "editor",
  };
}

/**
 * Gate for every admin route and every CMS server action. Redirects anonymous
 * visitors to the login screen.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const context = await getAdminContext();

  if (!context) {
    redirect("/admin/login");
  }

  return context;
}

/**
 * Gate for server actions. Throwing keeps the current route (and its form
 * state) intact instead of navigating away mid-submit.
 */
export async function assertAdmin(): Promise<AdminContext> {
  const context = await getAdminContext();

  if (!context) {
    throw new Error("Not authorised");
  }

  return context;
}