import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getSiteSettings } from "@/lib/queries/settings";
import { getServices } from "@/lib/queries/services";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import ContactForm from "@/components/contact/contact-form";
import Reveal from "@/components/cinematic/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return {
    title: dict.contact.title,
    description: dict.contact.intro,
    alternates: { canonical: `${siteUrl}/${locale}/contact` },
    openGraph: { title: dict.contact.title, description: dict.contact.intro },
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const dict = getDictionary(locale);

  const [settings, services] = await Promise.all([getSiteSettings(locale), getServices(locale)]);

  const channels = [
    settings.email
      ? { label: dict.contact.emailLabel, value: settings.email, href: `mailto:${settings.email}`, ltr: true }
      : null,
    settings.phone
      ? {
          label: dict.contact.phoneLabel,
          value: settings.phone,
          href: `tel:${settings.phone.replace(/\s+/g, "")}`,
          ltr: true,
        }
      : null,
    settings.whatsappUrl
      ? {
          label: dict.contact.whatsapp,
          value: dict.common.openInNewTab,
          href: settings.whatsappUrl,
          ltr: false,
        }
      : null,
  ].filter((value): value is NonNullable<typeof value> => Boolean(value));

  return (
    <>
      <PageHeader
        number="05"
        kicker={dict.nav.contact}
        title={dict.contact.title}
        intro={dict.contact.intro}
      />

      <section className="shell-wide grid gap-16 py-20 sm:py-28 lg:grid-cols-12">
        {/* ------------------------------------------------------------ Form */}
        <Reveal className="lg:col-span-7">
          <h2 className="kicker mb-10">{dict.contact.formTitle}</h2>
          <ContactForm
            locale={locale}
            services={services}
            defaultServiceId={query.service}
          />
        </Reveal>

        {/* -------------------------------------------------------- Channels */}
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={100}>
          <div className="lg:sticky lg:top-32">
            <h2 className="kicker mb-8">{dict.contact.channels}</h2>

            <dl className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
              {channels.map((channel) => (
                <div key={channel.label} className="py-5">
                  <dt className="kicker text-ink-faint">{channel.label}</dt>
                  <dd className="mt-2">
                    <a
                      href={channel.href}
                      dir={channel.ltr ? "ltr" : undefined}
                      target={channel.ltr ? undefined : "_blank"}
                      rel={channel.ltr ? undefined : "noreferrer noopener me"}
                      className="break-words text-lg transition-colors hover:text-violet"
                    >
                      {channel.value}
                    </a>
                  </dd>
                </div>
              ))}

              <div className="py-5">
                <dt className="kicker text-ink-faint">{dict.contact.location}</dt>
                <dd className="mt-2 text-lg">{settings.location || "—"}</dd>
              </div>

              <div className="py-5">
                <dt className="kicker text-ink-faint">{dict.contact.availability}</dt>
                <dd className="mt-2 flex items-center gap-3 text-lg">
                  <span
                    aria-hidden="true"
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      settings.availabilityStatus === "booked"
                        ? "bg-ink-faint"
                        : settings.availabilityStatus === "limited"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                  />
                  {dict.admin.settings.availabilityOptions[settings.availabilityStatus]}
                </dd>
              </div>
            </dl>

            {settings.social.instagram ? (
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noreferrer noopener me"
                className="kicker mt-8 inline-block text-ink-dim transition-colors hover:text-violet"
              >
                Instagram ↗
              </a>
            ) : null}
          </div>
        </Reveal>
      </section>
    </>
  );
}