import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPublicMediaUrl } from "@/lib/media/storage";
import type {
  ProjectCardView,
  ProjectDetailView,
  ProjectMediaView,
  ProjectSectionType,
  ProjectSectionView,
} from "@/types/content";
import { cn } from "@/lib/utils";
import Reveal from "@/components/cinematic/reveal";
import VideoPlayer from "@/components/video/video-player";
import MediaBlock from "./media-block";
import ProjectCard from "./project-card";

/**
 * Renders the case study from the flexible section model.
 *
 * Every project composes its own structure: sections are free-form blocks in
 * whatever order makes the story work, and media is interleaved between them.
 * Nothing here assumes a fixed template.
 */
export default function CaseStudy({
  project,
  locale,
  nextProject,
  related,
}: {
  project: ProjectDetailView;
  locale: string;
  nextProject: ProjectCardView | null;
  related: ProjectCardView[];
}) {
  const dict = getDictionary(locale);

  const heroPoster = getPublicMediaUrl(project.coverPosterPath);
  const heroVideo =
    project.coverType === "video" ? getPublicMediaUrl(project.coverMediaPath) : "";
  const heroImage =
    project.coverType === "image" ? getPublicMediaUrl(project.coverMediaPath) : "";

  const meta: [string, string | null][] = [
    [dict.project.client, project.clientName],
    [dict.project.year, project.year ? String(project.year) : null],
    [dict.project.category, project.categories.map((item) => item.name).join(" · ") || null],
  ];

  // Media blocks are distributed between text sections so the page alternates
  // between reading and looking instead of stacking all text, then all images.
  const mediaQueue = [...project.media];

  // The featured clip leads, and must leave the queue so it cannot also appear
  // in the body below.
  const leadIndex = mediaQueue.findIndex((item) => item.featured);
  const lead =
    leadIndex === -1 ? mediaQueue.shift() : mediaQueue.splice(leadIndex, 1)[0];

  return (
    <article>
      {/* ---------------------------------------------------------------- Hero */}
      <header className="relative flex min-h-[70vh] items-end overflow-hidden pt-28 sm:min-h-[85vh]">
        {heroVideo ? (
          <VideoPlayer
            src={heroVideo}
            poster={heroPoster || null}
            aspectClass="absolute inset-0 h-full w-full"
            autoplay
            loop
            locale={locale}
            label={project.title}
            priority
            className="!frame-0"
          />
        ) : heroImage ? (
          <Image
            src={heroImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-char" />
        )}

        <div className="scrim-full absolute inset-0" />

        <div className="shell relative z-10 pb-16 sm:pb-24">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="kicker text-violet">
                {project.categories[0]?.name ?? dict.project.film}
              </span>
              {project.year ? (
                <span aria-hidden="true" className="h-px w-8 bg-ink/30" />
              ) : null}
              {project.year ? (
                <span className="kicker">{project.year}</span>
              ) : null}
            </div>

            <h1 className="display mt-5 max-w-[16ch] text-5xl leading-[0.9] text-balance sm:text-7xl lg:text-8xl">
              {project.title}
            </h1>

            {project.summary ? (
              <p className="mt-6 max-w-measure text-lg leading-relaxed text-ink-dim sm:text-xl">
                {project.summary}
              </p>
            ) : null}
          </Reveal>
        </div>
      </header>

      {/* --------------------------------------------------------- Credits bar */}
      <div className="border-y border-ink/10">
        <dl className="shell-wide grid gap-6 py-6 sm:grid-cols-3">
          {meta.map(([label, value]) =>
            value ? (
              <div key={label}>
                <dt className="kicker text-ink-faint">{label}</dt>
                <dd className="mt-1.5 text-sm text-ink">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      {/* --------------------------------------------------------------- Body */}
      <div className="shell-wide py-16 sm:py-24">
        {project.sections.map((section, index) => (
          <SectionBlock
            key={section.id}
            section={section}
            locale={locale}
            index={index}
            media={mediaQueue.length > 0 ? mediaQueue.shift() : undefined}
          />
        ))}

        {lead ? (
          <Reveal className="mt-20" variant="wipe">
            <MediaBlock media={lead} locale={locale} label={project.title} priority />
          </Reveal>
        ) : null}

        {mediaQueue.length > 0 ? (
          <div className="mt-16 grid gap-10 sm:grid-cols-2">
            {mediaQueue.map((media) => (
              <MediaBlock
                key={media.id}
                media={media}
                locale={locale}
                label={project.title}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------------ Related / next */}
      <div className="border-t border-ink/10">
        <div className="shell-wide py-16 sm:py-24">
          {related.length > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">05</span>
                <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
                <span className="kicker">{dict.project.relatedWork}</span>
              </div>

              <div className="mt-10 grid gap-8 sm:grid-cols-3">
                {related.map((item, index) => (
                  <ProjectCard
                    key={item.id}
                    project={item}
                    href={`/${locale}/work/${item.slug}`}
                    variant={index === 1 ? "portrait" : "tile"}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : null}

          {nextProject ? (
            <Link
              href={`/${locale}/work/${nextProject.slug}`}
              className="group mt-16 block border-t border-ink/10 pt-10"
            >
              <span className="kicker text-ink-faint">{dict.project.nextProject}</span>
              <span className="display mt-3 flex items-center gap-4 text-4xl transition-colors group-hover:text-violet sm:text-6xl">
                {nextProject.title}
                <span aria-hidden="true" className="text-2xl">
                  →
                </span>
              </span>
            </Link>
          ) : null}

          <Link
            href={`/${locale}/work`}
            className="kicker mt-12 inline-block text-ink-dim transition-colors hover:text-ink"
          >
            ← {dict.project.backToWorkAll}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

const SECTION_LABELS: Record<ProjectSectionType, keyof ReturnType<typeof getDictionary>["project"]["sectionTypes"]> = {
  overview: "overview",
  brief: "brief",
  challenge: "challenge",
  concept: "concept",
  creative_direction: "creative_direction",
  production: "production",
  editing: "editing",
  color_grading: "color_grading",
  process: "process",
  behind_the_scenes: "behind_the_scenes",
  results: "results",
  credits: "credits",
  custom: "custom",
};

function SectionBlock({
  section,
  locale,
  index,
  media,
}: {
  section: ProjectSectionView;
  locale: string;
  index: number;
  media?: ProjectMediaView;
}) {
  const dict = getDictionary(locale);
  const labelKey = SECTION_LABELS[section.sectionType] ?? "custom";
  const label = dict.project.sectionTypes[labelKey];
  const flip = index % 2 === 1;

  return (
    <section className={cn("grid gap-10 border-t border-ink/10 py-14 md:grid-cols-12", index === 0 && "border-t-0 pt-0")}>
      <Reveal className={cn("md:col-span-4", flip && "md:order-2")}>
        <div className="flex items-center gap-3 md:sticky md:top-28">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden="true" className="h-px w-6 bg-ink/20" />
          <span className="kicker">{label}</span>
        </div>
        {section.heading ? (
          <h2 className="display mt-4 text-3xl leading-tight sm:text-4xl">{section.heading}</h2>
        ) : null}
      </Reveal>

      <Reveal
        className={cn("md:col-span-8", flip && "md:order-1")}
        delay={80}
      >
        {section.body ? (
          <div className="max-w-measure whitespace-pre-line text-lg leading-relaxed text-ink-dim">
            {section.body}
          </div>
        ) : null}

        {media ? (
          <div className="mt-10">
            <MediaBlock media={media} locale={locale} label={section.heading || label} />
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}
