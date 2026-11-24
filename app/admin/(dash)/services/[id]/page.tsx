import { notFound } from "next/navigation";
import { getAdminServiceEditor } from "@/lib/queries/services";
import { AdminPageHeader } from "@/components/admin/primitives";
import ServiceForm from "@/components/admin/service-form";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const editor = await getAdminServiceEditor(id);
  if (!editor) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Edit service" subtitle={editor.service.slug} />
      <ServiceForm service={editor.service} features={editor.features} packages={editor.packages} />
    </div>
  );
}
