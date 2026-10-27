-- =============================================================================
-- Raid VISION — core schema
--
-- All application data lives in the `raid_db` schema. Nothing is created in
-- `public`. Row Level Security is enabled on every table: anonymous visitors can
-- only read published content and insert contact inquiries, while full CMS
-- access is gated on `raid_db.is_admin()`.
-- =============================================================================

create schema if not exists raid_db;

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

-- Returns true when the caller is an authenticated Supabase user that exists in
-- `raid_db.admin_users` with `active = true`.
--
-- SECURITY DEFINER so that RLS on `admin_users` cannot hide the caller's own
-- row. `search_path` is pinned to '' so nothing can be shadowed.
create or replace function raid_db.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from raid_db.admin_users au
    where au.user_id = auth.uid()
      and au.active
  );
$$;

-- Returns true when the given project is publicly visible (published and the
-- publication date has passed). Used by child-table policies so a draft or
-- archived project can never leak through its sections/media/categories.
create or replace function raid_db.is_project_public(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from raid_db.projects p
    where p.id = p_project_id
      and p.status = 'published'
      and p.published_at is not null
      and p.published_at <= now()
  );
$$;

-- Returns true when the given service is publicly visible.
create or replace function raid_db.is_service_public(p_service_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from raid_db.services s
    where s.id = p_service_id
      and s.active
  );
$$;

create or replace function raid_db.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Contact inquiries always start as `new` regardless of what the client sends,
-- and are emptied of the honeypot value once validated.
create or replace function raid_db.prepare_contact_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'new';
  end if;
  new.honeypot := '';
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  new.message := btrim(new.message);
  return new;
end;
$$;

revoke all on function raid_db.is_admin() from public;
grant execute on function raid_db.is_admin() to authenticated;
revoke all on function raid_db.is_project_public(uuid) from public;
grant execute on function raid_db.is_project_public(uuid) to anon, authenticated;
revoke all on function raid_db.is_service_public(uuid) from public;
grant execute on function raid_db.is_service_public(uuid) to anon, authenticated;
revoke all on function raid_db.set_updated_at() from public;
revoke all on function raid_db.prepare_contact_message() from public;

-- -----------------------------------------------------------------------------
-- admin_users — links Supabase Auth users to CMS permissions
-- -----------------------------------------------------------------------------

create table raid_db.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('owner', 'editor'))
);

create index admin_users_active_idx on raid_db.admin_users (active);

-- -----------------------------------------------------------------------------
-- site_settings — single-row configuration for the whole website
-- -----------------------------------------------------------------------------

create table raid_db.site_settings (
  singleton boolean primary key default true,
  brand_name text not null default 'Raid VISION',
  owner_name text,
  tagline_i18n jsonb not null default '{}'::jsonb,
  short_intro_i18n jsonb not null default '{}'::jsonb,
  bio_i18n jsonb not null default '{}'::jsonb,
  location_i18n jsonb not null default '{}'::jsonb,
  email text,
  phone text,
  whatsapp_url text,
  instagram_url text,
  youtube_url text,
  vimeo_url text,
  tiktok_url text,
  hero_video_path text,
  hero_poster_path text,
  showreel_video_path text,
  showreel_poster_path text,
  availability_status text not null default 'available',
  default_currency text not null default 'DZD',
  seo_title_i18n jsonb not null default '{}'::jsonb,
  seo_description_i18n jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_check check (singleton),
  constraint site_settings_availability_check
    check (availability_status in ('available', 'limited', 'booked')),
  constraint site_settings_tagline_i18n_check
    check (jsonb_typeof(tagline_i18n) = 'object'),
  constraint site_settings_short_intro_i18n_check
    check (jsonb_typeof(short_intro_i18n) = 'object'),
  constraint site_settings_bio_i18n_check
    check (jsonb_typeof(bio_i18n) = 'object'),
  constraint site_settings_location_i18n_check
    check (jsonb_typeof(location_i18n) = 'object'),
  constraint site_settings_seo_title_i18n_check
    check (jsonb_typeof(seo_title_i18n) = 'object'),
  constraint site_settings_seo_description_i18n_check
    check (jsonb_typeof(seo_description_i18n) = 'object')
);

insert into raid_db.site_settings (singleton) values (true);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------

create table raid_db.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_i18n jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_name_i18n_check check (jsonb_typeof(name_i18n) = 'object')
);

create index categories_active_sort_idx on raid_db.categories (active, sort_order);

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------

