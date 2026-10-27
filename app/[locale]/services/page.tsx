import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getServices } from "@/lib/queries/services";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import Reveal from "@/components/cinematic/reveal";
import ServiceCard, { formatPrice } from "@/components/services/service-card";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return {
    title: dict.services.title,
    description: dict.services.intro,
    alternates: { canonical: `${siteUrl}/${locale}/services` },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const services = await getServices(locale);

  const packages = services.flatMap((service) =>
    service.packages
      .filter((item) => item.active)
      .map((item) => ({ ...item, serviceName: service.name, currency: item.currency || service.currency })),
  );

  return (
    <>
      <PageHeader
        number="03"
        kicker={dict.nav.services}
        title={dict.services.title}
        intro={dict.services.intro}
      />

      {/* ----------------------------------------------------------- Services */}
      <section className="shell-wide py-20 sm:py-28">
        {services.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.id} delay={index * 60} className="scroll-mt-32">
                <div id={service.slug}>
                  <ServiceCard service={service} locale={locale} index={index} />
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="frame grid min-h-[40vh] place-items-center text-center">
            <div>
              <span className="kicker text-violet">404</span>
              <p className="display mt-3 text-3xl">{dict.services.emptyTitle}</p>
              <p className="mt-3 text-ink-dim">{dict.services.emptyBody}</p>
            </div>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- Packages */}
      {packages.length > 0 ? (
        <section className="border-t border-ink/10 py-20 sm:py-28">
          <div className="shell-wide">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">04</span>
              <span aria-hidden="true" className="h-px w-10 bg-ink/20" />
              <span className="kicker">{dict.services.packages}</span>
            </div>
            <h2 className="display mt-6 max-w-[20ch] text-4xl leading-[0.95] text-balance sm:text-6xl">
              {dict.services.packages}
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {packages.map((item, index) => {
                const price = formatPrice(
                  {
                    priceType: item.price === null ? "custom_quote" : "fixed",
                    price: item.price,
                    maxPrice: null,
                    currency: item.currency,
                    unit: "",
                  },
                  dict,
                );

                return (
                  <Reveal key={item.id} delay={index * 60}>
                    <article
                      className={`frame flex h-full flex-col p-6 transition-colors sm:p-8 ${
                        item.featured ? "border-violet/50" : ""
                      }`}
                    >
                      {item.featured ? (
                        <span className="kicker text-violet">{dict.services.featured}</span>
                      ) : (
                        <span className="kicker text-ink-faint">{item.serviceName}</span>
                      )}

                      <h3 className="display mt-4 text-3xl leading-none">{item.name}</h3>

                      {item.description ? (
                        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                          {item.description}
                        </p>
                      ) : null}

                      <p className="mt-6 font-mono text-sm tracking-[0.08em]">{price}</p>

                      <div className="mt-auto pt-8">
                        <Link
                          href={`/${locale}/contact?service=${item.id}`}
                          className="kicker text-ink-dim transition-colors hover:text-violet"
                        >
                          {dict.services.enquire} →
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ Process */}
      <section className="border-t border-ink/10 py-20 sm:py-28">
        <div className="shell-wide">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">05</span>
            <span aria-hidden="true" className="h-px w-10 bg-ink/20" />
            <span className="kicker">{dict.services.processTitle}</span>
          </div>

          <ol className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
            {dict.services.process.map((step, index) => (
              <li key={step} className="bg-black p-6">
                <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 leading-relaxed text-ink-dim">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="display max-w-[24ch] text-3xl leading-tight sm:text-5xl">
              {dict.about.contactTitle}
            </p>
            <Link href={`/${locale}/contact`} className="btn btn-violet shrink-0">
              {dict.home.ctaAction} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}