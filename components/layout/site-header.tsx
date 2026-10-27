import { getSiteSettings } from "@/lib/queries/settings";
import SiteHeaderClient from "./site-header-client";

/**
 * Server entry point for the public chrome: reads settings once and hands plain
 * data to the interactive header.
 */
export default async function SiteHeader({ locale }: { locale: string }) {
  const settings = await getSiteSettings(locale);

  return (
    <SiteHeaderClient
      locale={locale}
      brandName={settings.brandName}
      social={settings.social}
    />
  );
}