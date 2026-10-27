"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import LanguageSwitcher from "./language-switcher";
import { cn } from "@/lib/utils";
import type { SocialLinks } from "@/types/content";

/**
 * Section ids on the landing page, in document order. The nav follows this
 * order so it reads as a table of contents rather than a list of destinations.
 *
 * Module scope on purpose: the scroll observer only needs the ids, and hoisting
 * them keeps it free of render-scoped dependencies.
 */
const SECTION_IDS = ["work", "services", "gallery", "about", "contact"] as const;

type SectionId = (typeof SECTION_IDS)[number];
type NavItem = { id: SectionId; label: string; path: string };

/**
 * Fixed header. Transparent over the hero, then a solid bar with a hairline once
 * the visitor scrolls, so the first screen stays pure imagery.
 */
export default function SiteHeaderClient({
  locale,
  brandName,
  social,
}: {
  locale: string;
  brandName: string;
  social: SocialLinks;
}) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * The site is one page: these ids are sections on the landing page, in
   * document order. The nav is in that same order so it reads as a table of
   * contents rather than a list of destinations.
   */
  const labels: Record<SectionId, string> = {
    work: dict.nav.work,
    services: dict.nav.services,
    gallery: dict.nav.gallery,
    about: dict.nav.about,
    contact: dict.nav.contact,
  };

  const items: NavItem[] = SECTION_IDS.map((id) => ({
    id,
    label: labels[id],
    path: `/${locale}/${id}`,
  }));

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // On the landing page, highlight the section currently under the header.
  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }

    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      // A band across the upper-middle of the viewport: one section owns it.
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: NavItem) =>
    isHome
      ? activeSection === item.id
      : pathname === item.path || pathname.startsWith(`${item.path}/`);

  /**
   * On the landing page these are plain anchors, so the browser owns the smooth
   * scroll and the hash updates without a router round-trip. Elsewhere they are
   * client-side links that land on the landing page at the right section.
   */
  const hrefFor = (item: NavItem) => (isHome ? `#${item.id}` : `/${locale}/#${item.id}`);

  const linkProps = (
    item: NavItem,
    className: string,
  ): {
    href: string;
    "aria-current": "location" | "page" | undefined;
    className: string;
  } => ({
    href: hrefFor(item),
    "aria-current": isActive(item) ? (isHome ? "location" : "page") : undefined,
    className,
  });

  const [first, second = ""] = brandName.split(" ");

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled || open
            ? "border-b border-ink/10 bg-black/85 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 sm:h-20">
          <div className="flex items-center gap-5">
            <Link
              href={`/${locale}`}
              className="group flex flex-col leading-none"
              aria-label={brandName}
            >
              <span
                className="display text-xl transition-colors group-hover:text-violet sm:text-2xl"
                style={{ letterSpacing: "0.04em" }}
              >
                {first}
              </span>
              {second ? (
                <span
                  className="display mt-0.5 text-xl text-ink-dim sm:text-2xl"
                  style={{ letterSpacing: "0.26em" }}
                >
                  {second}
                </span>
              ) : null}
            </Link>
            <span className="kicker rec-dot animate-blink hidden md:inline-block">REC</span>
          </div>

          <nav aria-label={dict.menu} className="hidden items-center gap-7 lg:flex">
            {items.map((item) => {
              const className = cn(
                "relative text-[0.8rem] uppercase tracking-[0.16em] transition-colors",
                isActive(item) ? "text-ink" : "text-ink-dim hover:text-ink",
              );
              const content = (
                <>
                  {item.label}
                  {isActive(item) ? (
                    <span aria-hidden="true" className="absolute -bottom-1.5 inset-x-0 h-px bg-violet" />
                  ) : null}
                </>
              );

              return isHome ? (
                <a key={item.id} {...linkProps(item, className)}>
                  {content}
                </a>
              ) : (
                <Link key={item.id} {...linkProps(item, className)}>
                  {content}
                </Link>
              );
            })}
            <LanguageSwitcher locale={locale} />
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
            className="flex h-10 items-center gap-3 lg:hidden"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-dim">
              {open ? dict.close : dict.menu}
            </span>
            <span aria-hidden="true" className="flex h-4 w-6 flex-col justify-between">
              <span
                className={cn(
                  "h-px w-full bg-ink transition-transform duration-300",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-ink transition-opacity duration-200",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-ink transition-transform duration-300",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {open ? (
        <div id="mobile-nav" className="fixed inset-0 z-40 animate-fade bg-black lg:hidden">
          <div className="flex h-full flex-col justify-between px-5 pb-10 pt-24">
            <nav aria-label={dict.menu} className="flex flex-col">
              {items.map((item, index) => {
                const className = "display animate-rise border-b border-ink/10 py-4 text-4xl sm:text-5xl";
                const content = (
                  <>
                    <span className="me-4 align-middle font-mono text-[0.6rem] tracking-[0.2em] text-violet">
                      0{index + 1}
                    </span>
                    {item.label}
                  </>
                );

                return isHome ? (
                  <a
                    key={item.id}
                    {...linkProps(item, className)}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    {...linkProps(item, className)}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between gap-4">
              <LanguageSwitcher locale={locale} />
              {social.instagram ? (
                <Link
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="kicker text-ink-dim"
                >
                  Instagram ↗
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}