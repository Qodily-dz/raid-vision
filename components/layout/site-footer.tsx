import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { SiteSettingsView } from "@/types/content";
import BrandLockup from "./brand-lockup";

type FooterLink = { href: string; label: string; external?: boolean };

export default function SiteFooter({
  locale,
  settings,
}: {
  locale: string;
  settings: SiteSettingsView;
}) {
  const dict = getDictionary(locale);

  const explore: FooterLink[] = [
    { href: `/${locale}/work`, label: dict.nav.work },
    { href: `/${locale}/gallery`, label: dict.nav.gallery },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const social: FooterLink[] = [
    { href: settings.social.instagram ?? "", label: "Instagram", external: true },
    { href: settings.social.youtube ?? "", label: "YouTube", external: true },
    { href: settings.social.vimeo ?? "", label: "Vimeo", external: true },
    { href: settings.social.tiktok ?? "", label: "TikTok", external: true },
  ].filter((link) => Boolean(link.href));

  const contact: FooterLink[] = [
    { href: `mailto:${settings.email}`, label: settings.email || dict.contact.emailLabel },
    { href: `tel:${settings.phone.replace(/\s+/g, "")}`, label: settings.phone },
    { href: settings.whatsappUrl, label: dict.contact.whatsapp, external: true },
  ].filter((link) => Boolean(link.href));

  return (
    <footer className="relative border-t border-ink/10 bg-black">
      <div className="shell-wide grid gap-12 py-14 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <BrandLockup brandName={settings.brandName} />
          {settings.tagline ? (
            <p className="mt-6 max-w-measure text-balance text-lg leading-relaxed text-ink-dim">
              {settings.tagline}
            </p>
          ) : null}

          <div className="mt-8 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-violet"
            />
            <span className="kicker">
              {dict.contact.availability}: {dict.admin.settings.availabilityOptions[settings.availabilityStatus]}
            </span>
          </div>
        </div>

        <nav className="lg:col-span-2" aria-label={dict.footer.explore}>
          <h2 className="kicker mb-5">{dict.footer.explore}</h2>
          <ul className="space-y-3">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-dim transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h2 className="kicker mb-5">{dict.footer.connect}</h2>
          <ul className="space-y-3">
            {social.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener me"
                  className="text-sm text-ink-dim transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {social.length === 0 ? (
              <li className="text-sm text-ink-faint">—</li>
            ) : null}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="kicker mb-5">{dict.contact.channels}</h2>
          <ul className="space-y-3">
            {contact.map((link) => (
              <li key={link.href} className="break-words">
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener me"
                    className="text-sm text-ink-dim transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm text-ink-dim transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            {contact.length === 0 ? (
              <li className="text-sm text-ink-faint">—</li>
            ) : null}
          </ul>

          {settings.location ? (
            <p className="mt-6 text-sm text-ink-faint">{settings.location}</p>
          ) : null}
        </div>
      </div>

      <div className="shell-wide flex flex-col gap-4 border-t border-ink/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="kicker">
          © {new Date().getFullYear()} {settings.brandName}. {dict.footer.rights}.
        </p>
        <a
          href="#main"
          className="kicker transition-colors hover:text-ink"
        >
          ↑ {dict.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}