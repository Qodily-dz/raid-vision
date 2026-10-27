"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type TimecodeProps = {
  locale: string;
  /** Frames per second. Matches film, so the counter reads like a real one. */
  fps?: number;
  className?: string;
};

const pad = (value: number, length: number) =>
  String(Math.max(0, Math.floor(value))).padStart(length, "0");

/**
 * Viewfinder timecode for the hero, the kind burned into a camera monitor.
 *
 * Runs on the client only, and it stops dead under `prefers-reduced-motion` so
 * the readout holds a still frame instead of ticking. Announced politely rather
 * than aggressively: it is ambience, not content.
 */
export default function Timecode({ locale, fps = 24, className }: TimecodeProps) {
  const dict = getDictionary(locale);
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let raf = 0;
    const started = performance.now();

    const tick = (now: number) => {
      setFrames(((now - started) / 1000) * fps);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [fps]);

  const totalSeconds = frames / fps;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = Math.floor(totalSeconds) % 60;
  const wholeFrames = Math.floor(frames % fps);

  return (
    <div
      className={cn("flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint", className)}
      aria-live="off"
    >
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="rec-dot animate-blink" />
        <span className="sr-only">{dict.home.recording}</span>
        <span aria-hidden="true">REC</span>
      </span>
      <span aria-hidden="true" className="h-2.5 w-px bg-ink/20" />
      <span className="tabular">
        {pad(hours, 2)}:{pad(minutes, 2)}:{pad(seconds, 2)}
        <span className="text-violet">:{pad(wholeFrames, 2)}</span>
      </span>
    </div>
  );
}