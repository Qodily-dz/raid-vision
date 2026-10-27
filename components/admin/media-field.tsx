"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildStoragePath, getPublicMediaUrl, MEDIA_BUCKET } from "@/lib/media/storage";
import { humanFileSize, validateMediaFile } from "@/lib/media/validation";
import { cn } from "@/lib/utils";

type MediaFieldProps = {
  /** Name of the hidden input that receives the stored path. */
  name: string;
  label: string;
  /** Storage path already attached to the record. */
  value?: string | null;
  /** Storage folder, e.g. `projects/<id>`. */
  folder: string;
  accept?: "image" | "video";
  /** Shown next to the preview when a poster is relevant. */
  posterName?: string;
  posterValue?: string | null;
  hint?: string;
};

/**
 * Uploads a file straight to the `raid-media` bucket and keeps only the stored
 * path in the record.
 *
 * The browser client carries the operator's session, so Storage Row Level
 * Security decides whether the write is allowed — an anonymous visitor cannot
 * upload even if they craft the request themselves.
 */
export default function MediaField({
  name,
  label,
  value,
  folder,
  accept = "image",
  posterName,
  posterValue,
  hint,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(value ?? "");
  const [posterPath, setPosterPath] = useState(posterValue ?? "");
  const [status, setStatus] = useState<{ tone: "error" | "ok"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const messages = {
    unsupported: "Unsupported file type. Use JPG, PNG, WebP, AVIF, MP4 or WebM.",
    tooLarge: (limit: string) => `That file is larger than the ${limit} limit.`,
  };

  const upload = async (file: File, slot: "file" | "poster") => {
    const result = validateMediaFile(file);

    if (!result.ok) {
      setStatus({
        tone: "error",
        message:
          result.reason === "type"
            ? messages.unsupported
            : messages.tooLarge(result.limit ?? ""),
      });
      return;
    }

    setBusy(true);
    setStatus(null);

    const supabase = createClient();
    const storagePath = buildStoragePath(folder, file.name);

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

    setBusy(false);

    if (error) {
      setStatus({ tone: "error", message: `Upload failed: ${error.message}` });
      return;
    }

    if (slot === "file") setPath(storagePath);
    else setPosterPath(storagePath);

    setStatus({ tone: "ok", message: `${file.name} — ${humanFileSize(file.size)}` });
  };

  const preview = getPublicMediaUrl(path);
  const poster = getPublicMediaUrl(posterPath);
  const showImage = accept === "image" && preview;

  return (
    <div className="flex flex-col gap-3">
      <span className="kicker">{label}</span>

      <input type="hidden" name={name} value={path} />
      {posterName ? <input type="hidden" name={posterName} value={posterPath} /> : null}

      <div className="flex flex-wrap items-start gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-ink/[0.03]",
            accept === "video" ? "aspect-video w-56" : "aspect-square w-32",
          )}
        >
          {showImage ? (
            <Image src={preview} alt="" fill sizes="128px" className="object-cover" />
          ) : path ? (
            <video
              src={preview || poster}
              poster={poster || undefined}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="kicker px-2 text-center text-ink-faint">—</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-outline cursor-pointer">
              {busy ? "Uploading…" : path ? "Replace" : "Choose file"}
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept={accept === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"}
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file, "file");
                  event.target.value = "";
                }}
              />
            </label>

            {posterName ? (
              <label className="btn btn-outline cursor-pointer">
                {posterPath ? "Replace poster" : "Add poster"}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file, "poster");
                    event.target.value = "";
                  }}
                />
              </label>
            ) : null}

            {path ? (
              <button
                type="button"
                onClick={() => {
                  setPath("");
                  setStatus(null);
                }}
                className="btn btn-outline"
              >
                Clear
              </button>
            ) : null}
          </div>

          {path ? (
            <p className="break-all font-mono text-[0.65rem] leading-relaxed text-ink-faint">
              {path}
            </p>
          ) : (
            <p className="text-xs text-ink-faint">{hint ?? "No file attached."}</p>
          )}

          {status ? (
            <p
              role="status"
              className={cn(
                "text-xs",
                status.tone === "error" ? "text-violet" : "text-emerald-300",
              )}
            >
              {status.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
