type TitleSequenceProps = {
  /** Already-split lines, so the caller controls where titles break. */
  lines: string[];
  className?: string;
  as?: "h1" | "h2";
};

/**
 * Title-card headline.
 *
 * Each line is masked by its own overflow box and rises into frame on a stagger,
 * the way a main title lands over a shot. The mask lives in CSS with `both`
 * fill, so the first line is already correct on first paint and the whole thing
 * still resolves if JavaScript never runs.
 *
 * Arabic needs looser leading and no uppercasing, so the caller passes its own
 * display classes rather than the animation owning typography.
 */
export default function TitleSequence({
  lines,
  className,
  as: Tag = "h1",
}: TitleSequenceProps) {
  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="title-line">
          <span style={{ "--line": index } as React.CSSProperties}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
