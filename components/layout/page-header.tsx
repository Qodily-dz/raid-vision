import { cn } from "@/lib/utils";

/**
 * Shared page masthead for the inner public pages: a clip counter, a mono
 * kicker, a display title and an optional intro paragraph.
 *
 * Sits below the fixed header so nothing important hides behind it.
 */
export default function PageHeader({
  number,
  kicker,
  title,
  intro,
  children,
  className,
}: {
  number: string;
  kicker: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-ink/10 pt-36 sm:pt-48",
        className,
      )}
    >
      {/* Faint film-grain wash so the masthead is not a flat black rectangle. */}
      <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.06]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,45,32,0.10),transparent_60%)]"
      />

      <div className="shell-wide relative pb-14 sm:pb-20">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">
            {number}
          </span>
          <span aria-hidden="true" className="h-px w-10 bg-ink/20" />
          <span className="kicker">{kicker}</span>
        </div>

        <h1 className="display mt-6 max-w-[16ch] text-5xl leading-[0.9] text-balance sm:text-7xl lg:text-8xl">
          {title}
        </h1>

        {intro ? (
          <p className="mt-7 max-w-measure text-lg leading-relaxed text-ink-dim sm:text-xl">
            {intro}
          </p>
        ) : null}

        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </header>
  );
}