import React, { useState } from 'react';
import { Mail, Eye, Loader2 } from 'lucide-react';
import { useCollectionData } from '../../hooks/useCollectionData';
import { updateDocument } from '../../lib/supabase';
import { AdminCard, SelectInput, btnGhost } from './ui';

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const statusBadge = (status?: string) => {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-950 text-emerald-400 border-emerald-700',
    pending: 'bg-amber-950 text-amber-400 border-amber-700',
    cancelled: 'bg-red-950 text-red-400 border-red-700',
    paid: 'bg-emerald-950 text-emerald-400 border-emerald-700',
    free_trial: 'bg-sky-950 text-sky-400 border-sky-700',
    pay_at_gym: 'bg-zinc-800 text-zinc-300 border-zinc-600',
    captured: 'bg-emerald-950 text-emerald-400 border-emerald-700',
    failed: 'bg-red-950 text-red-400 border-red-700',
    new: 'bg-amber-950 text-amber-400 border-amber-700',
    read: 'bg-zinc-800 text-zinc-300 border-zinc-600',
    active: 'bg-emerald-950 text-emerald-400 border-emerald-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${map[status || ''] || 'bg-zinc-800 text-zinc-300 border-zinc-600'}`}>
      {status || '—'}
    </span>
  );
};

export const BookingsViewer: React.FC = () => {
  const { data, loading } = useCollectionData<any>('bookings');
  const [filter, setFilter] = useState('ALL');
  const rows = filter === 'ALL' ? data : data.filter((b) => b.status === filter);

  return (
    <AdminCard title="Bookings" description="Read-only list of every booking." actions={
      <div className="w-40">
        <SelectInput label="" value={filter} onChange={setFilter} options={['ALL', 'confirmed', 'pending', 'cancelled']} />
      </div>
    }>
      {loading && <div className="py-8 text-center text-zinc-500 font-mono text-xs">Loading bookings…</div>}
      {!loading && rows.length === 0 && (
        <div className="py-8 text-center text-zinc-500 font-mono text-xs">No bookings found{filter !== 'ALL' && ` (${filter})`}.</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800">
            <tr>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Class</th>
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((b: any) => (
              <tr key={b.id} className="border-b border-zinc-900">
                <td className="py-2.5 pr-3 text-white">{b.userName}</td>
                <td className="py-2.5 pr-3">{b.userEmail}</td>
                <td className="py-2.5 pr-3">{b.classTitle}</td>
                <td className="py-2.5 pr-3">{fmtDate(b.date)} {b.timeSlot}</td>
                <td className="py-2.5 pr-3">${b.amount ?? 0}</td>
                <td className="py-2.5 pr-3">{statusBadge(b.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
};

export const PaymentsViewer: React.FC = () => {
  const { data, loading } = useCollectionData<any>('payments');
  const [filter, setFilter] = useState('ALL');
  const rows = filter === 'ALL' ? data : data.filter((p) => p.status === filter);

  return (
    <AdminCard title="Payments" description="Razorpay payment logs stored in Firestore.">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="w-44">
          <SelectInput label="" value={filter} onChange={setFilter} options={['ALL', 'captured', 'pending', 'failed']} />
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Total captured: {sumCaptured(data)}
        </span>
      </div>
      {loading && <div className="py-8 text-center text-zinc-500 font-mono text-xs">Loading payments…</div>}
      {!loading && rows.length === 0 && <div className="py-8 text-center text-zinc-500 font-mono text-xs">No payments found.</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800">
            <tr>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Item</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Payment ID</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Created</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((p: any) => (
              <tr key={p.id} className="border-b border-zinc-900">
                <td className="py-2.5 pr-3 text-white">
                  {p.userName}
                  <div className="text-[10px] text-zinc-500">{p.userEmail}</div>
                </td>
                <td className="py-2.5 pr-3">{p.planOrSession}</td>
                <td className="py-2.5 pr-3">₹{p.amount?.toLocaleString('en-IN') || p.amount}</td>
                <td className="py-2.5 pr-3 text-zinc-500">{p.razorpayPaymentId || p.razorpayOrderId || '—'}</td>
                <td className="py-2.5 pr-3">{statusBadge(p.status)}</td>
                <td className="py-2.5 pr-3">{fmtDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
};

export const ContactQueriesViewer: React.FC = () => {
  const { data, loading } = useCollectionData<any>('contactQueries');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const rows = filter === 'ALL' ? data : data.filter((c) => c.status === filter);

  const markRead = async (q: any) => {
    if (!q.id) return;
    setBusyId(q.id);
    try {
      await updateDocument('contactQueries', q.id, { status: 'read' });
    } catch {
      /* rules may restrict — best effort only */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminCard title="Contact Queries" description="Messages from the contact form.">
      <div className="mb-4 w-44">
        <SelectInput label="" value={filter} onChange={setFilter} options={['ALL', 'new', 'read']} />
      </div>
      {loading && <div className="py-8 text-center text-zinc-500 font-mono text-xs">Loading messages…</div>}
      {!loading && rows.length === 0 && <div className="py-8 text-center text-zinc-500 font-mono text-xs">No messages found.</div>}
      <div className="space-y-3">
        {rows.map((q: any) => (
          <div key={q.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-sans">
                    {q.name} <span className="text-[10px] font-mono text-zinc-500">· {q.email}</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {q.phone || ''} {q.subject ? `· ${q.subject}` : ''} · {fmtDate(q.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(q.status)}
                {q.status !== 'read' && (
                  <button onClick={() => markRead(q)} disabled={busyId === q.id} className={btnGhost}>
                    {busyId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    MARK READ
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs font-sans text-zinc-300 leading-relaxed">{q.message}</p>
          </div>
        ))}
      </div>
    </AdminCard>
  );
};

function sumCaptured(rows: any[]) {
  const total = rows.filter((r) => r.status === 'captured').reduce((s, r) => s + Number(r.amount || 0), 0);
  return `₹${total.toLocaleString('en-IN')}`;
}