create table raid_db.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_i18n jsonb not null default '{}'::jsonb,
  summary_i18n jsonb not null default '{}'::jsonb,
  client_name text,
  year smallint,
  cover_type text not null default 'image',
  cover_media_path text,
  cover_poster_path text,
  status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title_i18n jsonb not null default '{}'::jsonb,
  seo_description_i18n not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint projects_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint projects_cover_type_check check (cover_type in ('image', 'video')),
  constraint projects_title_i18n_check check (jsonb_typeof(title_i18n) = 'object'),
  constraint projects_summary_i18n_check check (jsonb_typeof(summary_i18n) = 'object'),
  constraint projects_seo_title_i18n_check
    check (jsonb_typeof(seo_title_i18n) = 'object'),
  constraint projects_seo_description_i18n_check
    check (jsonb_typeof(seo_description_i18n) = 'object'),
  constraint projects_year_check check (year is null or year between 1990 and 2100),
  constraint projects_published_at_check
    check (status <> 'published' or published_at is not null)
);

create index projects_status_idx on raid_db.projects (status);
create index projects_featured_sort_idx on raid_db.projects (featured, sort_order);
create index projects_sort_order_idx on raid_db.projects (sort_order);
create index projects_published_at_idx on raid_db.projects (published_at desc);

-- -----------------------------------------------------------------------------
-- project_sections — flexible case-study storytelling
-- -----------------------------------------------------------------------------

create table raid_db.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references raid_db.projects (id) on delete cascade,
  section_type text not null default 'custom',
  heading_i18n jsonb not null default '{}'::jsonb,
  body_i18n jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_sections_type_check check (section_type in (
    'overview',
    'brief',
    'challenge',
    'concept',
    'creative_direction',
    'production',
    'editing',
    'color_grading',
    'process',
    'behind_the_scenes',
    'results',
    'credits',
    'custom'
  )),
  constraint project_sections_heading_i18n_check
    check (jsonb_typeof(heading_i18n) = 'object'),
  constraint project_sections_body_i18n_check
    check (jsonb_typeof(body_i18n) = 'object'),
  constraint project_sections_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

create index project_sections_project_sort_idx
  on raid_db.project_sections (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- project_media
-- -----------------------------------------------------------------------------

create table raid_db.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references raid_db.projects (id) on delete cascade,
  media_type text not null default 'image',
  storage_path text,
  poster_path text,
  external_url text,
  alt_i18n jsonb not null default '{}'::jsonb,
  caption_i18n jsonb not null default '{}'::jsonb,
  aspect_ratio text not null default '16:9',
  autoplay boolean not null default false,
  muted boolean not null default true,
  loop boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_media_type_check
    check (media_type in ('image', 'video', 'external_video')),
  constraint project_media_aspect_ratio_check check (aspect_ratio in (
    '16:9', '21:9', '2.39:1', '4:3', '3:2', '1:1', '4:5', '9:16'
  )),
  constraint project_media_source_check check (
    (media_type = 'external_video' and external_url is not null)
    or (media_type <> 'external_video' and storage_path is not null)
  ),
  constraint project_media_alt_i18n_check check (jsonb_typeof(alt_i18n) = 'object'),
  constraint project_media_caption_i18n_check
    check (jsonb_typeof(caption_i18n) = 'object')
);

create index project_media_project_sort_idx
  on raid_db.project_media (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- project_categories (many-to-many)
-- -----------------------------------------------------------------------------

create table raid_db.project_categories (
  project_id uuid not null references raid_db.projects (id) on delete cascade,
  category_id uuid not null references raid_db.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, category_id)
);

create index project_categories_category_idx
  on raid_db.project_categories (category_id);

-- -----------------------------------------------------------------------------
-- gallery_items — standalone work, separate from case studies
-- -----------------------------------------------------------------------------

create table raid_db.gallery_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'image',
  title_i18n jsonb not null default '{}'::jsonb,
  caption_i18n jsonb not null default '{}'::jsonb,
  storage_path text,
  poster_path text,
  instagram_url text,
  external_url text,
  linked_project_id uuid references raid_db.projects (id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_type_check check (item_type in ('image', 'video', 'instagram')),
  constraint gallery_items_source_check check (
    (item_type = 'instagram' and instagram_url is not null)
    or (item_type <> 'instagram' and storage_path is not null)
  ),
  constraint gallery_items_title_i18n_check
    check (jsonb_typeof(title_i18n) = 'object'),
  constraint gallery_items_caption_i18n_check
    check (jsonb_typeof(caption_i18n) = 'object')
);

create index gallery_items_published_sort_idx
  on raid_db.gallery_items (published, sort_order);
