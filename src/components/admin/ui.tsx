import React, { useState } from 'react';
import { X, Plus, Trash2, Pencil, Upload, ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { uploadImage } from '../../lib/supabase';

// ============================================================
// Shared admin UI primitives (dark, consistent with the site)
// ============================================================

export const inputCls =
  "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:border-red-500 outline-none placeholder:text-zinc-600";
export const btnPrimary =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors";

export function AdminCard({ title, description, children, actions }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black font-sans uppercase tracking-tight text-white">{title}</h3>
          {description && <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export const FieldLabel: React.FC<{ label: string; help?: string }> = ({ label, help }) => (
  <div>
    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">{label}</label>
    {help && <div className="text-[10px] font-mono text-zinc-600 mb-1 -mt-0.5">{help}</div>}
  </div>
);

export const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, help, type = 'text' }) => (
  <div>
    <FieldLabel label={label} help={help} />
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
  </div>
);

export const NumberInput: React.FC<{
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  step?: number;
  help?: string;
}> = ({ label, value, onChange, step = 1, help }) => (
  <div>
    <FieldLabel label={label} help={help} />
    <input
      type="number"
      step={step}
      value={value === undefined || value === null ? '' : (value as any)}
      onChange={(e) => onChange(Number(e.target.value))}
      className={inputCls}
    />
  </div>
);

export const TextAreaInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  help?: string;
}> = ({ label, value, onChange, rows = 4, help }) => (
  <div>
    <FieldLabel label={label} help={help} />
    <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
  </div>
);

export const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  help?: string;
}> = ({ label, value, onChange, options, help }) => (
  <div>
    <FieldLabel label={label} help={help} />
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

export const ToggleInput: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 cursor-pointer">
    <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-wider">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-red-600' : 'bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </label>
);

/** Comma / newline separated tag editor (features, specialties, …). */
export const TagsInput: React.FC<{
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  help?: string;
}> = ({ label, values, onChange, help }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...values, t]);
    setDraft('');
  };
  return (
    <div>
      <FieldLabel label={label} help={help} />
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className={inputCls}
        />
        <button type="button" onClick={add} className="px-3 bg-zinc-800 hover:bg-red-600 rounded-lg text-zinc-300 hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {values.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs rounded">
            {t}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {values.length === 0 && <span className="text-[10px] font-mono text-zinc-600">No items yet.</span>}
      </div>
    </div>
  );
};

/** Image upload control with preview + URL passthrough. */
export const ImageUpload: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder: string;
}> = ({ label, value, onChange, folder }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e: any) {
      setError(e?.message || 'Upload failed. Make sure Firebase Storage is enabled.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FieldLabel label={label} help="Upload a photo or paste an image URL." />
      <div className="flex items-start gap-3">
        <label className={`shrink-0 w-28 h-24 rounded-lg border border-dashed ${value ? 'border-zinc-700' : 'border-zinc-600'} bg-zinc-950 flex items-center justify-center cursor-pointer overflow-hidden hover:border-red-500 transition-colors`}>
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-zinc-600">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              <span className="text-[9px] font-mono uppercase">{uploading ? 'Uploading…' : 'Image'}</span>
            </span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} disabled={uploading} />
        </label>
        <div className="flex-1 space-y-1">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" className={inputCls} />
          <div className="flex items-center gap-2">
            <label className={`${btnGhost} !py-1.5 !px-2.5 text-[10px] cursor-pointer`}>
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading…' : 'Upload'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} disabled={uploading} />
            </label>
            {value && (
              <button type="button" onClick={() => onChange('')} className="text-[10px] font-mono text-zinc-500 hover:text-red-400">
                Clear
              </button>
            )}
          </div>
          {error && <p className="text-[10px] font-mono text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

/** A small "Add new" button used by every manager. */
export const AddButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'ADD NEW' }) => (
  <button onClick={onClick} className={btnPrimary}>
    <Plus className="w-4 h-4" />
    {label}
  </button>
);