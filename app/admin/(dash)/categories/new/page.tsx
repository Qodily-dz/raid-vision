import { AdminPageHeader } from "@/components/admin/primitives";
import CategoryForm from "@/components/admin/category-form";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return <div className="flex flex-col gap-8"><AdminPageHeader title="New category" subtitle="Add a label for the project archive." /><CategoryForm /></div>;
}
