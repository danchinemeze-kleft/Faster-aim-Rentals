'use client'

import Link from 'next/link'

import { useState, useEffect, useMemo, useRef } from 'react'
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
  const heroRef = useRef(null)

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
      if (window.scrollY > 120) {
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
            transform: translateY(8px);
          }
        }

        @keyframes faimGlow {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(14, 165, 233, 0.2);
          }
          50% {
            box-shadow: 0 6px 20px rgba(244, 63, 94, 0.35), 0 0 0 1px rgba(244, 63, 94, 0.3);
          }
        }

        .faim-scroll-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 1.5rem;
          transition: opacity 0.5s ease, transform 0.5s ease;
          pointer-events: auto;
          cursor: pointer;
          user-select: none;
        }

        .faim-fade-out {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
        }

        .faim-scroll-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0f172a;
          color: #ffffff;
          padding: 0.45rem 0.9rem;
          border-radius: 9999px;
          border: 1px solid rgba(14, 165, 233, 0.35);
          animation: faimGlow 3s ease-in-out infinite, faimBobbing 1.5s ease-in-out infinite;
          text-decoration: none;
        }

        .faim-hand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .faim-scroll-text {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
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
              <button className="mobile-menu-close"