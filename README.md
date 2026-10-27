# Raid VISION

A multilingual, one-page portfolio and CMS for a filmmaker. Dark violet cinematic
front end, Supabase back end, admin for projects, gallery, services, enquiries,
media and site settings.

The public site is a **single scrolling page**: work, showreel, services, gallery,
about and the enquiry form are all sections of `/[locale]`, and the header nav
scrolls between them. The dedicated routes (`/work`, `/gallery`, `/services`,
`/about`, `/contact`) still exist for search engines and deep links, but nothing
in the primary navigation sends you to them.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3.4, CSS custom properties in `app/globals.css` |
| Data | Supabase Postgres (`raid_db`), `@supabase/ssr` |
| Auth | Supabase Auth, email + password, cookie sessions |
| Storage | Supabase Storage, public `raid-media` bucket |
| i18n | `ar` (RTL, default `/` → `/ar`), `fr`, `en` |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The site runs on <http://localhost:3000>. `/` redirects to the default locale
(`/ar`).

### Environment

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (or legacy anon) key. Must match the name used in `lib/supabase/*.ts` |
| `NEXT_PUBLIC_SITE_URL` | Absolute site origin, used for canonicals and OG tags |

Keep the service-role key server-only. It is not read from `NEXT_PUBLIC_*` and
must never reach the browser.

## Database

All tables live in the **`raid_db`** schema, not `public`.

1. **Authenticate the CLI** with a Supabase Personal Access Token:

   ```bash
   npx supabase login
   ```

2. **Link the project**:

   ```bash
   npx supabase link --project-ref <project-ref>
   ```

3. **Apply the migration**:

   ```bash
   npx supabase db push --dry-run   # inspect first
   npx supabase db push
   ```

   The migration is `supabase/migrations/20261001094046_create_raid_vision_schema.sql`.
   It creates the schema, every table, indexes, `updated_at` triggers, RLS
   policies, Storage policies, the public `raid-media` bucket, and the category
   seed rows.

4. **Expose `raid_db` to the Data API.** The app queries through PostgREST, so
   the schema has to be exposed: **Settings → API → Exposed schemas**. Without
   this, queries fail with `Could not find the table 'raid_db.projects' in the
   schema cache`.

5. **Regenerate types** (replaces the handwritten ones in
   `types/database.types.ts`):

   ```bash
   npx supabase gen types typescript --linked > types/database.types.ts
   ```

### Optional demo content

`supabase/seed.demo.sql` is **not** a migration and is never applied by
`db push`. Run it once from the SQL editor if you want the landing page to have
something in it before you upload your own work — it fills site settings,
six services and six published projects with EN/FR/AR copy. It references no
uploaded media, so there are no broken images, and every statement is
idempotent. The file ends with the statements that undo it.

## First administrator

1. **Create the user** in Supabase → Authentication → Users → *Add user*.
   Tick **Auto Confirm User** so no confirmation email is needed.
2. **Grant admin** — run in the SQL editor, substituting the email:

   ```sql
   insert into raid_db.admin_users (user_id, email, role)
   values (
     '<user-uuid>',
     'you@example.com',
     'admin'
   );
   ```

   To find the UUID: `select id, email from auth.users;`

3. Sign in at `/admin/login`.

Authorization is enforced server-side on every mutation by `requireAdmin` /
`assertAdmin` in `lib/auth/admin.ts`, which re-checks the session and the
`admin_users` row rather than trusting the UI. RLS is the second line of defence.

## Admin

`/admin` is English-only and LTR, and is not wrapped in the locale layout.

Implemented: login, forgot/reset password, auth callback, dashboard overview,
project listing, and shared form/upload/auth components.

**Still to build** — the nav links to these, so they 404 for a signed-in admin:

- `/admin/projects/new` and `/admin/projects/[id]`
- `/admin/gallery`
- `/admin/services`
- `/admin/messages`
- `/admin/media`
- `/admin/settings`

The server actions they need already exist in `lib/actions/` (`projects.ts`,
`gallery.ts`, `services.ts`, `inquiries.ts`, `media.ts`, `settings.ts`), so
these are UI-only tasks.

## Uploads

Media is uploaded client-side to the `raid-media` bucket with progress feedback,
then the returned storage path is written to the row. Validation lives in
`lib/media/storage.ts`; accepted MIME types and size limits are enforced on both
the client and the server action.

## Checks

```bash
npm run lint        # eslint, zero warnings
npx tsc --noEmit    # types
npm run build       # production build
```

## Notes for contributors

- **Never rewrite source files through PowerShell string replacement.** It
  corrupts the Arabic copy in `lib/i18n/dictionaries/ar.ts` and in SQL seeds.
  Use the editor, or `node`, when a file contains RTL text.
- Colours are CSS variables in `app/globals.css` (`--black`, `--char`,
  `--violet`, `--glow`, `--neon`, `--haze`). There is no second palette.
- Every section renders even with an empty database, via
  `components/cinematic/section-empty.tsx`. A portfolio with missing sections
  reads as broken, so sections must not be conditionally removed.
- `scroll-margin-top` is set on `[id]` so anchored sections clear the fixed
  header.
- `prefers-reduced-motion` is respected throughout.