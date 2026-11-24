import { getRawSiteSettings } from "@/lib/queries/settings";
import { updateSiteSettingsAction } from "@/lib/actions/settings";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "@/components/admin/primitives";
import FormShell from "@/components/admin/form-shell";
import I18nField from "@/components/admin/i18n-field";
import MediaField from "@/components/admin/media-field";

export const metadata = { title: "Site settings" };

function i18nRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export default async function SettingsPage() {
  const settings = await getRawSiteSettings();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Site settings"
        subtitle="Set the voice, contact details and media that shape the public site."
      />

      {!settings ? (
        <AdminEmpty
          title="Settings are not available"
          body="Apply the Supabase migration and expose the raid_db schema before editing site settings."
        />
      ) : (
        <FormShell action={updateSiteSettingsAction} submitLabel="Save settings">
          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title="Identity" description="The name and positioning shown across the portfolio.">
              <div className="flex flex-col gap-6">
                <label className="flex flex-col gap-2">
                  <span className="kicker">Brand name</span>
                  <input name="brandName" className="input" defaultValue={settings.brand_name} required maxLength={120} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="kicker">Owner name</span>
                  <input name="ownerName" className="input" defaultValue={settings.owner_name ?? ""} maxLength={120} />
                </label>
                <I18nField name="tagline" label="Tagline" value={i18nRecord(settings.tagline_i18n)} multiline rows={3} maxLength={400} />
                <I18nField name="shortIntro" label="Short introduction" value={i18nRecord(settings.short_intro_i18n)} multiline rows={4} maxLength={2000} />
                <I18nField name="bio" label="Biography" value={i18nRecord(settings.bio_i18n)} multiline rows={7} maxLength={8000} />
                <I18nField name="location" label="Location" value={i18nRecord(settings.location_i18n)} maxLength={400} />
              </div>
            </AdminPanel>

            <div className="flex flex-col gap-6">
              <AdminPanel title="Availability" description="Keep the enquiry CTA honest.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="kicker">Status</span>
                    <select name="availabilityStatus" className="select" defaultValue={settings.availability_status}>
                      <option value="available">Available</option>
                      <option value="limited">Limited availability</option>
                      <option value="booked">Booked</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="kicker">Default currency</span>
                    <input name="defaultCurrency" className="input" defaultValue={settings.default_currency} maxLength={8} />
                  </label>
                </div>
              </AdminPanel>

              <AdminPanel title="Direct channels" description="These appear in the contact section and footer.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2"><span className="kicker">Email</span><input name="email" type="email" className="input" defaultValue={settings.email ?? ""} /></label>
                  <label className="flex flex-col gap-2"><span className="kicker">Phone</span><input name="phone" type="tel" className="input" defaultValue={settings.phone ?? ""} /></label>
                  <label className="flex flex-col gap-2 sm:col-span-2"><span className="kicker">WhatsApp URL</span><input name="whatsappUrl" type="url" className="input" defaultValue={settings.whatsapp_url ?? ""} placeholder="https://wa.me/..." /></label>
                </div>
              </AdminPanel>

              <AdminPanel title="Social links" description="Only secure HTTP(S) links are accepted.">
                <div className="grid gap-6 sm:grid-cols-2">
                  {([
                    ["instagramUrl", "Instagram", settings.instagram_url],
                    ["youtubeUrl", "YouTube", settings.youtube_url],
                    ["vimeoUrl", "Vimeo", settings.vimeo_url],
                    ["tiktokUrl", "TikTok", settings.tiktok_url],
                  ] as const).map(([name, label, value]) => (
                    <label key={name} className="flex flex-col gap-2"><span className="kicker">{label}</span><input name={name} type="url" className="input" defaultValue={value ?? ""} /></label>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <AdminPanel title="Media direction" description="The hero should communicate the work before the visitor reads anything.">
              <div className="grid gap-8">
                <MediaField name="heroVideoPath" label="Hero video" value={settings.hero_video_path} folder="site" accept="video" posterName="heroPosterPath" posterValue={settings.hero_poster_path} />
                <MediaField name="showreelVideoPath" label="Showreel" value={settings.showreel_video_path} folder="site" accept="video" posterName="showreelPosterPath" posterValue={settings.showreel_poster_path} />
              </div>
            </AdminPanel>

            <AdminPanel title="Search preview" description="Keep the public title and description specific to the work.">
              <div className="flex flex-col gap-6">
                <I18nField name="seoTitle" label="SEO title" value={i18nRecord(settings.seo_title_i18n)} maxLength={200} />
                <I18nField name="seoDescription" label="SEO description" value={i18nRecord(settings.seo_description_i18n)} multiline rows={4} maxLength={400} />
              </div>
            </AdminPanel>
          </div>
        </FormShell>
      )}
    </div>
  );
}
