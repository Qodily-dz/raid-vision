"use client";

import { useMemo, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { CategoryView, ProjectCardView } from "@/types/content";
import { cn } from "@/lib/utils";
import ProjectCard, { type CardVariant } from "./project-card";

/**
 * Repeating composition so the work page reads as an edit rather than a grid of
 * identical cards. Spans are deliberately uneven.
 */
const LAYOUT: { variant: CardVariant; span: string }[] = [
  { variant: "wide", span: "md:col-span-12" },
  { variant: "portrait", span: "md:col-span-5" },
  { variant: "portrait", span: "md:col-span-5 md:mt-20" },
  { variant: "square", span: "md:col-span-6" },
  { variant: "portrait", span: "md:col-span-5" },
  { variant: "tile", span: "md:col-span-7" },
];

type SortKey = "curated" | "newest" | "oldest" | "az";

type ProjectBrowserProps = {
  projects: ProjectCardView[];
  categories: CategoryView[];
  locale: string;
};

/**
 * Work index with client-side filtering.
 *
 * All projects are already loaded server-side (RLS decides what is visible), so
 * filtering is instant and costs no round trips.
 */
export default function ProjectBrowser({ projects, categories, locale }: ProjectBrowserProps) {
  const dict = getDictionary(locale);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("curated");

  const visible = useMemo(() => {
    const filtered = category
      ? projects.filter((project) =>
          project.categories.some((item) => item.slug === category),
        )
      : [...projects];

    switch (sort) {
      case "newest":
        return filtered.sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.updatedAt).getTime() -
            new Date(a.publishedAt ?? a.updatedAt).getTime(),
        );
      case "oldest":
        return filtered.sort(
          (a, b) =>
            new Date(a.publishedAt ?? a.updatedAt).getTime() -
            new Date(b.publishedAt ?? b.updatedAt).getTime(),
        );
      case "az":
        return filtered.sort((a, b) => a.title.localeCompare(b.title, locale));
      case "curated":
      default:
        return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }, [projects, category, sort, locale]);

  const chip = (active: boolean) =>
    cn(
      "kicker border px-3 py-1.5 transition-colors",
      active
        ? "border-violet text-violet"
        : "border-ink/15 text-ink-faint hover:border-ink/40 hover:text-ink",
    );

  return (
    <>
      <div className="flex flex-col gap-4 border-y border-ink/10 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="kicker me-2 text-ink-faint">{dict.work.filterLabel}</span>

          <button
            type="button"
            onClick={() => setCategory(null)}
            aria-pressed={category === null}
            className={chip(category === null)}
          >
            {dict.common.all}
          </button>

          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory((current) => (current === item.slug ? null : item.slug))}
              aria-pressed={category === item.slug}
              className={chip(category === item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="kicker text-ink-faint">
            {visible.length === 1
              ? dict.work.resultCountOne
              : dict.work.resultCount.replace("{count}", String(visible.length))}
          </p>

          <div className="flex items-center gap-1">
            <span className="kicker me-2 text-ink-faint">SORT</span>
            {(
              [
                ["curated", "Curated"],
                ["newest", dict.project.publishedOn],
                ["oldest", "↑"],
                ["az", "A–Z"],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                className={cn(
                  "px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors",
                  sort === key ? "text-ink" : "text-ink-faint hover:text-ink-dim",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-12 md:gap-y-20">
          {visible.map((project, index) => {
            const layout = LAYOUT[index % LAYOUT.length];
            return (
              <div
                key={project.id}
                className={cn(
                  "animate-rise",
                  layout.span,
                  index % LAYOUT.length === 2 && "md:col-start-6",
                  index % LAYOUT.length === 4 && "md:col-start-2",
                  index % LAYOUT.length === 5 && "md:col-start-6",
                )}
              >
                <ProjectCard
                  project={project}
                  href={`/${locale}/work/${project.slug}`}
                  variant={layout.variant}
                  index={index}
                  priority={index < 3}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="frame mt-12 grid min-h-[45vh] place-items-center text-center">
          <div>
            <span className="kicker text-violet">404</span>
            <p className="display mt-3 text-3xl">{dict.work.emptyTitle}</p>
            <p className="mt-3 max-w-measure text-ink-dim">{dict.work.emptyBody}</p>
            <button type="button" onClick={() => setCategory(null)} className="btn btn-outline mt-8">
              {dict.common.all}
            </button>
          </div>
        </div>
      )}
    </>
  );
}