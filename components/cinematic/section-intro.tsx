import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionIntroProps = {
  /** 1-based section number, rendered as a clip counter. */
  number: number;
  kicker: string;
  title: string;
  description?: string;
  align?: "start" | "between";
  children?: ReactNode;
};

/**
 * Section header shared by the public pages: a clipped number, a mono kicker,
 * a display title, and an optional description.
 */
export default function SectionIntro({
  number,
  kicker,
  title,
  description,
  align = "between",
  children,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "between" && "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="neon font-mono text-[0.65rem] tracking-[0.2em]">
            {String(number).padStart(2, "0")}
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
          <span className="kicker">{kicker}</span>
        </div>
        <h2 className="display mt-4 text-4xl leading-[0.95] text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-measure text-lg leading-relaxed text-ink-dim">{description}</p>
        ) : null}
      </div>

      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}