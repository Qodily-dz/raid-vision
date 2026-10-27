import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSiteSettings } from "@/lib/queries/settings";
import { getFeaturedProjects, getPublishedProjects } from "@/lib/queries/projects";
import { getGalleryItems } from "@/lib/queries/gallery";
import { getServices } from "@/lib/queries/services";
import { getPublicMediaUrl } from "@/lib/media/storage";
import HeroVideo from "@/components/video/hero-video";
import VideoPlayer from "@/components/video/video-player";
import Reveal from "@/components/cinematic/reveal";
import Marquee from "@/components/cinematic/marquee";
import SectionIntro from "@/components/cinematic/section-intro";
import SectionEmpty from "@/components/cinematic/section-empty";
import CropMarks from "@/components/cinematic/crop-marks";
import Timecode from "@/components/cinematic/timecode";
import TitleSequence from "@/components/cinematic/title-sequence";
import CreditsStrip from "@/components/cinematic/credits-strip";
import ProjectCard from "@/components/projects/project-card";
import GalleryBrowser from "@/components/gallery/gallery-browser";
import ContactForm from "@/components/contact/contact-form";
import { formatPrice } from "@/components/services/service-card";

/** Breaks the brand into title-card lines: "Raid VISION" reads as two beats. */
function titleLines(brandName: string): string[] {
  const words = brandName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length === 1) return [words[0]];
  // Two lines of at most two words each, so a long name still sets well.
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);
}

