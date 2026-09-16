import React, { useEffect, useState } from 'react';
import { Save, RotateCcw, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, Info, Award, ShieldAlert, Zap, Apple, UserCheck, Dumbbell } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { DEFAULT_SITE_SETTINGS } from '../../lib/seed';
import { AdminCard, TextInput, NumberInput, TextAreaInput, ImageUpload, btnPrimary, btnGhost } from './ui';
import type { SiteSettings, HeroStat, WhyChooseUsItem } from '../../types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award, ShieldAlert, Zap, Apple, UserCheck, Dumbbell
};
const resolveIcon = (name: string): React.ComponentType<{ className?: string }> => ICONS[name] || Award;

export const SiteSettingsTab: React.FC = () => {
  const { settings, loading, save } = useSiteSettings();
  const [draft, setDraft] = useState<Partial<SiteSettings> | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  const set = (key: keyof SiteSettings, value: any) => setDraft((d) => (d ? { ...d, [key]: value } : { [key]: value }));

  const persist = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      await save(draft);
      setNotice('Settings saved — the live site updates instantly.');
      setTimeout(() => setNotice(''), 3500);
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!window.confirm('Overwrite current settings with the default values from gymData?')) return;
    setSaving(true);
    try {
      await save(DEFAULT_SITE_SETTINGS as SiteSettings);
      setDraft(DEFAULT_SITE_SETTINGS as SiteSettings);
      setNotice('Restored default settings.');
      setTimeout(() => setNotice(''), 3500);
    } catch (e: any) {
      setError(e?.message || 'Failed to reset settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <div className="py-12 text-center text-zinc-500 font-mono text-xs">Loading settings…</div>;
  }

  if (!draft) {
    return (
      <AdminCard title="Site Settings" description="No settings doc found — click below to create it from the bundled defaults.">
        <button onClick={resetToDefaults} className={btnPrimary}>
          <RotateCcw className="w-4 h-4" />
          Save Defaults
        </button>
      </AdminCard>
    );
  }

  const heroStats = draft.heroStats || [];
  const whyChooseUs = draft.whyChooseUs || [];

    const updateStat = (i: number, patch: Partial<HeroStat>) => {
    const next = [...heroStats];
    next[i] = { ...next[i], ...patch };
    set('heroStats', next);
  };
  const updateFeature = (i: number, patch: Partial<WhyChooseUsItem>) => {
    const next = [...whyChooseUs];
    next[i] = { ...next[i], ...patch };
    set('whyChooseUs', next);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="px-3 py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}
      {error && (
        <div className="px-3 py-2 bg-red-950 border border-red-700 text-red-300 text-xs font-mono rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <AdminCard title="General" description="Gym name, contact info, hero image & session fee.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Gym Name" value={draft.name || ''} onChange={(v) => set('name', v)} />
          <TextInput label="Established Year" value={draft.establishedYear || ''} onChange={(v) => set('establishedYear', v)} />
          <TextInput label="City / Location" value={draft.city || ''} onChange={(v) => set('city', v)} placeholder="KOTDWARA, INDIA" />
          <TextInput label="Tagline" value={draft.tagline || ''} onChange={(v) => set('tagline', v)} />
          <TextInput label="Phone" value={draft.phone || ''} onChange={(v) => set('phone', v)} />
          <TextInput label="Email" value={draft.email || ''} onChange={(v) => set('email', v)} />
          <TextAreaInput label="Address" value={draft.address || ''} onChange={(v) => set('address', v)} rows={2} />
          <NumberInput label="Session Fee" value={draft.sessionFee ?? 25} onChange={(v) => set('sessionFee', v)} />
          <TextAreaInput label="Subtext (footer blurb)" value={draft.subtext || ''} onChange={(v) => set('subtext', v)} rows={2} />
          <div className="sm:col-span-2">
            <TextAreaInput label="Hero Subtitle" value={draft.heroSubtext || ''} onChange={(v) => set('heroSubtext', v)} rows={2} />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload label="Hero Background Image" value={draft.heroImage || ''} onChange={(v) => set('heroImage', v)} folder="site-settings" />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Social & Hours" description="Contact link buttons and opening hours.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Instagram URL" value={draft.socials?.instagram || ''} onChange={(v) => set('socials', { ...(draft.socials || {}), instagram: v })} />
          <TextInput label="Facebook URL" value={draft.socials?.facebook || ''} onChange={(v) => set('socials', { ...(draft.socials || {}), facebook: v })} />
          <TextInput label="Weekday Hours" value={draft.hours?.weekdays || ''} onChange={(v) => set('hours', { ...(draft.hours || {}), weekdays: v })} />
          <TextInput label="Saturday Hours" value={draft.hours?.saturday || ''} onChange={(v) => set('hours', { ...(draft.hours || {}), saturday: v })} />
          <TextInput label="Sunday Hours" value={draft.hours?.sunday || ''} onChange={(v) => set('hours', { ...(draft.hours || {}), sunday: v })} />
        </div>
      </AdminCard>
<AdminCard title="Hero Stats" description="Numbers shown in the hero stats bar (500+ members, 12 coaches, …).">
        <div className="space-y-3">
          {heroStats.map((s, i) => (
            <div key={s.id || i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
              <TextInput label="Label" value={s.label || ''} onChange={(v) => updateStat(i, { label: v })} />
              <TextInput label="Prefix" value={s.prefix || ''} onChange={(v) => updateStat(i, { prefix: v })} />
              <NumberInput label="Value" value={s.value ?? 0} onChange={(v) => updateStat(i, { value: v })} />
              <TextInput label="Suffix" value={s.suffix || ''} onChange={(v) => updateStat(i, { suffix: v })} />
              <button
                type="button"
                onClick={() => set('heroStats', heroStats.filter((_, j) => j !== i))}
                className="px-3 py-2.5 bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-700 text-zinc-400 hover:text-red-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('heroStats', [...heroStats, { id: `stat-${Date.now()}`, label: 'NEW STAT', value: 0 }])} className={btnGhost}>
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        </div>
      </AdminCard>

      <AdminCard title="Why Choose Us" description="Feature cards under the hero.">
        <div className="mb-4 flex items-start gap-2 text-[11px] font-mono text-zinc-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Supported icons: Award, ShieldAlert, Zap, Apple, UserCheck, Dumbbell — the preview shows exactly what the live site renders. Unknown names fall back to Award.</span>
        </div>
        <div className="space-y-3">
          {whyChooseUs.map((f, i) => {
            const PreviewIcon = resolveIcon(f.icon || '');
            return (
            <div key={f.id || i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <TextInput label="Number" value={f.num || ''} onChange={(v) => updateFeature(i, { num: v })} />
              <div className="flex items-end gap-2">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400" title="Icon preview — rendered exactly like this on the live site">
                  <PreviewIcon className="w-5 h-5" />
                </div>
                <TextInput label="Icon Name" value={f.icon || ''} onChange={(v) => updateFeature(i, { icon: v })} placeholder="Award / ShieldAlert / Zap / Apple / UserCheck / Dumbbell" />
              </div>
              <TextInput label="Title" value={f.title || ''} onChange={(v) => updateFeature(i, { title: v })} />
              <button
                type="button"
                onClick={() => set('whyChooseUs', whyChooseUs.filter((_, j) => j !== i))}
                className="px-3 py-2.5 bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-700 text-zinc-400 hover:text-red-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="sm:col-span-4">
                <TextAreaInput label="Description" value={f.desc || ''} onChange={(v) => updateFeature(i, { desc: v })} rows={2} />
              </div>
            </div>
            );
          })}
          <button
            type="button"
            onClick={() => set('whyChooseUs', [...whyChooseUs, { id: `why-${Date.now()}`, num: String(whyChooseUs.length + 1).padStart(2, '0'), icon: 'Award', title: 'NEW FEATURE', desc: '' }])}
            className={btnGhost}
          >
            <Plus className="w-4 h-4" /> Add Feature
          </button>
        </div>
      </AdminCard>

      <div className="flex items-center gap-3 justify-end">
        <button onClick={resetToDefaults} className={btnGhost}>
          <RotateCcw className="w-4 h-4" /> Restore Defaults
        </button>
        <button onClick={persist} disabled={saving} className={btnPrimary}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
        </div>
  );
};
