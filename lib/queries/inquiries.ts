import { cache } from "react";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessageRow, InquiryView } from "@/types/content";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/types/content";
import { logQueryError } from "./errors";

type InquirySelect = Pick<
  ContactMessageRow,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "company"
  | "service_id"
  | "budget"
  | "project_date"
  | "message"
  | "status"
  | "created_at"
  | "updated_at"
>;

function toView(row: InquirySelect, serviceName: string): InquiryView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    serviceId: row.service_id,
    serviceName,
    budget: row.budget,
    projectDate: row.project_date,
    message: row.message,
    status: INQUIRY_STATUSES.includes(row.status as InquiryStatus)
      ? (row.status as InquiryStatus)
      : "new",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function withServiceNames(rows: InquirySelect[]): Promise<InquiryView[]> {
  const ids = [
    ...new Set(rows.map((row) => row.service_id).filter((id): id is string => Boolean(id))),
  ];

  if (ids.length === 0) return rows.map((row) => toView(row, ""));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name_i18n")
    .in("id", ids);

  if (error) {
    logQueryError("withServiceNames", error);
    return rows.map((row) => toView(row, ""));
  }

  const index = new Map(
    ((data ?? []) as { id: string; name_i18n: unknown }[]).map((row) => [
      row.id,
      getLocalizedValue(row.name_i18n, "en"),
    ]),
  );

  return rows.map((row) =>
    toView(row, row.service_id ? (index.get(row.service_id) ?? "") : ""),
  );
}

/**
 * Every inquiry, newest first. Row Level Security means an anonymous caller
 * receives zero rows here, so this function is admin-only in practice.
 */
export const getAdminInquiries = cache(
  async (status?: InquiryStatus): Promise<InquiryView[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("contact_messages")
      .select(
        "id, name, email, phone, company, service_id, budget, project_date, message, status, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      logQueryError("getAdminInquiries", error);
      return [];
    }

    return withServiceNames((data ?? []) as InquirySelect[]);
  },
);

export async function getRecentInquiries(limit = 5): Promise<InquiryView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select(
      "id, name, email, phone, company, service_id, budget, project_date, message, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logQueryError("getRecentInquiries", error);
    return [];
  }

  return withServiceNames((data ?? []) as InquirySelect[]);
}

export async function getAdminInquiry(id: string): Promise<InquiryView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select(
      "id, name, email, phone, company, service_id, budget, project_date, message, status, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logQueryError("getAdminInquiry", error);
    return null;
  }

  if (!data) return null;

  const [view] = await withServiceNames([data as InquirySelect]);
  return view ?? null;
}

export type AdminCounts = {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  galleryItems: number;
  activeServices: number;
  newInquiries: number;
};

/** Real counts only — the overview never invents analytics. */
export async function getAdminCounts(): Promise<AdminCounts> {
  const supabase = await createClient();

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    galleryItems,
    activeServices,
    newInquiries,
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("gallery_items").select("id", { count: "exact", head: true }),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  for (const [label, result] of [
    ["totalProjects", totalProjects],
    ["publishedProjects", publishedProjects],
    ["draftProjects", draftProjects],
    ["galleryItems", galleryItems],
    ["activeServices", activeServices],
    ["newInquiries", newInquiries],
  ] as const) {
    if (result.error) logQueryError(`getAdminCounts.${label}`, result.error);
  }

  return {
    totalProjects: totalProjects.count ?? 0,
    publishedProjects: publishedProjects.count ?? 0,
    draftProjects: draftProjects.count ?? 0,
    galleryItems: galleryItems.count ?? 0,
    activeServices: activeServices.count ?? 0,
    newInquiries: newInquiries.count ?? 0,
  };
}