/**
 * The whole portfolio, on one page.
 *
 * Every section is anchored and always rendered — including About and the
 * enquiry form — so this is the site, not a teaser that links elsewhere. The
 * dedicated routes (`/work`, `/gallery`, …) still exist for deep links and
 * search, and the header points here.
 *
 * Sections never vanish when the database is empty: they fall back to a framed
 * empty state, because a portfolio with holes in it reads as broken rather than
 * unfinished.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";

  const [settings, featured, allProjects, gallery, services] = await Promise.all([
    getSiteSettings(locale),
    getFeaturedProjects(locale, 6),
    getPublishedProjects(locale),
    getGalleryItems(locale, { limit: 6 }),
    getServices(locale),
  ]);

  const selected = featured.length > 0 ? featured : allProjects.slice(0, 6);
  const [lead, ...rest] = selected;

  const heroPoster = getPublicMediaUrl(settings.heroPosterPath);
  const heroVideo = getPublicMediaUrl(settings.heroVideoPath);
  const showreel = getPublicMediaUrl(settings.showreelVideoPath);
  const showreelPoster = getPublicMediaUrl(settings.showreelPosterPath);
  const portrait = getPublicMediaUrl(settings.heroPosterPath);

  const statement = settings.tagline || settings.shortIntro;
  const lines = titleLines(settings.brandName);
  const availability = dict.admin.settings.availabilityOptions[settings.availabilityStatus];

  // Contact channels, shared by the contact section and the footer.
  const channels = [
    settings.email
      ? {
          label: dict.contact.emailLabel,
          value: settings.email,
          href: `mailto:${settings.email}`,
          external: false,
        }
      : null,
    settings.phone
      ? {
          label: dict.contact.phoneLabel,
          value: settings.phone,
          href: `tel:${settings.phone.replace(/\s+/g, "")}`,
          external: false,
        }
      : null,
    settings.whatsappUrl
      ? {
          label: dict.contact.whatsapp,
          value: settings.whatsappUrl,
          href: settings.whatsappUrl,
          external: true,
        }
      : null,
  ].filter((value): value is NonNullable<typeof value> => Boolean(value));

  return (
    <>
      {/* ================================================================ Hero
          Framed like a shot: lit stage, vignette, a drifting transport line,
          crop marks, viewfinder rails, and a title that lands line by line. */}
      <section
        id="top"
        className="grain relative flex min-h-[92vh] flex-col justify-end overflow-hidden sm:min-h-dvh"
      >
        {heroVideo || heroPoster ? (
          <HeroVideo videoUrl={heroVideo} posterUrl={heroPoster} locale={locale} />
        ) : (
          <div aria-hidden="true" className="stage-empty absolute inset-0" />
        )}

        {/* Off-screen sources, so the dark reads as a lit room. */}
        <div aria-hidden="true" className="lights" />
        <div aria-hidden="true" className="light-strip top-[38%]" />
        <div aria-hidden="true" className="scanlines" />
        <div aria-hidden="true" className="weave" />
        <div aria-hidden="true" className="vignette" />
        <CropMarks inset="clamp(1rem, 3vw, 2.5rem)" />

        {/* Viewfinder rails: only on wide screens, where they frame the frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-5 hidden items-center lg:flex"
        >
          <span className="rail kicker opacity-45">{settings.ownerName || settings.brandName}</span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-5 hidden items-center lg:flex"
        >
          <span className="rail kicker opacity-45">{settings.location || "RAID VISION"}</span>
        </div>

        {/* Top monitor bar. */}
        <div className="relative z-20 flex items-center justify-between gap-4 px-5 pt-24 sm:px-8 sm:pt-28 lg:px-16">
          <Timecode locale={locale} className="animate-stage-in" />

          <p className="animate-stage-in flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-dim">
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
            {availability}
          </p>
        </div>

        {/* Title block. */}
        <div className="relative z-10 px-5 pb-24 pt-16 sm:px-8 sm:pb-32 lg:px-16">
          <p className="kicker-accent neon-cool animate-stage-in mb-6">{dict.home.statement}</p>

          {lines.length > 0 ? (
            <TitleSequence
              lines={lines}
              className={`display title-glow max-w-[16ch] text-[clamp(3.25rem,13vw,11rem)] text-balance ${
                isRtl ? "display-ar leading-[1.05]" : "leading-[0.84]"
              }`}
            />
          ) : null}

          <div
            aria-hidden="true"
            className="title-underline mt-8 h-px w-24 origin-left bg-violet rtl:origin-right"
          />

          {statement ? (
            <p className="mt-8 max-w-measure text-lg leading-relaxed text-ink-dim sm:text-xl">
              {statement}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={`/${locale}/#work`} className="btn btn-violet">
              {dict.common.viewWork}
            </Link>
            <Link href={`/${locale}/#contact`} className="btn btn-outline">
              {dict.home.ctaAction}
            </Link>
          </div>
        </div>

        {/* Bottom monitor bar. */}
        <div className="relative z-20 flex items-end justify-between gap-6 border-t border-ink/10 px-5 py-6 sm:px-8 lg:px-16">
          <span aria-hidden="true" className="kicker">
            {dict.home.frames[0]} — {dict.home.frames[2]}
          </span>

          <span
            aria-hidden="true"
            className="hidden flex-col items-center gap-3 text-ink-faint md:flex"
          >
            <span className="kicker">{dict.common.scroll}</span>
            <span className="animate-scroll-cue h-12 w-px bg-gradient-to-b from-violet to-transparent" />
          </span>
        </div>
      </section>

      <Marquee items={dict.home.frames} />

      {/* Real counts, so the band says something instead of decorating. */}
      <CreditsStrip
        className="shell-wide"
        items={[
          { label: dict.home.selectedCount, value: selected.length },
          { label: dict.nav.services, value: services.length },
          { label: dict.nav.gallery, value: gallery.length },
        ]}
      />

      {/* ============================================================== Work */}
      <section id="work" className="shell-wide py-20 sm:py-28">
        <SectionIntro
          number={1}
          kicker={dict.home.selectedWork}
          title={dict.home.selectedWorkIntro}
        >
          <Link href={`/${locale}/work`} className="btn btn-outline">
            {dict.common.viewAll} →
          </Link>
        </SectionIntro>

        {lead ? (
          <div className="mt-14 flex flex-col gap-20">
            <Reveal variant="wipe">
              <ProjectCard
                project={lead}
                href={`/${locale}/work/${lead.slug}`}
                variant="bleed"
                overlay
                priority
              />
            </Reveal>

            {rest.length > 0 ? (
              <div className="grid gap-x-6 gap-y-16 md:grid-cols-12">
                {rest.map((project, index) => (
                  <div
                    key={project.id}
                    className={
                      index % 3 === 0
                        ? "md:col-span-7"
                        : index % 3 === 1
                          ? "md:col-span-5 md:mt-24"
                          : "md:col-span-10 md:mx-auto"
                    }
                  >
                    <Reveal delay={index * 70}>
                      <ProjectCard
                        project={project}
                        href={`/${locale}/work/${project.slug}`}
                        variant={
                          index % 3 === 0 ? "wide" : index % 3 === 1 ? "portrait" : "feature"
                        }
                        index={index + 1}
                      />
                    </Reveal>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <SectionEmpty
            className="mt-14"
            title={dict.work.emptyTitle}
            body={dict.work.emptyBody}
          />
        )}
      </section>

      {/* ============================================================ Showreel */}
      <section id="reel" className="grain relative border-y border-ink/10 py-20 sm:py-28">
        <div aria-hidden="true" className="lights opacity-70" />
        <div className="shell-wide relative z-10">
          <SectionIntro
            number={2}
            kicker={dict.home.reelTitle}
            title={dict.home.reelIntro}
            align="start"
          />

          <div className="mt-12">
            {showreel ? (
              <Reveal variant="wipe">
                <VideoPlayer
                  src={showreel}
                  poster={showreelPoster || null}
                  aspectClass="aspect-21x9"
                  allowSound
                  locale={locale}
                  label={`${settings.brandName} — ${dict.home.reelTitle}`}
                />
              </Reveal>
            ) : (
              <SectionEmpty title={dict.home.reelTitle} body={dict.common.empty} />
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ Services */}
      <section id="services" className="shell-wide py-20 sm:py-28">
        <SectionIntro
          number={3}
          kicker={dict.nav.services}
          title={dict.home.servicesIntro}
        >
          <Link href={`/${locale}/services`} className="btn btn-outline">
            {dict.common.viewAll} →
          </Link>
        </SectionIntro>

        {services.length > 0 ? (
          <div className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
            {services.slice(0, 6).map((service, index) => {
              const price = formatPrice(service, dict);

              return (
                <Reveal key={service.id} delay={index * 60}>
                  <Link
                    href={`/${locale}/services#${service.slug}`}
                    className="group grid gap-4 py-8 transition-colors hover:bg-ink/[0.03] sm:grid-cols-12 sm:items-center sm:gap-8 sm:px-4"
                  >
                    <span className="font-mono text-[0.65rem] tracking-[0.2em] text-violet sm:col-span-1">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="display text-3xl transition-colors group-hover:text-violet sm:col-span-5 sm:text-4xl">
                      {service.name}
                    </span>

                    <span className="text-sm leading-relaxed text-ink-dim sm:col-span-4">
                      {service.shortDescription}
                    </span>

                    <span className="font-mono text-xs tracking-[0.08em] text-ink-faint sm:col-span-2 sm:text-end">
                      {price ?? dict.services.onRequest}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <SectionEmpty
            className="mt-14"
            title={dict.services.emptyTitle}
            body={dict.services.emptyBody}
          />
        )}
      </section>

      {/* ============================================================= Gallery */}
      <section id="gallery" className="border-t border-ink/10 py-20 sm:py-28">
        <div className="shell-wide">
          <SectionIntro
            number={4}
            kicker={dict.nav.gallery}
            title={dict.home.socialIntro}
          >
            <Link href={`/${locale}/gallery`} className="btn btn-outline">
              {dict.common.viewAll} →
            </Link>
          </SectionIntro>

          <div className="mt-12">
            {gallery.length > 0 ? (
              <GalleryBrowser items={gallery} locale={locale} />
            ) : (
              <SectionEmpty title={dict.gallery.emptyTitle} body={dict.gallery.emptyBody} />
            )}
          </div>
        </div>
      </section>

      {/* =============================================================== About */}
      <section id="about" className="grain relative border-t border-ink/10 py-20 sm:py-28">
        <div aria-hidden="true" className="lights opacity-70" />

        <div className="shell-wide relative z-10 grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            {portrait ? (
              <div className="frame relative aspect-4x5 overflow-hidden">
                <Image
                  src={portrait}
                  alt={settings.ownerName || settings.brandName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="frame stage-empty grid aspect-4x5 place-items-center">
                <div aria-hidden="true" className="lights opacity-80" />
                <CropMarks inset="clamp(0.75rem, 2vw, 1.5rem)" />
                <span className="display relative z-10 text-4xl text-ink-dim">
                  {settings.brandName}
                </span>
              </div>
            )}
          </Reveal>

          <Reveal className="lg:col-span-7" delay={80}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet glow-sm" />
              <span className="kicker">{settings.ownerName || dict.nav.about}</span>
            </div>

            <h2 className="display mt-6 text-4xl leading-[0.95] text-balance sm:text-5xl">
              {dict.about.title}
            </h2>

            {settings.bio ? (
              <div className="mt-7 max-w-measure whitespace-pre-line text-lg leading-relaxed text-ink-dim sm:text-xl">
                {settings.bio}
              </div>
            ) : (
              <p className="mt-7 max-w-measure text-lg leading-relaxed text-ink-dim">
                {dict.about.contactBody}
              </p>
            )}

            <dl className="mt-12 grid gap-8 border-t border-ink/10 pt-8 sm:grid-cols-3">
              <div>
                <dt className="kicker text-ink-faint">{dict.contact.location}</dt>
                <dd className="mt-2 text-sm">{settings.location || "—"}</dd>
              </div>
              <div>
                <dt className="kicker text-ink-faint">{dict.contact.availability}</dt>
                <dd className="mt-2 text-sm">{availability}</dd>
              </div>
              <div>
                <dt className="kicker text-ink-faint">Instagram</dt>
                <dd className="mt-2 text-sm">
                  {settings.social.instagram ? (
                    <a
                      href={settings.social.instagram}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition-colors hover:text-violet"
                    >
                      Instagram ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>

            <Link href={`/${locale}/#contact`} className="btn btn-violet mt-12">
              {dict.home.ctaAction} →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================================================= Contact */}
      <section id="contact" className="relative overflow-hidden border-t border-ink/10 py-20 sm:py-28">
        <div aria-hidden="true" className="stage-empty absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="lights" />
        <div aria-hidden="true" className="light-strip top-1/4" />

        <div className="shell-wide relative z-10 grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="neon font-mono text-[0.65rem] tracking-[0.2em]">05</span>
              <span aria-hidden="true" className="h-px w-8 bg-ink/20" />
              <span className="kicker">{dict.contact.formTitle}</span>
            </div>

            <h2 className="display mt-5 text-4xl leading-[0.95] text-balance sm:text-5xl">
              {dict.home.ctaTitle}
            </h2>

            <div className="mt-10">
              <ContactForm locale={locale} services={services} />
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4 lg:col-start-9" delay={100}>
            <div className="lg:sticky lg:top-32">
              <h3 className="kicker mb-8">{dict.contact.channels}</h3>

              <dl className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
                {channels.length > 0 ? (
                  channels.map((channel) => (
                    <div key={channel.label} className="py-5">
                      <dt className="kicker text-ink-faint">{channel.label}</dt>
                      <dd className="mt-2">
                        <a
                          href={channel.href}
                          dir={channel.external ? undefined : "ltr"}
                          target={channel.external ? "_blank" : undefined}
                          rel={channel.external ? "noreferrer noopener me" : undefined}
                          className="break-words text-lg transition-colors hover:text-violet"
                        >
                          {channel.value}
                        </a>
                      </dd>
                    </div>
                  ))
                ) : (
                  <div className="py-5">
                    <dd className="text-sm text-ink-faint">{dict.common.notAvailable}</dd>
                  </div>
                )}

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
                    {availability}
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
        </div>
      </section>

      {/* ======================================================= Closing call */}
      <section className="grain relative overflow-hidden border-t border-ink/10 py-24 sm:py-36">
        <div aria-hidden="true" className="stage-empty absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="lights" />
        <div aria-hidden="true" className="light-strip top-1/3" />
        <div aria-hidden="true" className="vignette opacity-60" />
        <CropMarks inset="clamp(1rem, 4vw, 3rem)" />

        <div className="shell-wide relative z-10 text-center">
          <Reveal>
            <p className="kicker-accent neon-cool mb-6">{dict.home.statement}</p>
            <h2 className="display mx-auto max-w-[18ch] text-5xl leading-[0.9] text-balance sm:text-7xl">
              {dict.home.ctaTitle}
            </h2>
            <p className="mt-6 text-xl text-ink-dim">{dict.home.ctaBody}</p>
            <Link href={`/${locale}/#contact`} className="btn btn-violet mt-10">
              {dict.home.ctaAction} →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}