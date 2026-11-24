import { listMediaObjects } from "@/lib/queries/media";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Media" };

function size(value: number | null): string {
  if (value === null) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaAdminPage() {
  const files = await listMediaObjects();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Media library" subtitle="A single view of uploaded files and their storage paths." />
      {files.length === 0 ? (
        <AdminEmpty title="No media uploaded" body="Upload a hero, project cover or gallery asset from its editor." />
      ) : (
        <div className="overflow-x-auto border border-ink/10">
          <table className="admin-table min-w-[44rem]"><thead><tr><th>File</th><th>Folder</th><th>Size</th><th>Updated</th></tr></thead><tbody>
            {files.map((file) => (
              <tr key={file.name}>
                <td><a href={getPublicMediaUrl(file.name)} target="_blank" rel="noreferrer" className="break-all text-sm text-ink hover:text-violet">{file.name}</a></td>
                <td className="text-sm text-ink-dim">{file.folder}</td>
                <td className="font-mono text-xs text-ink-faint">{size(file.size)}</td>
                <td className="font-mono text-xs text-ink-faint">{file.updatedAt ? new Date(file.updatedAt).toLocaleDateString("en-GB") : "—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
