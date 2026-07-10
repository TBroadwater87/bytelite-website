import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Restaurant self-serve signup flow (client island for /marketing/signup).
 *
 * Talks only to the api.thebytelite.com backend; all state lives server-side. The browser holds only a
 * portal token. Payment is a redirect to Stripe Checkout — no card data or Stripe.js in this page.
 * Honest gate: paying enters "pending review"; going live is an admin approval we control.
 */
const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) || 'https://api.thebytelite.com';
const TOKEN_KEY = 'hs_portal_token';

const CUISINES = [
  'american', 'italian', 'mexican', 'japanese', 'chinese', 'thai', 'indian',
  'mediterranean', 'steakhouse', 'seafood', 'vegan', 'cafe', 'bbq', 'french', 'korean',
];
const DIETARY = ['vegetarian', 'vegan', 'halal', 'gluten_free'];
const VIBES = ['romantic', 'casual', 'lively', 'cozy', 'upscale', 'relaxed', 'trendy', 'intimate'];
const PRICE_TIERS = [
  { v: 1, label: '$  (budget)' },
  { v: 2, label: '$$  (moderate)' },
  { v: 3, label: '$$$  (upscale)' },
  { v: 4, label: '$$$$  (fine dining)' },
];
const DEAL_TYPES = [
  { v: 'percent_off', label: 'Percent off', unit: 'percent' },
  { v: 'fixed_amount_off', label: 'Fixed amount off', unit: 'usd' },
  { v: 'bogo', label: 'Buy one, get one', unit: 'item' },
  { v: 'free_item', label: 'Free item', unit: 'item' },
  { v: 'combo_price', label: 'Set combo price', unit: 'usd' },
];

type Full = {
  signup: any | null;
  assets?: any[];
  deal?: any | null;
  payment?: any | null;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

async function api(path: string, opts: RequestInit = {}, auth = true): Promise<any> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const json = await res.json().catch(() => ({ success: false, error: 'Bad response' }));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data;
}

