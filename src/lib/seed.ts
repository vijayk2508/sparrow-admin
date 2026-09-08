import { adminApi } from "./supabase";
import {
  GYM_INFO,
  TRAINING_PROGRAMS,
  COACHES,
  SCHEDULE_CLASSES,
  MEMBERSHIP_PLANS,
  TESTIMONIALS,
  GALLERY_ITEMS,
  UPCOMING_EVENTS,
  HERO_STATS,
  WHY_CHOOSE_US_FEATURES,
} from "../data/gymData";
import type { SiteSettings } from "../types";

/**
 * Default site settings row. Once seeded this powers the whole public
 * site: gym info, hero stats, hero image, session fee, why-choose-us cards.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: GYM_INFO.name,
  tagline: GYM_INFO.tagline,
  subtext: GYM_INFO.subtext,
  city: "KOTDWARA, INDIA",
  address: GYM_INFO.address,
  phone: GYM_INFO.phone,
  email: GYM_INFO.email,
  establishedYear: GYM_INFO.establishedYear,
  heroImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1920",
  sessionFee: 25,
  currency: "₹",
  heroSubtext: "Train hard. Fight smart. Become unstoppable. Premium Boxing, Hyrox Race Preparation, Strength & Conditioning for champion-level results.",
  socials: GYM_INFO.socials,
  hours: GYM_INFO.hours,
  heroStats: HERO_STATS,
  whyChooseUs: WHY_CHOOSE_US_FEATURES,
};

const SEEDABLE_COLLECTIONS: { path: string; docs: any[] }[] = [
  { path: "coaches", docs: COACHES },
  { path: "programs", docs: TRAINING_PROGRAMS },
  { path: "schedule", docs: SCHEDULE_CLASSES },
  { path: "membershipPlans", docs: MEMBERSHIP_PLANS },
  { path: "testimonials", docs: TESTIMONIALS },
  { path: "gallery", docs: GALLERY_ITEMS },
  { path: "events", docs: UPCOMING_EVENTS },
];

export interface SeedResult {
  ok: boolean;
  counts: Record<string, number>;
  message: string;
}

/**
 * Seeds all content tables + site settings from gymData.ts into Supabase.
 * Tables that already contain rows are skipped unless `force: true`.
 * Requires a signed-in admin (RLS policies enforce it).
 */
export async function seedInitialData(options?: { force?: boolean }): Promise<SeedResult> {
  // Seed runs server-side (service-role key) via the admin API.
  const result = await adminApi<{ counts: Record<string, number>; message: string }>("seed", {
    force: options?.force === true,
  });
  return { ok: true, counts: result.counts, message: result.message };
}