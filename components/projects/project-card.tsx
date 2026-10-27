import Link from "next/link";
import { getPublicMediaUrl } from "@/lib/media/storage";
import type { ProjectCardView } from "@/types/content";
import { ASPECT_CLASS, type AspectRatio } from "@/types/content";
import { cn } from "@/lib/utils";
import CoverMedia from "@/components/media/cover-media";
import HoverPreview from "@/components/video/hover-preview";

export type CardVariant = "feature" | "portrait" | "wide" | "tile" | "square" | "bleed";

const VARIANT_ASPECT: Record<CardVariant, AspectRatio> = {
  feature: "16:9",
  portrait: "4:5",
  wide: "21:9",
  tile: "4:3",
  square: "1:1",
  bleed: "2.39:1",
};

const VARIANT_SIZE: Record<CardVariant, string> = {
  feature: "(max-width: 768px) 100vw, 66vw",
  portrait: "(max-width: 768px) 92vw, 30vw",
  wide: "(max-width: 768px) 100vw, 92vw",
  tile: "(max-width: 768px) 92vw, 38vw",
  square: "(max-width: 768px) 46vw, 24vw",
  bleed: "100vw",
};

type ProjectCardProps = {
  project: ProjectCardView;
  href: string;
  variant?: CardVariant;
  priority?: boolean;
  /** Overlay type on the cover, used for the home page feature card. */
  overlay?: boolean;
  index?: number;
};

/**
 * A project in the grid.
 *
 * Compositions vary on purpose: a portfolio should not read as a spreadsheet of
 * identical cards. Titles stay quiet; the image does the talking.
 */
export default function ProjectCard({
  project,
  href,
  variant = "tile",
  priority = false,
  overlay = false,
  index,
}: ProjectCardProps) {
  const ratio = VARIANT_ASPECT[variant];
  const videoUrl =
    project.coverType === "video" ? getPublicMediaUrl(project.coverMediaPath) : null;

  const meta = [project.year ? String(project.year) : null, project.categories[0]?.name]
    .filter(Boolean)
    .join("  ·  ");

  const media = (
    <div
      className={cn(
        "frame group/media relative overflow-hidden bg-char",
        // The frame catches the key light when hovered, like a lit print.
        "transition-[box-shadow] duration-500 hover:shadow-[0_0_34px_rgb(var(--violet)/0.28)]",
        ASPECT_CLASS[ratio],
        variant === "portrait" || variant === "square" ? "w-full" : "w-full",
      )}
    >
      <CoverMedia
        project={project}
        priority={priority}
        sizes={VARIANT_SIZE[variant]}
        className="transition-transform duration-[1.4s] ease-cinema group-hover/media:scale-[1.03]"
      />

      {videoUrl ? (
        <div className="absolute inset-0">
          <HoverPreview
            videoUrl={videoUrl}
            posterUrl={getPublicMediaUrl(project.coverPosterPath)}
            alt={project.title}
            sizes={VARIANT_SIZE[variant]}
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover/media:opacity-100" />

      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
          <p className="kicker text-violet">{meta}</p>
          <h3 className="display mt-2 text-3xl text-balance sm:text-5xl">{project.title}</h3>
        </div>
      ) : null}
    </div>
  );

  return (
    <article className={cn("group relative", variant === "portrait" && "sm:pe-6")}>
      <Link
        href={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
      >
        {media}

        {!overlay ? (
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="display truncate text-xl transition-colors group-hover:text-violet sm:text-2xl">
                {project.title}
              </h3>
              {project.summary ? (
                <p className="mt-1 line-clamp-2 max-w-measure text-sm leading-relaxed text-ink-faint">
                  {project.summary}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-end">
              {index !== undefined ? (
                <span className="block font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
              {meta ? (
                <span className="mt-1 block font-mono text-[0.65rem] tracking-[0.12em] text-ink-faint">
                  {meta}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <span className="sr-only">{project.title}</span>
      </Link>
    </article>
  );
}