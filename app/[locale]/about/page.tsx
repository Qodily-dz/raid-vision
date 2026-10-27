import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getSiteSettings } from "@/lib/queries/settings";
import { getGalleryItems } from "@/lib/queries/gallery";
import { getPublishedProjects } from "@/lib/queries/projects";
import { getPublicMediaUrl } from "@/lib/media/storage";
import { siteUrl } from "@/lib/utils";
import PageHeader from "@/components/layout/page-header";
import Reveal from "@/components/cinematic/reveal";
import ProjectCard from "@/components/projects/project-card";
import { ASPECT_CLASS } from "@/types/content";

import { buildAlternateLanguages } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import JsonLd from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const settings = await getSiteSettings(locale);
  const portrait = getPublicMediaUrl(settings.heroPosterPath);

  return {
    title: dict.about.title,
    description: settings.shortIntro || settings.tagline || dict.about.contactBody,
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
      languages: buildAlternateLanguages("/about"),
    },
    openGraph: {
      title: `${dict.about.title} — ${settings.ownerName || settings.brandName}`,
      description: settings.shortIntro || settings.tagline || dict.about.contactBody,
      url: `${siteUrl}/${locale}/about`,
      images: portrait ? [{ url: portrait, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.about.title} — ${settings.ownerName || settings.brandName}`,
      description: settings.shortIntro || settings.tagline || dict.about.contactBody,
      images: portrait ? [portrait] : undefined,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [settings, projects, behindTheScenes] = await Promise.all([
    getSiteSettings(locale),
    getPublishedProjects(locale),
    getGalleryItems(locale, { limit: 6 }),
  ]);

  const selected = projects.slice(0, 3);
  const portrait = getPublicMediaUrl(settings.heroPosterPath);

  const breadcrumbs = buildBreadcrumbSchema(
    [
      { name: dict.nav.home, path: "" },
      { name: dict.about.title, path: "/about" },
    ],
    locale,
  );

  return (
    <>
      <JsonLd schema={breadcrumbs} />

      <PageHeader
        number="04"
        kicker={dict.nav.about}
        title={dict.about.title}
        intro={settings.shortIntro || settings.tagline}
      />

      {/* -------------------------------------------------------------- Bio */}
      <section className="shell-wide grid gap-14 py-20 sm:py-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          {portrait ? (
            <div className="relative aspect-4x5 overflow-hidden bg-char">
              <Image
                src={portrait}
                alt={settings.ownerName || settings.brandName}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="frame grid aspect-4x5 place-items-center">
              <span className="kicker text-ink-faint">{settings.brandName}</span>
            </div>
          )}
        </Reveal>

        <Reveal className="lg:col-span-7" delay={80}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet" />
            <span className="kicker">{settings.ownerName}</span>
          </div>

          {settings.bio ? (
            <div className="mt-7 max-w-measure whitespace-pre-line text-lg leading-relaxed text-ink-dim sm:text-xl">
              {settings.bio}
            </div>
          ) : (
            <p className="mt-7 max-w-measure text-lg leading-relaxed text-ink-dim">
              {dict.about.contactBody}
            </p>
          )}

          <dl className="mt-12 grid gap-8 border-t border-ink/10 pt-8 sm:grid-cols-2">
            <div>
              <dt className="kicker text-ink-faint">{dict.contact.location}</dt>
              <dd className="mt-2 text-sm">{settings.location || "—"}</dd>
            </div>
            <div>
              <dt className="kicker text-ink-faint">{dict.contact.availability}</dt>
              <dd className="mt-2 text-sm">
                {dict.admin.settings.availabilityOptions[settings.availabilityStatus]}
              </dd>
            </div>
            {settings.email ? (
              <div>
                <dt className="kicker text-ink-faint">{dict.contact.emailLabel}</dt>
                <dd className="mt-2 break-words text-sm">
                  <a href={`mailto:${settings.email}`} className="transition-colors hover:text-violet">
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings.phone ? (
              <div>
                <dt className="kicker text-ink-faint">{dict.contact.phoneLabel}</dt>
                <dd className="mt-2 text-sm" dir="ltr">
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="transition-colors hover:text-violet">
                    {settings.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <Link href={`/${locale}/contact`} className="btn btn-violet mt-12">
            {dict.home.ctaAction} →
          </Link>
        </Reveal>
      </section>

      {/* ------------------------------------------------- Behind the scenes */}
      {behindTheScenes.length > 0 ? (
        <section className="border-t border-ink/10 py-20 sm:py-28">
          <div className="shell-wide">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">02</span>
              <span aria-hidden="true" className="h-px w-10 bg-ink/20" />
              <span className="kicker">{dict.about.btsTitle}</span>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {behindTheScenes.map((item, index) => {
                const image = getPublicMediaUrl(item.storagePath) || getPublicMediaUrl(item.posterPath);

                return (
                  <Reveal key={item.id} delay={index * 60}>
                    <figure>
                      <div
                        className={`relative overflow-hidden bg-char ${
                          ASPECT_CLASS[(index % 2 === 0 ? "4:5" : "1:1")] ?? "aspect-square"
                        }`}
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={item.caption || item.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-[1.4s] ease-cinema hover:scale-105"
                          />
                        ) : null}
                      </div>
                      {item.caption ? (
                        <figcaption className="kicker mt-2 truncate text-ink-faint">
                          {item.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  </Reveal>
                );
              })}
            </div>

            <Link href={`/${locale}/gallery`} className="btn btn-outline mt-12">
              {dict.common.viewAll} →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- Selected */}
      {selected.length > 0 ? (
        <section className="border-t border-ink/10 py-20 sm:py-28">
          <div className="shell-wide">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet">03</span>
              <span aria-hidden="true" className="h-px w-10 bg-ink/20" />
              <span className="kicker">{dict.home.selectedWork}</span>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {selected.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  href={`/${locale}/work/${project.slug}`}
                  variant={index === 1 ? "portrait" : "tile"}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}