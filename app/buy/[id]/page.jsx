'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';

const TYPE_LABELS = {
  residential_land: 'Residential Land',
  commercial_land: 'Commercial Land',
  mixed_use_land: 'Mixed-Use Land',
  apartment: 'Apartment / Flat',
  house: 'House',
  duplex: 'Duplex',
  bungalow: 'Bungalow / Terrace',
  commercial_building: 'Commercial Building',
  warehouse: 'Warehouse',
};

function VerylandBadge({ level }) {
  const cfg = {
    green: { fill: '#10B981', check: '#fff', label: 'Veryland Verified' },
    blue: { fill: '#1877F2', check: '#fff', label: 'Premium Verified' },
    yellow: { fill: '#F59E0B', check: '#fff', label: 'Partially Verified' },
  }[level] || null;
  if (!cfg) return null;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '6px 14px' }}>
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="7" fill={cfg.fill} />
        <path d="M6 11.5l3.5 3.5 6.5-7" stroke={cfg.check} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: '#10B981', fontWeight: 800, fontSize: 14 }}>{cfg.label}</span>
    </div>
  );
}

function Fact({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 15, paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
      <span style={{ color: '#cccccc', fontWeight: 700, minWidth: 150 }}>{label}</span>
      <span style={{ color: '#ffffff', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function SaleDetailPage() {
  const { id } = useParams();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [user, setUser] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: { user: u } }, { data: l, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('property_sales').select('*').eq('id', id).single(),
      ]);
      setUser(u);
      if (error || !l) { setNotFound(true); setLoading(false); return; }
      setListing(l);

      if (u && l.seller_id) {
        const { data: s } = await supabase
          .from('Profiles')
          .select('full_name, phone, email')
          .eq('id', l.seller_id)
          .single();
        setSeller(s);
      }
      setLoading(false);
    }
    load();
  }, [supabase, id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '4px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ color: '#ffffff', fontWeight: 900, marginBottom: 10 }}>Listing Not Found</h1>
        <p style={{ color: '#cccccc', marginBottom: 24 }}>This property may have been removed or is pending approval.</p>
        <a href="/buy" style={{ background: '#0ef6cc', color: '#080a0f', padding: '12px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>← Browse All Properties</a>
      </div>
    );
  }

  const images = listing.images || [];
  const img = images[imgIndex] || null;
  const isLand = ['residential_land', 'commercial_land', 'mixed_use_land'].includes(listing.property_type);
  const price = '₦' + parseInt(listing.price).toLocaleString('en-NG');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#555', margin: '0 8px' }}>/</span>
        <a href="/buy" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Buy Property</a>
        <span style={{ color: '#555', margin: '0 8px' }}>/</span>
        <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</span>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.25rem 6rem' }}>

        {/* FOR SALE banner */}
        <div style={{ display: 'inline-block', background: '#ff2d78', color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.06em', marginBottom: 14 }}>
          FOR SALE
        </div>

        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 8px', lineHeight: 1.3 }}>
          {listing.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ color: '#0ef6cc', fontWeight: 900, fontSize: 22 }}>{price}</span>
          {listing.negotiable && (
            <span style={{ background: 'rgba(14,246,204,0.1)', border: '1px solid rgba(14,246,204,0.3)', color: '#0ef6cc', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Negotiable</span>
          )}
          {listing.veryland_verified && listing.veryland_badge_level && (
            <VerylandBadge level={listing.veryland_badge_level} />
          )}
        </div>

        {/* Image gallery */}
        {images.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 340, background: '#111318' }}>
              <img src={img} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((src, i) => (
                  <div key={i} onClick={() => setImgIndex(i)} style={{
                    width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                    border: i === imgIndex ? '2.5px solid #0ef6cc' : '2px solid transparent', opacity: i === imgIndex ? 1 : 0.65,
                  }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>

          {/* Left col — details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Property facts */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                Property Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Fact label="Type" value={TYPE_LABELS[listing.property_type] || listing.property_type} />
                <Fact label="Location" value={`${listing.location}, ${listing.state}`} />
                <Fact label="Title / Document" value={listing.title_type} />
                <Fact label="Land Size" value={listing.land_size} />
                <Fact label="Ownership" value={listing.land_ownership} />
                <Fact label="Development Status" value={listing.development_status} />
                {!isLand && <Fact label="Bedrooms" value={listing.bedrooms} />}
                {!isLand && <Fact label="Bathrooms" value={listing.bathrooms} />}
                <Fact label="Listed" value={listing.created_at ? new Date(listing.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem' }}>
                <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                  Features
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{ background: 'rgba(14,246,204,0.08)', border: '1px solid rgba(14,246,204,0.25)', color: '#0ef6cc', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700 }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem' }}>
                <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                  Description
                </h2>
                <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{listing.description}</p>
              </div>
            )}
          </div>

          {/* Right col — contact */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                Contact Seller
              </h2>

              {user ? (
                seller ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {seller.full_name && (
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{seller.full_name}</div>
                    )}
                    {seller.phone && (
                      <a href={`tel:${seller.phone}`} style={{
                        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0ef6cc, #00c9a7)',
                        color: '#080a0f', padding: '13px', borderRadius: 10,
                        fontWeight: 900, fontSize: 16, textDecoration: 'none',
                      }}>
                        📞 {seller.phone}
                      </a>
                    )}
                    {seller.phone && (
                      <a href={`https://wa.me/${seller.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                        background: '#25D366', color: '#ffffff', padding: '12px', borderRadius: 10,
                        fontWeight: 800, fontSize: 14, textDecoration: 'none',
                      }}>
                        💬 WhatsApp
                      </a>
                    )}
                    {seller.email && (
                      <a href={`mailto:${seller.email}`} style={{
                        display: 'block', textAlign: 'center',
                        background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border-1)',
                        color: '#cccccc', padding: '11px', borderRadius: 10,
                        fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      }}>
                        ✉️ {seller.email}
                      </a>
                    )}
                    <p style={{ color: '#666', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                      Always verify ownership documents before making any payment.
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
                    <p style={{ color: '#cccccc', fontSize: 14, margin: 0 }}>Seller contact not available.</p>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#cccccc', fontSize: 14, lineHeight: 1.65, marginBottom: 18 }}>
                    Login to see the seller&apos;s contact details. It&apos;s free — no payment required.
                  </p>
                  <a href={`/account?redirect=/buy/${id}`} style={{
                    display: 'block', background: '#0ef6cc', color: '#080a0f',
                    padding: '13px', borderRadius: 10, fontWeight: 900, fontSize: 15,
                    textDecoration: 'none', textAlign: 'center',
                  }}>
                    Login / Sign Up (Free)
                  </a>
                </div>
              )}
            </div>

            {/* Veryland CTA */}
            {!listing.veryland_verified && (
              <div style={{ background: 'rgba(24,119,242,0.06)', border: '1.5px solid rgba(24,119,242,0.25)', borderRadius: 14, padding: '1rem', marginTop: 14, textAlign: 'center' }}>
                <p style={{ color: '#cccccc', fontSize: 13, margin: '0 0 10px', lineHeight: 1.6 }}>
                  Buyer tip: Ask the seller to get Veryland verified for extra trust.
                </p>
                <a href="/veryland" style={{ color: '#1877F2', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Learn about Veryland →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .buy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
