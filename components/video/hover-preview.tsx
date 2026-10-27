"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HoverPreviewProps = {
  videoUrl: string | null;
  posterUrl: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Thumbnail that upgrades to a short muted clip while the pointer or keyboard
 * focus is on it.
 *
 * The `<video>` element is only created on intent, so opening a page never
 * downloads a wall of footage, and it is skipped entirely on touch devices and
 * when reduced motion is requested.
 */
export default function HoverPreview({
  videoUrl,
  posterUrl,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: HoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;

    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A connection saving data should not be asked to fetch preview clips.
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection;

    setEnabled(Boolean(fine) && !connection?.saveData);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    video.play().catch(() => setActive(false));
  }, [active]);

  const start = () => {
    if (enabled && videoUrl) setActive(true);
  };

  const stop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setActive(false);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : null}

      {active ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl ?? undefined}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
}