import { useEffect, useState } from "react";
import { fetchCollection } from "../lib/supabase";

export interface CollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/**
 * Admin data hook — fetches via the backend API (Firebase ID-token
 * verified, service-role writes). Refreshes on the "admin:data-changed"
 * event that mutations dispatch, so edits appear instantly.
 */
export function useCollectionData<T extends { id?: string } = any>(path: string): CollectionState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await fetchCollection<T>(path);
        if (cancelled) return;
        setData(rows);
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
  }, [path]);

  return { data, loading, error };
}