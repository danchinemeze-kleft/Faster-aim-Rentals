'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function BrowseLightPage() {
  const router = useRouter()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [user, setUser] = useState(null)
  const [paying, setPaying] = useState(null)

  const filtered = useMemo(() => {
    let r = listings
    if (search) r = r.filter(l =>
      (l.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.state || '').toLowerCase().includes(search.toLowerCase())
    )
    if (typeFilter) r = r.filter(l => l.property_type === typeFilter)
    if (stateFilter) r = r.filter(l => l.state === stateFilter)
    if (priceFilter) r = r.filter(l => Number(l.price) <= Number(priceFilter))
    return r
  }, [search, typeFilter, stateFilter, priceFilter, listings])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setUser(session.user) })
    supabase.from('listings').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(500)
      .then(({ data, error }) => { if (!error && data) setListings(data); setLoading(false) })
  }, [])

  async function handleReveal(listing) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { sessionStorage.setItem('pendingReveal', listing.id); router.push('/account'); return }
    const { data: existing } = await supabase.from('Contact_reveals').select('id').eq('tenant_id', session.user.id).eq('listing_id', listing.id).maybeSingle()
    if (existing) { router.push(`/listing/${listing.id}`); return }
    setPaying(listing.id)
    const res = await fetch('/api/init-payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, type: 'reveal', listing_id: listing.id, user_id: session.user.id }),
    })
    const data = await res.json()
    if (data.authorization_url) window.location.href = data.authorization_url
    else alert('Payment could not be started. Please try again.')
    setPaying(null)
  }

  const inputStyle = { width: '100%', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', color: '#0f172a', fontSize: '0.9rem', outline: 'none', height: '48px', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.08em' }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/light" style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(90deg,#0ea5e9,#ff2d78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>🏠 Mr. Rent</a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/light/browse" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>Browse</a>
          <a href="/search" style={{ color: '#374151', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>AI Chat</a>
          <a href="/account" style={{ background: 'linear-gradient(135deg,#ff2d78,#c0135a)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'Account') : 'Login / Sign up'}
          </a>
          <a href="/browse" title="Switch to dark mode" style={{ fontSize: '1.1rem', background: 'rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', textDecoration: 'none' }}>🌙</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: '6px' }}>Available Properties</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: '#0f172a', margin: 0 }}>Browse All Listings</h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, marginTop: '6px' }}>Verified rental properties across Nigeria.</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div>
            <label style={labelStyle}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Location, area or title..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={inputStyle}>
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
            <label style={labelStyle}>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={inputStyle}>
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
            <label style={labelStyle}>Budget</label>
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} style={inputStyle}>
              <option value="">Any Budget</option>
              <option value="100000">Under ₦100k</option>
              <option value="300000">Under ₦300k</option>
              <option value="500000">Under ₦500k</option>
              <option value="1000000">Under ₦1M</option>
              <option value="2000000">Under ₦2M</option>
              <option value="5000000">Under ₦5M</option>
            </select>
          </div>
          <button onClick={() => { setSearch(''); setTypeFilter(''); setStateFilter(''); setPriceFilter('') }} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#0ea5e9', color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', height: '48px' }}>
            Clear
          </button>
        </div>

        {/* Count + AI link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
            Showing <span style={{ color: '#0ea5e9', fontWeight: 800 }}>{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'}
          </div>
          <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1.5px solid #0ea5e9', color: '#0ea5e9', padding: '8px 16px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
            🤖 Try Mr. Rent AI
          </a>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '5rem 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            Loading properties…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No properties found</div>
            <p>Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(l => (
              <div key={l.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <a href={`/listing/${l.id}`} style={{ display: 'block', position: 'relative', height: '220px', background: '#f1f5f9', textDecoration: 'none' }}>
                  {l.images?.length > 0 ? (
                    <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🏠</div>
                  )}
                  <span style={{ position: 'absolute', top: 12, left: 12, background: '#0ea5e9', color: '#fff', padding: '4px 10px', fontSize: '0.65rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase' }}>Verified</span>
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', color: '#374151', padding: '4px 10px', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', textTransform: 'capitalize' }}>{l.property_type || 'Property'}</span>
                </a>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    ₦{Number(l.price).toLocaleString('en-NG')} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>/ {l.price_period || 'year'}</span>
                  </div>
                  <a href={`/listing/${l.id}`} style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block' }}>{l.title}</a>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>📍 {l.location}, {l.state}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={`/listing/${l.id}`} style={{ flex: 1, padding: '10px 8px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#374151', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Details</a>
                    <button onClick={() => handleReveal(l)} disabled={paying === l.id} style={{ flex: 2, padding: '10px 8px', borderRadius: '8px', border: 'none', background: '#ff2d78', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: paying === l.id ? 'not-allowed' : 'pointer', opacity: paying === l.id ? 0.7 : 1 }}>
                      {paying === l.id ? 'Please wait…' : 'Meet Landlord • ₦5k'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