create index gallery_items_type_idx on raid_db.gallery_items (item_type);
create index gallery_items_linked_project_idx
  on raid_db.gallery_items (linked_project_id);

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------

create table raid_db.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_i18n jsonb not null default '{}'::jsonb,
  short_description_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  price_type text not null default 'custom_quote',
  price numeric(12, 2),
  max_price numeric(12, 2),
  currency text not null default 'DZD',
  unit_i18n jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_price_type_check check (price_type in (
    'fixed', 'from', 'range', 'hourly', 'daily', 'custom_quote'
  )),
  constraint services_name_i18n_check check (jsonb_typeof(name_i18n) = 'object'),
  constraint services_short_description_i18n_check
    check (jsonb_typeof(short_description_i18n) = 'object'),
  constraint services_description_i18n_check
    check (jsonb_typeof(description_i18n) = 'object'),
  constraint services_unit_i18n_check check (jsonb_typeof(unit_i18n) = 'object'),
  constraint services_price_check check (price is null or price >= 0),
  constraint services_max_price_check check (max_price is null or max_price >= 0),
  constraint services_price_order_check
    check (price is null or max_price is null or max_price >= price),
  constraint services_range_price_check
    check (price_type <> 'range' or (price is not null and max_price is not null))
);

create index services_active_sort_idx on raid_db.services (active, sort_order);

-- -----------------------------------------------------------------------------
-- service_features
-- -----------------------------------------------------------------------------

create table raid_db.service_features (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references raid_db.services (id) on delete cascade,
  label_i18n jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_features_label_i18n_check
    check (jsonb_typeof(label_i18n) = 'object')
);

create index service_features_service_sort_idx
  on raid_db.service_features (service_id, sort_order);

-- -----------------------------------------------------------------------------
-- service_packages (optional)
-- -----------------------------------------------------------------------------

create table raid_db.service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references raid_db.services (id) on delete cascade,
  name_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  price numeric(12, 2),
  currency text not null default 'DZD',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_packages_name_i18n_check
    check (jsonb_typeof(name_i18n) = 'object'),
  constraint service_packages_description_i18n_check
    check (jsonb_typeof(description_i18n) = 'object'),
  constraint service_packages_price_check check (price is null or price >= 0)
);

create index service_packages_service_sort_idx
  on raid_db.service_packages (service_id, sort_order);

-- -----------------------------------------------------------------------------
-- contact_messages
-- -----------------------------------------------------------------------------

create table raid_db.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service_id uuid references raid_db.services (id) on delete set null,
  budget text,
  project_date date,
  message text not null,
  status text not null default 'new',
  honeypot text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_status_check
    check (status in ('new', 'read', 'replied', 'archived')),
  constraint contact_messages_name_check
    check (char_length(btrim(name)) between 2 and 120),
  constraint contact_messages_email_check
    check (char_length(email) <= 254 and position('@' in email) > 1),
  constraint contact_messages_message_check
    check (char_length(btrim(message)) between 10 and 5000)
);

create index contact_messages_status_created_idx
  on raid_db.contact_messages (status, created_at desc);
create index contact_messages_service_idx on raid_db.contact_messages (service_id);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_users',
    'site_settings',
    'categories',
    'projects',
    'project_sections',
    'project_media',
    'project_categories',
    'gallery_items',
    'services',
    'service_features',
    'service_packages',
    'contact_messages'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on raid_db.%I
         for each row execute function raid_db.set_updated_at()',
      t, t
    );
  end loop;
end
$$;

create trigger contact_messages_prepare
  before insert or update on raid_db.contact_messages
  for each row execute function raid_db.prepare_contact_message();

-- -----------------------------------------------------------------------------
-- Grants — PostgREST needs explicit privileges for a non-default schema
-- -----------------------------------------------------------------------------

grant usage on schema raid_db to anon, authenticated, service_role;
grant select on all tables in schema raid_db to anon, authenticated;
grant all on all tables in schema raid_db to service_role;
grant all on all sequences in schema raid_db to service_role;
grant usage on all sequences in schema raid_db to anon, authenticated;
grant insert on raid_db.contact_messages to anon, authenticated;

alter default privileges in schema raid_db
  grant select on tables to anon, authenticated;
alter default privileges in schema raid_db
  grant all on tables to service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table raid_db.admin_users enable row level security;
alter table raid_db.site_settings enable row level security;
alter table raid_db.categories enable row level security;
alter table raid_db.projects enable row level security;
alter table raid_db.project_sections enable row level security;
alter table raid_db.project_media enable row level security;
alter table raid_db.project_categories enable row level security;
alter table raid_db.gallery_items enable row level security;
alter table raid_db.services enable row level security;
alter table raid_db.service_features enable row level security;
alter table raid_db.service_packages enable row level security;
alter table raid_db.contact_messages enable row level security;

