import React, { useState } from 'react';
import { Pencil, Trash2, X, Loader2, ImageIcon } from 'lucide-react';
import { useCollectionData } from '../../hooks/useCollectionData';
import { saveDocument, deleteDocument } from '../../lib/supabase';
import {
  AdminCard, AddButton, TextInput, NumberInput, TextAreaInput, SelectInput,
  ToggleInput, TagsInput, ImageUpload, btnGhost, btnPrimary,
} from './ui';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'image' | 'tags' | 'bool' | 'socials';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  help?: string;
}

interface CrudManagerProps {
  title: string;
  description?: string;
  collection: string;
  fields: FieldConfig[];
  newItem: () => Record<string, any>;
  storageFolder?: string;
  listKeys?: string[];
  listImageKey?: string;
}

export const CrudManager: React.FC<CrudManagerProps> = ({
  title,
  description,
  collection,
  fields,
  newItem,
  storageFolder,
  listKeys,
  listImageKey,
}) => {
  const { data, loading } = useCollectionData<any>(collection);
  const [form, setForm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const previewFields = listKeys || fields.slice(0, 2).map((f) => f.key);
  const set = (key: string, value: any) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const openCreate = () => setForm({ ...newItem(), id: '' });
  const openEdit = (item: any) => setForm({ ...item });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.id) delete payload.id;
      const savedId = await saveDocument(collection, payload);
      setNotice(`Saved — ${savedId}`);
      setTimeout(() => setNotice(''), 3000);
      setForm(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to save. Check Supabase RLS policies / admin access.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!item.id) return;
    if (!window.confirm(`Delete this item? This cannot be undone.`)) return;
    try {
      await deleteDocument(collection, item.id);
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    }
  };

  return (
    <AdminCard
      title={title}
      description={description}
      actions={<AddButton onClick={openCreate} />}
    >
      {notice && (
        <div className="mb-4 px-3 py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono rounded-lg">
          {notice}
        </div>
      )}
      {error && !form && (
        <div className="mb-4 px-3 py-2 bg-red-950 border border-red-700 text-red-300 text-xs font-mono rounded-lg">
          {error}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading && <div className="text-center py-8 text-zinc-500 font-mono text-xs">Loading…</div>}
        {!loading && data.length === 0 && (
          <div className="text-center py-8 text-zinc-500 font-mono text-xs">
            No items yet. Click “ADD NEW” to create the first one.
          </div>
        )}
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3">
            {listImageKey && item[listImageKey] ? (
              <img src={item[listImageKey]} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0" />
            ) : listImageKey ? (
              <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold font-sans text-white uppercase truncate">
                {String(item[previewFields[0]] ?? 'Untitled')}
              </div>
              {previewFields[1] && (
                <div className="text-[11px] font-mono text-zinc-500 truncate">
                  {typeof item[previewFields[1]] === 'object'
                    ? JSON.stringify(item[previewFields[1]])
                    : String(item[previewFields[1]] ?? '')}
                </div>
              )}
            </div>
            <button onClick={() => openEdit(item)} className={btnGhost} title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              className="px-2 py-2 bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Create/Edit modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 sm:p-8 my-6">
            <button onClick={() => setForm(null)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-lg">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-black font-sans uppercase tracking-tight text-white mb-6">
              {form.id ? 'EDIT ITEM' : 'ADD NEW ITEM'}
            </h3>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-950 border border-red-700 text-red-300 text-xs font-mono rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => renderField(f, form, set))}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center gap-3 justify-end">
                <button type="button" onClick={() => setForm(null)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminCard>
  );
};

function renderField(f: FieldConfig, current: any, setter: (k: string, v: any) => void) {
  const value = current[f.key];
  switch (f.type) {
    case 'textarea':
      return (
        <div key={f.key} className="sm:col-span-2">
          <TextAreaInput label={f.label} value={value ?? ''} onChange={(v) => setter(f.key, v)} rows={3} help={f.help} />
        </div>
      );
    case 'number':
      return (
        <div key={f.key}>
          <NumberInput label={f.label} value={value ?? 0} onChange={(v) => setter(f.key, v)} help={f.help} />
        </div>
      );
    case 'select':
      return (
        <div key={f.key}>
          <SelectInput label={f.label} value={String(value ?? f.options?.[0] ?? '')} onChange={(v) => setter(f.key, v)} options={f.options || []} help={f.help} />
        </div>
      );
    case 'image':
      return (
        <div key={f.key} className="sm:col-span-2">
          <ImageUpload label={f.label} value={value ?? ''} onChange={(v) => setter(f.key, v)} folder="images" />
        </div>
      );
    case 'tags':
      return (
        <div key={f.key} className="sm:col-span-2">
          <TagsInput label={f.label} values={Array.isArray(value) ? value : []} onChange={(v) => setter(f.key, v)} help={f.help} />
        </div>
      );
    case 'bool':
      return (
        <div key={f.key} className="sm:col-span-2">
          <ToggleInput label={f.label} value={!!value} onChange={(v) => setter(f.key, v)} />
        </div>
      );
    case 'socials': {
      const social: any = value || {};
      return (
        <div key={f.key} className="sm:col-span-2 space-y-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">{f.label}</div>
          {(['instagram', 'twitter', 'youtube'] as const).map((s) => (
            <div key={s}>
              <TextInput
                label={s.toUpperCase()}
                value={social[s] || ''}
                onChange={(v) => setter(f.key, { ...social, [s]: v })}
                placeholder={`https://…/${s}`}
              />
            </div>
          ))}
        </div>
      );
    }
    default:
      return (
        <div key={f.key}>
          <TextInput label={f.label} value={value ?? ''} onChange={(v) => setter(f.key, v)} placeholder={f.placeholder} help={f.help} />
        </div>
      );
  }
}