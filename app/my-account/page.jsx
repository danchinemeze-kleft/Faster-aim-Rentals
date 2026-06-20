'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'

export default function MyAccountPage() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [reveals, setReveals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('Profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const fetchReveals = async (userId) => {
    const { data } = await supabase
      .from('Contact_reveals')
      .select('*, listings(*)')
      .eq('tenant_id', userId)
      .order('created_at', { ascending: false })
    setReveals(data || [])
  }

  useEffect(() => {
    let settled = false

    const init = async (session) => {
      if (settled) return
      settled = true
      if (!session) { router.push('/account?redirect=/my-account'); return }
      setUser(session.user)
      await Promise.all([
        fetchProfile(session.user.id),
        fetchReveals(session.user.id),
      ])
      setLoading(false)
    }

    // onAuthStateChange fires INITIAL_SESSION immediately with the real session
    // state, avoiding the race where getSession() resolves before cookies hydrate
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!settled) init(session)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="faim-loading">
      <div className="faim-spinner"></div>
      <p>Loading your account...</p>
    </div>
  )

  return (
    <div className="faim-myaccount">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Account', href: '/my-account' }]} />

      {/* Sidebar */}
      <aside className="faim-sidebar">
        <div className="faim-sidebar-brand">
          <span>🏠</span>
          <span>Mr. Rent</span>
        </div>
        <nav className="faim-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'reveals', icon: '🔓', label: 'Saved Contacts' },
            { id: 'profile', icon: '👤', label: 'My Profile' },
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
          <a href="/browse" className="faim-browse-btn">🔍 Browse Properties</a>
          <a href="/search" className="faim-chat-btn">🤖 Ask Mr. Rent</a>
          <button onClick={handleLogout} className="faim-logout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="faim-main">

        {/* Topbar */}
        <div className="faim-topbar">
          <div>
            <h1 className="faim-page-title">
              {activeTab === 'overview' && 'My Account'}
              {activeTab === 'reveals' && 'Saved Contacts'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="faim-welcome">Welcome back, {profile?.full_name?.split(' ')[0] || 'Tenant'} 👋</p>
          </div>
          <span className="faim-tenant-badge">🔍 Tenant</span>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="faim-overview">

            {/* Stats */}
            <div className="faim-stats-grid">
              <div className="faim-stat-card">
                <div className="faim-stat-icon">🔓</div>
                <div>
                  <p className="faim-stat-value">{reveals.length}</p>
                  <p className="faim-stat-label">Contacts Revealed</p>
                </div>
              </div>
              <div className="faim-stat-card">
                <div className="faim-stat-icon">💰</div>
                <div>
                  <p className="faim-stat-value">₦{(reveals.length * 5000).toLocaleString()}</p>
                  <p className="faim-stat-label">Total Spent</p>
                </div>
              </div>
              <div className="faim-stat-card">
                <div className="faim-stat-icon">📅</div>
                <div>
                  <p className="faim-stat-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—'}</p>
                  <p className="faim-stat-label">Member Since</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="faim-quick-actions">
              <h2>Quick Actions</h2>
              <div className="faim-actions-grid">
                <a href="/browse" className="faim-action-card">
                  <span className="faim-action-icon">🏘️</span>
                  <span className="faim-action-title">Browse Listings</span>
                  <span className="faim-action-desc">Find your next home</span>
                </a>
                <a href="/search" className="faim-action-card">
                  <span className="faim-action-icon">🤖</span>
                  <span className="faim-action-title">Ask Mr. Rent AI</span>
                  <span className="faim-action-desc">Get property advice</span>
                </a>
                <button onClick={() => setActiveTab('reveals')} className="faim-action-card">
                  <span className="faim-action-icon">🔓</span>
                  <span className="faim-action-title">Saved Contacts</span>
                  <span className="faim-action-desc">{reveals.length} landlords saved</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className="faim-action-card">
                  <span className="faim-action-icon">👤</span>
                  <span className="faim-action-title">My Profile</span>
                  <span className="faim-action-desc">View your details</span>
                </button>
                <a href="/list" className="faim-action-card">
                  <span className="faim-action-icon">🏠</span>
                  <span className="faim-action-title">List a Property</span>
                  <span className="faim-action-desc">Add your property for free</span>
                </a>
              </div>
            </div>

            {/* Recent Reveals */}
            {reveals.length > 0 && (
              <div className="faim-section">
                <div className="faim-section-header">
                  <h2>Recent Contacts</h2>
                  <button onClick={() => setActiveTab('reveals')} className="faim-view-all">View All →</button>
                </div>
                {reveals.slice(0, 3).map(reveal => (
                  <div key={reveal.id} className="faim-reveal-row">
                    <div>
                      <p className="faim-reveal-title">{reveal.listings?.title || 'Property'}</p>
                      <p className="faim-reveal-sub">📍 {reveal.listings?.location}, {reveal.listings?.state}</p>
                    </div>
                    <span className="faim-reveal-badge">Contact Revealed</span>
                  </div>
                ))}
              </div>
            )}

            {reveals.length === 0 && (
              <div className="faim-empty-card">
                <p>🏠 You haven't revealed any landlord contacts yet.</p>
                <p>Browse listings and pay ₦5,000 to get a landlord's contact details.</p>
                <a href="/browse" className="faim-cta-btn">Browse Listings →</a>
              </div>
            )}
          </div>
        )}

        {/* REVEALS TAB */}
        {activeTab === 'reveals' && (
          <div className="faim-reveals-tab">
            <h2 style={{marginBottom:'1.5rem', color:'var(--text)'}}>Saved Contacts ({reveals.length})</h2>
            {reveals.length === 0 ? (
              <div className="faim-empty-card">
                <p>🔓 No contacts revealed yet.</p>
                <p>Find a property you like and pay ₦5,000 to reveal the landlord's contact.</p>
                <a href="/browse" className="faim-cta-btn">Browse Listings →</a>
              </div>
            ) : (
              <div className="faim-reveals-grid">
                {reveals.map(reveal => (
                  <div key={reveal.id} className="faim-reveal-card">
                    <div className="faim-reveal-card-header">
                      <span className="faim-type-pill">{reveal.listings?.property_type || 'Property'}</span>
                      <span className="faim-revealed-tag">✓ Contact Revealed</span>
                    </div>
                    <h3>{reveal.listings?.title || 'Property'}</h3>
                    <p className="faim-reveal-location">📍 {reveal.listings?.location}, {reveal.listings?.state}</p>
                    <p className="faim-reveal-price">₦{reveal.listings?.price?.toLocaleString()} / {reveal.listings?.price_period}</p>
                    <p className="faim-reveal-specs">{reveal.listings?.bedrooms} bed • {reveal.listings?.bathrooms} bath</p>
                    <div className="faim-reveal-contact">
                      <p className="faim-contact-label">Landlord Contact</p>
                      <p className="faim-contact-value">{reveal.landlord_phone || reveal.landlord_email || 'Contact info saved'}</p>
                    </div>
                    <p className="faim-reveal-date">Revealed on {new Date(reveal.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="faim-profile-tab">
            <div className="faim-profile-card">
              <div className="faim-profile-avatar">
                {profile?.full_name?.[0] || user?.email?.[0] || '?'}
              </div>
              <h2>{profile?.full_name || 'Tenant'}</h2>
              <p>{user?.email}</p>
              <p>{profile?.phone || 'No phone added'}</p>
              <span className="faim-tenant-badge" style={{marginTop:'0.5rem', display:'inline-block'}}>🔍 Tenant</span>
            </div>
            <div className="faim-profile-info">
              {[
                { label: 'Full Name', value: profile?.full_name || '—' },
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: profile?.phone || '—' },
                { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
                { label: 'Contacts Revealed', value: reveals.length },
                { label: 'Total Spent', value: `₦${(reveals.length * 5000).toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="faim-info-row">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .faim-myaccount {
          display: flex;
          min-height: 100vh;
          background: #f5f4f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .faim-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #666;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .faim-spinner {
          width: 40px; height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #e67e22;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .faim-sidebar {
          width: 220px;
          background: #1a1a2e;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
        }
        .faim-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          padding: 0 4px;
        }
        .faim-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .faim-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          font-size: 0.88rem;
          text-align: left;
          transition: all 0.15s;
        }
        .faim-nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .faim-nav-item--active { background: rgba(230,126,34,0.2); color: #e67e22; font-weight: 600; }
        .faim-sidebar-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
        .faim-browse-btn, .faim-chat-btn {
          color: white;
          text-decoration: none;
          padding: 0.65rem;
          border-radius: 10px;
          text-align: center;
          font-size: 0.82rem;
          font-weight: 500;
          transition: all 0.15s;
        }
        .faim-browse-btn { background: #e67e22; }
        .faim-browse-btn:hover { background: #cf6d17; }
        .faim-chat-btn { border: 1px solid #444; }
        .faim-chat-btn:hover { border-color: #888; }
        .faim-logout-btn {
          background: transparent;
          color: #aaa;
          border: 1px solid #333;
          padding: 0.65rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.15s;
        }
        .faim-logout-btn:hover { color: white; border-color: #666; }

        .faim-main {
          margin-left: 220px;
          flex: 1;
          padding: 2rem;
        }
        .faim-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .faim-page-title { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; }
        .faim-welcome { color: #888; font-size: 0.9rem; margin-top: 2px; }
        .faim-tenant-badge {
          background: #f0f4ff;
          color: #3b5bdb;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .faim-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .faim-stat-card {
          background: white;
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .faim-stat-icon { font-size: 1.8rem; }
        .faim-stat-value { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; }
        .faim-stat-label { font-size: 0.78rem; color: #888; }

        .faim-quick-actions { margin-bottom: 1.5rem; }
        .faim-quick-actions h2 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 1rem; }
        .faim-actions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        .faim-action-card {
          background: white;
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.15s, box-shadow 0.15s;
          text-align: center;
        }
        .faim-action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .faim-action-icon { font-size: 1.8rem; }
        .faim-action-title { font-size: 0.85rem; font-weight: 600; color: #1a1a2e; }
        .faim-action-desc { font-size: 0.75rem; color: #888; }

        .faim-section {
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
        }
        .faim-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .faim-section-header h2 { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
        .faim-view-all { background: none; border: none; color: #e67e22; font-weight: 600; cursor: pointer; font-size: 0.85rem; }

        .faim-reveal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 0;
          border-bottom: 1px solid #f0ede8;
        }
        .faim-reveal-row:last-child { border-bottom: none; }
        .faim-reveal-title { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
        .faim-reveal-sub { font-size: 0.78rem; color: #888; margin-top: 2px; }
        .faim-reveal-badge {
          background: #f0fff4;
          color: #27ae60;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .faim-empty-card {
          background: white;
          border-radius: 14px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          color: #666;
          line-height: 2;
        }
        .faim-cta-btn {
          display: inline-block;
          margin-top: 1rem;
          background: #e67e22;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.15s;
        }
        .faim-cta-btn:hover { background: #cf6d17; }

        .faim-reveals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .faim-reveal-card {
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .faim-reveal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .faim-type-pill {
          background: #f0ede8;
          color: #666;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .faim-revealed-tag {
          background: #f0fff4;
          color: #27ae60;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .faim-reveal-card h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .faim-reveal-location { font-size: 0.82rem; color: #888; margin-bottom: 4px; }
        .faim-reveal-price { font-size: 1rem; font-weight: 700; color: #e67e22; margin-bottom: 4px; }
        .faim-reveal-specs { font-size: 0.82rem; color: #666; margin-bottom: 1rem; }
        .faim-reveal-contact {
          background: #f0ede8;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .faim-contact-label { font-size: 0.75rem; color: #888; margin-bottom: 2px; }
        .faim-contact-value { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
        .faim-reveal-date { font-size: 0.75rem; color: #aaa; }

        .faim-profile-tab { display: flex; gap: 1.5rem; }
        .faim-profile-card {
          background: white;
          border-radius: 14px;
          padding: 2rem;
          text-align: center;
          width: 220px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .faim-profile-avatar {
          width: 72px; height: 72px;
          background: #3b5bdb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin: 0 auto 1rem;
          text-transform: uppercase;
        }
        .faim-profile-card h2 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .faim-profile-card p { font-size: 0.82rem; color: #888; margin-bottom: 4px; }
        .faim-profile-info {
          flex: 1;
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .faim-info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.875rem 0;
          border-bottom: 1px solid #f0ede8;
          font-size: 0.9rem;
        }
        .faim-info-row:last-child { border-bottom: none; }
        .faim-info-row span:first-child { color: #888; }
        .faim-info-row span:last-child { color: #1a1a2e; font-weight: 500; }

        @media (max-width: 768px) {
          .faim-sidebar { width: 60px; padding: 1rem 0.5rem; }
          .faim-sidebar-brand span:last-child,
          .faim-nav-item span:last-child { display: none; }
          .faim-browse-btn, .faim-chat-btn { font-size: 0; padding: 0.65rem; }
          .faim-main { margin-left: 60px; padding: 1rem; }
          .faim-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .faim-actions-grid { grid-template-columns: repeat(3, 1fr); }
          .faim-profile-tab { flex-direction: column; }
          .faim-profile-card { width: 100%; }
        }
      `}</style>
    </div>
  )
}

