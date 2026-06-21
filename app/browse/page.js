'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Breadcrumb from '../components/Breadcrumb';
import SwitchRoleModal from '../components/SwitchRoleModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VERYLAND_BADGE = {
  white:  { fill: '#d0d0d0', check: '#888', label: 'Submitted' },
  yellow: { fill: '#F59E0B', check: '#fff', label: 'Partial Verified' },
  green:  { fill: '#10B981', check: '#fff', label: 'Verified' },
  blue:   { fill: '#3B82F6', check: '#fff', label: 'Premium Verified' },
};

function VerylandBadge({ level }) {
  const b = VERYLAND_BADGE[level];
  if (!b) return null;
  return (
    <span
      title={`Veryland ${b.label}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: b.fill, flexShrink: 0 }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="8" fill={b.fill} />
        <polyline points="4.5,8 7,10.5 12,5" stroke={b.check} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {b.label}
    </span>
  );
}

function BrowseVideoPlayer({ src }) {
  const [state, setState] = useState('loading')
  if (!src) return null
  return (
    <div style={{ background: '#0a0a0a', borderTop: '2px solid #0ef6cc', position: 'relative' }}>
      <div style={{ padding: '5px 12px 3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0ef6cc', textTransform: 'uppercase', letterSpacing: '1px' }}>▶ Property Video</span>
        {state === 'error' && (
          <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#0ef6cc', fontWeight: 700 }}>Open →</a>
        )}
      </div>

      {state === 'loading' && (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #1a1d24', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#444', fontSize: 11 }}>Loading…</span>
        </div>
      )}

      {state === 'error' && (
        <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🎬</span>
          <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0ef6cc', fontWeight: 700, textDecoration: 'none' }}>Tap to watch video →</a>
        </div>
      )}

      <video
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setState('ready')}
        onCanPlay={() => setState('ready')}
        onError={() => setState('error')}
        style={{ width: '100%', maxHeight: 200, display: state === 'error' ? 'none' : 'block', background: '#000' }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" />
      </video>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function BrowsePage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [user, setUser] = useState(null);
  const [paying, setPaying] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [pendingListing, setPendingListing] = useState(null);

  const filtered = useMemo(() => {
    let result = listings;
    if (search) result = result.filter(l =>
      (l.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.state || '').toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter) result = result.filter(l => l.property_type === typeFilter);
    if (stateFilter) result = result.filter(l => l.state === stateFilter);
    if (priceFilter) result = result.filter(l => Number(l.price) <= Number(priceFilter));
    return result;
  }, [search, typeFilter, stateFilter, priceFilter, listings]);

  async function loadUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      const { data: profile } = await supabase.from('Profiles').select('role').eq('id', session.user.id).single();
      setUserRole(profile?.role || 'tenant');
    }
  }

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!error && data) setListings(data);
    setLoading(false);
  }

  useEffect(() => {
    loadUser();
    loadListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initiatePayment(userObj, listingId) {
    setPaying(listingId);
    try {
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObj.email,
          type: 'reveal',
          listing_id: listingId,
          user_id: userObj.id,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Payment could not be started. Please try again.');
      }
    } catch {
      alert('Payment could not be started. Please try again.');
    }
    setPaying(null);
  }

  async function handleReveal(listing) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      sessionStorage.setItem('pendingReveal', listing.id);
      router.push('/account#login');
      return;
    }

    if (userRole === 'landlord') {
      setPendingListing(listing);
      setShowRoleModal(true);
      return;
    }

    // If already paid, go straight to listing detail which shows the contact
    const { data: existing } = await supabase
      .from('Contact_reveals')
      .select('id')
      .eq('tenant_id', session.user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();
    if (existing) {
      router.push(`/listing/${listing.id}`);
      return;
    }

    await initiatePayment(session.user, listing.id);
  }

  async function handleSwitchToTenant() {
    if (!user) return;
    setSwitchingRole(true);
    try {
      await supabase.from('Profiles').update({ role: 'tenant' }).eq('id', user.id);
      setUserRole('tenant');
      setShowRoleModal(false);
      if (pendingListing) {
        const listing = pendingListing;
        setPendingListing(null);
        const { data: existing } = await supabase
          .from('Contact_reveals').select('id')
          .eq('tenant_id', user.id).eq('listing_id', listing.id).maybeSingle();
        if (existing) { router.push(`/listing/${listing.id}`); return; }
        await initiatePayment(user, listing.id);
      }
    } catch {
      alert('Could not switch role. Please try again.');
    } finally {
      setSwitchingRole(false);
    }
  }

  // Resume pending payment after login redirect
  useEffect(() => {
    if (!user || loading) return;
    const listingId = sessionStorage.getItem('pendingReveal');
    if (!listingId) return;
    sessionStorage.removeItem('pendingReveal');
    initiatePayment(user, listingId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return (
    <div style={{ background: 'var(--page-bg)', color: 'var(--text-1)', minHeight: '100vh', padding: '40px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <Breadcrumb theme="dark" items={[{ label: 'Home', href: '/' }, { label: 'Browse Listings', href: '/browse' }]} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#0ef6cc', marginBottom: '8px' }}>Available Properties</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Browse All Listings</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', fontWeight: 700, marginTop: '6px' }}>Verified rental properties across Nigeria.</p>
          </div>
          <a href={user ? '/account' : '/account#login'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--input-bg)', border: '2px solid #0ef6cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ef6cc', fontWeight: 800, fontSize: '1rem', overflow: 'hidden' }}>
              {user ? (user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase() : (
                <svg viewBox="0 0 24 24" fill="none" stroke="#0ef6cc" strokeWidth="1.5" style={{ width: '26px', height: '26px' }}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{user ? 'Account' : 'Login'}</span>
          </a>
        </div>

        {/* Filters */}
        <div style={{ background: 'var(--card-bg)', border: '2px solid #0ef6cc', borderRadius: '16px', padding: '28px', marginBottom: '36px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '18px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-1)', marginBottom: '10px', letterSpacing: '1px' }}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Location, area or title..." style={{ width: '100%', background: 'var(--input-bg)', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: 'var(--text-1)', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-1)', marginBottom: '10px', letterSpacing: '1px' }}>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: 'var(--text-1)', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
              <option value="">All Types</option>
              <option value="flat">Flat / Apartment</option>
              <option value="self_contain">Self Contain</option>
              <option value="duplex">Duplex</option>
              <option value="bungalow">Bungalow</option>
              <option value="mansion">Mansion</option>
              <option value="room_and_parlour">Room &amp; Parlour</option>
              <option value="shop">Shop / Office</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-1)', marginBottom: '10px', letterSpacing: '1px' }}>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: 'var(--text-1)', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
              <option value="">All States</option>
              <option value="Anambra">Anambra</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja (FCT)</option>
              <option value="Rivers">Rivers</option>
              <option value="Enugu">Enugu</option>
              <option value="Delta">Delta</option>
              <option value="Imo">Imo</option>
              <option value="Ogun">Ogun</option>
              <option value="Kano">Kano</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-1)', marginBottom: '10px', letterSpacing: '1px' }}>Budget</label>
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: 'var(--text-1)', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
              <option value="">Any Budget</option>
              <option value="100000">Under N100,000</option>
              <option value="300000">Under N300,000</option>
              <option value="500000">Under N500,000</option>
              <option value="1000000">Under N1,000,000</option>
              <option value="2000000">Under N2,000,000</option>
              <option value="5000000">Under N5,000,000</option>
            </select>
          </div>
          <button onClick={() => { setSearch(''); setTypeFilter(''); setStateFilter(''); setPriceFilter(''); }} style={{ padding: '14px 26px', borderRadius: '10px', border: 'none', background: '#0ef6cc', color: '#0a0a0a', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer', height: '52px', fontFamily: 'DM Sans, sans-serif' }}>Clear</button>
        </div>

        {/* Results info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-1)', fontWeight: 700 }}>
            Showing <span style={{ color: '#0ef6cc', fontWeight: 800 }}>{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'}
          </div>
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(14,246,204,0.1)', border: '2px solid #0ef6cc', color: '#0ef6cc', padding: '9px 18px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Try Mr. Rent AI</a>
        </div>

        {/* Tenant pass banner */}
        <a
          href="/tenant-subscribe"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #0a1f1a 0%, #0d0f14 100%)',
            border: '1px solid #0ef6cc33', borderRadius: 12,
            padding: '14px 20px', marginBottom: '28px',
            textDecoration: 'none', gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🔓</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8e8', marginBottom: 2 }}>
                Tenant Access Pass — ₦25,000/month
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                Reveal unlimited landlord contacts. Cheaper than 5 pays.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0ef6cc', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Subscribe →
          </span>
        </a>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#ffffff', padding: '80px 20px' }}>Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#ffffff', padding: '80px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>No properties found</div>
            <p style={{ color: '#aaaaaa' }}>Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filtered.map(l => (
              <div key={l.id} style={{ background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <a href={`/listing/${l.id}`} style={{ display: 'block', position: 'relative', height: '220px', background: '#111318', textDecoration: 'none' }}>
                  {l.images && l.images.length > 0 ? (
                    <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🏠</div>
                  )}
                  <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#0ef6cc', color: '#0a0a0a', padding: '5px 12px', fontSize: '0.68rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase' }}>Verified</span>
                  <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(10,10,10,0.82)', color: '#fff', padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase' }}>{l.property_type || 'Property'}</span>
                </a>
                {l.video_url && <BrowseVideoPlayer src={l.video_url} />}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: '#111', marginBottom: '4px' }}>
                    N{Number(l.price).toLocaleString('en-NG')} <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#999', fontFamily: 'DM Sans, sans-serif' }}>/ {l.price_period || 'year'}</span>
                  </div>
                  <a href={`/listing/${l.id}`} style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block' }}>{l.title}</a>
                  <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600, marginBottom: l.veryland_badge ? 8 : 16 }}>📍 {l.location}{l.city ? `, ${l.city}` : ''}, {l.state}</div>
                  {l.veryland_badge && (
                    <div style={{ marginBottom: 16 }}>
                      <VerylandBadge level={l.veryland_badge} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={`/listing/${l.id}`} style={{ flex: 1, padding: '11px 8px', borderRadius: '8px', border: '2px solid #e8e8e8', background: '#f8f8f8', color: '#444', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Details</a>
                    <button onClick={() => handleReveal(l)} disabled={paying === l.id} style={{ flex: 2, padding: '11px 8px', borderRadius: '8px', border: 'none', background: '#ff2d78', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: paying === l.id ? 'not-allowed' : 'pointer', opacity: paying === l.id ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif' }}>{paying === l.id ? 'Please wait...' : 'Meet Landlord • ₦5k'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRoleModal && (
        <SwitchRoleModal
          fromRole="landlord"
          loading={switchingRole}
          onConfirm={handleSwitchToTenant}
          onCancel={() => { setShowRoleModal(false); setPendingListing(null); }}
        />
      )}
    </div>
  );
}
