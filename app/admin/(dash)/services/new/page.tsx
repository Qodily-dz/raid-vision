import { AdminPageHeader } from "@/components/admin/primitives";
import ServiceForm from "@/components/admin/service-form";

export const metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="New service" subtitle="Turn a capability into a clear offer with a useful starting point." />
      <ServiceForm />
    </div>
  );
}
