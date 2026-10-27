"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/slug";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/types/content";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin } from "./revalidate";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * RLS on `raid_db.contact_messages` only allows administrators to read, update
 * or delete, so this action cannot be used to snoop on enquiries.
 */
export async function updateInquiryStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  const status = str(formData, "status");

  if (!isUuid(id)) return fail("notFound");
  if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) return fail("error");

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) return fail("error");

  revalidateAdmin();
  return ok();
}

export async function deleteInquiryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!isUuid(id)) return fail("notFound");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);

  if (error) return fail("error");

  revalidateAdmin();
  return ok({ code: "deleted" });
}