'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

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

  async function fetchProfile(userId) {
    const { data } = await supabase.from('Profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  async function fetchListings(userId) {
    const { data } = await supabase.from('listings').select('*').eq('landlord_id', userId).order('created_at', { ascending: false })
    setListings(data || [])
  }

  async function fetchSubscription(userId) {
    const { data } = await supabase.from('Subscription').select('*').eq('landlord_id', userId).order('created_at', { ascending: false }).limit(1).single()
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

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/account?redirect=/dashboard'); return }
      setUser(session.user)
      await Promise.all([
        fetchProfile(session.user.id),
        fetchListings(session.user.id),
        fetchSubscription(session.user.id),
        fetchStats(session.user.id),
      ])
      setLoading(false)
    }
    init()
  }, [])

  const toggleAvailability = async (listing) => {
    setTogglingId(listing.id)
    const { error } = await supabase.from('listings').update({ available: !listing.available }).eq('id', listing.id)
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
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: 1000000,
          metadata: { type: 'subscription', landlord_id: user.id },
          callback_url: `${window.location.origin}/dashboard?subscribed=true`,
        })
      })
      const data = await res.json()
      if (data.authorization_url) window.location.href = data.authorization_url
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
          <a href="/list" className="faim-add-listing-btn">+ Add Listing</a>
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
                    <p className="faim-listing-row-sub">📍 {listing.location} • ₦{listing.price?.toLocaleString()}/{listing.price_period}</p>
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
                <p className="faim-empty-text">No listings yet. <a href="/list">Create your first listing →</a></p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="faim-listings-tab">
            <div className="faim-section-header">
              <h2>All Listings ({listings.length})</h2>
              <a href="/list" className="faim-subscribe-btn" style={{textDecoration:'none'}}>+ New Listing</a>
            </div>
            {listings.length === 0 ? (
              <div className="faim-empty-state">
                <p>🏠 No listings yet.</p>
                <a href="/list">Create your first listing</a>
              </div>
            ) : (
              <div className="faim-listings-full">
                {listings.map(listing => (
                  <div key={listing.id} className="faim-listing-full-card">
                    <div className="faim-listing-full-top">
                      <div>
                        <span className="faim-type-pill">{listing.property_type}</span>
                        <h3>{listing.title}</h3>
                        <p className="faim-listing-meta">📍 {listing.location}, {listing.state} • {listing.bedrooms} bed • {listing.bathrooms} bath</p>
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

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .faim-dashboard { display: flex; min-height: 100vh; background: #f5f4f0; font-family: 'Segoe UI', system-ui, sans-serif; }
        .faim-dash-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #666; font-family: 'Segoe UI', system-ui, sans-serif; }
        .faim-spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #e67e22; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .faim-sidebar { width: 240px; background: #1a1a2e; color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
        .faim-sidebar-brand { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; font-weight: 700; margin-bottom: 2rem; padding: 0 0.5rem; }
        .faim-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .faim-nav-item { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1rem; border-radius: 10px; border: none; background: transparent; color: #aaa; cursor: pointer; font-size: 0.9rem; text-align: left; transition: all 0.15s; }
        .faim-nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .faim-nav-item--active { background: rgba(230,126,34,0.2); color: #e67e22; font-weight: 600; }
        .faim-sidebar-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
        .faim-add-listing-btn { background: #e67e22; color: white; text-decoration: none; padding: 0.75rem; border-radius: 10px; text-align: center; font-weight: 600; font-size: 0.9rem; transition: background 0.15s; }
        .faim-add-listing-btn:hover { background: #cf6d17; }
        .faim-logout-btn { background: transparent; color: #aaa; border: 1px solid #333; padding: 0.65rem; border-radius: 10px; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; }
        .faim-logout-btn:hover { color: white; border-color: #666; }
        .faim-main { margin-left: 240px; flex: 1; padding: 2rem; max-width: calc(100vw - 240px); }
        .faim-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .faim-page-title { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; }
        .faim-welcome { color: #888; font-size: 0.9rem; margin-top: 2px; }
        .faim-sub-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .faim-sub-badge--active { background: #f0fff4; color: #27ae60; }
        .faim-sub-badge--inactive { background: #fff0f0; color: #e74c3c; }
        .faim-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .faim-stat-card { background: white; border-radius: 14px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-stat-icon { font-size: 1.8rem; }
        .faim-stat-value { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; }
        .faim-stat-label { font-size: 0.78rem; color: #888; }
        .faim-alert-card { background: #fff8f2; border: 1.5px solid #e67e22; border-radius: 14px; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .faim-alert-card--warning { background: #fffbf0; border-color: #f39c12; }
        .faim-alert-card h3 { font-size: 0.95rem; color: #1a1a2e; margin-bottom: 4px; }
        .faim-alert-card p { font-size: 0.85rem; color: #666; }
        .faim-subscribe-btn { background: #e67e22; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; font-size: 0.85rem; transition: background 0.15s; }
        .faim-subscribe-btn:hover { background: #cf6d17; }
        .faim-section { background: white; border-radius: 14px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .faim-section-header h2 { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
        .faim-view-all { background: none; border: none; color: #e67e22; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .faim-listing-row { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 0; border-bottom: 1px solid #f0ede8; }
        .faim-listing-row:last-child { border-bottom: none; }
        .faim-listing-row-title { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
        .faim-listing-row-sub { font-size: 0.78rem; color: #888; margin-top: 2px; }
        .faim-toggle-wrap { display: flex; align-items: center; gap: 8px; }
        .faim-avail-label { font-size: 0.75rem; font-weight: 600; }
        .faim-avail-label--yes { color: #27ae60; }
        .faim-avail-label--no { color: #e74c3c; }
        .faim-toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.2s; }
        .faim-toggle--on { background: #27ae60; }
        .faim-toggle--off { background: #ddd; }
        .faim-toggle--on .faim-toggle-thumb { left: 22px; }
        .faim-toggle-thumb { position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .faim-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
        .faim-listings-full { display: flex; flex-direction: column; gap: 1rem; }
        .faim-listing-full-card { background: white; border-radius: 14px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-listing-full-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .faim-type-pill { display: inline-block; background: #f0ede8; color: #666; padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; text-transform: capitalize; margin-bottom: 0.4rem; }
        .faim-listing-full-top h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .faim-listing-meta { font-size: 0.8rem; color: #888; margin-bottom: 4px; }
        .faim-listing-price-tag { font-size: 1rem; font-weight: 700; color: #e67e22; }
        .faim-listing-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
        .faim-listing-btns { display: flex; gap: 0.5rem; }
        .faim-edit-btn { padding: 6px 12px; border: 1.5px solid #e67e22; border-radius: 6px; color: #e67e22; font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: all 0.15s; }
        .faim-edit-btn:hover { background: #fff8f2; }
        .faim-del-btn { padding: 6px 10px; border: none; border-radius: 6px; background: #fff0f0; color: #e74c3c; cursor: pointer; font-size: 0.85rem; transition: background 0.15s; }
        .faim-del-btn:hover { background: #fcc; }
        .faim-listing-desc-preview { font-size: 0.82rem; color: #888; line-height: 1.5; margin-bottom: 0.75rem; }
        .faim-amenity-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .faim-amenity-pills span { background: #f0ede8; color: #666; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; }
        .faim-sub-tab { display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px; }
        .faim-sub-status-card { background: white; border-radius: 14px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-sub-status-icon { font-size: 2.5rem; }
        .faim-sub-status-card h2 { font-size: 1.1rem; color: #1a1a2e; margin-bottom: 4px; }
        .faim-sub-status-card p { font-size: 0.85rem; color: #666; }
        .faim-plan-card { background: #1a1a2e; border-radius: 14px; padding: 1.5rem; color: white; }
        .faim-plan-header { margin-bottom: 1.25rem; }
        .faim-plan-header h3 { font-size: 1rem; color: #aaa; margin-bottom: 4px; }
        .faim-plan-price { font-size: 2rem; font-weight: 700; color: #e67e22; }
        .faim-plan-price span { font-size: 1rem; color: #aaa; font-weight: 400; }
        .faim-plan-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem; }
        .faim-plan-features li { font-size: 0.9rem; color: #ccc; }
        .faim-profile-tab { display: flex; gap: 1.5rem; }
        .faim-profile-card { background: white; border-radius: 14px; padding: 2rem; text-align: center; width: 240px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-profile-avatar { width: 72px; height: 72px; background: #e67e22; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; color: white; margin: 0 auto 1rem; text-transform: uppercase; }
        .faim-profile-card h2 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .faim-profile-card p { font-size: 0.82rem; color: #888; margin-bottom: 4px; }
        .faim-role-tag { display: inline-block; background: #fff8f2; color: #e67e22; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin-top: 0.5rem; }
        .faim-profile-info { flex: 1; background: white; border-radius: 14px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faim-info-row { display: flex; justify-content: space-between; padding: 0.875rem 0; border-bottom: 1px solid #f0ede8; font-size: 0.9rem; }
        .faim-info-row:last-child { border-bottom: none; }
        .faim-info-row span:first-child { color: #888; }
        .faim-info-row span:last-child { color: #1a1a2e; font-weight: 500; }
        .faim-empty-text { color: #888; font-size: 0.85rem; padding: 1rem 0; }
        .faim-empty-text a { color: #e67e22; }
        .faim-empty-state { background: white; border-radius: 14px; padding: 3rem; text-align: center; color: #888; }
        .faim-empty-state a { color: #e67e22; display: block; margin-top: 0.5rem; }
        @media (max-width: 768px) {
          .faim-sidebar { width: 60px; padding: 1rem 0.5rem; }
          .faim-sidebar-brand span:last-child { display: none; }
          .faim-nav-item span:last-child { display: none; }
          .faim-add-listing-btn { font-size: 0; padding: 0.65rem; }
          .faim-main { margin-left: 60px; padding: 1rem; }
          .faim-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .faim-profile-tab { flex-direction: column; }
          .faim-profile-card { width: 100%; }
        }
      `}</style>
    </div>
  )
}