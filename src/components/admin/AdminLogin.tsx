import React from 'react';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';

export const AdminLogin: React.FC = () => {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      // onAuthStateChanged in AdminPanel will flip the view.
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <a href="https://www.sparrowtrainingclub.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </a>

        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center border border-red-500/40 mb-5">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black font-sans uppercase tracking-tight">Admin Panel</h1>
          <p className="text-xs font-mono text-zinc-400 mt-2 leading-relaxed">
            Sign in with Google to manage content.
            <br />
            Access is restricted to whitelisted emails.
          </p>

          <button
            onClick={handleLogin}
            disabled={busy}
            className="mt-6 w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-lg transition-colors disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
            )}
            {busy ? 'SIGNING IN…' : 'SIGN IN WITH GOOGLE'}
          </button>

          {error && <p className="mt-3 text-[11px] font-mono text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};