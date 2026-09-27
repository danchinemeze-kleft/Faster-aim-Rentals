'use client'

import Link from 'next/link'
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

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
  }, [supabase])

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

  // Scroll Down Indicator: Auto fade out after 5s or early on scrolling past hero
  useEffect(() => {
    let fadeTimer
    let hideTimer

    const dismissIndicator = () => {
      setIsFadingOut(true)
      hideTimer = setTimeout(() => {
        setShowScrollIndicator(false)
      }, 500)
    }

    fadeTimer = setTimeout(() => {
      dismissIndicator()
    }, 5000)

    const handleScroll = () => {
      if (window.scrollY > 100) {
        dismissIndicator()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
      window.removeEventListener('scroll', handleScroll)
    }
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

  const handleScrollDownClick = () => {
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
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

        /* Animated Scroll Indicator */
        @keyframes faimBobbing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(7px);
          }
        }

        @keyframes faimPulse {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(14, 246, 204, 0.2), 0 0 0 1px rgba(14, 246, 204, 0.35);
          }
          50% {
            box-shadow: 0 6px 20px rgba(244, 63, 94, 0.3), 0 0 0 1px rgba(244, 63, 94, 0.45);
          }
        }

        .faim-scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          transition: opacity 0.5s ease, transform 0.5s ease;
          user-select: none;
          cursor: pointer;
        }

        .faim-scroll-indicator.faim-fade-out {
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
        }

        .faim-scroll-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #0f172a;
          color: #ffffff;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(14, 246, 204, 0.3);
          animation: faimPulse 3s ease-in-out infinite;
          text-decoration: none;
          backdrop-filter: blur(8px);
        }

        .faim-hand-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: faimBobbing 1.5s ease-in-out infinite;
        }

        .faim-scroll-text {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #0ef6cc 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
        }
      `}</style>

      <Breadcrumb theme="light" items={[{ label: 'Mr. Rent', href: '/' }]} />
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', color: '#0ea5e9' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mr. Rent
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <a href="/browse" style={s.navLink}>Browse Rentals</a>
          <a href="/list" style={s.navLink}>List Property</a>
          <a href="/veryland" style={{ ...s.navLink, color: '#0ea5e9', fontWeight: 700 }}>Verified Properties</a>
          <a href="/account" style={s.navBtn}>Login / Sign up</a>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px', color: '#0ea5e9', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ verticalAlign: 'middle' }}>Mr. Rent</span>
              </div>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">&times;</button>
            </div>

            {/* 2. Primary Navigation */}
            <div className="mobile-menu-group">
              <Link href="/browse" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Browse Rentals
                </div>
              </Link>
              <Link href="/list" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  List Property
                </div>
              </Link>
              <Link href="/veryland" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item mobile-menu-item-highlight">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  Verified Properties
                </div>
              </Link>
              <Link href="/affiliate" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Affiliates
                </div>
              </Link>
            </div>

            {/* 3. Account Action */}
            <div className="mobile-menu-footer">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                style={{
                  ...s.navBtn,
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  borderRadius: '10px'
                }}
              >
                Login / Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={s.hero}>
        <div style={s.heroWrap}>
          <div className="hero-layout" style={s.heroLayout}>
            {/* Left Column: Text & CTAs */}
            <div>
              <div style={s.badge}>
                <span style={s.badgeDot}></span>
                Zero Agent Fees &bull; 100% Direct Landlords
              </div>

              <h1 className="hero-title-el" style={s.heroTitle}>
                Direct from landlords.{' '}
                <span style={s.heroGradient}>Zero agency fee.</span>
              </h1>

              <p style={s.heroSub}>
                Browse genuine properties listed by owners across Nigeria. Connect directly with no middlemen, no inflated inspection charges, and no hidden commission fees.
              </p>

              <div style={s.heroCtas}>
                <Link href="/browse" style={s.btnPrimary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Find a home</span>
                </Link>
                <Link href="/list" style={s.btnSecondary}>
                  <span>List a property</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>

              <div style={s.livePill}>
                <span style={s.liveDot}></span>
                <span style={s.liveCount}>{displayCount}</span>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div style={s.heroImgWrap}>
              <div style={s.heroImgCard}>
                <Image
                  src="/images/hero-modern-apartment.jpg"
                  alt="Modern apartment interior in Nigeria"
                  width={640}
                  height={440}
                  priority
                  style={s.heroImg}
                />
                <div style={s.heroImgOverlay}>
                  <span style={s.heroImgTag}>Direct listing &bull; Verified landlord</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Scroll Down Indicator */}
          {showScrollIndicator && (
            <div
              className={`faim-scroll-indicator ${isFadingOut ? 'faim-fade-out' : ''}`}
              onClick={handleScrollDownClick}
              role="button"
              tabIndex={0}
              aria-label="Scroll down to learn how it works"
            >
              <div className="faim-scroll-pill">
                <span className="faim-hand-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" stroke="#0ef6cc" />
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" stroke="#0ef6cc" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" stroke="#0ef6cc" />
                    <path d="M10 8V3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" stroke="#f43f5e" />
                    <path d="M12 19v3" stroke="#0ef6cc" />
                    <path d="M9 22h6" stroke="#0ef6cc" />
                  </svg>
                </span>
                <span className="faim-scroll-text">Scroll Down</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={s.stepsSec}>
        <div style={s.secWrap}>
          <div style={s.secHeader}>
            <span style={s.secTag}>Simple process</span>
            <h2 style={s.secTitle}>How Mr. Rent works</h2>
            <p style={s.secSub}>Three straightforward steps to finding your next apartment without paying a single kobo in agent commission.</p>
          </div>

          <div className="steps-grid" style={s.stepsGrid}>
            <div className="feature-card" style={s.stepCard}>
              <div style={s.stepNum}>01</div>
              <div style={s.stepIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 style={s.stepTitle}>Browse listings</h3>
              <p style={s.stepDesc}>Filter by location, price, property type, and amenities. View full photo galleries and exact pricing upfront.</p>
            </div>

            <div className="feature-card" style={s.stepCard}>
              <div style={s.stepNum}>02</div>
              <div style={s.stepIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0