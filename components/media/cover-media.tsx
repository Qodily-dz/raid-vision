import Image from "next/image";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { ASPECT_CLASS, type AspectRatio, type ProjectCardView } from "@/types/content";
import { cn } from "@/lib/utils";
type CoverMediaProps = {
  project: Pick<ProjectCardView, "coverType" | "coverMediaPath" | "coverPosterPath" | "title">;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders a project cover.
 *
 * Video covers always show their poster image rather than an autoplaying clip:
 * a page of cards must never pull down a wall of footage. The clip itself is
 * loaded later by `HoverPreview`, on intent only.
 */
export default function CoverMedia({
  project,
  className,
  sizes = "(max-width: 768px) 100vw, 60vw",
  priority = false,
}: CoverMediaProps) {
  const poster = getPublicMediaUrl(project.coverPosterPath);
  const media = getPublicMediaUrl(project.coverMediaPath);
  const isVideo = project.coverType === "video";

  // A video cover without a poster still gets a frame so the grid never breaks.
  if (isVideo) {
    if (!poster) {
      return (
        <div className={cn("frame h-full w-full bg-char-2", className)} aria-hidden="true" />
      );
    }

    return (
      <Image
        src={poster}
        alt={project.title}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  if (!media) {
    return (
      <div className={cn("frame h-full w-full bg-char-2", className)} aria-hidden="true">
        <span className="kicker absolute inset-0 grid place-items-center text-ink-faint">
          NO COVER
        </span>
      </div>
    );
  }

  return (
    <Image
      src={media}
      alt={project.title}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}

/** Resolves a stored aspect ratio to its Tailwind class, defaulting to 16:9. */
export function aspectFor(ratio: string | null | undefined): string {
  return ASPECT_CLASS[ratio as AspectRatio] ?? ASPECT_CLASS["16:9"];
}