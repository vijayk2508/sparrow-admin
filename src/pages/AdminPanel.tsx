import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Settings, Users, Dumbbell, CalendarRange, CreditCard,
  MessageSquareQuote, Image as ImageIcon, Ticket, CalendarCheck, Wallet, Mail,
  LogOut, Lock, ShieldAlert, X,
} from 'lucide-react';
import { onAuthStateChanged, isAdminUser, logOut, ADMIN_EMAILS, getCurrentUser } from '../lib/firebase';
import { syncCurrentUser } from '../lib/supabase';
import { AdminLogin } from '../components/admin/AdminLogin';
import { DashboardTab } from '../components/admin/DashboardTab';
import { SiteSettingsTab } from '../components/admin/SiteSettingsTab';
import { CoachesTab, ProgramsTab, ScheduleTab, PlansTab, TestimonialsTab, GalleryTab, EventsTab } from '../components/admin/Managers';
import { BookingsViewer, PaymentsViewer, ContactQueriesViewer } from '../components/admin/Viewers';
import { Spinner } from '../components/Skeletons';

type TabKey = 'dashboard' | 'settings' | 'coaches' | 'programs' | 'schedule' | 'plans' | 'testimonials' | 'gallery' | 'events' | 'bookings' | 'payments' | 'contact';

const NAV: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'settings', label: 'Site Settings', icon: Settings },
  { key: 'coaches', label: 'Coaches', icon: Users },
  { key: 'programs', label: 'Programs', icon: Dumbbell },
  { key: 'schedule', label: 'Schedule', icon: CalendarRange },
  { key: 'plans', label: 'Membership Plans', icon: CreditCard },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'events', label: 'Events', icon: Ticket },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'payments', label: 'Payments', icon: Wallet },
    { key: 'contact', label: 'Contact Queries', icon: Mail },
];

// ---- Per-page URLs: every tab is addressable & bookmarkable -------------
// e.g. /coaches, /settings, /dashboard (falls back to `/` = dashboard).
const TAB_PATHS: Record<TabKey, string> = {
  dashboard: 'dashboard',
  settings: 'settings',
  coaches: 'coaches',
  programs: 'programs',
  schedule: 'schedule',
  plans: 'membershipplans',
  testimonials: 'testimonials',
  gallery: 'gallery',
  events: 'events',
  bookings: 'bookings',
  payments: 'payments',
  contact: 'contact',
};
const TAB_FROM_PATH: Record<string, TabKey> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([k, v]) => [v, k as TabKey])
);

