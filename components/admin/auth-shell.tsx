import Link from "next/link";

/** Shared frame for the sign-in / password-recovery screens. */
export default function AuthShell({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,45,32,0.12),transparent_60%)]"
      />

      <div className="relative w-full max-w-sm">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="display text-4xl transition-colors group-hover:text-violet">
            Raid
          </span>
          <span className="display text-4xl text-ink-dim">VISION</span>
        </Link>

        <p className="kicker mt-6">{kicker}</p>
        <h1 className="display mt-3 text-2xl leading-tight">{title}</h1>
        {body ? <p className="mt-3 text-sm leading-relaxed text-ink-dim">{body}</p> : null}

        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}