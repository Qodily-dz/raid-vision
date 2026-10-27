import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

/**
 * Not found inside a locale segment. `not-found.tsx` cannot read route params,
 * so it renders in the default language while the layout keeps the correct
 * `lang`/`dir` — a better outcome than crashing or guessing.
 */
export default function LocaleNotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,45,32,0.12),transparent_65%)]"
      />
      <div className="grain absolute inset-0 opacity-[0.05]" aria-hidden="true" />

      <div className="shell relative px-5 text-center">
        <span className="display block text-[22vw] leading-none text-ink/10 sm:text-[14rem]">
          404
        </span>
        <h1 className="display -mt-6 text-4xl sm:text-6xl">{dict.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-measure text-lg text-ink-dim">{dict.notFound.body}</p>
        <Link href={`/${DEFAULT_LOCALE}`} className="btn btn-violet mt-10">
          {dict.notFound.action}
        </Link>
      </div>
    </section>
  );
}