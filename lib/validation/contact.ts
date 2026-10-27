import { isBudgetValue } from "@/lib/i18n/budget";

export type ContactErrorKey =
  | "name"
  | "email"
  | "messageShort"
  | "messageLong"
  | "phone"
  | "company"
  | "generic";

/** Error keys flagged for a field; the client maps them to dictionary strings. */
export type ContactErrors = Partial<Record<ContactErrorKey, true>>;

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceId: string;
  budget: string;
  projectDate: string;
  message: string;
  honeypot: string;
};

export type ValidatedContact = {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceId: string | null;
  budget: string | null;
  projectDate: string | null;
  message: string;
  /** True when the invisible field was filled — the submission is discarded. */
  isBot: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Permissive: international formats vary wildly, so only reject the obvious. */
const PHONE_PATTERN = /^[+()\d][\d\s()+-]{4,}$/;

const LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  company: 120,
  message: 5000,
  budget: 40,
} as const;

export function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Server-side validation for the public enquiry form. Nothing here trusts the
 * browser: length limits, formats and the service id shape are all re-checked
 * before the row is written.
 */
export function validateContact(
  formData: FormData,
): { ok: true; value: ValidatedContact } | { ok: false; errors: ContactErrors } {
  const honeypot = readString(formData, "website");
  const input: ContactInput = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    company: readString(formData, "company"),
    serviceId: readString(formData, "serviceId"),
    budget: readString(formData, "budget"),
    projectDate: readString(formData, "projectDate"),
    message: readString(formData, "message"),
    honeypot,
  };

  const errors: ContactErrors = {};

  if (input.name.length < 2) errors.name = true;
  if (input.name.length > LIMITS.name) errors.name = true;
  if (!EMAIL_PATTERN.test(input.email) || input.email.length > LIMITS.email) {
    errors.email = true;
  }
  if (input.phone && !PHONE_PATTERN.test(input.phone)) errors.phone = true;
  if (input.phone.length > LIMITS.phone) errors.phone = true;
  if (input.message.length < 10) errors.messageShort = true;
  if (input.message.length > LIMITS.message) errors.messageLong = true;
  if (input.company.length > LIMITS.company) errors.company = true;

  // A filled honeypot means a bot. Report success to the sender, drop the row.
  if (honeypot) {
    return {
      ok: true,
      value: {
        name: "Bot",
        email: "bot@example.invalid",
        phone: null,
        company: null,
        serviceId: null,
        budget: null,
        projectDate: null,
        message: "",
        isBot: true,
      },
    };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: input.name.slice(0, LIMITS.name),
      email: input.email.toLowerCase().slice(0, LIMITS.email),
      phone: input.phone ? input.phone.slice(0, LIMITS.phone) : null,
      company: input.company ? input.company.slice(0, LIMITS.company) : null,
      serviceId: isUuid(input.serviceId) ? input.serviceId : null,
      budget: isBudgetValue(input.budget) ? input.budget : null,
      projectDate: isIsoDate(input.projectDate) ? input.projectDate : null,
      message: input.message,
      isBot: false,
    },
  };
}