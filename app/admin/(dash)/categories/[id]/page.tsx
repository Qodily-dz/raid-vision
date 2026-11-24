import { notFound } from "next/navigation";
import { getAdminCategories } from "@/lib/queries/categories";
import { AdminPageHeader } from "@/components/admin/primitives";
import CategoryForm from "@/components/admin/category-form";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = (await getAdminCategories()).find((item) => item.id === id);
  if (!category) notFound();
  return <div className="flex flex-col gap-8"><AdminPageHeader title="Edit category" subtitle={category.slug} /><CategoryForm category={category} /></div>;
}
