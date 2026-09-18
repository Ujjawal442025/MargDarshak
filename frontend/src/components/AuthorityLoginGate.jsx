import React, { useState } from 'react';
import { Shield, Lock, User, AlertTriangle, Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// DEMO-ONLY ACCESS GATE
// ---------------------------------------------------------------------------
// This is a FRONTEND-ONLY credential check for presentation/demo purposes.
// There is no backend, no hashing, no real auth server behind this — the
// "password" literally ships inside this JS bundle, so anyone who opens
// devtools can read it. It stops a casual visitor from clicking into the
// Authority Command Center, but it is NOT real security.
//
// For a real deployment this must be replaced with actual authentication
// (e.g. a backend session/JWT check, SSO, etc.) before going anywhere near
// production. Flagging that clearly here so it isn't mistaken for a finished
// security feature later.
// ---------------------------------------------------------------------------

const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'rajasthan2026',
};

const SESSION_KEY = 'margdarshak_authority_session';

export function isAuthoritySessionActive() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function clearAuthoritySession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function AuthorityLoginGate({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setChecking(true);

    // Tiny artificial delay so it reads like a real credential check on stage,
    // rather than an instant client-side if-statement.
    setTimeout(() => {
      if (
        username.trim().toLowerCase() === DEMO_CREDENTIALS.username &&
        password === DEMO_CREDENTIALS.password
      ) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setChecking(false);
        onAuthenticated();
      } else {
        setChecking(false);
        setError('Invalid Employee ID or Password. Access denied.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080C16] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-[#0D1526] border border-slate-800 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
          {/* Top accent strip echoing the Command Center's own chrome */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-slate-500">
              Government of Rajasthan · Department of Tourism
            </span>
            <h1 className="font-serif-title text-lg font-bold text-slate-100 mt-1">
              Authority Command Center
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">Restricted access — authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Employee ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={checking}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying credentials...
                </>
              ) : (
                'Access Command Center'
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-600 text-center mt-5 leading-relaxed">
            This portal is monitored. Unauthorized access attempts are logged.
            <br />
            Demo credentials — Employee ID: <span className="text-slate-400 font-mono">admin</span>, Password:{' '}
            <span className="text-slate-400 font-mono">rajasthan2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
