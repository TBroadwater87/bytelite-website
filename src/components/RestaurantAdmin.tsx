import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Admin review console (client island for /marketing/admin).
 *
 * Gated by the app's existing admin-user auth: every /admin call carries an Authorization Bearer token
 * that must belong to an is_admin app user (authMiddleware + adminMiddleware on the backend). Approve
 * is the only path that flips a paid restaurant into a live, featured venue — no auto-publish.
 */
const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) || 'https://api.thebytelite.com';
const ADMIN_TOKEN_KEY = 'hs_admin_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

async function api(path: string, token: string, opts: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(opts.headers as Record<string, string>),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const json = await res.json().catch(() => ({ success: false, error: 'Bad response' }));
  if (!res.ok || json.success === false) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data;
}

function Inner() {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // login inputs
  const [pasteToken, setPasteToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { setToken(getToken()); }, []);
  useEffect(() => { if (token) load(); }, [token]);

  async function load() {
    if (!token) return;
    setError(null);
    try {
      const data = await api('/api/restaurant-portal/admin/pending', token);
      setPending(data.pending || []);
    } catch (e: any) { setError(e.message); }
  }

  function save(t: string) { window.localStorage.setItem(ADMIN_TOKEN_KEY, t); setToken(t); }

  async function loginPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      const t = json?.data?.token || json?.data?.accessToken || json?.data?.access_token || json?.token;
      if (!t) throw new Error(json?.error || 'Login did not return a token — paste an admin token instead.');
      save(t);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function act(id: number, action: 'approve' | 'reject' | 'pause') {
    if (!token) return;
    setBusy(true); setError(null);
    try {
      const notes = action === 'reject' ? window.prompt('Reason (optional):') || undefined : undefined;
      await api(`/api/restaurant-portal/admin/${id}/${action}`, token, {
        method: 'POST', body: JSON.stringify({ notes }),
      });
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  function logout() { window.localStorage.removeItem(ADMIN_TOKEN_KEY); setToken(null); setPending([]); }

  if (!token) {
    return (
      <div className="rs-card">
        <h2>Admin sign in</h2>
        {error && <div className="rs-error">{error}</div>}
        <form onSubmit={loginPassword}>
          <label>Admin email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <hr className="divider" />
        <label>…or paste an admin token
          <input value={pasteToken} onChange={(e) => setPasteToken(e.target.value)} placeholder="Bearer token from your admin login" />
        </label>
        <button className="btn btn-outline btn-sm" disabled={!pasteToken} onClick={() => save(pasteToken.trim())}>Use token</button>
      </div>
    );
  }

  return (
    <div>
      <div className="rs-topbar">
        <span className="rs-steps-label">{pending.length} pending review</span>
        <span>
          <button className="rs-link" onClick={load}>Refresh</button>{'  '}
          <button className="rs-link" onClick={logout}>Log out</button>
        </span>
      </div>
      {error && <div className="rs-error">{error}</div>}
      {pending.length === 0 && <div className="rs-card"><p>No restaurants awaiting review.</p></div>}
      {pending.map((row: any) => {
        const s = row.signup; const deal = row.deal; const pay = row.payment; const assets = row.assets || [];
        return (
          <div key={s.id} className="rs-card admin-row">
            <div className="admin-head">
              <h3>{s.name}</h3>
              <span className="badge badge-planned">{s.status}</span>
            </div>
            <ul className="rs-summary">
              <li><strong>Cuisine / tier:</strong> {s.cuisine} · {'$'.repeat(s.price_tier || 1)}</li>
              <li><strong>Area:</strong> {s.area || '—'}</li>
              <li><strong>Dietary:</strong> {(s.dietary_options || []).join(', ') || '—'}</li>
              <li><strong>Deal:</strong> {deal ? `${deal.title} (${deal.deal_type})` : '⚠ none — cannot approve'}</li>
              <li><strong>Payment:</strong> {pay ? `${pay.status} · $${(pay.amount_cents / 100).toFixed(2)}` : '—'}</li>
              <li><strong>Contact:</strong> {s.contact_email || s.contact_name || '—'}</li>
            </ul>
            {assets.length > 0 && (
              <div className="rs-thumbs">
                {assets.map((a: any) => <figure key={a.id}><img src={a.url} alt={a.kind} /><figcaption>{a.kind}</figcaption></figure>)}
              </div>
            )}
            <div className="rs-nav">
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act(s.id, 'reject')}>Reject</button>
              <button className="btn btn-primary btn-sm" disabled={busy || !deal || !s.pilot_paid} onClick={() => act(s.id, 'approve')}>
                Approve & go live
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RestaurantAdmin() {
  return (
    <ErrorBoundary>
      <Inner />
    </ErrorBoundary>
  );
}
