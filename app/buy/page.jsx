'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const TYPE_LABELS = {
  residential_land: 'Residential Land',
  commercial_land: 'Commercial Land',
  mixed_use_land: 'Mixed-Use Land',
  apartment: 'Apartment',
  house: 'House',
  duplex: 'Duplex',
  bungalow: 'Bungalow',
  commercial_building: 'Commercial',
  warehouse: 'Warehouse',
};

const LAND_TYPES_SET = new Set(['residential_land', 'commercial_land', 'mixed_use_land']);

function VerylandBadge({ level, size = 16 }) {
  if (!level) return null;
  const cfg = {
    green: { fill: '#10B981', check: '#fff', tip: 'Veryland Verified' },
    blue: { fill: '#1877F2', check: '#fff', tip: 'Veryland Premium Verified' },
    yellow: { fill: '#F59E0B', check: '#fff', tip: 'Partially Verified' },
  }[level] || null;
  if (!cfg) return null;
  return (
    <span title={cfg.tip} style={{ display: 'inline-flex', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="7" fill={cfg.fill} />
        <path d="M6 11.5l3.5 3.5 6.5-7" stroke={cfg.check} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function formatPrice(price, negotiable) {
  const formatted = '₦' + parseInt(price).toLocaleString('en-NG');
  return negotiable ? formatted + ' (neg.)' : formatted;
}

export default function BuyPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMax, setFilterMax] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('property_sales')
        .select('id,title,location,state,price,negotiable,property_type,title_type,land_size,development_status,images,veryland_verified,veryland_badge_level,created_at')
        .eq('status', 'approved')
        .eq('listing_fee_paid', true)
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (filterState) q = q.eq('state', filterState);
      if (filterType) q = q.eq('property_type', filterType);
      if (filterMax) q = q.lte('price', parseInt(filterMax));

      const { data } = await q;
      setListings(data || []);
      setLoading(false);
    }
    load();
  }, [supabase, filterState, filterType, filterMax]);

  const selStyle = {
    padding: '10px 14px', background: 'var(--card-bg)',
    border: '1.5px solid var(--border-1)', borderRadius: 9,
    color: '#ffffff', fontSize: 14, outline: 'none',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
          <span style={{ color: '#555' }}>/</span>
          <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 700 }}>Buy Property</span>
        </div>
        <a href="/sell" style={{ background: '#0ef6cc', color: '#080a0f', padding: '7px 16px', borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
          + List for Sale
        </a>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Buy Land & Property
          </h1>
          <p style={{ color: '#cccccc', fontSize: 15, margin: 0 }}>
            Browse verified properties for sale across Nigeria. Contact sellers directly — no payment needed.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 14 }}>
          <select value={filterState} onChange={e => setFilterState(e.target.value)} style={selStyle}>
            <option value="">All States</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selStyle}>
            <option value="">All Property Types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={filterMax} onChange={e => setFilterMax(e.target.value)} style={selStyle}>
            <option value="">Any Price</option>
            <option value="1000000">Under ₦1M</option>
            <option value="5000000">Under ₦5M</option>
            <option value="10000000">Under ₦10M</option>
            <option value="20000000">Under ₦20M</option>
            <option value="50000000">Under ₦50M</option>
            <option value="100000000">Under ₦100M</option>
          </select>
          {(filterState || filterType || filterMax) && (
            <button onClick={() => { setFilterState(''); setFilterType(''); setFilterMax(''); }} style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: 9, color: '#fca5a5', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '4px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#cccccc', fontSize: 15 }}>Loading listings…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
            <h2 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px' }}>No listings found</h2>
            <p style={{ color: '#cccccc', fontSize: 15, marginBottom: 24 }}>
              {filterState || filterType || filterMax ? 'Try adjusting your filters.' : 'No properties for sale yet. Be the first to list!'}
            </p>
            <a href="/sell" style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '12px 28px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
              List Your Property for Sale
            </a>
          </div>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>{listings.length} propert{listings.length === 1 ? 'y' : 'ies'} found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {listings.map(l => {
                const img = l.images?.[0];
                const isLand = LAND_TYPES_SET.has(l.property_type);
                return (
                  <div key={l.id} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}>
                    {/* Image */}
                    <div style={{ height: 190, background: '#111318', position: 'relative', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                          {isLand ? '🌿' : '🏠'}
                        </div>
                      )}
                      {/* FOR SALE badge */}
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#ff2d78', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
                        FOR SALE
                      </div>
                      {l.veryland_verified && l.veryland_badge_level && (
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <VerylandBadge level={l.veryland_badge_level} size={22} />
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 14, lineHeight: 1.4, flex: 1 }}>{l.title}</span>
                      </div>
                      <div style={{ color: '#0ef6cc', fontWeight: 900, fontSize: 17 }}>
                        {formatPrice(l.price, l.negotiable)}
                      </div>
                      <div style={{ color: '#cccccc', fontSize: 13 }}>📍 {l.location}, {l.state}</div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        <span style={{ background: 'rgba(14,246,204,0.08)', border: '1px solid rgba(14,246,204,0.25)', color: '#0ef6cc', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                          {TYPE_LABELS[l.property_type] || l.property_type}
                        </span>
                        {l.title_type && (
                          <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#cccccc', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                            {l.title_type}
                          </span>
                        )}
                        {l.land_size && (
                          <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#cccccc', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                            📐 {l.land_size}
                          </span>
                        )}
                      </div>

                      {l.development_status && (
                        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                          Status: {l.development_status}
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                        <a href={`/buy/${l.id}`} style={{
                          display: 'block', textAlign: 'center',
                          background: 'linear-gradient(135deg, #0ef6cc, #00c9a7)',
                          color: '#080a0f', padding: '10px', borderRadius: 9,
                          fontWeight: 800, fontSize: 14, textDecoration: 'none',
                        }}>
                          View Details →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
