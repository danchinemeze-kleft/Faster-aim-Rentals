'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Breadcrumb from '../components/Breadcrumb';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  const filtered = useMemo(() => {
    let result = listings;
    if (search) result = result.filter(l =>
      (l.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.state || '').toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter) result = result.filter(l => l.property_type === typeFilter);
    if (stateFilter) result = result.filter(l => l.state === stateFilter);
    if (priceFilter) result = result.filter(l => Number(l.price) <= Number(priceFilter));
    return result;
  }, [search, typeFilter, stateFilter, priceFilter, listings]);

  async function loadUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);
  }

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
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
    await initiatePayment(session.user, listing.id);
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
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '40px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <Breadcrumb theme="dark" items={[{ label: 'Home', href: '/' }, { label: 'Browse Listings', href: '/browse' }]} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#0ef6cc', marginBottom: '8px' }}>Available Properties</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', margin: 0 }}>Browse All Listings</h1>
            <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>Verified rental properties across Nigeria.</p>
          </div>
          <a href={user ? '/account' : '/account#login'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1a1a1a', border: '2px solid #0ef6cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ef6cc', fontWeight: 800, fontSize: '1rem', overflow: 'hidden' }}>
              {user ? (user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase() : (
                <svg viewBox="0 0 24 24" fill="none" stroke="#0ef6cc" strokeWidth="1.5" style={{ width: '26px', height: '26px' }}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '1px' }}>{user ? 'Account' : 'Login'}</span>
          </a>
        </div>

        {/* Filters */}
        <div style={{ background: '#141414', border: '2px solid #0ef6cc', borderRadius: '16px', padding: '28px', marginBottom: '36px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '18px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Location, area or title..." style={{ width: '100%', background: '#1a1a1a', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: '#ffffff', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: '#ffffff', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
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
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: '#ffffff', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
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
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '10px', letterSpacing: '1px' }}>Budget</label>
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '2px solid #ff2d78', borderRadius: '10px', padding: '14px 18px', color: '#ffffff', fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', height: '52px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 700 }}>
            Showing <span style={{ color: '#0ef6cc', fontWeight: 800 }}>{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'}
          </div>
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(14,246,204,0.1)', border: '2px solid #0ef6cc', color: '#0ef6cc', padding: '9px 18px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Try Mr. Rent AI</a>
        </div>

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
              <div key={l.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e8e8e8', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '220px', background: '#f0f0f0' }}>
                  {l.images && l.images.length > 0 ? (
                    <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🏠</div>
                  )}
                  <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#0ef6cc', color: '#0a0a0a', padding: '5px 12px', fontSize: '0.68rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase' }}>Verified</span>
                  <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(10,10,10,0.82)', color: '#fff', padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase' }}>{l.property_type || 'Property'}</span>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: '#111', marginBottom: '4px' }}>
                    N{Number(l.price).toLocaleString('en-NG')} <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#999', fontFamily: 'DM Sans, sans-serif' }}>/ {l.price_period || 'year'}</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600, marginBottom: '16px' }}>📍 {l.location}, {l.state}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href="/search" style={{ flex: 1, padding: '11px 8px', borderRadius: '8px', border: '2px solid #e8e8e8', background: '#f8f8f8', color: '#444', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Ask Mr. Rent</a>
                    <button onClick={() => handleReveal(l)} disabled={paying === l.id} style={{ flex: 2, padding: '11px 8px', borderRadius: '8px', border: 'none', background: '#ff2d78', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: paying === l.id ? 'not-allowed' : 'pointer', opacity: paying === l.id ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif' }}>{paying === l.id ? 'Please wait...' : 'Meet Landlord • ₦5k'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
