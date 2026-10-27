import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Page heading used across the dashboard. */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="display text-3xl leading-none sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-measure text-sm text-ink-dim">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

/** A card/panel surface. */
export function AdminPanel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("border border-ink/10 bg-ink/[0.02]", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-3.5">
          <div>
            <h2 className="kicker">{title}</h2>
            {description ? <p className="mt-1 text-xs text-ink-faint">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Labelled stat tile for the overview. */
export function AdminStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const body = (
    <>
      <p className="kicker text-ink-faint">{label}</p>
      <p className="display mt-3 text-4xl leading-none tabular">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="border border-ink/10 bg-ink/[0.02] p-5 transition-colors hover:border-violet/50"
      >
        {body}
      </Link>
    );
  }

  return <div className="border border-ink/10 bg-ink/[0.02] p-5">{body}</div>;
}

/** Empty state for any collection. */
export function AdminEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-[16rem] place-items-center p-8 text-center">
      <div>
        <span className="kicker text-violet">0</span>
        <p className="display mt-3 text-2xl">{title}</p>
        {body ? <p className="mx-auto mt-2 max-w-sm text-sm text-ink-dim">{body}</p> : null}
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

/** Small text status pill. */
export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "brand";
}) {
  const tones = {
    neutral: "border-ink/20 text-ink-dim",
    good: "border-emerald-500/40 text-emerald-300",
    warn: "border-amber-500/40 text-amber-300",
    bad: "border-violet/50 text-violet",
    brand: "border-violet/50 bg-violet/10 text-violet",
  } as const;

  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
