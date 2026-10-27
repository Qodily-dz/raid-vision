"use client";

import { useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type HeroVideoProps = {
  videoUrl: string | null;
  posterUrl: string | null;
  locale: string;
  className?: string;
  priority?: boolean;
};

/**
 * Full-bleed background media for the hero.
 *
 * Muted, inline and looping so it never fights the visitor's audio. A pause
 * control is provided for accessibility, and the poster is used until the video
 * is actually ready — a failed video simply leaves the poster in place.
 */
export default function HeroVideo({
  videoUrl,
  posterUrl,
  locale,
  className,
  priority = true,
}: HeroVideoProps) {
  const dict = getDictionary(locale);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const attempt = video.play();
    if (attempt) {
      attempt
        .then(() => {
          setPlaying(true);
          setReady(true);
        })
        .catch(() => {
          // Autoplay refused (data saver, low power): the poster carries the hero.
          setPlaying(false);
          setReady(true);
        });
    } else {
      setReady(true);
    }
  }, [videoUrl]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-black", className)}>
      {videoUrl ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            ready && playing ? "opacity-100" : "opacity-0",
          )}
          src={videoUrl}
          poster={posterUrl ?? undefined}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "auto" : "metadata"}
          aria-hidden="true"
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : null}

      {posterUrl ? (
        // Always rendered underneath: it is the fallback if the video never loads.
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
            playing ? "opacity-0" : "opacity-100",
          )}
          style={{ backgroundImage: `url(${posterUrl})` }}
          role="img"
          aria-label={dict.home.selectedWork}
        />
      ) : null}

      <div className="scrim-full absolute inset-0" />

      {videoUrl ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? dict.common.pauseVideo : dict.common.playVideo}
          className="absolute bottom-6 end-6 z-20 flex items-center gap-2 border border-ink/25 bg-black/40 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-dim backdrop-blur-sm transition-colors hover:border-violet hover:text-violet"
        >
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
          {playing ? "PAUSE" : "PLAY"}
        </button>
      ) : null}
    </div>
  );
}