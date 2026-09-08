import React, { useState } from 'react';
import { Database, ExternalLink, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCollectionData } from '../../hooks/useCollectionData';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { seedInitialData, type SeedResult } from '../../lib/seed';
import { AdminCard, btnPrimary, btnGhost, ToggleInput } from './ui';

const COLLECTIONS = [
  'coaches', 'programs', 'schedule', 'membershipPlans',
  'testimonials', 'gallery', 'events', 'bookings', 'payments', 'contactQueries',
];

export const DashboardTab: React.FC = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [force, setForce] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const runSeed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const r = await seedInitialData({ force });
      setResult(r);
    } catch (e: any) {
      setResult({ ok: false, counts: {}, message: e?.message || 'Seed failed' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview counts */}
      <AdminCard title="Database Overview" description="Live doc counts per collection (auto updates while you browse).">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COLLECTIONS.map((col) => (
            <CollectionCount key={col} path={col} />
          ))}
        </div>
      </AdminCard>

      {/* Seed panel */}
      <AdminCard title="Seed Initial Data" description="Migrate the bundled gymData.ts content into Supabase exactly once.">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400 leading-relaxed">
            <p>
              This writes the current site content (coaches, programs, schedule, membership plans, testimonials,
              gallery, events) plus the site settings row into your Supabase database — so you can then edit
              everything from this panel instead of in code.
            </p>
            <p className="mt-2 text-zinc-500">
              Collections that already contain data are skipped unless you enable <strong className="text-zinc-300">Force overwrite</strong>.
              You must be signed in with a whitelisted admin email.
            </p>
          </div>

          <ToggleInput label="Force overwrite existing collections" value={force} onChange={setForce} />
          {result && (
            <div className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-start gap-2 ${result.ok ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-red-950 border-red-700 text-red-300'}`}>
              {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="whitespace-pre-wrap">{result.message}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={runSeed} disabled={seeding} className={btnPrimary}>
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {seeding ? 'Seeding…' : 'Seed Initial Data'}
            </button>
            <a href="#/" className={btnGhost}>
              <ExternalLink className="w-4 h-4" /> View Live Site
            </a>
          </div>
          {!settingsLoading && !settings && (
            <p className="text-[11px] font-mono text-amber-400">
              Site settings doc not found yet — the site currently runs on bundled defaults until you seed.
            </p>
          )}
        </div>
      </AdminCard>
    </div>
  );
};

const CollectionCount: React.FC<{ path: string }> = ({ path }) => {
  const { data, loading } = useCollectionData<any>(path);
  const name = path.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
      <div className="text-3xl font-black font-mono text-white">{loading ? '…' : data.length}</div>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{name}</div>
    </div>
  );
};