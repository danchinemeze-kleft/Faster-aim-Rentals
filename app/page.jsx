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

const s = {
  main: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#0f172a',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    zIndex: 50,
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 800,
    fontSize: '1.25rem',
    color: '#0f172a',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    marginRight: '1.75rem',
  },
  navBtn: {
    background: '#0f172a',
    color: '#fff',
    padding: '0.6rem 1.35rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  hero: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '4.5rem 2rem 2rem',
  },
  heroLayout: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '3rem',
    alignItems: 'center',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0ea5e9',
    background: 'rgba(14,165,233,0.08)',
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    marginBottom: '1.25rem',
  },
  heroTitle: {
    fontSize: '3rem',
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    margin: '0 0 1.25rem',
    color: '#0f172a',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: '#475569',
    lineHeight: 1.7,
    marginBottom: '1.75rem',
    maxWidth: '520px',
  },
  heroCtaRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
  },
  ctaPrimary: {
    background: '#0f172a',
    color: '#fff',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  ctaSecondary: {
    background: '#fff',
    color: '#0f172a',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.95rem',
    border: '1.5px solid #e2e8f0',
  },
  listingCountText: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
  },
  heroImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: '20px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)',
  },
  section: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '3.5rem 2rem',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 0.5rem',
  },
  sectionSubtitle: {
    fontSize: '0.98rem',
    color: '#64748b',
    maxWidth: '520px',
    margin: '0 auto',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  stepCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.75rem',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#0f172a',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 0.5rem',
  },
  stepText: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.75rem',
  },
  featureIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.85rem',
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 0.4rem',
  },
  featureText: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    padding: '3rem 2rem 2rem',
  },
  footerInner: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  footerHeading: {
    fontSize: '0.8rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#0f172a',
    marginBottom: '0.35rem',
  },
  footerLinkStyle: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.88rem',
  },
  footerBottom: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
    fontSize: '0.8rem',
    color: '#94a3b8',
    textAlign: 'center',
  },
  bubbleWrap: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 200,
    maxWidth: '300px',
    background: '#0f172a',
    color: '#fff',
    borderRadius: '16px',
    padding: '1.1rem 1.25rem',
    boxShadow: '0 12px 32px rgba(15,23,42,0.25)',
  },
  bubbleText: {
    fontSize: '0.88rem',
    lineHeight: 1.5,
    marginBottom: '0.9rem',
  },
  bubbleBtnRow: {
    display: 'flex',
    gap: '0.6rem',
  },
  bubbleYes: {
    flex: 1,
    background: '#0ea5e9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  bubbleNo: {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '0.55rem',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
}

const STEPS = [
  { title: 'Search or Browse', text: 'Look through verified listings across Nigeria, or chat with Mr. Rent AI to find exactly what fits your budget.' },
  { title: 'Connect Directly', text: 'Reveal a landlord\u2019s contact for a small one-time fee — no agent middlemen, no hidden markups.' },
  { title: 'Move In Safely', text: 'Verified listings carry document checks, so you can transact with real confidence.' },
]

const FEATURES = [
  { icon: '\u2705', title: 'Verified Listings', text: 'Documents checked before a listing goes live, so what you see is what\u2019s real.' },
  { icon: '\u{1F4AC}', title: 'Mr. Rent AI', text: 'Ask in plain language and get matched to properties that actually fit your needs.' },
  { icon: '\u{1F4B3}', title: 'Secure Payments', text: 'All transactions run through Paystack — no cash handed to strangers.' },
]

