import { supabaseAdmin, tableFor } from "./supabase";
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
} from "../src/data/gymData";
import type { SiteSettings } from "../src/types";

// ============================================================
// SERVER-SIDE SEED — runs with the service-role key, triggered
// by the admin API (action: "seed"). Data source: gymData.ts.
// ============================================================

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

export async function seedInitialData(options?: { force?: boolean }): Promise<SeedResult> {
  const force = options?.force === true;
  const counts: Record<string, number> = {};
  const seeded: string[] = [];
  const skipped: string[] = [];

  // ---- Site settings -------------------------------------------------
  try {
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("site_settings")
      .select("id")
      .eq("id", "settings")
      .maybeSingle();
    if (existingErr) throw existingErr;
    if (force || !existing) {
      const { error } = await supabaseAdmin
        .from("site_settings")
        .upsert({ id: "settings", ...DEFAULT_SITE_SETTINGS });
      if (error) throw error;
      counts["siteSettings"] = 1;
      seeded.push("siteSettings");
    } else {
      skipped.push("siteSettings");
    }
  } catch (e: any) {
    return { ok: false, counts, message: `siteSettings: ${e?.message || e}` };
  }

  // ---- Content tables -------------------------------------------------
  for (const { path, docs } of SEEDABLE_COLLECTIONS) {
    try {
      const table = tableFor(path);
      const { count, error: countErr } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true });
      if (countErr) throw countErr;
      if (!force && (count ?? 0) > 0) {
        skipped.push(path);
        counts[path] = 0;
        continue;
      }

      if (force && (count ?? 0) > 0) {
        const { error: delErr } = await supabaseAdmin.from(table).delete().neq("id", "__none__");
        if (delErr) throw delErr;
      }

      const rows = docs.map((d, i) => {
        const row: any = { ...d };
        row.sort_order = row.order ?? i + 1;
        delete row.order;
        if (!row.id) row.id = `seed-${path}-${i}`;
        return row;
      });

      const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: "id" });
      if (error) throw error;
      counts[path] = rows.length;
      seeded.push(path);
    } catch (e: any) {
      return { ok: false, counts, message: `${path}: ${e?.message || e}` };
    }
  }

  return {
    ok: true,
    counts,
    message:
      seeded.length > 0
        ? `Seeded: ${seeded.join(", ")}${skipped.length ? ` | Skipped (already has data): ${skipped.join(", ")}` : ""}`
        : "Nothing seeded — all tables already have data. Use the Force toggle to overwrite.",
  };
}
