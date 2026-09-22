'use client'

import Link from 'next/link'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from './components/Breadcrumb'

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

  useEffect(() => {
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setListingCount(count) })
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

  const displayCount = listingCount === null ? '...' : listingCount > 0 ? `${listingCount}+` : 'New'

  return (
    <main style={s.main}>
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
            </div>

            {/* 5. Login/Sign-up Button */}
            <div className="mobile-menu-footer">
              <a href="/account" style={{ ...s.navBtn, display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem' }} onClick={() => setMenuOpen(false)}>
                Login / Sign up
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={s.heroSection} className="hero-section">
        <div style={s.heroOuter} className="hero-outer">
          <div style={s.heroInner} className="hero-inner">
            <div style={s.heroLayout} className="hero-layout">
              <div style={s.heroText}>
                <div style={s.heroBadge}>🇳🇬 Nigeria Nationwide</div>
                <h1 style={s.heroTitle} className="hero-title-el">
                  Find or List<br />
                  <span style={s.heroCyan}>Property for Rent</span><br />
                  <span style={s.heroTeal}>Quickly & Securely</span>
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
                <div style={s.heroStats}>
                  <div style={s.heroStat}>
                    <span style={s.statValueCyan}>{displayCount}</span>
                    <span style={s.statLabel}>Active Homes</span>
                  </div>
                  <div style={s.statDivider}></div>
                  <div style={s.heroStat}>
                    <span style={s.statValueTeal}>36</span>
                    <span style={s.statLabel}>States</span>
                  </div>
                </div>
              </div>

              <div style={s.avatarContainer} className="avatar-cont">
                <div style={s.ringTeal} className="ring-teal"></div>
                <div style={s.ringCyan} className="ring-cyan"></div>
                <a href="/search" style={{ display: 'block', borderRadius: '50%' }}>
                  <div style={s.avatarWrapper} className="avatar-wrap">
                    <Image
                      src="/mr-rent-avatar.png"
                      alt="Mr. Rent"
                      width={320}
                      height={380}
                      style={s.avatarImage}
                      priority
                    />
                  </div>
                </a>
                <div style={s.verifiedBadge} className="verified-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#14B8A6', flexShrink: 0 }}>
                    <path d="M9 16.17L4.83 12m0 0L3 13.83m1.83-1.83l5.34 5.34 9.84-9.84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>Real People</div>
                    <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '2px' }}>Verified landlords</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section style={{ padding: '4rem 2rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>Every landlord is real</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: '500', textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            We verify identity and property documents on Veryland before you see a listing. No anonymity, no hidden owners.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '1', title: 'ID Verified', desc: 'Landlord identity confirmed through official documents' },
              { icon: '2', title: 'Documents Checked', desc: 'Property ownership validated with C of O or deed' },
              { icon: '3', title: 'Badge Earned', desc: 'Verified landlords display trusted badge on listings' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', background: `${CYAN}15`, border: `2px solid ${CYAN}44`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: CYAN, fontSize: '1.2rem', marginBottom: '1rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionTag}>— HOW IT WORKS —</p>
          <h2 style={s.sectionTitle}>Simple. Fast. <span style={s.heroCyan}>Secure.</span></h2>
          <div style={s.stepsGrid} className="steps-grid-el">
            {[
              { title: 'Browse Listings', desc: 'Search properties by location, budget, and type across all 36 states.', color: '#0ea5e9', link: '/browse', svgPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z' },
              { title: 'Connect with AI', desc: 'Use our assistant to ask questions and get personalized property recommendations.', color: '#14B8A6', link: '/search', svgPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              { title: 'Reveal Contact', desc: "Pay ₦5,000 to instantly reveal the landlord's verified contact information.", color: '#0ea5e9', link: '/browse', svgPath: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
              { title: 'Move In', desc: 'Contact your verified landlord directly and arrange your inspection and move-in.', color: '#14B8A6', link: '/browse', svgPath: 'M3 12l2.889-2.889m0 0L9.778 3m-5.889 8.889L3 21m16-10.778L21 3m0 0l-2.889 2.889m2.889-2.889l-5.889 5.889M21 21l-2.889-2.889' },
            ].map((step, i) => (
              <a href={step.link} key={i} style={{ ...s.stepCard, borderColor: step.color + '44', textDecoration: 'none', display: 'block' }}>
                <div style={{ ...s.stepNumber, color: step.color }}>0{i + 1}</div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="1.5" style={{ marginBottom: '1rem', color: step.color }}>
                  <path d={step.svgPath} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 style={{ ...s.stepTitle, color: step.color }}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Buy & Sell — new product */}
      <section style={{ padding:'4rem 2rem', background:'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fbbf24', color:'#080a0f', padding:'4px 14px', borderRadius:20, fontSize:'0.68rem', fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1rem' }}>
            <span style={{ color: '#080a0f' }}>★</span> New Feature
          </div>
          <h2 style={{ fontSize:'2rem', fontWeight:900, color:'#0f172a', margin:'0 0 0.75rem', letterSpacing:'-0.5px' }}>
            Now Also: <span style={s.heroCyan}>Buy</span> &amp; <span style={s.heroPink}>Sell</span> Property
          </h2>
          <p style={{ color:'#475569', fontSize:'0.92rem', fontWeight:600, lineHeight:1.75, marginBottom:'2.5rem', maxWidth:'540px', margin:'0 auto 2.5rem' }}>
            Beyond rentals — browse land and properties for sale across Nigeria, or list yours to reach thousands of buyers.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="buy-sell-grid">
            <Link href="/buy" style={{ background:'#ffffff', border:`2px solid ${CYAN}55`, borderRadius:18, padding:'2rem', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, boxShadow:`0 4px 24px ${CYAN}22`, position:'relative', overflow:'hidden' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{ fontWeight: '700', fontSize:'1.15rem', color:'#0f172a' }}>Buy Property</div>
              <p style={{ color:'#475569', fontSize:'0.84rem', fontWeight:600, lineHeight:1.7, margin:0, textAlign:'left' }}>Browse verified land and houses for sale. Contact sellers directly — free for logged-in users. No hidden fees.</p>
              <span style={{ background:`${CYAN}15`, border:`1px solid ${CYAN}44`, color:CYAN, borderRadius:20, padding:'3px 12px', fontSize:'0.78rem', fontWeight:800, marginTop:4 }}>Free to browse</span>
              <div style={{ display:'inline-block', background:`linear-gradient(135deg,${CYAN},#0284c7)`, color:'white', padding:'9px 20px', borderRadius:9, fontWeight:800, fontSize:'0.85rem', marginTop:4 }}>Browse Properties →</div>
              <div style={{ position:'absolute', top:14, right:14, background:'#fbbf24', color:'#080a0f', fontSize:'0.62rem', fontWeight:900, borderRadius:5, padding:'2px 7px', letterSpacing:'0.06em' }}>NEW</div>
            </Link>
            <Link href="/sell" style={{ background:'#ffffff', border:`2px solid ${TEAL}55`, borderRadius:18, padding:'2rem', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, boxShadow:`0 4px 24px ${TEAL}22`, position:'relative', overflow:'hidden' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5m-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11m3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{ fontWeight: '700', fontSize:'1.15rem', color:'#0f172a' }}>Sell Property</div>
              <p style={{ color:'#475569', fontSize:'0.84rem', fontWeight:600, lineHeight:1.7, margin:0, textAlign:'left' }}>List your land or house and reach thousands of serious buyers. One-time fee, listing stays live until sold.</p>
              <span style={{ background:`${TEAL}10`, border:`1px solid ${TEAL}44`, color:TEAL, borderRadius:20, padding:'3px 12px', fontSize:'0.78rem', fontWeight:800, marginTop:4 }}>₦20,000 listing fee</span>
              <div style={{ display:'inline-block', background:`linear-gradient(135deg,${TEAL},#0D9488)`, color:'white', padding:'9px 20px', borderRadius:9, fontWeight:800, fontSize:'0.85rem', marginTop:4 }}>List for Sale →</div>
              <div style={{ position:'absolute', top:14, right:14, background:'#fbbf24', color:'#080a0f', fontSize:'0.62rem', fontWeight:900, borderRadius:5, padding:'2px 7px', letterSpacing:'0.06em' }}>NEW</div>
            </Link>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section style={s.landlordSection}>
        <div style={s.landlordInner}>
          <div style={s.landlordContent} className="landlord-cont">
            <div style={s.landlordText}>
              <p style={s.sectionTag}>— FOR LANDLORDS —</p>
              <h2 style={{ ...s.sectionTitle, textAlign: 'left', marginBottom: '1rem' }}>
                List Your Property.<br />
                <span style={s.heroPink}>Reach Thousands.</span>
              </h2>
              <p style={s.landlordDesc}>
                Subscribe for ₦10,000/month and list unlimited properties. Tenants pay ₦5,000 to reveal your contact — you earn from every serious inquiry.
              </p>
              <ul style={s.featureList}>
                {['Unlimited property listings', 'Appear in AI-powered searches', 'Earn from contact reveals', 'Professional landlord dashboard', 'Real-time availability control'].map((f, i) => (
                  <li key={i} style={s.featureItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5" style={{ flexShrink: 0, marginRight: '6px' }}>
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/account" style={s.btnCyan}>Get Started →</a>
            </div>
            <div style={s.pricingCard} className="pricing-card">
              <p style={s.pricingLabel}>LANDLORD PLAN</p>
              <div style={s.pricingAmount}>
                <span style={s.pricingCurrency}>₦</span>
                <span style={s.pricingValue}>10,000</span>
              </div>
              <p style={s.pricingPer}>/month</p>
              <div style={s.pricingFeatures}>
                <p>✓ Unlimited listings</p>
                <p>✓ Dashboard access</p>
                <p>✓ AI promotion</p>
                <p>✓ Cancel anytime</p>
              </div>
              <a href="/account" style={s.btnTeal}>Subscribe Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <p style={s.sectionTag}>— JOIN MR. RENT —</p>
        <h2 style={s.ctaTitle} className="cta-title">Your Next Home is<br /><span style={s.heroCyan}>One Click Away</span></h2>
        <p style={s.ctaSubtitle}>Join thousands of Nigerians finding and listing homes on Mr. Rent</p>
        <div style={{ ...s.heroActions, margin: '0 auto 2.5rem' }}>
          <a href="/browse" style={s.btnCyan}>Browse Listings</a>
          <a href="/search" style={s.btnTeal}>Ask Mr. Rent AI 🤖</a>
          <a href="/list" style={s.btnOutline}>Add Your Property 🏠</a>
          <a href="https://fasteraim.com" target="_blank" rel="noopener noreferrer" style={s.btnCyan}>Learn AI Skills 🎓</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerGrid} className="footer-grid">
          <div style={s.footerBrandCol}>
            <div style={s.footerBrand}>🏠 Mr. Rent</div>
            <p style={s.footerDesc}>Nigerian property rental platform powered by AI</p>
          </div>

          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Explore</p>
            <a href="/browse" style={s.footerLink}>Browse Rentals</a>
            <Link href="/buy" style={s.footerLink}>Buy Property</Link>
            <Link href="/sell" style={s.footerLink}>Sell Property</Link>
            <a href="/search" style={s.footerLink}>AI Chat</a>
            <a href="/list" style={s.footerLink}>List for Rent</a>
            <a href="/veryland" style={{ ...s.footerLink, color: '#1877F2', fontWeight: 800 }}>Veryland</a>
          </div>

          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Account</p>
            <a href="/account" style={s.footerLink}>Login / Sign Up</a>
            <a href="/my-account" style={s.footerLink}>My Account</a>
            <a href="/affiliate" style={{ ...s.footerLink, color: '#14B8A6', fontWeight: 700 }}>💰 Earn — Affiliate</a>
            <a href="/admin" style={s.footerAdminLink}>⚙ Admin</a>
          </div>

          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Support</p>
            <a href="/support" style={s.footerLink}>Support</a>
            <a href="/feedback" style={s.footerLink}>Feedback</a>
            <a href="/contact" style={s.footerLink}>Contact Us</a>
          </div>

          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Legal</p>
            <a href="/privacy-policy" style={s.footerLink}>Privacy Policy</a>
            <a href="/terms" style={s.footerLink}>Terms of Service</a>
            <a href="/refund-policy" style={s.footerLink}>Refund Policy</a>
          </div>
        </div>

        <hr style={s.footerDivider} />
        <p style={s.footerCopy}>© 2026 Faster Aim Technology Limited. All rights reserved.</p>
      </footer>

      {/* Floating welcome chat bubble */}
      {showBubble && (
        <div style={s.chatBubbleWrap} className="chat-bubble-wrap">
          <div style={s.chatBubbleCard} className="chat-bubble-card">
            <button onClick={dismissBubble} style={s.chatBubbleClose} aria-label="Close">✕</button>
            <div style={s.chatBubbleHeader}>
              <div style={s.chatBubbleAvatarWrap}>
                <Image
                  src="/mr-rent-avatar.png"
                  alt="Mr. Rent"
                  width={44}
                  height={44}
                  style={s.chatBubbleAvatar}
                />
              </div>
              <div>
                <div style={s.chatBubbleName}>Mr. Rent</div>
                <div style={s.chatBubbleStatus}><span style={s.chatBubbleDot}></span>Online now</div>
              </div>
            </div>
            <p style={s.chatBubbleText}>Hey, welcome! 👋 I&apos;m Mr. Rent. Please, can you tell me about yourself?</p>
            <div style={s.chatBubbleActions}>
              <button onClick={handleBubbleYes} style={s.chatBubbleYesBtn}>Yes, sure!</button>
              <button onClick={handleBubbleNo} style={s.chatBubbleNoBtn}>No, thanks</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #ffffff; }
        a { text-decoration: none; }

        /* ---- Desktop vs Mobile Nav ---- */
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none;
          }
          .nav-hamburger {
            display: flex !important;
          }
        }

        /* ---- Redesigned Mobile Menu Overlay ---- */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .mobile-menu-panel {
          background: #ffffff;
          width: 100%;
          max-width: 320px;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.25s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 1.25rem;
        }
        .mobile-menu-close {
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: #64748b;
          line-height: 1;
          padding: 4px;
        }
        .mobile-menu-group {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          margin-bottom: 1.5rem;
        }
        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          color: #334155;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .mobile-menu-item:not(:last-child) {
          border-bottom: 1px solid #e2e8f0;
        }
        .mobile-menu-item:hover {
          background: #f1f5f9;
        }
        .mobile-menu-item-highlight {
          color: #14B8A6 !important; /* Brand teal/emerald */
        }
        .mobile-menu-icon {
          flex-shrink: 0;
          color: #64748b;
        }
        .mobile-menu-item-highlight .mobile-menu-icon {
          color: #14B8A6;
        }
        .mobile-menu-footer {
          margin-top: auto;
          padding-top: 1rem;
        }

        /* ---- Hamburger nav ---- */
        .nav-hamburger {
          display: none; background: none; border: 2px solid #e2e8f0;
          border-radius: 8px; font-size: 1.3rem; cursor: pointer; color: #0f172a;
          padding: 6px 10px; line-height: 1; flex-shrink: 0;
        }

        /* ---- Veryland tooltip ---- */
        .vl-nav-wrap { position: relative; display: inline-flex; align-items: center; }
        .vl-tooltip {
          display: none; position: absolute; top: calc(100% + 10px); left: 50%;
          transform: translateX(-50%); background: #0ea5e9; color: white;
          padding: 10px 14px; border-radius: 10px; font-size: 0.74rem; font-weight: 600;
          white-space: nowrap; z-index: 9999; box-shadow: 0 4px 20px rgba(14,165,233,0.35);
          line-height: 1.6; pointer-events: none; text-align: center;
        }
        .vl-tooltip::before {
          content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          border: 7px solid transparent; border-bottom-color: #0ea5e9;
        }
        .vl-tooltip-up { top: auto; bottom: calc(100% + 10px); }
        .vl-tooltip-up::before { bottom: auto; top: 100%; border-bottom-color: transparent; border-top-color: #0ea5e9; }
        .vl-nav-wrap:hover .vl-tooltip { display: block; }

        /* ---- Animations ---- */
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatReverse { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinSlowReverse { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bubbleIn {
          0% { opacity: 0; transform: translateY(24px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bubblePulse {
          0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.16), 0 0 0 0 rgba(14,165,233,0.35); }
          50% { box-shadow: 0 8px 32px rgba(0,0,0,0.16), 0 0 0 8px rgba(14,165,233,0); }
        }

        /* ---- Chat bubble ---- */
        .chat-bubble-wrap {
          animation: bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .chat-bubble-card {
          animation: bubblePulse 2.5s ease-in-out infinite;
        }

        /* ---- Floating badge — hide on mobile where avatar is too small ---- */
        @media (max-width: 768px) {
          .floating-card-2 { display: none !important; }
        }

        /* ---- Tablet (≤900px) ---- */
        @media (max-width: 900px) {
          .hero-layout { flex-direction: column-reverse !important; gap: 2rem !important; }
          .avatar-cont { width: 220px !important; height: 260px !important; margin: 0 auto !important; }
          .ring-pink { width: 210px !important; height: 210px !important; }
          .ring-cyan { width: 180px !important; height: 180px !important; }
          .avatar-wrap { width: 160px !important; height: 160px !important; }
          .landlord-cont { flex-direction: column !important; gap: 2rem !important; }
          .pricing-card { min-width: unset !important; width: 100% !important; }
        }

        /* ---- Mobile (≤768px) ---- */
        @media (max-width: 768px) {
          /* Hero */
          .hero-section { padding: 1.25rem 0.75rem !important; }
          .hero-outer { border-radius: 14px !important; }
          .hero-inner { padding: 1.75rem 1.25rem !important; border-radius: 10px !important; }
          .hero-title-el { font-size: 2rem !important; letter-spacing: -0.5px !important; margin-bottom: 1rem !important; }
          .hero-subtitle { font-size: 0.88rem !important; margin-bottom: 1.5rem !important; }

          /* Steps */
          .steps-grid-el { grid-template-columns: 1fr 1fr !important; gap: 1rem !important; }

          /* CTA */
          .cta-title { font-size: 1.9rem !important; letter-spacing: -0.5px !important; }

          /* Footer */
          .footer-top { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 1rem !important; }
          .footer-links { flex-wrap: wrap !important; justify-content: center !important; gap: 0.85rem !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important; text-align: left !important; }

          /* Chat bubble */
          .chat-bubble-wrap { right: 14px !important; bottom: 14px !important; left: 14px !important; max-width: none !important; }
        }

        /* ---- Buy/Sell grid ---- */
        @media (max-width: 640px) {
          .buy-sell-grid { grid-template-columns: 1fr !important; }
        }

        /* ---- Small phones (≤480px) ---- */
        @media (max-width: 480px) {
          .hero-title-el { font-size: 1.65rem !important; }
          .hero-inner { padding: 1.25rem 1rem !important; }
          .steps-grid-el { grid-template-columns: 1fr !important; }
          .cta-title { font-size: 1.5rem !important; }
          .avatar-cont { width: 170px !important; height: 200px !important; }
          .ring-pink { width: 160px !important; height: 160px !important; }
          .ring-cyan { width: 135px !important; height: 135px !important; }
          .avatar-wrap { width: 120px !important; height: 120px !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}

const CYAN = '#0ea5e9'
const TEAL = '#14B8A6'

const s = {
  main: { minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif" },

  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.9rem 1.25rem', background: '#ffffff',
    boxShadow: '0 1px 0 #e2e8f0', position: 'sticky', top: 0, zIndex: 100,
  },
  navBrand: {
    fontSize: '1.4rem', fontWeight: '800',
    background: `linear-gradient(90deg, ${CYAN}, ${TEAL})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { color: '#374151', fontSize: '0.88rem', fontWeight: '700' },
  navBtn: {
    background: `linear-gradient(135deg, ${TEAL}, #0D9488)`,
    color: 'white', padding: '0.55rem 1.25rem',
    borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700',
  },

  heroSection: {
    padding: '3rem 2rem',
    background: `radial-gradient(ellipse at top left, ${CYAN}11 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${TEAL}11 0%, transparent 50%)`,
    display: 'flex', justifyContent: 'center',
  },
  heroOuter: {
    border: `1.5px solid ${TEAL}55`, borderRadius: '24px',
    padding: '4px', maxWidth: '1100px', width: '100%',
  },
  heroInner: {
    border: `1.5px solid ${CYAN}55`, borderRadius: '20px',
    padding: '3.5rem 3rem', background: '#ffffff',
    boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
  },
  heroLayout: { display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' },
  heroText: { flex: 1, minWidth: '300px' },
  heroBadge: {
    display: 'inline-block', background: `${CYAN}15`,
    border: `1px solid ${CYAN}44`, color: CYAN,
    padding: '0.4rem 1.25rem', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.05em',
    marginBottom: '1.5rem', textTransform: 'uppercase',
  },
  heroTitle: { fontSize: '3rem', fontWeight: '900', lineHeight: '1.15', marginBottom: '1.25rem', letterSpacing: '-1px', color: '#0f172a' },
  heroCyan: { color: CYAN },
  heroTeal: { color: TEAL },
  heroSubtitle: { fontSize: '0.95rem', color: '#475569', fontWeight: '600', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px' },

  heroActionsPrimary: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  heroActionsSecondary: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    fontSize: '0.9rem',
  },
  secondaryLink: {
    color: '#0f172a', fontWeight: '600', textDecoration: 'none',
    borderBottom: `2px solid ${CYAN}44`, paddingBottom: '2px',
    transition: 'all 0.2s',
  },
  btnAffiliate: {
    gridColumn: '1 / -1',
    background: `linear-gradient(135deg, ${TEAL}, #0D9488)`,
    color: 'white', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${TEAL}44`, textAlign: 'center',
  },
  btnVeryland: {
    gridColumn: '1 / -1',
    background: `linear-gradient(135deg, ${CYAN}, #0284c7)`,
    color: 'white', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${CYAN}44`, textAlign: 'center',
  },

  btnCyan: {
    background: `linear-gradient(135deg, ${CYAN}, #0284c7)`,
    color: '#ffffff', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${CYAN}44`, textAlign: 'center',
  },
  btnTeal: {
    background: `linear-gradient(135deg, ${TEAL}, #0D9488)`,
    color: 'white', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${TEAL}44`, textAlign: 'center',
  },
  btnOutline: {
    background: '#ffffff', color: '#0f172a',
    padding: '0.75rem 1.25rem', borderRadius: '10px',
    fontWeight: '800', fontSize: '0.85rem',
    border: `2px solid ${CYAN}`, boxShadow: `0 4px 16px ${CYAN}22`, textAlign: 'center',
  },
  btnPurple: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: 'white', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)', textAlign: 'center',
  },

  heroStats: { display: 'flex', alignItems: 'center', gap: '2rem' },
  heroStat: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statValueCyan: { fontSize: '1.5rem', fontWeight: '800', color: CYAN },
  statValueTeal: { fontSize: '1.5rem', fontWeight: '800', color: TEAL },
  statLabel: { fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  statDivider: { width: '1px', height: '36px', background: '#e2e8f0' },

  avatarContainer: {
    position: 'relative', width: '340px', height: '400px',
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringTeal: {
    position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
    border: `2px solid ${TEAL}44`,
    boxShadow: 'none', display: 'none',
  },
  ringCyan: {
    position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
    border: `1px solid ${CYAN}22`,
    boxShadow: 'none', display: 'block',
  },
  avatarWrapper: {
    position: 'relative', zIndex: 2, animation: 'float 4s ease-in-out infinite',
    borderRadius: '50%', overflow: 'hidden', width: '240px', height: '240px',
    border: `3px solid ${CYAN}55`, boxShadow: `0 8px 40px ${CYAN}33, 0 4px 20px ${TEAL}22`,
  },
  avatarImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
  verifiedBadge: {
    position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)',
    background: '#ffffff', border: `1.5px solid ${TEAL}`,
    borderRadius: '12px', padding: '8px 12px 8px 10px',
    fontSize: '0.75rem', fontWeight: '600', color: '#0f172a',
    display: 'flex', alignItems: 'center', gap: '8px',
    zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },

  section: { padding: '5rem 2rem', background: '#f8fafc' },
  sectionInner: { maxWidth: '1100px', margin: '0 auto' },
  sectionTag: { textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '1rem', fontWeight: '800' },
  sectionTitle: { fontSize: '2.2rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem', color: '#0f172a', letterSpacing: '-0.5px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' },
  stepCard: {
    background: '#ffffff', border: '1.5px solid', borderRadius: '16px',
    padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  stepNumber: { fontSize: '4rem', fontWeight: '900', opacity: 0.12, position: 'absolute', top: '0.5rem', right: '1rem', lineHeight: 1 },
  stepTitle: { fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' },
  stepDesc: { fontSize: '0.83rem', color: '#64748b', fontWeight: '600', lineHeight: '1.6' },

  landlordSection: { padding: '5rem 2rem', background: '#ffffff' },
  landlordInner: {
    maxWidth: '1000px', margin: '0 auto',
    border: `1.5px solid ${CYAN}33`, borderRadius: '24px',
    padding: '3rem', background: '#f8fafc',
  },
  landlordContent: { display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' },
  landlordText: { flex: 1, minWidth: '280px' },
  landlordDesc: { color: '#475569', fontWeight: '600', lineHeight: '1.8', marginBottom: '1.75rem', fontSize: '0.92rem' },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' },
  featureItem: { color: '#0f172a', fontWeight: '600', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  featureCheck: { color: CYAN, fontWeight: '800' },
  pricingCard: {
    background: '#ffffff', border: `1.5px solid ${TEAL}33`,
    borderRadius: '16px', padding: '2rem', minWidth: '220px', textAlign: 'center',
    boxShadow: `0 4px 24px ${TEAL}22`,
  },
  pricingLabel: { color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: '800', marginBottom: '0.75rem' },
  pricingAmount: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' },
  pricingCurrency: { color: TEAL, fontSize: '1.2rem', fontWeight: '700', marginTop: '8px' },
  pricingValue: { color: TEAL, fontSize: '2.8rem', fontWeight: '900', lineHeight: 1 },
  pricingPer: { color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginTop: '4px', marginBottom: '1.5rem' },
  pricingFeatures: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem', color: '#475569', fontSize: '0.82rem', fontWeight: '600' },

  ctaSection: {
    padding: '6rem 2rem', textAlign: 'center',
    background: `linear-gradient(135deg, ${CYAN}08, ${TEAL}08)`,
    borderTop: '1px solid #e2e8f0',
  },
  ctaTitle: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px', color: '#0f172a' },
  ctaSubtitle: { color: '#475569', fontWeight: '600', marginBottom: '2.5rem', fontSize: '0.95rem' },

  footer: { padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
    gap: '2rem',
    maxWidth: '1100px',
    margin: '0 auto 1.5rem',
  },
  footerBrandCol: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '0.55rem' },
  footerColTitle: {
    color: '#0f172a', fontSize: '0.72rem', fontWeight: '800',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem',
  },
  footerBrand: {
    fontSize: '1.2rem', fontWeight: '800',
    background: `linear-gradient(90deg, ${CYAN}, ${TEAL})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  footerLink: { color: '#64748b', fontSize: '0.82rem', fontWeight: '600' },
  footerAdminLink: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: '6px' },
  footerDivider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 auto 1.5rem', maxWidth: '1000px' },
  footerDesc: { color: '#94a3b8', fontWeight: '600', fontSize: '0.8rem', marginBottom: '0.5rem' },
  footerCopy: { color: '#cbd5e1', fontWeight: '600', fontSize: '0.75rem', textAlign: 'center' },

  // ---- Floating chat bubble ----
  chatBubbleWrap: {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
    maxWidth: '320px', width: '90vw',
  },
  chatBubbleCard: {
    background: '#ffffff', borderRadius: '18px', padding: '1.25rem',
    border: `1.5px solid ${CYAN}44`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.16)', position: 'relative',
  },
  chatBubbleClose: {
    position: 'absolute', top: '10px', right: '10px',
    background: '#f1f5f9', border: 'none', borderRadius: '50%',
    width: '24px', height: '24px', fontSize: '0.75rem', color: '#64748b',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  chatBubbleHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' },
  chatBubbleAvatarWrap: {
    width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
    border: `2px solid ${CYAN}55`, flexShrink: 0,
  },
  chatBubbleAvatar: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
  chatBubbleName: { fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' },
  chatBubbleStatus: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#22c55e', fontWeight: '700' },
  chatBubbleDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' },
  chatBubbleText: { fontSize: '0.86rem', color: '#334155', fontWeight: '600', lineHeight: '1.6', marginBottom: '1rem' },
  chatBubbleActions: { display: 'flex', gap: '0.6rem' },
  chatBubbleYesBtn: {
    flex: 1, background: `linear-gradient(135deg, ${CYAN}, #0284c7)`,
    color: '#ffffff', border: 'none', padding: '0.6rem 0.75rem',
    borderRadius: '9px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer',
  },
  chatBubbleNoBtn: {
    flex: 1, background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0',
    padding: '0.6rem 0.75rem', borderRadius: '9px', fontWeight: '800',
    fontSize: '0.82rem', cursor: 'pointer',
  },
}
