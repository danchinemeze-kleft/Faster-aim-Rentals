'use client'
export const dynamic = 'force-dynamic'


import { useState, useEffect, useMemo, useRef } from 'react'
import { useLoadingRouter } from '../hooks/useLoadingRouter';
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'
import SwitchRoleModal from '../components/SwitchRoleModal'

// Your existing delete route (expects Authorization: Bearer <token> and { confirm: 'DELETE' })
const DELETE_ENDPOINT = '/api/delete-account'
const MAX_AVATAR_MB = 3

function EyeIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function PasswordField({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        minLength={6}
        autoComplete="new-password"
        style={{ ...SET.input, paddingRight: '2.75rem' }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 0, display: 'flex' }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  )
}

// Shared look for the new account-settings blocks (uses your theme variables)
const SET = {
  title: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 1rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border-1)', borderRadius: '9px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-1)' },
  btn: { padding: '0.7rem 1.2rem', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  btnGhost: { padding: '0.7rem 1.2rem', background: 'transparent', color: 'var(--text-1)', border: '1.5px solid var(--border-1)', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  btnDanger: { padding: '0.7rem 1.2rem', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  col: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  note: { fontSize: '0.85rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.5 },
}

function Msg({ m }) {
  if (!m) return null
  return (
    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.75rem 0 0', color: m.type === 'ok' ? '#27ae60' : '#e74c3c' }}>{m.text}</p>
  )
}

export default function DashboardPage() {
  const router = useLoadingRouter()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])
  const fileRef = useRef(null)
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

  // Account settings state
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [resetBusy, setResetBusy] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)
  const [confirmText, setConfirmText] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delMsg, setDelMsg] = useState(null)

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

  // ---------- Account settings actions ----------

  const openSettings = () => {
    setActiveTab('profile')
    setTimeout(() => {
      document.getElementById('account-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    setAvatarMsg(null)
    if (!file.type.startsWith('image/')) {
      return setAvatarMsg({ type: 'err', text: 'Please choose an image file.' })
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      return setAvatarMsg({ type: 'err', text: `Image must be smaller than ${MAX_AVATAR_MB} MB.` })
    }
    setAvatarBusy(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('Profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      if (dbErr) throw dbErr
      await fetchProfile(user.id)
      setAvatarMsg({ type: 'ok', text: 'Profile picture updated.' })
    } catch (err) {
      setAvatarMsg({ type: 'err', text: err?.message || 'Could not upload the picture. Please try again.' })
    }
    setAvatarBusy(false)
  }

  const handleAvatarRemove = async () => {
    if (!user) return
    setAvatarMsg(null)
    setAvatarBusy(true)
    try {
      const { error } = await supabase.from('Profiles').update({ avatar_url: null }).eq('id', user.id)
      if (error) throw error
      await fetchProfile(user.id)
      setAvatarMsg({ type: 'ok', text: 'Profile picture removed.' })
    } catch (err) {
      setAvatarMsg({ type: 'err', text: err?.message || 'Could not remove the picture.' })
    }
    setAvatarBusy(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword.length < 6) return setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' })
    if (newPassword !== confirmPassword) return setPwMsg({ type: 'err', text: 'Passwords do not match.' })
    setPwBusy(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMsg({ type: 'err', text: error.message })
    } else {
      setPwMsg({ type: 'ok', text: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPwBusy(false)
  }

  const handleSendResetLink = async () => {
    if (!user?.email) return
    setResetMsg(null)
    setResetBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/account/callback?redirect=${encodeURIComponent('/account/reset-password')}`,
    })
    setResetMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'Reset link sent. Check your email inbox.' })
    setResetBusy(false)
  }

  const handleDeleteAccount = async () => {
    setDelMsg(null)
    if (confirmText.trim() !== 'DELETE') {
      return setDelMsg({ type: 'err', text: 'Type DELETE (in capitals) to confirm.' })
    }
    setDelBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Session expired. Please log in again.')
      const res = await fetch(DELETE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Could not delete your account.')
      await supabase.auth.signOut({ scope: 'local' })
      router.push('/')
    } catch (err) {
      setDelMsg({ type: 'err', text: err.message })
      setDelBusy(false)
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={openSettings}
              aria-label="Account settings"
              title="Account settings"
              style={{ background: 'transparent', border: '1.5px solid var(--border-1)', color: 'var(--text-1)', borderRadius: '50%', width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <GearIcon />
            </button>
            <div className={`faim-sub-badge ${isSubscriptionActive() ? 'faim-sub-badge--active' : 'faim-sub-badge--inactive'}`}>
              {isSubscriptionActive() ? '● Active Plan' : '● No Active Plan'}
            </div>
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
              <div className="faim-profile-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name || 'Profile picture'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
                  />
                ) : (
                  profile?.full_name?.[0] || user?.email?.[0] || '?'
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={avatarBusy}
                  style={{ ...SET.btnGhost, padding: '0.4rem 0.9rem', fontSize: '0.8rem', opacity: avatarBusy ? 0.6 : 1 }}>
                  {avatarBusy ? 'Please wait...' : '📷 Change picture'}
                </button>
                {profile?.avatar_url && (
                  <button type="button" onClick={handleAvatarRemove} disabled={avatarBusy}
                    style={{ ...SET.btnGhost, padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                    Remove
                  </button>
                )}
              </div>
              <Msg m={avatarMsg} />
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

              <div className="faim-profile-info" id="account-settings">
                <h3 style={SET.title}>Update Profile</h3>
                {!profile?.phone && (
                  <div style={{ background: '#fff8f2', border: '1.5px solid #e67e22', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#7a4a1a' }}>
                    ⚠️ Tenants cannot see your contact details until you add your phone number.
                  </div>
                )}
                <form onSubmit={handleProfileSave} style={SET.col}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>Full Name</label>
                    <input
                      type="text"
                      placeholder={profile?.full_name || 'Enter your full name'}
                      value={profileForm.full_name}
                      onChange={e => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      style={SET.input}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>Phone Number <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value.replace(/[^+0-9]/g, '') }))}
                      style={SET.input}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Digits only. This is what tenants see after paying.</span>
                  </div>
                  {profileMsg && (
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: profileMsg.includes('success') ? '#27ae60' : '#e74c3c' }}>{profileMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{ ...SET.btn, padding: '0.75rem', fontSize: '0.95rem', cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.7 : 1 }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="faim-profile-info">
                <h3 style={SET.title}>Change Password</h3>
                <form onSubmit={handleChangePassword} style={SET.col}>
                  <PasswordField placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <PasswordField placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <button type="submit" disabled={pwBusy} style={{ ...SET.btn, opacity: pwBusy ? 0.7 : 1 }}>
                    {pwBusy ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
                <Msg m={pwMsg} />
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-1)', margin: '1.25rem 0' }} />
                <p style={{ ...SET.note, marginBottom: '0.75rem' }}>Prefer a reset link by email?</p>
                <button type="button" onClick={handleSendResetLink} disabled={resetBusy} style={{ ...SET.btnGhost, opacity: resetBusy ? 0.7 : 1 }}>
                  {resetBusy ? 'Sending...' : 'Email me a reset link'}
                </button>
                <Msg m={resetMsg} />
              </div>

              <div className="faim-profile-info">
                <h3 style={SET.title}>Session</h3>
                <button type="button" onClick={handleLogout} style={SET.btnGhost}>Sign Out</button>
              </div>

              <div className="faim-profile-info" style={{ border: '1.5px solid rgba(192,57,43,0.5)' }}>
                <h3 style={{ ...SET.title, color: '#e74c3c' }}>Delete Account</h3>
                <p style={{ ...SET.note, marginBottom: '1rem' }}>
                  This permanently deletes your account, listings and data. It cannot be undone. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  style={{ ...SET.input, marginBottom: '1rem' }}
                />
                <button type="button" onClick={handleDeleteAccount} disabled={delBusy} style={{ ...SET.btnDanger, opacity: delBusy ? 0.7 : 1 }}>
                  {delBusy ? 'Deleting...' : 'Delete My Account'}
                </button>
                <Msg m={delMsg} />
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