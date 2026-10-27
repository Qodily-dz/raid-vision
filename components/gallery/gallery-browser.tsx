"use client";

import { useMemo, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import GalleryTile from "./gallery-tile";
import Lightbox from "./lightbox";
import type { GalleryItemType, GalleryItemView } from "@/types/content";

type GalleryBrowserProps = {
  items: GalleryItemView[];
  locale: string;
};

/**
 * Archive browser: filter by media type, then open a full-screen viewer.
 * Filtering is client-side so switching a chip never round-trips the server.
 */
export default function GalleryBrowser({ items, locale }: GalleryBrowserProps) {
  const dict = getDictionary(locale);
  const [filter, setFilter] = useState<GalleryItemType | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.itemType === filter)),
    [items, filter],
  );

  const filters: { key: GalleryItemType | "all"; label: string }[] = [
    { key: "all", label: dict.gallery.filters.all },
    { key: "image", label: dict.gallery.filters.photos },
    { key: "video", label: dict.gallery.filters.videos },
    { key: "instagram", label: dict.gallery.filters.instagram },
  ];

  const chip = (active: boolean) =>
    cn(
      "kicker border px-3 py-1.5 transition-colors",
      active
        ? "border-violet text-violet"
        : "border-ink/15 text-ink-faint hover:border-ink/40 hover:text-ink",
    );

  return (
    <>
      <div className="flex flex-col gap-4 border-y border-ink/10 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setFilter(entry.key)}
              aria-pressed={filter === entry.key}
              className={chip(filter === entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <p aria-live="polite" className="kicker shrink-0 text-ink-faint">
          {filtered.length === 1
            ? dict.gallery.itemCountOne
            : dict.gallery.itemCount.replace("{count}", String(filtered.length))}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <GalleryTile
              key={item.id}
              item={item}
              index={index}
              onOpen={setOpenIndex}
              priority={index < 3}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            />
          ))}
        </div>
      ) : (
        <div className="frame mt-8 grid min-h-[45vh] place-items-center text-center">
          <div>
            <span className="kicker text-violet">{items.length === 0 ? "404" : "0"}</span>
            <p className="display mt-3 text-2xl">
              {items.length === 0 ? dict.gallery.emptyTitle : dict.common.empty}
            </p>
            {items.length === 0 ? (
              <p className="mt-3 max-w-measure text-ink-dim">{dict.gallery.emptyBody}</p>
            ) : null}
          </div>
        </div>
      )}

      <Lightbox
        items={filtered}
        index={openIndex}
        locale={locale}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </>
  );
}