export const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<any | null | undefined>(undefined); // undefined = loading
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [verifying, setVerifying] = useState(false);
    const [tab, setTab] = useState<TabKey>(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    return (path && TAB_FROM_PATH[path]) || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Push a per-page URL when switching tabs (har ek page ka apna url).
  const navigateTo = (next: TabKey) => {
    const path = TAB_PATHS[next] || 'dashboard';
    window.history.pushState({ tab: next }, '', path === 'dashboard' ? '/' : '/' + path);
    setTab(next);
  };

  // Sync tab when the user hits back/forward.
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const next = (path && TAB_FROM_PATH[path]) || 'dashboard';
      if (next !== tab) setTab(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [tab]);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setRole(null);
        setVerifying(false);
        return;
      }
      setUser(fbUser);
      setVerifying(true);
      // Verify the Firebase ID token with the backend and get the
      // DB-derived role. Never trust a role supplied by the client.
      // Fallback to client-side check if backend is unavailable.
      try {
        const appUser = await syncCurrentUser();
        console.log("[AdminPanel] syncCurrentUser result:", appUser);
        if (appUser) {
          setRole(appUser.role === 'admin' ? 'admin' : 'user');
        } else {
          // Backend unavailable — use client-side admin check as fallback
          const isAdmin = isAdminUser(fbUser.email);
          console.log("[AdminPanel] fallback isAdminUser check:", isAdmin, "email:", fbUser.email);
          setRole(isAdmin ? 'admin' : 'user');
        }
      } catch (e) {
        // Backend error — use client-side admin check as fallback
        console.error("[AdminPanel] syncCurrentUser error:", e);
        const isAdmin = isAdminUser(fbUser.email);
        console.log("[AdminPanel] fallback isAdminUser check:", isAdmin, "email:", fbUser.email);
        setRole(isAdmin ? 'admin' : 'user');
      } finally {
        setVerifying(false);
      }
    });
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#070709] text-white">
        <Spinner label="Checking auth…" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  // Show loading spinner while verifying user with backend
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#070709] text-white">
        <Spinner label="Verifying admin access…" />
      </div>
    );
  }

  if (role !== 'admin') {
    return <AccessDenied email={user.email || ''} />;
  }

  const renderTab = () => {
    switch (tab) {
      case 'dashboard': return <DashboardTab />;
      case 'settings': return <SiteSettingsTab />;
      case 'coaches': return <CoachesTab />;
      case 'programs': return <ProgramsTab />;
      case 'schedule': return <ScheduleTab />;
      case 'plans': return <PlansTab />;
      case 'testimonials': return <TestimonialsTab />;
      case 'gallery': return <GalleryTab />;
      case 'events': return <EventsTab />;
      case 'bookings': return <BookingsViewer />;
      case 'payments': return <PaymentsViewer />;
      case 'contact': return <ContactQueriesViewer />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0a0a0d] border-r border-zinc-800/80 sticky top-0 h-screen">
                <SidebarContent active={tab} onSelect={navigateTo} user={user} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0d] border-r border-zinc-800 overflow-y-auto">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>
                        <SidebarContent active={tab} onSelect={(t) => { navigateTo(t); setSidebarOpen(false); }} user={user} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-[#0a0a0d]/95 backdrop-blur border-b border-zinc-800/80 px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300"
              aria-label="Open menu"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black font-sans uppercase tracking-tight truncate">
                SPARROW <span className="text-red-600">ADMIN</span>
              </h1>
              <div className="text-[10px] font-mono text-zinc-500 truncate">{NAV.find((n) => n.key === tab)?.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
                            href="https://www.sparrowtrainingclub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/50 transition-colors"
            >
              View Site
            </a>
            <button
              onClick={() => logOut()}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-6xl w-full">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ active: TabKey; onSelect: (t: TabKey) => void; user: any }> = ({ active, onSelect, user }) => (
  <div className="flex flex-col h-full">
    <div className="px-6 py-6 border-b border-zinc-800/80">
      <div className="text-xl font-black font-sans uppercase tracking-tight">
        SPARROW <span className="text-red-600">ADMIN</span>
      </div>
      <div className="text-[10px] font-mono text-zinc-500 mt-1 truncate">{user.displayName || user.email}</div>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              isActive
                ? 'bg-red-600/15 border border-red-600/40 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>

    <div className="px-3 py-4 border-t border-zinc-800/80 space-y-2">
      <a
                href="https://www.sparrowtrainingclub.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
      >
        <Lock className="w-3.5 h-3.5" /> Back to live site
      </a>
    </div>
  </div>
);

const AccessDenied: React.FC<{ email: string }> = ({ email }) => (
  <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6">
    <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950 border border-red-700/60 flex items-center justify-center mb-5">
        <ShieldAlert className="w-7 h-7 text-red-400" />
      </div>
      <h1 className="text-2xl font-black font-sans uppercase tracking-tight">Access Denied</h1>
      <p className="text-xs font-mono text-zinc-400 mt-3 leading-relaxed">
        You are signed in as <span className="text-white">{email}</span>, but that email is not on the admin whitelist.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button onClick={() => logOut()} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
          Switch Account
        </button>
                <a href="https://www.sparrowtrainingclub.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-mono font-bold text-white">
          Back to Site
        </a>
      </div>
    </div>
  </div>
);