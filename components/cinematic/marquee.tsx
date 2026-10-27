export default function Marquee({
  items,
  speed = 40,
}: {
  items: string[];
  speed?: number;
}) {
  if (items.length === 0) return null;

  const content = Array.from({ length: 4 }).map(() => items).flat();

  return (
    <div className="relative overflow-hidden border-y border-ink/10 py-4 text-ink-dim">
      <div
        className="marquee-track flex shrink-0 gap-10"
        style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
      >
        {content.map((item, index) => (
          <span key={index} className="kicker whitespace-nowrap">
            {item}
            <span aria-hidden="true" className="mx-5 inline-block h-1 w-1 rounded-full bg-violet" />
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="marquee-fade-start" />
      <div aria-hidden="true" className="marquee-fade-end" />
    </div>
  );
}