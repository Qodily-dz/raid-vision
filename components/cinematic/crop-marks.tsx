import { cn } from "@/lib/utils";

type CropMarksProps = {
  /** Corner inset. The default matches the hero gutters. */
  inset?: string;
  className?: string;
};

/**
 * Camera framing crop marks.
 *
 * Purely decorative furniture that signals "this frame is deliberate", so it is
 * hidden from assistive technology. Anchored with logical properties, which keeps
 * the corners correct in RTL without a second set of rules.
 */
export default function CropMarks({ inset, className }: CropMarksProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("crop", className)}
      style={inset ? { inset } : undefined}
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}