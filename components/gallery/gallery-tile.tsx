import Image from "next/image";
import { getPublicMediaUrl } from "@/lib/media/storage";
import type { GalleryItemView } from "@/types/content";
import { cn } from "@/lib/utils";

type GalleryTileProps = {
  item: GalleryItemView;
  index: number;
  /** When provided the tile becomes a button that opens the lightbox. */
  onOpen?: (index: number) => void;
  sizes?: string;
  priority?: boolean;
};

/**
 * A frame from the archive.
 *
 * Video items show their poster and Instagram posts show whatever still was
 * saved locally, so the grid never starts playing or reaches out to Instagram on
 * its own. Nothing is ever scraped.
 */
export default function GalleryTile({
  item,
  index,
  onOpen,
  sizes = "(max-width: 640px) 50vw, 33vw",
  priority = false,
}: GalleryTileProps) {
  const isVideo = item.itemType === "video";
  const isInstagram = item.itemType === "instagram";

  const image =
    (isVideo ? getPublicMediaUrl(item.posterPath) : getPublicMediaUrl(item.storagePath)) ||
    getPublicMediaUrl(item.posterPath) ||
    getPublicMediaUrl(item.storagePath);

  const badge = isInstagram ? "IG" : isVideo ? "▶" : String(index + 1).padStart(2, "0");

  const frame = (
    <>
      <div className="relative aspect-square w-full overflow-hidden sm:aspect-[4/5]">
        {image ? (
          <Image
            src={image}
            alt={item.caption || item.title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[1.4s] ease-cinema group-hover:scale-[1.04]"
          />
        ) : (
          <span className="kicker absolute inset-0 grid place-items-center text-ink-faint">
            {isInstagram ? "INSTAGRAM" : "—"}
          </span>
        )}

        <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="kicker line-clamp-2 text-ink">{item.title}</span>
          <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.2em] text-ink-dim">
            {badge}
          </span>
        </div>
      </div>

      {item.linkedProjectSlug ? (
        <p className="kicker mt-2 truncate text-ink-faint">{item.linkedProjectTitle}</p>
      ) : null}
    </>
  );

  const className = cn(
    "group block w-full text-start",
    onOpen &&
      "cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet",
  );

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(index)} className={className}>
        {frame}
      </button>
    );
  }

  return <figure className={className}>{frame}</figure>;
}