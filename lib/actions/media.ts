"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { MEDIA_BUCKET } from "@/lib/media/storage";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin, revalidatePublic } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * Uploads are performed by the browser client so the owner sees real progress;
 * storage RLS is what actually authorises them. Deletes run here so the admin
 * session is used and the path is validated first.
 */
export async function deleteMediaObjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const path = str(formData, "path");

  // Only paths inside the portfolio bucket may be removed.
  if (!path || path.includes("..") || path.startsWith("/")) {
    return fail("required", { path: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

  if (error) {
    console.error("[raid-vision] deleteMediaObject:", error);
    return fail("error");
  }

  revalidateAdmin();
  revalidatePublic();

  return ok({ code: "deleted" });
}