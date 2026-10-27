"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
  poster?: string | null;
  /** Tailwind aspect utility. Defaults to 16:9. */
  aspectClass?: string;
  /** Autoplaying media is always muted; sound requires an explicit click. */
  autoplay?: boolean;
  loop?: boolean;
  allowSound?: boolean;
  locale: string;
  label: string;
  className?: string;
  /** Above-the-fold media may load eagerly. */
  priority?: boolean;
};

/**
 * Accessible video with a poster, real controls and a graceful failure state.
 *
 * Never autoplays with sound: `autoplay` only ever produces muted, inline
 * playback, and the sound toggle appears after the visitor interacts.
 */
export default function VideoPlayer({
  src,
  poster,
  aspectClass = "aspect-video",
  autoplay = false,
  loop = false,
  allowSound = false,
  locale,
  label,
  className,
  priority = false,
}: VideoPlayerProps) {
  const dict = getDictionary(locale);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!autoplay) return;

    // Autoplay is muted + inline by design.
    video.muted = true;
    const attempt = video.play();
    if (attempt) {
      attempt.catch(() => setPlaying(false));
    }
  }, [autoplay, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => setFailed(true);
    const onTimeUpdate = () => {
      setTimecode(formatTimecode(video.currentTime));
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // The first deliberate play is what unlocks sound.
      if (allowSound && !autoplay) video.muted = false;
      video.play().catch(() => setFailed(true));
    } else {
      video.pause();
    }
  }, [allowSound, autoplay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      container.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  return (
    <div
      className={cn("frame group relative", aspectClass, className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onFocus={() => setShowControls(true)}
    >
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-char px-6 text-center">
          <span className="kicker text-violet">ERR</span>
          <p className="max-w-xs text-sm text-ink-dim">{dict.common.videoUnavailable}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster ?? undefined}
            muted={muted}
            loop={loop}
            playsInline
            preload={priority ? "auto" : "metadata"}
            aria-label={label}
            controls={false}
            disablePictureInPicture
          />

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? dict.common.pauseVideo : dict.common.playVideo}
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300",
              playing ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : "opacity-100",
            )}
          >
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center border border-ink/40 bg-black/40 backdrop-blur-sm transition-colors group-hover:border-violet group-hover:bg-violet"
            >
              {playing ? (
                <svg viewBox="0 0 12 12" className="h-4 w-4 fill-ink">
                  <rect x="1" y="1" width="3.5" height="10" />
                  <rect x="7.5" y="1" width="3.5" height="10" />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" className="ms-0.5 h-4 w-4 fill-ink">
                  <path d="M1 0.5 L11 6 L1 11.5 Z" />
                </svg>
              )}
            </span>
          </button>

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-4 py-3 font-mono text-[0.65rem] tracking-[0.18em] text-ink/80 transition-opacity duration-300",
              showControls || !playing ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="tabular">{timecode}</span>
            <div className="pointer-events-auto flex items-center gap-2">
              {allowSound ? (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? dict.common.unmuteVideo : dict.common.muteVideo}
                  className="border border-ink/25 px-2 py-1 transition-colors hover:border-violet hover:text-violet"
                >
                  {muted ? "SOUND OFF" : "SOUND ON"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={dict.common.viewProject}
                className="border border-ink/25 px-2 py-1 transition-colors hover:border-violet hover:text-violet"
              >
                FULL
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** `00:00:23:18` — frames are rendered at 24fps for the cinema feel. */
function formatTimecode(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00:00:00";
  const total = Math.max(0, seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const frames = Math.floor((total % 1) * 24);

  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
}