'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'
import SwitchRoleModal from '../components/SwitchRoleModal'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({ total: 0, available: 0, reveals: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [togglingId, setTogglingId] = useState(null)
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  async function fetchProfile(userId) {
    const { data } = await supabase.from('Profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  useEffect(() => {
    async function fetchListings(userId) {
      const { data } = await supabase.from('listings').select('*').eq('landlord_id', userId).order('created_at', { ascending: false })
      setListings(data || [])
    }

    async function fetchSubscription(userId) {
      const { data } = await supabase.from('Subscription').select('*').eq('landlord_id', userId).gte('expiry_date', new Date().toISOString()).order('expiry_date', { ascending: false }).limit(1).maybeSingle()
      setSubscription(data)
    }

    async function fetchStats(userId) {
      const { data: listingsData } = await supabase.from('listings').select('id, available').eq('landlord_id', userId)
      const { data: revealsData } = await supabase.from('Contact_reveals').select('id').eq('landlord_id', userId)
      setStats({
        total: listingsData?.length || 0,
        available: listingsData?.filter(l => l.available).length || 0,
        reveals: revealsData?.length || 0,
      })
    }

    let settled = false

    const init = async (session) => {
      if (settled) return
      settled = true
      if (!session) { router.push('/account?redirect=/dashboard'); return }
      setUser(session.user)
      await Promise.all([
        fetchProfile(session.user.id),
        fetchListings(session.user.id),
        fetchSubscription(session.user.id),
        fetchStats(session.user.id),
      ])
      setLoading(false)
      // Role guard: tenants must switch to landlord to access dashboard
      const { data: prof } = await supabase.from('Profiles').select('role').eq('id', session.user.id).single()
      if (prof?.role === 'tenant') setShowRoleModal(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!settled) init(session)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSwitchToLandlord() {
    if (!user) return
    setSwitchingRole(true)
    try {
      await supabase.from('Profiles').update({ role: 'landlord' }).eq('id', user.id)
      setShowRoleModal(false)
    } catch {
      alert('Could not switch role. Please try again.')
    } finally {
      setSwitchingRole(false)
    }
  }

  const toggleAvailability = async (listing) => {
    setTogglingId(listing.id)
    const { error } = await supabase.from('listings').update({ available: !listing.available, is_available: !listing.available }).eq('id', listing.id)
    if (!error) {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, available: !l.available } : l))
      setStats(prev => ({ ...prev, available: !listing.available ? prev.available + 1 : prev.available - 1 }))
    }
    setTogglingId(null)
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) {
      setListings(prev => prev.filter(l => l.id !== id))
      setStats(prev => ({ ...prev, total: prev.total - 1 }))
    }
  }

  const handleSubscribe = async () => {
    try {
      const refCode = document.cookie.match(/mrrent_ref=([^;]+)/)?.[1] || null
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'landlord',
          user_id: user.id,
          ref_code: refCode,
        })
      })
      const data = await res.json()
      if (data.authorization_url) window.location.href = data.authorization_url
      else alert(data.error || 'Could not start payment. Please try again.')
    } catch (err) {
      alert('Payment error: ' + err.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (profileForm.phone && !/^\+?[0-9]{10,14}$/.test(profileForm.phone)) {
      setProfileMsg('Phone must be 10–14 digits only.')
      return
    }
    setSavingProfile(true)
    setProfileMsg('')
    const updates = {}
    if (profileForm.full_name.trim()) updates.full_name = profileForm.full_name.trim()
    if (profileForm.phone.trim()) updates.phone = profileForm.phone.trim()
    const { error } = await supabase.from('Profiles').update(updates).eq('id', user.id)
    if (error) {
      setProfileMsg('Failed to save. Please try again.')
    } else {
      await fetchProfile(user.id)
      setProfileForm({ full_name: '', phone: '' })
      setProfileMsg('Profile updated successfully.')
      setTimeout(() => setProfileMsg(''), 3000)
    }
    setSavingProfile(false)
  }

  const isSubscriptionActive = () => {
    if (!subscription) return false
    return new Date(subscription.expiry_date) > new Date()
  }

  const daysUntilExpiry = () => {
    if (!subscription) return 0
    const diff = new Date(subscription.expiry_date) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) return (
    <div className="faim-dash-loading">
      <div className="faim-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  )

  return (
    <div className="faim-dashboard">
      <aside className="faim-sidebar">
        <div className="faim-sidebar-brand">
          <span>🏠</span>
          <span>Mr. Rent</span>
        </div>
        <nav className="faim-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'listings', icon: '🏘️', label: 'My Listings' },
            { id: 'subscription', icon: '💳', label: 'Subscription' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map(tab => (
            <button key={tab.id}
              className={`faim-nav-item ${activeTab === tab.id ? 'faim-nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="faim-sidebar-actions">
          <a href={isSubscriptionActive() ? '/list?subscribed=1' : '/list?free=1'} className="faim-add-listing-btn">+ Add Listing</a>
          <button onClick={handleLogout} className="faim-logout-btn">Sign Out</button>
        </div>
      </aside>

      <main className="faim-main">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }]} />
        <div className="faim-topbar">
          <div>
            <h1 className="faim-page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'listings' && 'My Listings'}
              {activeTab === 'subscription' && 'Subscription'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="faim-welcome">Welcome back, {profile?.full_name?.split(' ')[0] || 'Landlord'} 👋</p>
          </div>
          <div className={`faim-sub-badge ${isSubscriptionActive() ? 'faim-sub-badge--active' : 'faim-sub-badge--inactive'}`}>
            {isSubscriptionActive() ? '● Active Plan' : '● No Active Plan'}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="faim-overview">
            <div className="faim-stats-grid">
              <div className="faim-stat-card">
                <div className="faim-stat-icon">🏘️</div>
                <div><p className="faim-stat-value">{stats.total}</p><p className="faim-stat-label">Total Listings</p></div>
              </div>
              <div className="faim-stat-card">
                <div className="faim-stat-icon">✅</div>
                <div><p className="faim-stat-value">{stats.available}</p><p className="faim-stat-label">Available Now</p></div>
              </div>
              <div className="faim-stat-card">
                <div className="faim-stat-icon">👁️</div>
                <div><p className="faim-stat-value">{stats.reveals}</p><p className="faim-stat-label">Contact Reveals</p></div>
              </div>
              <div className="faim-stat-card">
                <div className="faim-stat-icon">💰</div>
                <div><p className="faim-stat-value">₦{(stats.reveals * 5000).toLocaleString()}</p><p className="faim-stat-label">Revenue Generated</p></div>
              </div>
            </div>

            {!isSubscriptionActive() && (
              <div className="faim-alert-card">
                <div>
                  <h3>⚠️ No Active Subscription</h3>
                  <p>Subscribe for ₦10,000/month to list properties and get discovered by thousands of tenants.</p>
                </div>
                <button onClick={handleSubscribe} className="faim-subscribe-btn">Subscribe Now</button>
              </div>
            )}

            {isSubscriptionActive() && daysUntilExpiry() <= 7 && (
              <div className="faim-alert-card faim-alert-card--warning">
                <div>
                  <h3>⏰ Subscription Expiring Soon</h3>
                  <p>Your subscription expires in {daysUntilExpiry()} days. Renew to keep your listings active.</p>
                </div>
                <button onClick={handleSubscribe} className="faim-subscribe-btn">Renew Now</button>
              </div>
            )}

            <div className="faim-section">
              <div className="faim-section-header">
                <h2>Recent Listings</h2>
                <button onClick={() => setActiveTab('listings')} className="faim-view-all">View All →</button>
              </div>
              {listings.slice(0, 3).map(listing => (
                <div key={listing.id} className="faim-listing-row">
                  <div className="faim-listing-row-info">
                    <p className="faim-listing-row-title">{listing.title}</p>
                    <p className="faim-listing-row-sub">📍 {listing.location}{listing.city ? `, ${listing.city}` : ''}, {listing.state} • ₦{listing.price?.toLocaleString()}/{listing.price_period}</p>
                  </div>
                  <div className="faim-toggle-wrap">
                    <span className={`faim-avail-label ${listing.available ? 'faim-avail-label--yes' : 'faim-avail-label--no'}`}>
                      {listing.available ? 'Available' : 'Unavailable'}
                    </span>
                    <button className={`faim-toggle ${listing.available ? 'faim-toggle--on' : 'faim-toggle--off'}`}
                      onClick={() => toggleAvailability(listing)} disabled={togglingId === listing.id}>
                      <span className="faim-toggle-thumb"></span>
                    </button>
                  </div>
                </div>
              ))}
              {listings.length === 0 && (
                <p className="faim-empty-text">No listings yet. <a href={isSubscriptionActive() ? '/list?subscribed=1' : '/list?free=1'}>Create your first listing →</a></p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="faim-listings-tab">
            <div className="faim-section-header">
              <h2>All Listings ({listings.length})</h2>
              <a href={isSubscriptionActive() ? '/list?subscribed=1' : '/list?free=1'} className="faim-subscribe-btn" style={{textDecoration:'none'}}>+ New Listing</a>
            </div>
            {listings.length === 0 ? (
              <div className="faim-empty-state">
                <p>🏠 No listings yet.</p>
                <a href={isSubscriptionActive() ? '/list?subscribed=1' : '/list?free=1'}>Create your first listing</a>
              </div>
            ) : (
              <div className="faim-listings-full">
                {listings.map(listing => (
                  <div key={listing.id} className="faim-listing-full-card">
                    <div className="faim-listing-full-top">
                      <div>
                        <span className="faim-type-pill">{listing.property_type}</span>
                        <h3>{listing.title}</h3>
                        <p className="faim-listing-meta">📍 {listing.location}{listing.city ? `, ${listing.city}` : ''}, {listing.state}{listing.bedrooms ? ` • ${listing.bedrooms} bed • ${listing.bathrooms} bath` : listing.size ? ` • ${listing.size}` : ''}</p>
                        <p className="faim-listing-price-tag">₦{listing.price?.toLocaleString()} / {listing.price_period}</p>
                      </div>
                      <div className="faim-listing-controls">
                        <div className="faim-toggle-wrap">
                          <span className={`faim-avail-label ${listing.available ? 'faim-avail-label--yes' : 'faim-avail-label--no'}`}>
                            {listing.available ? 'Available' : 'Unavailable'}
                          </span>
                          <button className={`faim-toggle ${listing.available ? 'faim-toggle--on' : 'faim-toggle--off'}`}
                            onClick={() => toggleAvailability(listing)} disabled={togglingId === listing.id}>
                            <span className="faim-toggle-thumb"></span>
                          </button>
                        </div>
                        <div className="faim-listing-btns">
                          <a href="/list" className="faim-edit-btn">✏️ Edit</a>
                          <button onClick={() => handleDeleteListing(listing.id)} className="faim-del-btn">🗑️</button>
                        </div>
                      </div>
                    </div>
                    <p className="faim-listing-desc-preview">{listing.description?.substring(0, 150)}...</p>
                    {listing.amenities?.length > 0 && (
                      <div className="faim-amenity-pills">
                        {listing.amenities.map(a => <span key={a}>{a}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="faim-sub-tab">
            <div className="faim-sub-status-card">
              <div className="faim-sub-status-icon">{isSubscriptionActive() ? '✅' : '❌'}</div>
              <div>
                <h2>{isSubscriptionActive() ? 'Subscription Active' : 'No Active Subscription'}</h2>
                {isSubscriptionActive() ? (
                  <>
                    <p>Expires: <strong>{new Date(subscription.expiry_date).toLocaleDateString()}</strong></p>
                    <p>{daysUntilExpiry()} days remaining</p>
                  </>
                ) : (
                  <p>Subscribe to list properties and reach thousands of tenants.</p>
                )}
              </div>
            </div>
            <div className="faim-plan-card">
              <div className="faim-plan-header">
                <h3>Landlord Plan</h3>
                <p className="faim-plan-price">₦10,000 <span>/month</span></p>
              </div>
              <ul className="faim-plan-features">
                <li>✓ Unlimited property listings</li>
                <li>✓ Appear in tenant searches</li>
                <li>✓ Receive contact reveal payments</li>
                <li>✓ Dashboard analytics</li>
                <li>✓ Mr. Rent AI promotion</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button onClick={handleSubscribe} className="faim-subscribe-btn" style={{width:'100%',padding:'1rem',fontSize:'1rem'}}>
                {isSubscriptionActive() ? 'Renew Subscription' : 'Subscribe Now — ₦10,000/month'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="faim-profile-tab">
            <div className="faim-profile-card">
              <div className="faim-profile-avatar">{profile?.full_name?.[0] || user?.email?.[0] || '?'}</div>
              <h2>{profile?.full_name || 'Landlord'}</h2>
              <p>{user?.email}</p>
              <p style={{ color: profile?.phone ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
                {profile?.phone || '⚠️ No phone added'}
              </p>
              <span className="faim-role-tag">🏠 Landlord</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="faim-profile-info">
                <div className="faim-info-row"><span>Full Name</span><span>{profile?.full_name || '—'}</span></div>
                <div className="faim-info-row"><span>Email</span><span>{user?.email}</span></div>
                <div className="faim-info-row"><span>Phone</span><span>{profile?.phone || '—'}</span></div>
                <div className="faim-info-row"><span>Member Since</span><span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span></div>
                <div className="faim-info-row"><span>Total Listings</span><span>{stats.total}</span></div>
                <div className="faim-info-row"><span>Contact Reveals</span><span>{stats.reveals}</span></div>
              </div>

              <div className="faim-profile-info">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Update Profile</h3>
                {!profile?.phone && (
                  <div style={{ background: '#fff8f2', border: '1.5px solid #e67e22', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#7a4a1a' }}>
                    ⚠️ Tenants cannot see your contact details until you add your phone number.
                  </div>
                )}
                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Full Name</label>
                    <input
                      type="text"
                      placeholder={profile?.full_name || 'Enter your full name'}
                      value={profileForm.full_name}
                      onChange={e => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e0e0e0', borderRadius: '9px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Phone Number <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value.replace(/[^+0-9]/g, '') }))}
                      style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e0e0e0', borderRadius: '9px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>Digits only. This is what tenants see after paying.</span>
                  </div>
                  {profileMsg && (
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: profileMsg.includes('success') ? '#27ae60' : '#e74c3c' }}>{profileMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{ padding: '0.75rem', background: '#e67e22', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Styles now defined in globals.css with dark/light mode support */}

      {showRoleModal && (
        <SwitchRoleModal
          fromRole="tenant"
          loading={switchingRole}
          onConfirm={handleSwitchToLandlord}
          onCancel={() => router.push('/browse')}
        />
      )}
    </div>
  )
}