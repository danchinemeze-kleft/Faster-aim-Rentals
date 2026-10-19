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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })

    supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (!error && data) setListings(data)
        setLoading(false)
      })
  }, [])

  async function handleReveal(listing) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      sessionStorage.setItem('pendingReveal', listing.id)
      router.push('/account')
      return
    }

    const { data: existing } = await supabase
      .from('Contact_reveals')
      .select('id')
      .eq('tenant_id', session.user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()

    if (existing) {
      router.push(`/listing/${listing.id}`)
      return
    }

    setPaying(listing.id)

    const res = await fetch('/api/init-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session.user.email,
        type: 'reveal',
        listing_id: listing.id,
        user_id: session.user.id,
      }),
    })

    const data = await res.json()
    if (data.authorization_url) {
      window.location.href = data.authorization_url
    } else {
      alert('Payment could not be started. Please try again.')
    }
    setPaying(null)
  }

  return (
    <div className="browse-page">
      {/* Navigation */}
      <nav className="browse-nav">
        <a href="/light" className="browse-logo">
          🏠 Mr. Rent
        </a>

        <div className="browse-nav-links">
          <a href="/light/browse" className="browse-nav-link active">Browse</a>
          <a href="/search" className="browse-nav-link">AI Chat</a>
          <a href="/account" className="browse-account-btn">
            {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'Account') : 'Login / Sign up'}
          </a>
        </div>
      </nav>

      <div className="browse-container">
        {/* Header */}
        <div className="browse-header">
          <div className="browse-eyebrow">Available Properties</div>
          <h1>Browse All Listings</h1>
          <p>Verified rental properties across Nigeria.</p>
        </div>

        {/* Filters */}
        <div className="browse-filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Location, area or title..."
            />
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="flat">Flat / Apartment</option>
              <option value="self_contain">Self Contain</option>
              <option value="duplex">Duplex</option>
              <option value="bungalow">Bungalow</option>
              <option value="mansion">Mansion</option>
              <option value="room_and_parlour">Room & Parlour</option>
              <option value="shop">Shop / Office</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div className="filter-group">
            <label>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
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

          <div className="filter-group">
            <label>Budget</label>
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="100000">Under ₦100k</option>
              <option value="300000">Under ₦300k</option>
              <option value="500000">Under ₦500k</option>
              <option value="1000000">Under ₦1M</option>
              <option value="2000000">Under ₦2M</option>
              <option value="5000000">Under ₦5M</option>
            </select>
          </div>

          <button
            className="clear-btn"
            onClick={() => {
              setSearch('')
              setTypeFilter('')
              setStateFilter('')
              setPriceFilter('')
            }}
          >
            Clear
          </button>
        </div>

        {/* Results count */}
        <div className="browse-results-bar">
          <div className="results-count">
            Showing <span>{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'}
          </div>
          <a href="/search" className="ai-link">
            🤖 Try Mr. Rent AI
          </a>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="browse-empty">
            <div className="spinner" />
            <p>Loading properties…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="browse-empty">
            <div className="empty-icon">🔍</div>
            <h3>No properties found</h3>
            <p>Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filtered.map(l => (
              <div key={l.id} className="listing-card">
                <a href={`/listing/${l.id}`} className="listing-image">
                  {l.images?.length > 0 ? (
                    <img src={l.images[0]} alt={l.title} />
                  ) : (
                    <div className="listing-placeholder">🏠</div>
                  )}
                  <span className="badge verified">Verified</span>
                  <span className="badge type">{l.property_type || 'Property'}</span>
                </a>

                <div className="listing-body">
                  <div className="listing-price">
                    ₦{Number(l.price).toLocaleString('en-NG')}
                    <span> / {l.price_period || 'year'}</span>
                  </div>

                  <a href={`/listing/${l.id}`} className="listing-title">
                    {l.title}
                  </a>

                  <div className="listing-location">
                    📍 {l.location}, {l.state}
                  </div>

                  <div className="listing-actions">
                    <a href={`/listing/${l.id}`} className="btn-secondary">
                      View Details
                    </a>
                    <button
                      onClick={() => handleReveal(l)}
                      disabled={paying === l.id}
                      className="btn-primary"
                    >
                      {paying === l.id ? 'Please wait…' : 'Meet Landlord • ₦5k'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}