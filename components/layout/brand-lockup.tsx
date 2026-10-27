import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The brand lockup. "Raid" and "VISION" are stacked and offset like a film
 * title card, while the legal brand name stays "Raid VISION".
 */
export default function BrandLockup({
  brandName = "Raid VISION",
  className,
  compact = false,
}: {
  brandName?: string;
  className?: string;
  compact?: boolean;
}) {
  const [first, second = ""] = brandName.split(" ");

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex flex-col leading-none",
        className,
      )}
      aria-label={brandName}
    >
      <span
        className={cn(
          "display transition-[color,text-shadow] duration-300 group-hover:text-glow group-hover:text-shadow-[0_0_14px_rgb(var(--violet)/0.7)]",
          compact ? "text-lg" : "text-xl sm:text-2xl",
        )}
        style={{ letterSpacing: "0.04em" }}
      >
        {first}
      </span>
      {second ? (
        <span
          className={cn(
            "display mt-0.5 text-ink-dim transition-colors group-hover:text-ink-dim",
            compact ? "text-lg" : "text-xl sm:text-2xl",
          )}
          style={{ letterSpacing: "0.26em" }}
        >
          {second}
        </span>
      ) : null}
    </Link>
  );
}