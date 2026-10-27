import CropMarks from "./crop-marks";

type SectionEmptyProps = {
  title: string;
  body: string;
  /** Rendered under the message, e.g. a link to the full archive. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * A section with nothing in it yet.
 *
 * The important job here is to *not disappear*: a portfolio whose sections
 * vanish when the database is empty reads as a broken page rather than an
 * unconfigured one. So the empty state keeps the section's frame, its number and
 * its height — an unlit frame in a film, not a hole in the reel.
 */
export default function SectionEmpty({
  title,
  body,
  children,
  className,
}: SectionEmptyProps) {
  return (
    <div
      className={`relative grid min-h-[16rem] place-items-center overflow-hidden border border-ink/10 bg-char/40 px-6 py-16 text-center sm:min-h-[20rem] ${className ?? ""}`}
    >
      {/* The light is still on, even with nothing in the frame. */}
      <div aria-hidden="true" className="lights opacity-60" />
      <CropMarks inset="clamp(0.75rem, 2vw, 1.75rem)" />

      <div className="relative z-10 max-w-md">
        <p aria-hidden="true" className="mx-auto mb-5 h-px w-10 bg-violet/50" />
        <h3 className="display text-2xl leading-tight text-ink-dim sm:text-3xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-faint">{body}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}