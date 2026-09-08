import { useCallback, useEffect, useState } from "react";
import { fetchSiteSettings, saveSiteSettings } from "../lib/supabase";
import type { SiteSettings } from "../types";

export interface SiteSettingsState {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  save: (next: Partial<SiteSettings>) => Promise<void>;
}

/**
 * Admin site-settings hook — loads the single site_settings row (id =
 * 'settings') via the backend API and exposes a `save` helper that merges
 * partial updates through the token-verified API.
 */
export function useSiteSettings(): SiteSettingsState {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const s = await fetchSiteSettings();
        if (cancelled) return;
        setSettings(s as SiteSettings | null);
        setLoading(false);
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e?.message || e));
        setLoading(false);
      }
    };
    load();

    const onChanged = () => load();
    window.addEventListener("admin:data-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("admin:data-changed", onChanged);
    };
  }, []);

  const save = useCallback(async (next: Partial<SiteSettings>) => {
    await saveSiteSettings(next as Record<string, any>);
    const s = await fetchSiteSettings();
    setSettings(s as SiteSettings | null);
  }, []);

  return { settings, loading, error, save };
}