import type { Database } from "./database.types";

export type ProjectRow = Database["raid_db"]["Tables"]["projects"]["Row"];
export type ProjectSectionRow = Database["raid_db"]["Tables"]["project_sections"]["Row"];
export type ProjectMediaRow = Database["raid_db"]["Tables"]["project_media"]["Row"];
export type CategoryRow = Database["raid_db"]["Tables"]["categories"]["Row"];
export type GalleryItemRow = Database["raid_db"]["Tables"]["gallery_items"]["Row"];
export type ServiceRow = Database["raid_db"]["Tables"]["services"]["Row"];
export type ServiceFeatureRow = Database["raid_db"]["Tables"]["service_features"]["Row"];
export type ServicePackageRow = Database["raid_db"]["Tables"]["service_packages"]["Row"];
export type ContactMessageRow = Database["raid_db"]["Tables"]["contact_messages"]["Row"];
export type SiteSettingsRow = Database["raid_db"]["Tables"]["site_settings"]["Row"];
export type AdminUserRow = Database["raid_db"]["Tables"]["admin_users"]["Row"];

/* -------------------------------------------------------------------------- */
/* Domain constants                                                           */
/* -------------------------------------------------------------------------- */

export const PROJECT_STATUSES = ["draft", "published", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_SECTION_TYPES = [
  "overview",
  "brief",
  "challenge",
  "concept",
  "creative_direction",
  "production",
  "editing",
  "color_grading",
  "process",
  "behind_the_scenes",
  "results",
  "credits",
  "custom",
] as const;
export type ProjectSectionType = (typeof PROJECT_SECTION_TYPES)[number];

export const MEDIA_TYPES = ["image", "video", "external_video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const ASPECT_RATIOS = [
  "16:9",
  "21:9",
  "2.39:1",
  "4:3",
  "3:2",
  "1:1",
  "4:5",
  "9:16",
] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/** Tailwind aspect utilities, generated as static strings so the JIT sees them. */
export const ASPECT_CLASS: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
  "2.39:1": "aspect-[2.39/1]",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "9:16": "aspect-[9/16]",
};

export const GALLERY_ITEM_TYPES = ["image", "video", "instagram"] as const;
export type GalleryItemType = (typeof GALLERY_ITEM_TYPES)[number];

export const PRICE_TYPES = [
  "fixed",
  "from",
  "range",
  "hourly",
  "daily",
  "custom_quote",
] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const AVAILABILITY_STATUSES = ["available", "limited", "booked"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const ADMIN_ROLES = ["owner", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/* -------------------------------------------------------------------------- */
/* View models                                                                */
/* -------------------------------------------------------------------------- */

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
};

export type ProjectCardView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  clientName: string | null;
  year: number | null;
  coverType: string;
  coverMediaPath: string | null;
  coverPosterPath: string | null;
  /** Carried on the card so admin listings can show and filter by state. */
  status: ProjectStatus;
  featured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  updatedAt: string;
  categories: CategoryView[];
};

export type ProjectSectionView = {
  id: string;
  sectionType: ProjectSectionType;
  heading: string;
  body: string;
  metadata: Record<string, unknown>;
  sortOrder: number;
};

export type ProjectMediaView = {
  id: string;
  mediaType: MediaType;
  storagePath: string | null;
  posterPath: string | null;
  externalUrl: string | null;
  alt: string;
  caption: string;
  aspectRatio: AspectRatio;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  featured: boolean;
  sortOrder: number;
};

export type ProjectDetailView = ProjectCardView & {
  seoTitle: string;
  seoDescription: string;
  sections: ProjectSectionView[];
  media: ProjectMediaView[];
  /** Paths that point at this project's uploaded files. */
  storagePaths: string[];
};

export type GalleryItemView = {
  id: string;
  itemType: GalleryItemType;
  title: string;
  caption: string;
  storagePath: string | null;
  posterPath: string | null;
  instagramUrl: string | null;
  externalUrl: string | null;
  linkedProjectId: string | null;
  linkedProjectSlug: string | null;
  linkedProjectTitle: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type ServiceFeatureView = {
  id: string;
  label: string;
  sortOrder: number;
};

export type ServicePackageView = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export type ServiceView = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceType: PriceType;
  price: number | null;
  maxPrice: number | null;
  currency: string;
  unit: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  features: ServiceFeatureView[];
  packages: ServicePackageView[];
};

export type SocialLinks = {
  instagram: string | null;
  youtube: string | null;
  vimeo: string | null;
  tiktok: string | null;
};

export type SiteSettingsView = {
  brandName: string;
  ownerName: string;
  tagline: string;
  shortIntro: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  social: SocialLinks;
  heroVideoPath: string | null;
  heroPosterPath: string | null;
  showreelVideoPath: string | null;
  showreelPosterPath: string | null;
  availabilityStatus: AvailabilityStatus;
  defaultCurrency: string;
  seoTitle: string;
  seoDescription: string;
};

export type InquiryView = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceId: string | null;
  serviceName: string;
  budget: string | null;
  projectDate: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
};

/** Raw `*_i18n` values, keyed by locale, as stored in PostgreSQL JSONB. */
export type I18nRecord = Record<string, string>;