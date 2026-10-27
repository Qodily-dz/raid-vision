"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; exact?: boolean; badge?: number };

/**
 * Sidebar navigation for the dashboard.
 *
 * Active state is derived from the pathname on the client so the server can
 * render a single markup tree without threading the current route through
 * every page.
 */
export default function AdminNav({
  items,
  footer,
}: {
  items: NavItem[];
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-ink/10 bg-black/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" className="display text-lg">
          Raid <span className="text-ink-dim">VISION</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="kicker border border-ink/20 px-3 py-1.5"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="admin-nav"
        aria-label="Dashboard"
        className={cn(
          "flex-col gap-1 border-e border-ink/10 bg-black p-4 md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:border-e",
          open ? "flex" : "hidden",
        )}
      >
        <div className="mb-6 hidden md:block">
          <Link href="/admin" className="group flex flex-col leading-none">
            <span className="display text-2xl transition-colors group-hover:text-violet">
              Raid
            </span>
            <span className="display text-2xl text-ink-dim">VISION</span>
          </Link>
        </div>

        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-none border-s-2 px-3 py-2.5 text-sm transition-colors",
                  isActive(item)
                    ? "border-violet bg-ink/[0.06] text-ink"
                    : "border-transparent text-ink-dim hover:bg-ink/[0.03] hover:text-ink",
                )}
              >
                {item.label}
                {item.badge ? (
                  <span className="rounded-full bg-violet px-2 py-0.5 font-mono text-[0.6rem] text-black">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {footer ? <div className="mt-auto pt-6">{footer}</div> : null}
      </nav>
    </>
  );
}
