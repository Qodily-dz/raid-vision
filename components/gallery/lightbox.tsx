"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { GalleryItemView } from "@/types/content";

type LightboxProps = {
  items: GalleryItemView[];
  index: number | null;
  locale: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Full-screen archive viewer with keyboard navigation and focus containment.
 *
 * Closing returns focus to the tile that opened it, so keyboard and screen
 * reader users are never stranded. Arrow glyphs flip with the document
 * direction through a logical `rtl:` variant rather than JavaScript.
 */
export default function Lightbox({
  items,
  index,
  locale,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const dict = getDictionary(locale);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(true);

  const open = index !== null && index >= 0 && index < items.length;
  const item = open ? items[index] : null;

  const go = useCallback(
    (delta: number) => {
      if (items.length === 0 || index === null) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;

    triggerRef.current = (document.activeElement as HTMLElement) ?? null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
      // Arrows follow the reading direction, which is what a visitor expects.
      const rtl = document.documentElement.dir === "rtl";
      if (event.key === "ArrowRight") go(rtl ? -1 : 1);
      if (event.key === "ArrowLeft") go(rtl ? 1 : -1);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open, onClose, go]);

  if (!open || !item) return null;

  const isVideo = item.itemType === "video";
  const isInstagram = item.itemType === "instagram";
  const video = isVideo ? getPublicMediaUrl(item.storagePath) : "";
  const image =
    (isVideo ? getPublicMediaUrl(item.posterPath) : getPublicMediaUrl(item.storagePath)) ||
    getPublicMediaUrl(item.posterPath) ||
    getPublicMediaUrl(item.storagePath);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[60] animate-fade bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-4 sm:p-6">
        <span className="kicker text-ink-dim">
          {dict.gallery.counter
            .replace("{current}", String(index + 1))
            .replace("{total}", String(items.length))}
        </span>

        <div className="flex items-center gap-2">
          {video ? (
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className="kicker border border-ink/25 px-3 py-1.5 transition-colors hover:border-violet hover:text-violet"
            >
              {muted ? dict.common.muteVideo : dict.common.unmuteVideo}
            </button>
          ) : null}

          {isInstagram && item.instagramUrl ? (
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noreferrer noopener me"
              onClick={(event) => event.stopPropagation()}
              className="kicker border border-ink/25 px-3 py-1.5 transition-colors hover:border-violet hover:text-violet"
            >
              {dict.gallery.openOnInstagram} ↗
            </a>
          ) : null}

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={dict.common.closeViewer}
            className="grid h-10 w-10 place-items-center border border-ink/25 transition-colors hover:border-violet hover:text-violet"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      <div
        className="flex h-full w-full items-center justify-center p-4 pb-24 pt-20 sm:p-10 sm:pb-28 sm:pt-24"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={dict.common.previous}
          className="absolute start-3 z-10 grid h-11 w-11 place-items-center border border-ink/25 bg-black/40 transition-colors hover:border-violet hover:text-violet sm:start-6"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">
            ←
          </span>
        </button>

        <div className="flex h-full max-h-full w-full max-w-5xl items-center justify-center">
          {video ? (
            <video
              key={item.id}
              className="max-h-full max-w-full object-contain"
              src={video}
              poster={image || undefined}
              muted={muted}
              autoPlay
              loop
              playsInline
              controls
            />
          ) : image ? (
            <Image
              key={item.id}
              src={image}
              alt={item.caption || item.title}
              width={2048}
              height={2048}
              sizes="100vw"
              className="max-h-full max-w-auto object-contain"
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={dict.common.next}
          className="absolute end-3 z-10 grid h-11 w-11 place-items-center border border-ink/25 bg-black/40 transition-colors hover:border-violet hover:text-violet sm:end-6"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">
            →
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-center sm:p-6">
        <p className="display text-xl">{item.title}</p>
        {item.caption ? (
          <p className="mx-auto mt-1 max-w-measure text-sm text-ink-dim">{item.caption}</p>
        ) : null}
      </div>
    </div>
  );
}