"use client";

import { useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type I18nFieldProps = {
  /** Base field name; inputs are posted as `<name>_ar`, `<name>_fr`, `<name>_en`. */
  name: string;
  label: string;
  value?: Record<string, string> | null;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
  maxLength?: number;
  className?: string;
};

const LOCALE_LABEL: Record<Locale, string> = { ar: "ع", fr: "FR", en: "EN" };

/**
 * One editable value in three languages.
 *
 * The server stores the whole object per field (`title_i18n`, `summary_i18n`, …)
 * and resolves the right language at read time, falling back to English when a
 * translation is missing. Every locale stays in the DOM, so switching tabs never
 * loses what was typed.
 */
export default function I18nField({
  name,
  label,
  value,
  multiline = false,
  rows = 4,
  required = false,
  hint,
  maxLength,
  className,
}: I18nFieldProps) {
  const [active, setActive] = useState<Locale>("en");
  const record = value ?? {};

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="kicker">
          {label}
          {required ? <span className="ms-1 text-violet">*</span> : null}
        </span>

        <div role="tablist" aria-label={`${label} — language`} className="flex gap-1">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              role="tab"
              aria-selected={active === locale}
              onClick={() => setActive(locale)}
              className={cn(
                "px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] transition-colors",
                active === locale
                  ? "bg-violet text-black"
                  : "border border-ink/15 text-ink-faint hover:text-ink",
              )}
            >
              {LOCALE_LABEL[locale]}
              {record[locale] ? <span aria-hidden="true"> •</span> : null}
            </button>
          ))}
        </div>
      </div>

      {LOCALES.map((locale) => {
        const isActive = active === locale;
        const text = record[locale] ?? "";

        return (
          <div key={locale} hidden={!isActive}>
            {multiline ? (
              <textarea
                name={`${name}_${locale}`}
                rows={rows}
                defaultValue={text}
                maxLength={maxLength}
                dir={locale === "ar" ? "rtl" : "ltr"}
                lang={locale}
                aria-label={`${label} (${locale})`}
                className="textarea"
              />
            ) : (
              <input
                type="text"
                name={`${name}_${locale}`}
                defaultValue={text}
                maxLength={maxLength}
                dir={locale === "ar" ? "rtl" : "ltr"}
                lang={locale}
                aria-label={`${label} (${locale})`}
                className="input"
              />
            )}
          </div>
        );
      })}

      {hint ? <p className="text-xs leading-relaxed text-ink-faint">{hint}</p> : null}
    </div>
  );
}