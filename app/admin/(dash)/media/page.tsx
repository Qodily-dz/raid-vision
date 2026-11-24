import { listMediaObjects } from "@/lib/queries/media";
import { getReferencedMediaPaths } from "@/lib/queries/media";
import { getPublicMediaUrl } from "@/lib/media/storage";
import AdminActionForm from "@/components/admin/action-form";
import { deleteMediaObjectAction } from "@/lib/actions/media";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Media" };

function size(value: number | null): string {
  if (value === null) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaAdminPage() {
  const [files, referenced] = await Promise.all([listMediaObjects(), getReferencedMediaPaths()]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Media library" subtitle="A single view of uploaded files and their storage paths." />
      {files.length === 0 ? (
        <AdminEmpty title="No media uploaded" body="Upload a hero, project cover or gallery asset from its editor." />
      ) : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="admin-table min-w-[52rem]"><thead><tr><th>File</th><th>Folder</th><th>Usage</th><th>Size</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
            {files.map((file) => (
              <tr key={file.name}>
                <td><a href={getPublicMediaUrl(file.name)} target="_blank" rel="noreferrer" className="break-all text-sm text-ink hover:text-violet">{file.name}</a></td>
                <td className="text-sm text-ink-dim">{file.folder}</td>
                <td><AdminBadge tone={referenced.has(file.name) ? "good" : "neutral"}>{referenced.has(file.name) ? "Used" : "Unused"}</AdminBadge></td>
                <td className="font-mono text-xs text-ink-faint">{size(file.size)}</td>
                <td className="font-mono text-xs text-ink-faint">{file.updatedAt ? new Date(file.updatedAt).toLocaleDateString("en-GB") : "—"}</td>
                <td>{referenced.has(file.name) ? <span className="text-xs text-ink-faint">Detach before deleting</span> : <AdminActionForm action={deleteMediaObjectAction} fields={{ path: file.name }} label="Delete" tone="danger" confirm="Delete this unused file? This cannot be undone." />}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
