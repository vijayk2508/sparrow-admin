import React from 'react';
import { useCollectionData } from '../../hooks/useCollectionData';
import { AdminCard } from './ui';

const COLLECTIONS = [
  'coaches', 'programs', 'schedule', 'membershipPlans',
  'testimonials', 'gallery', 'events', 'bookings', 'payments', 'contactQueries',
];

// NOTE: The "Seed Initial Data" panel was removed — the Supabase database is
// already seeded (verified live). The seed API endpoint still exists at
// POST /api/admin/db {action:"seed"} if you ever need to re-run it.
export const DashboardTab: React.FC = () => {
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