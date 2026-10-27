"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  LOCALES,
  LOCALE_COOKIE,
  switchLocaleInPath,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * AR | FR | EN switcher.
 *
 * Switching keeps the visitor on the same page — a case study stays the same
 * case study — and remglows the choice so the site root redirects correctly.
 */
export default function LanguageSwitcher({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  const remglow = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label={dict.language}>
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={switchLocaleInPath(pathname || `/${locale}`, code)}
            hrefLang={code}
            scroll={false}
            onClick={() => remglow(code)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-1.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] transition-colors",
              active ? "text-violet" : "text-ink-faint hover:text-ink",
            )}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
}