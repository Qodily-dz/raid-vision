import { cn } from "@/lib/utils";

type CreditsStripProps = {
  /** Label/value pairs rendered as a film end-credit line-up. */
  items: { label: string; value: string | number }[];
  className?: string;
};

/**
 * Lower-third credit line-up.
 *
 * Used as a quiet band between hero and work: it gives the eye a horizontal
 * anchor after the full-bleed hero, and reports real counts so the page carries
 * information rather than decoration.
 *
 * Renders nothing when there is nothing to say, so an unconfigured site does not
 * show a row of zeroes.
 */
export default function CreditsStrip({ items, className }: CreditsStripProps) {
  const visible = items.filter(
    (item) => item.value !== "" && item.value !== 0 && item.value !== undefined,
  );

  if (visible.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid divide-y divide-ink/10 border-y border-ink/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4",
        className,
      )}
    >
      {visible.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-4 px-5 py-5 sm:flex-col sm:items-start sm:gap-2 lg:px-8">
          <dt className="kicker">{item.label}</dt>
          <dd className="display text-3xl leading-none sm:text-4xl">
            <span className="tabular">{item.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}