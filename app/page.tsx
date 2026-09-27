'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, CSSProperties } from 'react'
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
}

export default function Home() {
  const router = useRouter()
  const supabase = useSupabase()
  const [listingCount, setListingCount] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [user, setUser] = useState<any>(null)
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

  // Fetch listing count
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
      // localStorage unavailable
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
    let fadeTimer: NodeJS.Timeout
    let hideTimer: NodeJS.Timeout

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

  const displayCount = listingCount === null 
    ? '...' 
    : listingCount > 0 
      ? `${listingCount}+ real spaces available for rent` 
      : 'New real spaces added weekly'

  return (
    <main className={jakarta.className} style={s.main}>
      <style>{`
        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
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
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
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

        @keyframes faimBobbing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(7px); }
        }

        @keyframes faimPulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(14, 246, 204, 0.2), 0 0 0 1px rgba(14, 246, 204, 0.35); }
          50% { box-shadow: 0 6px 20px rgba(244, 63, 94, 0.3), 0 0 0 1px rgba(244, 63, 94, 0.45); }
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
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hero-layout { grid-template-columns: 1fr !important; }
          .hero-title-el { font-size: 2.1rem !important; line-height: 1.15 !important; }
          .steps-grid, .features-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
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
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/browse" style={s.navLink}>Browse Rentals</a>
          <a href="/list" style={s.navLink}>List Property</a>
          <a href="/veryland" style={{ ...s.navLink, color: '#0ea5e9', fontWeight: 700 }}>Verified Properties</a>
          <a href="/account" style={s.navBtn}>{user ? 'My Account' : 'Login / Sign up'}</a>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ background: 'none', border: '2px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}>☰</button>
      </nav>

      {/* Mobile Navigation Drawer */}
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
                  <span>Browse Rentals</span>
                </div>
              </Link>

              <Link href="/list" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>List Property</span>
                </div>
              </Link>

              <Link href="/veryland" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div className="mobile-menu-item mobile-menu-item-highlight">
                  <svg className="mobile-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Verified Properties</span>
                </div>
              </Link>
            </div>

            <div className="mobile-menu-footer">
              <Link href="/account" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div style={s.navBtn}>
                  {user ? 'My Account' : 'Login / Sign up'}
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={s.heroSection}>
        <div className="hero-layout" style={s.heroLayout}>
          <div>
            <span style={s.badge}>Verified Landlord Direct Connect</span>
            <h1 className="hero-title-el" style={s.heroTitle}>
              Find Your Next Apartment Without Agent Fees
            </h1>
            <p style={s.heroDesc}>
              Directly connect with genuine landlords, verify land titles, and rent properties seamlessly across Awka and beyond.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Link href="/browse" style={s.ctaPrimary}>
                Explore Listings
              </Link>
              <Link href="/list" style={s.ctaSecondary}>
                List a Property
              </Link>
            </div>

            <div style={s.liveCounter}>
              <span style={s.liveDot}></span>
              <span>{displayCount}</span>
            </div>

            {/* Scroll Indicator */}
            {showScrollIndicator && (
              <div 
                className={`faim-scroll-indicator ${isFadingOut ? 'faim-fade-out' : ''}`}
                onClick={handleScrollDownClick}
              >
                <div className="faim-scroll-pill">
                  <span className="faim-hand-icon-wrap">👇</span>
                  <span className="faim-scroll-text">Scroll to learn more</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={s.heroCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>100% Direct Landlords</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>No middleman markups</p>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
  &quot;Rented my 2-bedroom flat within 48 hours without paying agency or inspection fees.&quot;
</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={s.section}>
        <h2 style={s.sectionTitle}>How Mr. Rent Works</h2>
        <p style={s.sectionSub}>Rent or list property in three simple steps</p>

        <div className="steps-grid" style={s.grid3}>
          <div className="feature-card" style={s.card}>
            <div style={s.cardStep}>1</div>
            <h3 style={s.cardTitle}>Search Listings</h3>
            <p style={s.cardDesc}>Browse verified apartments, shops, and land available directly from property owners.</p>
          </div>
          <div className="feature-card" style={s.card}>
            <div style={s.cardStep}>2</div>
            <h3 style={s.cardTitle}>Unlock Owner Contact</h3>
            <p style={s.cardDesc}>Unlock direct landlord phone numbers and inspection schedules for a transparent connection.</p>
          </div>
          <div className="feature-card" style={s.card}>
            <div style={s.cardStep}>3</div>
            <h3 style={s.cardTitle}>Inspect & Rent</h3>
            <p style={s.cardDesc}>Inspect the property, verify documents, and pay directly to the landlord securely.</p>
          </div>
        </div>
      </section>

      {/* Floating Welcome Bubble */}
      {showBubble && (
        <div style={s.bubbleWrap}>
          <div style={s.bubbleCard}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
              Looking to rent or list a property today?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleBubbleYes} style={s.bubbleBtnPrimary}>Get Started</button>
              <button onClick={handleBubbleNo} style={s.bubbleBtnSecondary}>Learn More</button>
              <button onClick={dismissBubble} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={s.footer}>
        <div className="footer-grid" style={s.footerGrid}>
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Mr. Rent</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Empowering direct property rentals and transparent real estate transactions.
            </p>
          </div>
          <div>
            <h5 style={{ color: '#ffffff', marginBottom: '0.75rem' }}>Quick Links</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/browse" className="footer-link" style={s.footerLink}>Browse Rentals</Link>
              <Link href="/list" className="footer-link" style={s.footerLink}>List Property</Link>
              <Link href="/veryland" className="footer-link" style={s.footerLink}>VeryLand Audit</Link>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#ffffff', marginBottom: '0.75rem' }}>Legal</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/terms" className="footer-link" style={s.footerLink}>Terms of Service</Link>
              <Link href="/privacy" className="footer-link" style={s.footerLink}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #334155', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Mr. Rent (Faster Aim Technology Limited). All rights reserved.
        </div>
      </footer>
    </main>
  )
}

// Inline Stylesheet Object
const s: Record<string, CSSProperties> = {
  main: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#0f172a',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  navBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    textAlign: 'center',
    display: 'inline-block',
  },
  heroSection: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    color: '#0ea5e9',
    fontWeight: 700,
    fontSize: '0.8rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    marginBottom: '1rem',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1,
    margin: '0 0 1rem 0',
  },
  heroDesc: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  ctaPrimary: {
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    padding: '0.8rem 1.6rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
  },
  ctaSecondary: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '0.8rem 1.6rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
  },
  liveCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '400px',
  },
  section: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 0.5rem 0',
  },
  sectionSub: {
    textAlign: 'center',
    color: '#64748b',
    margin: '0 0 3rem 0',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  cardStep: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    color: '#0ea5e9',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
  },
  cardDesc: {
    color: '#64748b',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    margin: 0,
  },
  bubbleWrap: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 999,
  },
  bubbleCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    maxWidth: '320px',
  },
  bubbleBtnPrimary: {
    backgroundColor: '#0ea5e9',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  bubbleBtnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  footer: {
    backgroundColor: '#0f172a',
    padding: '4rem 2rem 2rem 2rem',
  },
  footerGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '3rem',
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
}