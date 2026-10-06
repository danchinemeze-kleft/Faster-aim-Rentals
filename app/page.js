'use client'

import Link from 'next/link'

import DownloadPopup from "./components/DownloadPopup";
import DownloadButton from "./components/DownloadButton";
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from './components/Breadcrumb'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const useSupabase = () => {
  return useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])
}

export default function Home() {
  const router = useRouter()
  const supabase = useSupabase()
  const [listingCount, setListingCount] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [user, setUser] = useState(null)
  const [featured, setFeatured] = useState([])

  // Fetch user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setListingCount(count) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch featured properties (top 3 across rentals + sales, verified first, newest first)
  useEffect(() => {
    async function loadFeatured() {
      const [{ data: rentRows }, { data: saleRows }] = await Promise.all([
        supabase
          .from('listings')
          .select('id, title, location, price, price_period, images, bedrooms, bathrooms, property_type, veryland_badge, created_at')
          .eq('status', 'active')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('property_sales')
          .select('id, title, location, price, images, bedrooms, bathrooms, property_type, veryland_verified, created_at')
          .eq('status', 'active')
          .eq('available', true)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      const rent = (rentRows || []).map((r) => ({
        id: r.id,
        kind: 'rent',
        title: r.title || 'Untitled listing',
        location: r.location,
        price: r.price || 0,
        pricePeriod: r.price_period,
        image: r.images && r.images[0] ? r.images[0] : null,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms,
        propertyType: r.property_type,
        verified: Boolean(r.veryland_badge),
        createdAt: r.created_at,
      }))

      const sale = (saleRows || []).map((r) => ({
        id: r.id,
        kind: 'sale',
        title: r.title,
        location: r.location,
        price: r.price,
        pricePeriod: null,
        image: r.images && r.images[0] ? r.images[0] : null,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms,
        propertyType: r.property_type,
        verified: Boolean(r.veryland_verified),
        createdAt: r.created_at,
      }))

      const combined = [...rent, ...sale]
        .sort((a, b) => {
          if (a.verified !== b.verified) return a.verified ? -1 : 1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        .slice(0, 3)

      setFeatured(combined)
    }

    loadFeatured()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Floating welcome chat bubble — first-time visitors only, after 6s
  useEffect(() => {
    try {
      const seen = localStorage.getItem('mrRentBubbleSeen')
      if (!seen) {
        const timer = setTimeout(() => {
          setShowBubble(true)
        }, 6000)
        return () => clearTimeout(timer)
      }
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — just skip
    }
  }, [])

  // Capture affiliate ref parameter from URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        localStorage.setItem('mrRentAffiliate', ref)
      }
    } catch (e) {}
  }, [])

  const dismissBubble = () => {
    try { localStorage.setItem('mrRentBubbleSeen', '1') } catch (e) {}
    setShowBubble(false)
  }

  const handleBubbleYes = () => {
    dismissBubble()
    router.push('/account')
  }

  const handleBubbleNo = () => {
    dismissBubble()
    router.push('/terms')
  }

  function formatNaira(amount) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const displayCount = listingCount === null ? '...' : listingCount > 0 ? `${listingCount}+ real spaces available for rent` : 'New real spaces added weekly'

  return (
    <main className={jakarta.className} style={s.main}>
      <style>{`
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
        }
        .mobile-menu-panel {
          background-color: #ffffff;
          width: 85%;
          max-width: 360px;
          height: 100%;
          box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }
        .mobile-menu-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #64748b;
          cursor: pointer;
          line-height: 1;
        }
        .mobile-menu-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.95rem;
          transition: background-color 0.2s;
        }
        .mobile-menu-item:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        .mobile-menu-item-highlight {
          color: #0ea5e9;
          background-color: rgba(14, 165, 233, 0.05);
        }
        .mobile-menu-item-highlight:hover {
          background-color: rgba(14, 165, 233, 0.1);
        }
        .mobile-menu-icon {
          flex-shrink: 0;
          color: #64748b;
        }
        .mobile-menu-item-highlight .mobile-menu-icon {
          color: #0ea5e9;
        }
        .mobile-menu-footer {
          margin-top: 1.5rem;
        }
        .feature-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12);
        }
        .footer-link:hover {
          color: #0ea5e9;
        }
        .make-money-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .make-money-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 26px -8px rgba(20, 184, 166, 0.65);
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .scroll-down-btn {
          animation: bounceDown 1.8s ease-in-out infinite;
        }
        .featured-grid {
          scrollbar-width: none;
        }
        .featured-grid::-webkit-scrollbar {
          display: none;
        }
        .featured-more-mobile {
          display: none;
        }
        @media (min-width: 769px) {
          .nav-hamburger {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
          .hero-layout {
            grid-template-columns: 1fr !important;
          }
          .hero-title-el {
            font-size: 2.1rem !important;
            line-height: 1.15 !important;
          }
          .steps-grid, .features-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .featured-grid {
            display: flex !important;
            grid-template-columns: unset !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 1rem !important;
            padding-bottom: 0.25rem;
          }
          .featured-card-item {
            flex: 0 0 82% !important;
            scroll-snap-align: start;
          }
          .featured-more-desktop {
            display: none !important;
          }
          .featured-more-mobile {
            display: flex !important;
          }
        }
      `}</style>
{/* 5-Star Rating Bar */}
<div style={{
  width: '100%',
  background: 'linear-gradient(90deg, #0ea5e9 0%, #0ef6cc 100%)',
  color: '#ffffff',
  textAlign: 'center',
  padding: '0.5rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  cursor: 'pointer',
}}
  onClick={() => router.push('/reviews')} // change target as needed
>
  <span style={{ letterSpacing: '1px' }}>★★★★★</span>
  <span>Rated 5 Stars by Verified Renters — See Reviews</span>
</div>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
  }}
>
  <Breadcrumb theme="Gold" items={[{ label: 'Home', href: '/' }]} />
  <DownloadButton />
</div>
{/* Navbar */}
<nav style={s.nav} className="nav-3d">
        <div style={s.navBrand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', color: '#0ea5e9' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mr. Rent
        </div>

<DownloadPopup />

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <a href="/browse" style={s.navLink}>Browse Rentals</a>
          <a href="/list" style={s.navLink}>List Property</a>
          <a href="/veryland" style={{ ...s.navLink, color: '#0ea5e9', fontWeight: 700 }}>Verified Properties</a>
          <a href="/account" style={s.navBtn}>Get started</a>
          <div className="nav-menu-hover">
  <button type="button" className="nav-menu-trigger" aria-haspopup="true">
    <span className="nav-menu-icon">☰</span>
    <span className="nav-menu-label">Menu</span>
  </button>

  <div className="nav-menu-dropdown">
    <a href="/browse">Browse Rentals</a>
    <a href="/list">List Property</a>
    <a href="/veryland">Verified Properties</a>
    <a href="/search">AI Chat Assistant</a>
    <a href="/affiliate/auth">Earn with Referrals</a>
    <a href="/about">About Us</a>
    <a href="/contact">Contact &amp; Support</a>
    <a href="/faq">FAQ</a>
  </div>
</div>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ background: 'none', border: '2px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}>☰</button>
      </nav>

      {/* Redesigned Mobile Navigation Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            {/* 1. Header Row */}
            <div className="mobile-menu-header">
              <div style={s.navBrand}>
  <svg width="30" height="30" viewBox="0 0 32 32" style={{ marginRight: '8px' }}>
    <polygon
      fill="#10705a"
      points="16,3 28,13 28,29 20,29 20,20 12,20 12,29 4,29 4,13"
    />
  </svg>
  <span style={{ color: '#0b4a3a', fontWeight: 800 }}>Mr. Rent</span>
</div>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
            </div>

            {/* 2. Grouped Navigation Links Container */}
            <div className="mobile-menu-group">
              {/* Browse Rentals */}
              <a href="/browse" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Browse Rentals</span>
              </a>

              {/* List Property */}
              <a href="/list" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                <span>List Property</span>
              </a>

              {/* Verified Properties */}
              <a href="/veryland" className="mobile-menu-item mobile-menu-item-highlight" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 11 2 2 4-4"/>
                </svg>
                <span>Verified Properties</span>
              </a>

              {/* Dashboard (Conditional) */}
              {user && (
                <a href="/dashboard" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                    <rect x="3" y="3" width="7" height="9"/>
                    <rect x="14" y="3" width="7" height="5"/>
                    <rect x="14" y="12" width="7" height="9"/>
                    <rect x="3" y="16" width="7" height="5"/>
                  </svg>
                  <span>Dashboard</span>
                </a>
              )}

              {/* My Account (Conditional) */}
              {user && (
                <a href="/my-account" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>My Account</span>
                </a>
              )}

              {/* Search / AI Chat */}
              <a href="/search" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Search / AI Chat</span>
              </a>

              {/* About Us */}
              <a href="/about" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>About Us</span>
              </a>

              {/* Contact / Support */}
              <a href="/support" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>Contact &amp; Support</span>
              </a>

              {/* FAQ */}
              <a href="/faq" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-menu-icon">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>FAQ</span>
              </a>
            </div>

            {/* Secondary Legal Section */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: 'auto', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Legal &amp; Info</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <a href="/privacy-policy" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textDecoration: 'none', padding: '0.25rem 0.5rem' }} onClick={() => setMenuOpen(false)}>Privacy Policy</a>
                <a href="/terms" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textDecoration: 'none', padding: '0.25rem 0.5rem' }} onClick={() => setMenuOpen(false)}>Terms of Service</a>
              </div>
            </div>

            {/* 5. Get started Button */}
            <div className="mobile-menu-footer">
              <a href="/account" style={{ ...s.navBtn, display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem' }} onClick={() => setMenuOpen(false)}>
                Get started
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={s.heroSection} className="hero-section">
        <div style={s.heroOuter} className="hero-outer">
          <div style={s.heroInner} className="hero-inner hero-3d">
            <div style={s.heroLayout} className="hero-layout">
              <div style={s.heroText}>
                <div style={s.heroBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  <span>Nigeria Nationwide</span>
                </div>
                <h1 style={s.heroTitle} className="hero-title-el">
                  Find or List<br />
                  <span style={s.heroCyan}>Property for Rent</span><br />
                  <span style={s.heroTeal}>Quickly &amp; Securely</span>
                </h1>
                <p style={s.heroSubtitle} className="hero-subtitle">
                  Connect with verified landlords across Nigeria. Browse listings, chat with Mr. Rent AI, and find your perfect home today.
                </p>
                <div style={s.heroActionsPrimary}>
                  <a href="/browse" style={s.btnCyan}>Browse Rentals</a>
                  <a href="/list" style={s.btnTeal}>List a Property</a>
                </div>
                <div style={s.heroActionsSecondary}>
                  <a href="/search" style={s.secondaryLink}>AI Chat Assistant</a>
                  <a href="/veryland" style={s.secondaryLink}>Verify Documents</a>
                  <a href="/affiliate" style={s.secondaryLink}>Earn with Referrals</a>
                </div>
                <div style={s.trustRow}>
                  <div style={s.trustPill}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    <span style={s.trustText}>{displayCount}</span>
                  </div>
                  <div style={s.trustPill}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    <span style={s.trustText}>Available Nationwide</span>
                  </div>
                  <div style={s.trustPill}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={s.trustText}>Active 24 Hours</span>
                  </div>
                  <div style={s.trustPill}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span style={s.trustText}>Free Search, No Agent Fee</span>
                  </div>
                </div>
              </div>

              <div style={s.heroRight}>
                {/* Make Money button — sits above the circular photo */}
                <a href="/affiliate" style={s.makeMoneyBtn} className="make-money-btn">
                  <span aria-hidden="true">$</span> Make Money
                </a>

                <div style={s.avatarContainer} className="avatar-cont">
                  <div style={s.ringTeal} className="ring-teal"></div>
                  <div style={s.ringCyan} className="ring-cyan"></div>
                  <a href="/search" style={{ display: 'block', borderRadius: '50%' }}>
                    <div style={s.avatarWrapper} className="avatar-wrap">
                      <Image
                        src="/mr-rent-avatar.png"
                        alt="Mr. Rent"
                        fill
                        style={s.avatarImage}
                        sizes="300px"
                        priority
                      />
                    </div>
                  </a>
                  <a href="/search" style={{ ...s.verifiedBadge, textDecoration: 'none', cursor: 'pointer' }} className="verified-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#14B8A6', flexShrink: 0 }} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>Chat Free — Ask About Real Estate</div>
                      <div style={{ fontWeight: 600, fontSize: '0.68rem', color: '#64748b', marginTop: '0.1rem' }}>Find available homes</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div style={s.scrollDownWrap}>
            <button
              type="button"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.72, behavior: 'smooth' })}
              aria-label="Scroll down"
              className="scroll-down-btn"
              style={s.scrollDownBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section style={s.sectionWrap}>
          <div style={s.sectionInner}>
            <div style={s.featuredHeadRow}>
              <div style={s.featuredSectionHead}>
                <h2 style={s.sectionTitle}>Featured Properties</h2>
                <p style={s.sectionSubtitle}>Verified listings, handpicked for you — to rent or to buy.</p>
              </div>
              <Link href="/browse" style={s.moreBtnDesktop} className="featured-more-desktop">
                More <span aria-hidden="true">&raquo;</span>
              </Link>
            </div>
            <div style={s.featuredGrid} className="featured-grid">
              {featured.map((property) => (
                <Link
                  key={property.id}
                  href={property.kind === 'rent' ? `/listing/${property.id}` : `/property-for-sale/${property.id}`}
                  style={s.featuredCard}
                  className="feature-card featured-card-item"
                >
                  <div style={s.featuredImageWrap}>
                    {property.image ? (
                      <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="400px"
                      />
                    ) : (
                      <div style={s.featuredNoImage}>No image</div>
                    )}
                    <span style={s.featuredKindBadge}>
                      {property.kind === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    {property.verified && (
                      <span style={s.featuredVerifiedBadge}>Verified</span>
                    )}
                  </div>
                  <div style={s.featuredBody}>
                    <h3 style={s.featuredTitle}>{property.title}</h3>
                    <p style={s.featuredLocation}>{property.location}</p>
                    <div style={s.featuredPriceRow}>
                      <span style={s.featuredPrice}>
                        {formatNaira(property.price)}
                        {property.pricePeriod && (
                          <span style={s.featuredPricePeriod}>/{property.pricePeriod}</span>
                        )}
                      </span>
                      {(property.bedrooms || property.bathrooms) && (
                        <span style={s.featuredBeds}>
                          {property.bedrooms || '-'} bd &middot; {property.bathrooms || '-'} ba
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/browse" style={s.moreBtnMobile} className="featured-more-mobile">
              More properties <span aria-hidden="true">&raquo;</span>
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section style={s.sectionWrap}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>How Mr. Rent Works</h2>
            <p style={s.sectionSubtitle}>Three simple steps, no confusing forms, no hidden surprises.</p>
          </div>
          <div style={s.stepsGrid} className="steps-grid">
            <div style={s.stepCard} className="feature-card">
             
   <Image
    src="/images/search-or-chat.jpg"
    alt="Man searching for a home on the Mr. Rent app"
    width={1024}
    height={559}
    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16, marginBottom: 20 }}
  />
              <div style={{ ...s.stepNumber, backgroundColor: '#0ea5e9' }}>1</div>
              <h3 style={s.stepTitle}>Search or Chat</h3>
              <p style={s.stepText}>Whether you&apos;re looking in the bustling streets of Lagos, the heart of Abuja, or thriving communities in Anambra—find, list, and secure properties across all 36 states and the FCT.</p>
            </div>
            <div style={s.stepCard} className="feature-card">
              <Image
  src="/images/verify-connect.jpg"
  alt="Verified landlord meeting a tenant, with the Mr. Rent verified badge on the phone"
  width={1024}
  height={559}
  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16, marginBottom: 20 }}
/>
              <div style={{ ...s.stepNumber, backgroundColor: '#14b8a6' }}>2</div>
              <h3 style={s.stepTitle}>Verify &amp; Connect</h3>
              <p style={s.stepText}>Every landlord on Mr. Rent is checked before they can list. Unlock verified contact details and speak directly, with no middlemen.</p>
            </div>
            <div style={s.stepCard} className="feature-card">
<Image
  src="/images/move-in-safely.jpg"
  alt="Tenant receiving keys from a verified landlord at his new home"
  width={1024}
  height={559}
  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16, marginBottom: 20 }}
/>
              <div style={{ ...s.stepNumber, backgroundColor: '#0f172a' }}>3</div>
              <h3 style={s.stepTitle}>Move In Safely</h3>
              <p style={s.stepText}>Agree terms directly with a verified landlord and move in with confidence, knowing you didn&apos;t pay a scammer along the way.</p>
            </div>
          </div>
        </div>
      </section>

         {/* Why Choose Us */}
      <section style={{ ...s.sectionWrap, backgroundColor: '#ffffff' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>Why People Trust Mr. Rent</h2>
            <p style={s.sectionSubtitle}>We built Mr. Rent to eliminate the stress, hidden fees, and fraudulent listings of traditional real estate—giving you a safe, smooth path to your next home</p>
          </div>
          <div style={s.featuresGrid} className="features-grid">
            <div style={s.featureCard} className="feature-card">
              <div style={{ ...s.featureIconWrap, backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 11 2 2 4-4"/>
                </svg>
              </div>
              <Image
                src="/images/trust-verified.jpg"
                alt="Landlord having an ID document verified on Mr. Rent"
                width={600}
                height={340}
                className="trust-img"
              />
              <h3 style={s.featureTitle}>Verified Landlords Only</h3>
              <p style={s.featureText}>No fake listings, no mystery landlords. Every property owner undergoes thorough document and identity verification before posting, giving you total confidence in who you&apos;re dealing with every step of the way</p>
            </div>
            <div style={s.featureCard} className="feature-card">
              <div style={{ ...s.featureIconWrap, backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <Image
                src="/images/trust-ai.jpg"
                alt="Tenant chatting with the Mr. Rent AI on a phone"
                width={600}
                height={340}
                className="trust-img"
              />
              <h3 style={s.featureTitle}>AI That Actually Helps</h3>
              <p style={s.featureText}>House hunting made as easy as sending a WhatsApp message. Just tell Mr. Rent AI what you&apos;re looking for in your own words, and let our smart matching engine find properties tailored precisely to your budget and needs—no confusing property jargon required.</p>
            </div>
            <div style={s.featureCard} className="feature-card">
              <div style={{ ...s.featureIconWrap, backgroundColor: 'rgba(15, 23, 42, 0.06)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <Image
                src="/images/trust-nationwide.jpg"
                alt="Residential streets across Nigerian cities"
                width={600}
                height={340}
                className="trust-img"
              />
              <h3 style={s.featureTitle}>Nationwide Coverage</h3>
              <p style={s.featureText}>Whether you&apos;re looking in the bustling streets of Lagos, the heart of Abuja, or thriving communities in Anambra—find, list, and secure properties across all 36 states and the FCT. Nationwide coverage, zero stress. Seamlessly search and list homes from commercial hubs like Lagos and Abuja to vibrant cities across every state in Nigeria</p>
            </div>
            <div style={s.featureCard} className="feature-card">
              <div style={{ ...s.featureIconWrap, backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>
              <Image
                src="/images/trust-list.jpg"
                alt="Landlord listing a property on Mr. Rent from a phone"
                width={600}
                height={340}
                className="trust-img"
              />
              <h3 style={s.featureTitle}>List in Minutes</h3>
              <p style={s.featureText}>List your property in under five minutes and connect directly with pre-screened, serious tenants. Mr. Rent cuts through the noise, delivering verified inquiries straight to your dashboard—so you fill vacancies faster with zero hassle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Ready to find your next home?</h2>
          <p style={s.ctaSubtitle}>Join hundreds of thousands of Nigerians who are already using Mr. Rent to find homes, list properties, and move in completely stress-free. From verified listings to hassle-free relocations, we handle the entire process so you can focus on settling in.</p>
          <div style={s.ctaActions}>
            <a href="/browse" style={s.btnCyan}>Browse Rentals</a>
            <a href="/list" style={{ ...s.btnTeal, backgroundColor: 'transparent', color: '#ffffff', border: '2px solid rgba(255,255,255,0.3)' }}>List a Property</a>
          </div>
        </div>
      </section>
{/* Footer */}
<footer style={s.footer}>
  <div style={s.footerCard} className="site-footer">
    <div style={s.footerTop}>
      <div style={{ ...s.navBrand, marginBottom: '0.5rem' }} className="footer-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Mr. Rent
      </div>
      <p style={s.footerTagline} className="footer-text">Find or list property for rent across Nigeria, quickly and securely.</p>
    </div>
    <div style={s.footerGrid} className="footer-grid">
      <div>
        <p style={s.footerHeading} className="footer-heading">Explore</p>
        <a href="/browse" className="footer-link" style={s.footerLink}>Browse Rentals</a>
        <a href="/list" className="footer-link" style={s.footerLink}>List Property</a>
        <a href="/veryland" className="footer-link" style={s.footerLink}>Verified Properties</a>
        <a href="/search" className="footer-link" style={s.footerLink}>AI Chat Assistant</a>
      </div>
      <div>
        <p style={s.footerHeading} className="footer-heading">Company</p>
        <a href="/about" className="footer-link" style={s.footerLink}>About Us</a>
        <a href="/support" className="footer-link" style={s.footerLink}>Contact &amp; Support</a>
        <a href="/faq" className="footer-link" style={s.footerLink}>FAQ</a>
        <a href="/affiliate" className="footer-link" style={s.footerLink}>Earn with Referrals</a>
      </div>
      <div>
        <p style={s.footerHeading} className="footer-heading">Legal</p>
        <a href="/privacy-policy" className="footer-link" style={s.footerLink}>Privacy Policy</a>
        <a href="/terms" className="footer-link" style={s.footerLink}>Terms of Service</a>
      </div>
    </div>
    <div style={s.footerBottom} className="footer-bottom">
      <span>© {new Date().getFullYear()} Mr. Rent. All rights reserved.</span>
    </div>
  </div>
</footer>
    </main>
  )
}

const s = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: '800',
    fontSize: '1.25rem',
    color: '#0f172a',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginRight: '1.5rem',
  },
  navBtn: {
    textDecoration: 'none',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  heroSection: {
    padding: '2rem 1rem',
  },
  heroOuter: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroInner: {
    background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><path d='M15 25 L25 15 L35 25 L35 40 L15 40 Z M21 40 L21 32 L29 32 L29 40' fill='none' stroke='%230ea5e9' stroke-width='1.2' opacity='0.07'/><path d='M75 20 A 4 4 0 1 0 75 28 A 4 4 0 1 0 75 20 M79 24 L92 24 L92 28 L88 28 L88 24' fill='none' stroke='%2314B8A6' stroke-width='1.2' opacity='0.07'/><path d='M20 70 A 5 5 0 0 1 30 70 C 30 77 25 83 25 83 C 25 83 20 77 20 70 Z' fill='none' stroke='%2314B8A6' stroke-width='1.2' opacity='0.07'/><path d='M65 60 L65 90 L85 90 L85 60 Z M70 66 L74 66 L74 70 L70 70 Z M76 66 L80 66 L80 70 L76 70 Z M70 76 L74 76 L74 80 L70 80 Z M76 76 L80 76 L80 80 L76 80 Z' fill='none' stroke='%230ea5e9' stroke-width='1.2' opacity='0.07'/></svg>") repeat, radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(20, 184, 166, 0.05), transparent 40%), #ffffff`,
    borderRadius: '24px',
    padding: '3rem 2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.12)',
  },
  heroLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'center',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.08',
    letterSpacing: '-0.01em',
    color: '#0f172a',
  },
  heroCyan: {
    color: '#0ea5e9',
  },
  heroTeal: {
    color: '#14b8a6',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: '1.6',
  },
  heroActionsPrimary: {
    display: 'flex',
    gap: '1rem',
  },
  btnCyan: {
    textDecoration: 'none',
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.5)',
  },
  btnTeal: {
    textDecoration: 'none',
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: '0 8px 20px -6px rgba(20, 184, 166, 0.5)',
  },
  heroActionsSecondary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  secondaryLink: {
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  trustRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
    marginTop: '0.5rem',
  },
  trustPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '0.4rem 0.8rem',
  },
  trustText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155',
    whiteSpace: 'nowrap',
  },
  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  makeMoneyBtn: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
    color: '#ffffff',
    padding: '0.6rem 1.4rem',
    borderRadius: '9999px',
    fontWeight: '800',
    fontSize: '0.95rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    boxShadow: '0 8px 20px -6px rgba(20, 184, 166, 0.55)',
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringTeal: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    border: '2px dashed rgba(20, 184, 166, 0.2)',
  },
  ringCyan: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    border: '2px dashed rgba(14, 165, 233, 0.2)',
  },
  avatarWrapper: {
    position: 'relative',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    border: '4px solid #ffffff',
    boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.25)',
  },
  avatarImage: {
    objectFit: 'cover',
    objectPosition: 'center 15%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: '0px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    padding: '0.6rem 1.2rem',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    maxWidth: '92%',
    whiteSpace: 'nowrap',
  },

  // Shared section styles
  sectionWrap: {
    padding: '4rem 1rem',
  },
  sectionInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHead: {
    textAlign: 'center',
    maxWidth: '560px',
    margin: '0 auto 2.5rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '0.5rem',
    letterSpacing: '-0.01em',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },

  // Hero scroll-down indicator
  scrollDownWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  scrollDownBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 18px -10px rgba(15, 23, 42, 0.25)',
    padding: 0,
  },

  // Featured Properties
  featuredHeadRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '2rem',
  },
  featuredSectionHead: {
    textAlign: 'left',
    maxWidth: '560px',
  },
  moreBtnDesktop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    textDecoration: 'none',
    color: '#0ea5e9',
    fontWeight: '700',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    marginTop: '0.25rem',
  },
  moreBtnMobile: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    textDecoration: 'none',
    color: '#0ea5e9',
    fontWeight: '700',
    fontSize: '0.95rem',
    marginTop: '1.25rem',
    padding: '0.6rem 1rem',
    borderRadius: '9999px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f1f5f9',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  featuredCard: {
    display: 'block',
    textDecoration: 'none',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px -16px rgba(15, 23, 42, 0.15)',
  },
  featuredImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    backgroundColor: '#f1f5f9',
  },
  featuredNoImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  featuredKindBadge: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
  },
  featuredVerifiedBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
  },
  featuredBody: {
    padding: '1.25rem',
  },
  featuredTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  featuredLocation: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.75rem',
  },
  featuredPriceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredPrice: {
    fontWeight: '800',
    color: '#0ea5e9',
    fontSize: '1rem',
  },
  featuredPricePeriod: {
    fontWeight: '600',
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  featuredBeds: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '600',
  },

  // How It Works
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  stepCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 24px -16px rgba(15, 23, 42, 0.15)',
  },
  stepNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  stepTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  stepText: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.6',
  },

  // Why Choose Us
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem',
  },
  featureIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.4rem',
  },
  featureText: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.6',
  },

  // Bottom CTA
  ctaSection: {
    background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
    padding: '4rem 1rem',
  },
  ctaInner: {
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01em',
  },
  ctaSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2rem',
  },
  ctaActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },

  // Footer
  footer: {
    backgroundColor: '#f8fafc',
    padding: '3rem 1rem 4rem',
  },
  footerCard: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '3rem 2rem',
    boxShadow: '0 20px 45px -25px rgba(15, 23, 42, 0.12)',
  },
  footerTop: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '2rem',
    marginBottom: '2rem',
  },
  footerTagline: {
    fontSize: '0.95rem',
    color: '#64748b',
    maxWidth: '420px',
    lineHeight: '1.6',
    margin: 0,
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
  },
  footerHeading: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  footerLink: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    textDecoration: 'none',
    marginBottom: '0.6rem',
    transition: 'color 0.2s',
  },
  footerBottom: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    textAlign: 'center',
  },
}