export default function Home() {
  const router = useRouter()
  const supabase = useSupabase()
  const [listingCount, setListingCount] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [user, setUser] = useState(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

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

  useEffect(() => {
    try {
      const seen = localStorage.getItem('mrRentBubbleSeen')
      if (!seen) {
        const timer = setTimeout(() => {
          setShowBubble(true)
        }, 6000)
        return () => clearTimeout(timer)
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        localStorage.setItem('mrRentAffiliate', ref)
      }
    } catch (e) {}
  }, [])

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
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(15, 23, 42, 0.6); z-index: 9999;
          display: flex; justify-content: flex-end;
        }
        .mobile-menu-panel {
          background-color: #ffffff; width: 85%; max-width: 360px; height: 100%;
          box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
          display: flex; flex-direction: column; padding: 1.5rem;
          overflow-y: auto; box-sizing: border-box;
        }
        .mobile-menu-header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;
        }
        .mobile-menu-close { background: none; border: none; font-size: 2rem; color: #64748b; cursor: pointer; line-height: 1; }
        .mobile-menu-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .mobile-menu-item {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
          border-radius: 8px; text-decoration: none; color: #475569;
          font-weight: 600; font-size: 0.95rem; transition: background-color 0.2s;
        }
        .mobile-menu-item:hover { background-color: #f1f5f9; color: #0f172a; }
        .mobile-menu-item-highlight { color: #0ea5e9; background-color: rgba(14, 165, 233, 0.05); }
        .mobile-menu-item-highlight:hover { background-color: rgba(14, 165, 233, 0.1); }
        .mobile-menu-icon { flex-shrink: 0; color: #64748b; }
        .mobile-menu-item-highlight .mobile-menu-icon { color: #0ea5e9; }
        .mobile-menu-footer { margin-top: 1.5rem; }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12); }
        .footer-link:hover { color: #0ea5e9; }

        @keyframes faimBobbing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
        @keyframes faimPulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(14, 246, 204, 0.2), 0 0 0 1px rgba(14, 246, 204, 0.35); }
          50% { box-shadow: 0 6px 20px rgba(244, 63, 94, 0.3), 0 0 0 1px rgba(244, 63, 94, 0.45); }
        }
        .faim-scroll-indicator {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 60;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: opacity 0.5s ease, transform 0.5s ease;
          user-select: none; cursor: pointer;
        }
        .faim-scroll-indicator.faim-fade-out {
          opacity: 0;
          transform: translate(-50%, calc(-50% + 10px));
          pointer-events: none;
        }
        .faim-scroll-pill {
          display: inline-flex; align-items: center; gap: 0.45rem;
          background: #0f172a; color: #ffffff; padding: 0.4rem 0.85rem;
          border-radius: 9999px; border: 1px solid rgba(14, 246, 204, 0.3);
          animation: faimPulse 3s ease-in-out infinite; text-decoration: none; backdrop-filter: blur(8px);
        }
        .faim-scroll-text {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          background: linear-gradient(90deg, #0ef6cc 0%, #f43f5e 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* Floating pointing-hand effect */
        .faim-hand-stage {
          position: relative;
          width: 64px;
          height: 76px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .faim-hand-icon-wrap {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: faimHandFloat 1.6s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
        }
        .faim-hand-ring {
          position: absolute;
          top: -6px;
          left: 50%;
          width: 28px;
          height: 28px;
          margin-left: -14px;
          border-radius: 50%;
          border: 2px solid #0ef6cc;
          opacity: 0;
          animation: faimRingPulse 1.6s ease-out infinite;
        }
        .faim-hand-ring--delay {
          animation-delay: 0.55s;
        }
        @keyframes faimHandFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(10px) rotate(2deg); }
        }
        @keyframes faimRingPulse {
          0% { transform: scale(0.6); opacity: 0.65; }
          80% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @media (min-width: 769px) { .nav-hamburger { display: none !important; } }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hero-layout { grid-template-columns: 1fr !important; }
          .hero-title-el { font-size: 2.1rem !important; line-height: 1.15 !important; }
          .steps-grid, .features-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

      <Breadcrumb theme="light" items={[{ label: 'Mr. Rent', href: '/' }]} />
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', color: '#0ea5e9' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mr. Rent
        </div>

        <div className="nav-links-desktop">
          <a href="/browse" style={s.navLink}>Browse Rentals</a>
          <a href="/list" style={s.navLink}>List Property</a>
          <a href="/veryland" style={{ ...s.navLink, color: '#0ea5e9', fontWeight: 700 }}>Verified Properties</a>
          <a href={user ? '/my-account' : '/account'} style={s.navBtn}>{user ? 'My Account' : 'Login / Sign up'}</a>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ background: 'none', border: '2px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}>☰</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
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
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  List Property
                </div>
              </Link>

              <Link href="/veryland" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item mobile-menu-item-highlight">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  Verified Properties
                </div>
              </Link>
            </div>

            <div className="mobile-menu-footer">
              <Link href={user ? '/my-account' : '/account'} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div style={{ ...s.navBtn, textAlign: 'center', display: 'block' }}>
                  {user ? 'My Account' : 'Login / Sign up'}
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      <section style={s.hero}>
        <div className="hero-layout" style={s.heroLayout}>
          <div>
            <span style={s.eyebrow}>Verified rentals across Nigeria</span>
            <h1 className="hero-title-el" style={s.heroTitle}>Find your next home — without the scam.</h1>
            <p style={s.heroSubtitle}>
              Search, chat with Mr. Rent AI, or browse verified listings. Connect directly with landlords, pay only when you're ready — no agent runaround.
            </p>
            <div style={s.heroCtaRow}>
              <a href="/search" style={s.ctaPrimary}>Ask Mr. Rent AI</a>
              <a href="/browse" style={s.ctaSecondary}>Browse Listings</a>
            </div>
            <p style={s.listingCountText}>{displayCount}</p>
          </div>

          <div style={s.heroImageWrap}>
            <Image
              src="/hero-property.jpg"
              alt="Verified rental property in Nigeria"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {showScrollIndicator && (
          <div
            className={`faim-scroll-indicator${isFadingOut ? ' faim-fade-out' : ''}`}
            onClick={handleScrollDownClick}
          >
            <div className="faim-hand-stage">
              <span className="faim-hand-ring"></span>
              <span className="faim-hand-ring faim-hand-ring--delay"></span>
              <span className="faim-hand-icon-wrap">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 3v8.5M12 11.5c-1.1 0-2 .9-2 2v3.2c0 2.4 1.9 4.3 4.3 4.3h.4c2.1 0 3.8-1.5 4.2-3.5l1-4.8c.2-1-.5-1.9-1.5-1.9-.5 0-.9.3-1.1.7l-.8 1.6V6.5c0-.8-.7-1.5-1.5-1.5S13 5.7 13 6.5V11"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="#ffffff"
                  />
                  <path
                    d="M10 11.5c-.6 0-1.1.2-1.5.6l-1.8 1.8c-.5.5-.5 1.3 0 1.8.5.5 1.3.5 1.8 0l.5-.5"
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="#ffffff"
                  />
                </svg>
              </span>
            </div>
            <span className="faim-scroll-text" style={{ marginTop: '0.35rem' }}>Scroll down</span>
          </div>
        )}
      </section>

      <section id="how-it-works" style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>How Mr. Rent works</h2>
          <p style={s.sectionSubtitle}>Three simple steps between you and your next home.</p>
        </div>
        <div className="steps-grid" style={s.stepsGrid}>
          {STEPS.map((step, i) => (
            <div key={step.title} style={s.stepCard}>
              <div style={s.stepNumber}>{i + 1}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...s.section, background: '#f8fafc' }}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Built for trust</h2>
          <p style={s.sectionSubtitle}>Every feature exists to keep tenants and landlords safe.</p>
        </div>
        <div className="features-grid" style={s.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card" style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureText}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div className="footer-grid" style={s.footerGrid}>
            <div style={s.footerCol}>
              <div style={s.navBrand}>Mr. Rent</div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Find your next home in Nigeria — verified, direct, and scam-free.
              </p>
            </div>
            <div style={s.footerCol}>
              <span style={s.footerHeading}>Explore</span>
              <a href="/browse" className="footer-link" style={s.footerLinkStyle}>Browse Rentals</a>
              <a href="/buy" className="footer-link" style={s.footerLinkStyle}>Buy Property</a>
              <a href="/list" className="footer-link" style={s.footerLinkStyle}>List Property</a>
              <a href="/search" className="footer-link" style={s.footerLinkStyle}>Mr. Rent AI</a>
            </div>
            <div style={s.footerCol}>
              <span style={s.footerHeading}>Company</span>
              <a href="/about" className="footer-link" style={s.footerLinkStyle}>About Us</a>
              <a href="/contact" className="footer-link" style={s.footerLinkStyle}>Contact</a>
              <a href="/affiliate" className="footer-link" style={s.footerLinkStyle}>Affiliate Program</a>
            </div>
            <div style={s.footerCol}>
              <span style={s.footerHeading}>Legal</span>
              <a href="/privacy-policy" className="footer-link" style={s.footerLinkStyle}>Privacy Policy</a>
              <a href="/terms-of-service" className="footer-link" style={s.footerLinkStyle}>Terms of Service</a>
              <a href="/refund-policy" className="footer-link" style={s.footerLinkStyle}>Refund Policy</a>
            </div>
          </div>
          <div style={s.footerBottom}>
            © {new Date().getFullYear()} Faster Aim Technology Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {showBubble && (
        <div style={s.bubbleWrap}>
          <p style={s.bubbleText}>👋 New here? Want me to show you around and get your account set up?</p>
          <div style={s.bubbleBtnRow}>
            <button style={s.bubbleYes} onClick={handleBubbleYes}>Yes, let's go</button>
            <button style={s.bubbleNo} onClick={handleBubbleNo}>Not now</button>
          </div>
        </div>
      )}
    </main>
  )
}