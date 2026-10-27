"use server";

import { createClient } from "@/lib/supabase/server";
import { validateContact, type ContactErrors } from "@/lib/validation/contact";
import { fail, ok, type ActionState } from "./state";
import { revalidateAdmin } from "./revalidate";

export type ContactActionState = ActionState & { errors?: ContactErrors };

/**
 * Public enquiry submission.
 *
 * Uses the anonymous-safe server client: Row Level Security allows INSERT on
 * `raid_db.contact_messages` and nothing else, so even a manipulated request can
 * only ever create one row.
 */
export async function submitContactInquiry(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const result = validateContact(formData);

  if (!result.ok) {
    return { ok: false, code: "error", errors: result.errors };
  }

  const inquiry = result.value;

  // Honeypot tripped: behave like a success for the bot, write nothing.
  if (inquiry.isBot) return ok();

  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    company: inquiry.company,
    service_id: inquiry.serviceId,
    budget: inquiry.budget,
    project_date: inquiry.projectDate,
    message: inquiry.message,
    status: "new",
    honeypot: "",
  });

  if (error) {
    console.error("[raid-vision] submitContactInquiry:", error);
    return fail("error");
  }

  revalidateAdmin();
  return ok();
}