function Inner() {
  const [step, setStep] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [full, setFull] = useState<Full>({ signup: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pilotCents, setPilotCents] = useState(2000);
  const [stripeOk, setStripeOk] = useState(true);

  // account form
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // profile form
  const [p, setP] = useState<any>({
    name: '', cuisine: 'american', priceTier: 2, address: '', area: '',
    hours: '', dietaryOptions: [] as string[], vibeTags: [] as string[],
    contactName: '', contactEmail: '', contactPhone: '', lat: '', lng: '',
  });

  // deal form
  const [d, setD] = useState<any>({
    dealType: 'percent_off', title: '', description: '', valueNumeric: '', terms: '', redeemKind: 'code',
  });

  useEffect(() => {
    setToken(getToken());
    api('/api/restaurant-portal/config', {}, false)
      .then((cfg) => { setPilotCents(cfg.pilot_price_cents); setStripeOk(cfg.stripe_configured); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token]);

  async function refresh() {
    try {
      const data = await api('/api/restaurant-portal/me');
      setFull(data);
      if (data.signup) {
        setP((prev: any) => ({
          ...prev,
          name: data.signup.name || '',
          cuisine: data.signup.cuisine || 'american',
          priceTier: data.signup.price_tier || 2,
          address: data.signup.address || '',
          area: data.signup.area || '',
          hours: (data.signup.hours_json && data.signup.hours_json.text) || '',
          dietaryOptions: data.signup.dietary_options || [],
          vibeTags: data.signup.vibe_tags || [],
          contactName: data.signup.contact_name || '',
          contactEmail: data.signup.contact_email || '',
          contactPhone: data.signup.contact_phone || '',
          lat: data.signup.lat ?? '',
          lng: data.signup.lng ?? '',
        }));
        setStep((s) => (s < 1 ? 1 : s));
      } else {
        setStep(1);
      }
    } catch (e: any) { setError(e.message); }
  }

  function saveToken(t: string) {
    window.localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  async function doAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const data = await api(
        `/api/restaurant-portal/${mode}`,
        { method: 'POST', body: JSON.stringify({ email, password }) },
        false
      );
      saveToken(data.token);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api('/api/restaurant-portal/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: p.name, cuisine: p.cuisine, priceTier: Number(p.priceTier),
          address: p.address, area: p.area, hours: { text: p.hours },
          dietaryOptions: p.dietaryOptions, vibeTags: p.vibeTags,
          contactName: p.contactName, contactEmail: p.contactEmail, contactPhone: p.contactPhone,
          lat: p.lat === '' ? null : Number(p.lat), lng: p.lng === '' ? null : Number(p.lng),
        }),
      });
      await refresh();
      setStep(2);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function uploadAsset(kind: 'logo' | 'photo', file: File) {
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', kind);
      await api('/api/restaurant-portal/assets', { method: 'POST', body: fd });
      await refresh();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function saveDeal(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const unit = DEAL_TYPES.find((t) => t.v === d.dealType)?.unit || null;
      await api('/api/restaurant-portal/deal', {
        method: 'PUT',
        body: JSON.stringify({
          dealType: d.dealType, title: d.title, description: d.description,
          valueNumeric: d.valueNumeric === '' ? null : Number(d.valueNumeric),
          valueUnit: unit, terms: d.terms, redeemKind: d.redeemKind,
        }),
      });
      await refresh();
      setStep(4);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function pay() {
    setBusy(true); setError(null);
    try {
      const data = await api('/api/restaurant-portal/checkout', { method: 'POST' });
      if (data.url) { window.location.href = data.url; }
      else { setError('Checkout URL unavailable'); }
    } catch (e: any) { setError(e.message); setBusy(false); }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null); setFull({ signup: null }); setStep(0);
  }

  function toggle(list: string[], v: string): string[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  const dollars = (pilotCents / 100).toFixed(2);
  const status = full.signup?.status as string | undefined;

  // If already paid / in review / live, show status instead of the form.
  if (token && status && status !== 'draft') {
    return (
      <div className="rs-wrap">
        <StatusPanel status={status} deal={full.deal} onLogout={logout} />
      </div>
    );
  }

  return (
    <div className="rs-wrap">
      {token && (
        <div className="rs-topbar">
          <span className="rs-steps-label">Step {Math.min(step, 4)} of 4</span>
          <button className="rs-link" onClick={logout}>Log out</button>
        </div>
      )}
      {error && <div className="rs-error" role="alert">{error}</div>}

      {/* Step 0: account */}
      {!token && (
        <form className="rs-card" onSubmit={doAuth}>
          <h2>{mode === 'register' ? 'Create your restaurant account' : 'Log in'}</h2>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Log in'}</button>
          <p className="rs-switch">
            {mode === 'register' ? 'Already have an account?' : 'Need an account?'}{' '}
            <button type="button" className="rs-link" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
              {mode === 'register' ? 'Log in' : 'Create one'}
            </button>
          </p>
        </form>
      )}

      {/* Step 1: profile */}
      {token && step === 1 && (
        <form className="rs-card" onSubmit={saveProfile}>
          <h2>Restaurant profile</h2>
          <label>Name<input required value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></label>
          <div className="rs-row">
            <label>Cuisine
              <select value={p.cuisine} onChange={(e) => setP({ ...p, cuisine: e.target.value })}>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Price tier
              <select value={p.priceTier} onChange={(e) => setP({ ...p, priceTier: Number(e.target.value) })}>
                {PRICE_TIERS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
              </select>
            </label>
          </div>
          <label>Address<input value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></label>
          <label>Area / neighbourhood<input value={p.area} onChange={(e) => setP({ ...p, area: e.target.value })} /></label>
          <label>Hours<textarea rows={2} placeholder="e.g. Mon–Fri 5pm–11pm, Sat–Sun 12pm–11pm" value={p.hours} onChange={(e) => setP({ ...p, hours: e.target.value })} /></label>
          <fieldset><legend>Dietary options</legend>
            {DIETARY.map((v) => (
              <label key={v} className="rs-check"><input type="checkbox" checked={p.dietaryOptions.includes(v)} onChange={() => setP({ ...p, dietaryOptions: toggle(p.dietaryOptions, v) })} />{v}</label>
            ))}
          </fieldset>
          <fieldset><legend>Vibe</legend>
            {VIBES.map((v) => (
              <label key={v} className="rs-check"><input type="checkbox" checked={p.vibeTags.includes(v)} onChange={() => setP({ ...p, vibeTags: toggle(p.vibeTags, v) })} />{v}</label>
            ))}
          </fieldset>
          <div className="rs-row">
            <label>Contact name<input value={p.contactName} onChange={(e) => setP({ ...p, contactName: e.target.value })} /></label>
            <label>Contact email<input type="email" value={p.contactEmail} onChange={(e) => setP({ ...p, contactEmail: e.target.value })} /></label>
          </div>
          <label>Contact phone<input value={p.contactPhone} onChange={(e) => setP({ ...p, contactPhone: e.target.value })} /></label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save & continue'}</button>
        </form>
      )}

      {/* Step 2: assets */}
      {token && step === 2 && (
        <div className="rs-card">
          <h2>Logo & photos</h2>
          <p className="rs-hint">Images only (JPEG, PNG, WebP), up to 10MB each.</p>
          <label className="rs-file">Logo
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAsset('logo', e.target.files[0])} />
          </label>
          <label className="rs-file">Add a photo
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAsset('photo', e.target.files[0])} />
          </label>
          {full.assets && full.assets.length > 0 && (
            <div className="rs-thumbs">
              {full.assets.map((a: any) => (
                <figure key={a.id}><img src={a.url} alt={a.kind} /><figcaption>{a.kind}</figcaption></figure>
              ))}
            </div>
          )}
          <div className="rs-nav">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: deal */}
      {token && step === 3 && (
        <form className="rs-card" onSubmit={saveDeal}>
          <h2>Your deal <span className="rs-req">required</span></h2>
          <p className="rs-hint">A discount is required to be featured. You set the value — we never invent it.</p>
          <label>Deal type
            <select value={d.dealType} onChange={(e) => setD({ ...d, dealType: e.target.value })}>
              {DEAL_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </label>
          <label>Title<input required placeholder="e.g. 20% off your table" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></label>
          {(d.dealType === 'percent_off' || d.dealType === 'fixed_amount_off' || d.dealType === 'combo_price') && (
            <label>Value ({DEAL_TYPES.find((t) => t.v === d.dealType)?.unit})
              <input type="number" step="0.01" min="0" value={d.valueNumeric} onChange={(e) => setD({ ...d, valueNumeric: e.target.value })} />
            </label>
          )}
          <label>Description<textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></label>
          <label>Terms<textarea rows={2} placeholder="e.g. dine-in only, one per table" value={d.terms} onChange={(e) => setD({ ...d, terms: e.target.value })} /></label>
          <label>Redemption
            <select value={d.redeemKind} onChange={(e) => setD({ ...d, redeemKind: e.target.value })}>
              <option value="code">Code</option>
              <option value="qr">QR</option>
            </select>
          </label>
          <div className="rs-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save deal'}</button>
          </div>
        </form>
      )}

      {/* Step 4: review & pay */}
      {token && step === 4 && (
        <div className="rs-card">
          <h2>Start your $20 pilot</h2>
          <ul className="rs-summary">
            <li><strong>Restaurant:</strong> {full.signup?.name}</li>
            <li><strong>Cuisine / tier:</strong> {full.signup?.cuisine} · {'$'.repeat(full.signup?.price_tier || 1)}</li>
            <li><strong>Deal:</strong> {full.deal ? full.deal.title : <em>none yet — go back and add one</em>}</li>
            <li><strong>Photos:</strong> {full.assets?.length || 0}</li>
          </ul>
          <p className="rs-pay-note">
            One-time <strong>${dollars}</strong> pilot — less than $1/day. After payment your restaurant
            enters <em>pending review</em>. It goes live in the app only after we approve it.
          </p>
          {!stripeOk && <div className="rs-error">Payments are not configured yet. Check back shortly.</div>}
          <div className="rs-nav">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
            <button className="btn btn-primary" disabled={busy || !full.deal || !stripeOk} onClick={pay}>
              {busy ? 'Redirecting…' : `Pay $${dollars} & submit`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPanel({ status, deal, onLogout }: { status: string; deal: any; onLogout: () => void }) {
  const map: Record<string, { badge: string; title: string; body: string }> = {
    pending_review: { badge: 'badge-planned', title: 'Pending review', body: 'Payment received. Your restaurant is in our review queue. We approve each listing before it goes live in the app.' },
    approved: { badge: 'badge-active', title: 'Live & featured', body: 'Your restaurant is approved and can now appear as a featured date suggestion in HeartStrings.' },
    rejected: { badge: 'badge-none', title: 'Not approved', body: 'This signup was not approved. Contact us if you believe this was a mistake.' },
    paused: { badge: 'badge-none', title: 'Paused', body: 'Your listing is temporarily paused and not currently shown in the app.' },
  };
  const m = map[status] || map.pending_review;
  return (
    <div className="rs-card">
      <span className={`badge ${m.badge}`}>{m.title}</span>
      <h2 style={{ marginTop: '.75rem' }}>{m.title}</h2>
      <p>{m.body}</p>
      {deal && (
        <p className="rs-pay-note"><strong>Your deal:</strong> {deal.title}
          {deal.redeem_code && <> · redemption code <code>{deal.redeem_code}</code></>}
        </p>
      )}
      <button className="rs-link" onClick={onLogout}>Log out</button>
    </div>
  );
}

export default function RestaurantSignup() {
  return (
    <ErrorBoundary>
      <Inner />
    </ErrorBoundary>
  );
}
