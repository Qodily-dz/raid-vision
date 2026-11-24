import Link from "next/link";
import { getAdminCategories } from "@/lib/queries/categories";
import { reorderCategoriesAction, deleteCategoryAction } from "@/lib/actions/categories";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";
import AdminActionForm from "@/components/admin/action-form";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Categories" subtitle="Keep the archive easy to scan and the project filters intentional." actions={<Link href="/admin/categories/new" className="btn btn-violet">New category</Link>} />
      {categories.length === 0 ? <AdminEmpty title="No categories yet" body="Create the labels you want to use when organising projects." action={<Link href="/admin/categories/new" className="btn btn-outline">New category</Link>} /> : <div className="overflow-x-auto border border-ink/10"><table className="admin-table min-w-[48rem]"><thead><tr><th>Name</th><th>Slug</th><th>Visibility</th><th>Order</th><th>Actions</th></tr></thead><tbody>{categories.map((category, index) => <tr key={category.id}><td><Link href={`/admin/categories/${category.id}`} className="text-sm text-ink hover:text-violet">{typeof category.name_i18n === "object" && category.name_i18n && "en" in category.name_i18n ? String(category.name_i18n.en) : category.slug}</Link></td><td className="font-mono text-xs text-ink-faint">{category.slug}</td><td><AdminBadge tone={category.active ? "good" : "neutral"}>{category.active ? "Active" : "Hidden"}</AdminBadge></td><td className="font-mono text-xs text-ink-faint">{category.sort_order}</td><td><div className="flex flex-wrap items-center gap-2"><Link href={`/admin/categories/${category.id}`} className="btn btn-outline">Edit</Link><AdminActionForm action={reorderCategoriesAction} fields={{ id: category.id, direction: "up" }} label="↑" className={index === 0 ? "hidden" : undefined} /><AdminActionForm action={reorderCategoriesAction} fields={{ id: category.id, direction: "down" }} label="↓" className={index === categories.length - 1 ? "hidden" : undefined} /><AdminActionForm action={deleteCategoryAction} fields={{ id: category.id }} label="Delete" tone="danger" confirm="Delete this category? Projects will lose this classification." /></div></td></tr>)}</tbody></table></div>}
    </div>
  );
}