-- --- Public read -----------------------------------------------------------

create policy "site_settings_public_read"
  on raid_db.site_settings for select
  to anon, authenticated
  using (true);

create policy "categories_public_read"
  on raid_db.categories for select
  to anon, authenticated
  using (active);

create policy "projects_public_read"
  on raid_db.projects for select
  to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

create policy "project_sections_public_read"
  on raid_db.project_sections for select
  to anon, authenticated
  using (raid_db.is_project_public(project_id));

create policy "project_media_public_read"
  on raid_db.project_media for select
  to anon, authenticated
  using (raid_db.is_project_public(project_id));

create policy "project_categories_public_read"
  on raid_db.project_categories for select
  to anon, authenticated
  using (raid_db.is_project_public(project_id));

create policy "gallery_items_public_read"
  on raid_db.gallery_items for select
  to anon, authenticated
  using (published);

create policy "services_public_read"
  on raid_db.services for select
  to anon, authenticated
  using (active);

create policy "service_features_public_read"
  on raid_db.service_features for select
  to anon, authenticated
  using (raid_db.is_service_public(service_id));

create policy "service_packages_public_read"
  on raid_db.service_packages for select
  to anon, authenticated
  using (active and raid_db.is_service_public(service_id));

-- --- Public write ----------------------------------------------------------

-- Visitors may submit an inquiry, nothing more. The honeypot column must be
-- empty and the row is forced to `new` by the prepare trigger.
create policy "contact_messages_public_insert"
  on raid_db.contact_messages for insert
  to anon, authenticated
  with check (status = 'new' and btrim(coalesce(honeypot, '')) = '');

-- --- Admin -----------------------------------------------------------------

create policy "admin_users_admin_all"
  on raid_db.admin_users for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "site_settings_admin_all"
  on raid_db.site_settings for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "categories_admin_all"
  on raid_db.categories for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "projects_admin_all"
  on raid_db.projects for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "project_sections_admin_all"
  on raid_db.project_sections for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "project_media_admin_all"
  on raid_db.project_media for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "project_categories_admin_all"
  on raid_db.project_categories for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "gallery_items_admin_all"
  on raid_db.gallery_items for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "services_admin_all"
  on raid_db.services for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "service_features_admin_all"
  on raid_db.service_features for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "service_packages_admin_all"
  on raid_db.service_packages for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

create policy "contact_messages_admin_all"
  on raid_db.contact_messages for all
  to authenticated
  using (raid_db.is_admin()) with check (raid_db.is_admin());

-- -----------------------------------------------------------------------------
-- Storage — public bucket, admin-only writes
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'raid-media',
  'raid-media',
  true,
  262144000,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "raid_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'raid-media');

create policy "raid_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'raid-media' and raid_db.is_admin());

create policy "raid_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'raid-media' and raid_db.is_admin())
  with check (bucket_id = 'raid-media' and raid_db.is_admin());

create policy "raid_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'raid-media' and raid_db.is_admin());

-- -----------------------------------------------------------------------------
-- Seed categories — safe to re-run, removable by the owner
-- -----------------------------------------------------------------------------

insert into raid_db.categories (slug, name_i18n, sort_order)
values
  ('commercial', '{"en":"Commercial","fr":"Commercial","ar":"إعلان تجاري"}'::jsonb, 10),
  ('marketing', '{"en":"Marketing","fr":"Marketing","ar":"تسويق"}'::jsonb, 20),
  ('music-video', '{"en":"Music Video","fr":"Clip musical","ar":"كليب موسيقي"}'::jsonb, 30),
  ('social-content', '{"en":"Social Content","fr":"Contenu social","ar":"محتوى سوشيال"}'::jsonb, 40),
  ('brand-film', '{"en":"Brand Film","fr":"Film de marque","ar":"فيلم علامة تجارية"}'::jsonb, 50),
  ('event', '{"en":"Event","fr":"Événement","ar":"فعالية"}'::jsonb, 60),
  ('editing', '{"en":"Editing","fr":"Montage","ar":"مونتاج"}'::jsonb, 70),
  ('film', '{"en":"Film","fr":"Film","ar":"فيلم"}'::jsonb, 80),
  ('short-form', '{"en":"Short Form","fr":"Format court","ar":"فيديو قصير"}'::jsonb, 90)
on conflict (slug) do nothing;