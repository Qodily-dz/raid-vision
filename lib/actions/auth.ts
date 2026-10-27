"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionState } from "./state";

/** Redirect target after a successful login. */
function safeNext(value: string | null): string {
  if (!value) return "/admin";
  // Only same-origin relative paths are accepted, never absolute URLs.
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) return fail("required");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Never leak which half of the credential pair was wrong.
    if (/rate limit|too many/i.test(error.message)) return fail("error");
    return fail("error");
  }

  revalidatePath("/admin", "layout");
  redirect(safeNext(next));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return fail("required");

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/auth/callback`,
  });

  if (error) return fail("error");

  // Always report success: revealing which addresses exist is an information leak.
  return ok({ code: "saved" });
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return fail("required", { password: true });
  if (password !== confirm) return fail("error", { confirm: true });

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return fail("error");

  redirect("/admin/login?reset=success");
}