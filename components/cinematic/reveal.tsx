"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** `rise` fades up, `wipe` reveals with a clip-path cut, `none` just delays. */
  variant?: "rise" | "wipe" | "none";
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Scroll reveal driven by an IntersectionObserver.
 *
 * Content is only ever *enhanced*: if the observer never fires, or JavaScript is
 * unavailable, `prefers-reduced-motion` rules and the base styles keep everything
 * readable. Nothing important is hidden behind an animation.
 */
export default function Reveal({
  children,
  variant = "rise",
  delay = 0,
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.revealed = "";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Separate attribute: overwriting `data-reveal` would drop the
            // variant selector mid-transition.
            (entry.target as HTMLElement).dataset.revealed = "";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant === "none" ? undefined : variant}
      className={className}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}