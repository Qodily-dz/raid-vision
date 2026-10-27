import Image from "next/image";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { toEmbedUrl } from "@/lib/media/external";
import type { ProjectMediaView } from "@/types/content";
import { ASPECT_CLASS } from "@/types/content";
import { cn } from "@/lib/utils";
import VideoPlayer from "@/components/video/video-player";

/**
 * One block of case-study media: an uploaded image, an uploaded video, or an
 * embedded YouTube/Vimeo player.
 *
 * External embeds load lazily and only after the block is near the viewport, so
 * a long case study does not open ten trackers at once.
 */
export default function MediaBlock({
  media,
  locale,
  label,
  priority = false,
  className,
}: {
  media: ProjectMediaView;
  locale: string;
  label: string;
  priority?: boolean;
  className?: string;
}) {
  const aspect = ASPECT_CLASS[media.aspectRatio] ?? ASPECT_CLASS["16:9"];
  const embed = media.mediaType === "external_video" ? toEmbedUrl(media.externalUrl) : null;
  const source = getPublicMediaUrl(media.storagePath);
  const poster = getPublicMediaUrl(media.posterPath);

  const caption = media.caption ? (
    <figcaption className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-ink-faint">
      <span aria-hidden="true" className="mt-1.5 h-px w-4 shrink-0 bg-violet" />
      {media.caption}
    </figcaption>
  ) : null;

  if (embed) {
    return (
      <figure className={className}>
        <div className={cn("frame relative w-full overflow-hidden bg-black", aspect)}>
          <iframe
            src={embed}
            title={media.alt || label}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        {caption}
      </figure>
    );
  }

  if (media.mediaType === "video") {
    return (
      <figure className={className}>
        <VideoPlayer
          src={source}
          poster={poster || null}
          aspectClass={aspect}
          autoplay={media.autoplay}
          loop={media.loop}
          allowSound
          locale={locale}
          label={media.alt || label}
          priority={priority}
        />
        {caption}
      </figure>
    );
  }

  if (!source) return null;

  return (
    <figure className={className}>
      <div className={cn("frame relative w-full overflow-hidden bg-char", aspect)}>
        <Image
          src={source}
          alt={media.alt || label}
          fill
          sizes="(max-width: 768px) 100vw, 90vw"
          priority={priority}
          className="object-cover"
        />
      </div>
      {caption}
    </figure>
  );
}
