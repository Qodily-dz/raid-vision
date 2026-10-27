"use client";

import { useEffect } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

/**
 * Route-level error boundary. Labels stay in the default language because this
 * component cannot read the locale segment, but the surrounding layout still
 * supplies the correct `lang` and `dir`.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = getDictionary(DEFAULT_LOCALE);

  useEffect(() => {
    // Surface the digest so a failed render can be traced in the server logs.
    console.error("[raid-vision] route error:", error);
  }, [error]);

  return (
    <section className="relative grid min-h-[80vh] place-items-center px-5">
      <div className="shell text-center">
        <span className="kicker text-violet">ERR</span>
        <h1 className="display mt-4 text-4xl sm:text-6xl">{dict.error.title}</h1>
        <p className="mx-auto mt-5 max-w-measure text-lg text-ink-dim">{dict.error.body}</p>

        {error.digest ? (
          <p className="mt-4 font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
            {error.digest}
          </p>
        ) : null}

        <button type="button" onClick={reset} className="btn btn-outline mt-10">
          {dict.common.errorRetry}
        </button>
      </div>
    </section>
  );
}