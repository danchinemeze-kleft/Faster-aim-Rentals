'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import Breadcrumb from './components/Breadcrumb'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [listingCount, setListingCount] = useState(null)

  useEffect(() => {
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setListingCount(count) })
  }, [])

  const displayCount = listingCount === null ? '...' : listingCount > 0 ? `${listingCount}+` : 'New'

  return (
    <main style={s.main}>
      <Breadcrumb theme="light" items={[{ label: 'Mr. Rent', href: '/' }]} />
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navBrand}>🏠 Mr. Rent</div>
        <div style={s.navLinks}>
          <a href="/browse" style={s.navLink}>Browse</a>
          <a href="/search" style={s.navLink}>AI Chat</a>
          <a href="/list" style={s.navLink}>List Property</a>
          <a href="/account" style={s.navBtn}>Login / Sign up</a>
          <a href="/light" title="Switch to dark mode" style={{ fontSize: '1.1rem', background: 'rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', textDecoration: 'none' }}>🌙</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.heroSection}>
        <div style={s.heroOuter}>
          <div style={s.heroInner}>
            <div style={s.heroLayout}>
              <div style={s.heroText}>
                <div style={s.heroBadge}>🇳🇬 Nigeria Nationwide</div>
                <h1 style={s.heroTitle}>
                  Find or List<br />
                  <span style={s.heroCyan}>Property for Rent</span><br />
                  <span style={s.heroPink}>Quickly & Securely</span>
                </h1>
                <p style={s.heroSubtitle}>
                  Connect with verified landlords across Nigeria. Browse listings, chat with Mr. Rent AI, and find your perfect home today.
                </p>
                <div style={s.heroActions}>
                  <a href="/browse" style={s.btnCyan}>Browse Listings</a>
                  <a href="/search" style={s.btnPink}>Ask Mr. Rent AI 🤖</a>
                  <a href="/list" style={s.btnOutline}>Add Your Property 🏠</a>
                  <a href="https://fasteraim.com" target="_blank" rel="noopener noreferrer" style={s.btnPurple}>Learn AI Skills 🎓</a>
                </div>
                <div style={s.heroStats}>
                  <div style={s.heroStat}>
                    <span style={s.statValueCyan}>{displayCount}</span>
                    <span style={s.statLabel}>Listings</span>
                  </div>
                  <div style={s.statDivider}></div>
                  <div style={s.heroStat}>
                    <span style={s.statValuePink}>36</span>
                    <span style={s.statLabel}>States</span>
                  </div>
                  <div style={s.statDivider}></div>
                  <div style={s.heroStat}>
                    <span style={s.statValueCyan}>₦5k</span>
                    <span style={s.statLabel}>Per Reveal</span>
                  </div>
                </div>
              </div>

              <div style={s.avatarContainer}>
                <div style={s.ringPink}></div>
                <div style={s.ringCyan}></div>
                <a href="/search" style={{ display: 'block', borderRadius: '50%' }}>
                  <div style={s.avatarWrapper}>
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
                <div style={s.floatingBadge}>
                  <span style={s.floatingDot}></span>
                  AI Powered
                </div>
                <div style={s.floatingCard1}>🏠 2 new listings</div>
                <div style={s.floatingCard2}>✓ Verified Landlord</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionTag}>— HOW IT WORKS —</p>
          <h2 style={s.sectionTitle}>Simple. Fast. <span style={s.heroCyan}>Secure.</span></h2>
          <div style={s.stepsGrid}>
            {[
              { icon: '🔍', title: 'Browse Listings', desc: 'Search properties by location, budget, and type across all 36 states.', color: '#0ea5e9', link: '/browse' },
              { icon: '🤖', title: 'Ask Mr. Rent AI', desc: 'Chat with our AI assistant to find the perfect property for your needs.', color: '#ff2d78', link: '/search' },
              { icon: '💳', title: 'Reveal Contact', desc: "Pay ₦5,000 to instantly reveal the landlord's contact details.", color: '#0ea5e9', link: '/browse' },
              { icon: '🏠', title: 'Move In', desc: 'Contact the landlord directly and arrange your inspection and move.', color: '#ff2d78', link: '/browse' },
            ].map((step, i) => (
              <a href={step.link} key={i} style={{ ...s.stepCard, borderColor: step.color + '44', textDecoration: 'none', display: 'block' }}>
                <div style={{ ...s.stepNumber, color: step.color }}>0{i + 1}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h3 style={{ ...s.stepTitle, color: step.color }}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section style={s.landlordSection}>
        <div style={s.landlordInner}>
          <div style={s.landlordContent}>
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
                {['Unlimited property listings', 'Appear in AI-powered searches', 'Earn from contact reveals', 'Professional landlord dashboard', 'Available/unavailable toggle'].map((f, i) => (
                  <li key={i} style={s.featureItem}><span style={s.featureCheck}>✓</span> {f}</li>
                ))}
              </ul>
              <a href="/account" style={s.btnCyan}>Get Started →</a>
            </div>
            <div style={s.pricingCard}>
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
              <a href="/account" style={s.btnPink}>Subscribe Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <p style={s.sectionTag}>— JOIN MR. RENT —</p>
        <h2 style={s.ctaTitle}>Your Next Home is<br /><span style={s.heroCyan}>One Click Away</span></h2>
        <p style={s.ctaSubtitle}>Join thousands of Nigerians finding and listing homes on Mr. Rent</p>
        <div style={{ ...s.heroActions, margin: '0 auto 2.5rem' }}>
          <a href="/browse" style={s.btnCyan}>Browse Listings</a>
          <a href="/search" style={s.btnPink}>Ask Mr. Rent AI 🤖</a>
          <a href="/list" style={s.btnOutline}>Add Your Property 🏠</a>
          <a href="https://fasteraim.com" target="_blank" rel="noopener noreferrer" style={s.btnPurple}>Learn AI Skills 🎓</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerBrand}>🏠 Mr. Rent</div>
          <div style={s.footerLinks}>
            <a href="/browse" style={s.footerLink}>Browse</a>
            <a href="/search" style={s.footerLink}>AI Chat</a>
            <a href="/list" style={s.footerLink}>List Property</a>
            <a href="/affiliate" style={{ ...s.footerLink, color: '#7c3aed', fontWeight: 700 }}>💰 Earn — Affiliate</a>
            <a href="/account" style={s.footerLink}>Login</a>
            <a href="/admin" style={s.footerAdminLink}>⚙ Admin</a>
          </div>
        </div>
        <hr style={s.footerDivider} />
        <p style={s.footerDesc}>Nigerian property rental platform powered by AI</p>
        <p style={s.footerCopy}>© 2026 Faster Aim Technology Limited. All rights reserved.</p>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #ffffff; }
        a { text-decoration: none; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatReverse { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinSlowReverse { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @media (max-width: 768px) {
          .hero-layout { flex-direction: column !important; }
          .hero-title { font-size: 2rem !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .landlord-content { flex-direction: column !important; }
          .avatar-container { width: 260px !important; height: 300px !important; }
        }
      `}</style>
    </main>
  )
}

const CYAN = '#0ea5e9'
const PINK = '#ff2d78'

const s = {
  main: { minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif" },

  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 2rem', background: '#ffffff',
    boxShadow: '0 1px 0 #e2e8f0', position: 'sticky', top: 0, zIndex: 100,
  },
  navBrand: {
    fontSize: '1.4rem', fontWeight: '800',
    background: `linear-gradient(90deg, ${CYAN}, ${PINK})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { color: '#374151', fontSize: '0.88rem', fontWeight: '700' },
  navBtn: {
    background: `linear-gradient(135deg, ${PINK}, #c0135a)`,
    color: 'white', padding: '0.55rem 1.25rem',
    borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700',
  },

  heroSection: {
    padding: '3rem 2rem',
    background: `radial-gradient(ellipse at top left, ${CYAN}11 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${PINK}11 0%, transparent 50%)`,
    display: 'flex', justifyContent: 'center',
  },
  heroOuter: {
    border: `1.5px solid ${PINK}55`, borderRadius: '24px',
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
  heroPink: { color: PINK },
  heroSubtitle: { fontSize: '0.95rem', color: '#475569', fontWeight: '600', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px' },

  heroActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '2.5rem',
    maxWidth: '480px',
  },

  btnCyan: {
    background: `linear-gradient(135deg, ${CYAN}, #0284c7)`,
    color: '#ffffff', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${CYAN}44`, textAlign: 'center',
  },
  btnPink: {
    background: `linear-gradient(135deg, ${PINK}, #c0135a)`,
    color: 'white', padding: '0.75rem 1.25rem',
    borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem',
    boxShadow: `0 4px 16px ${PINK}44`, textAlign: 'center',
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
  statValuePink: { fontSize: '1.5rem', fontWeight: '800', color: PINK },
  statLabel: { fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  statDivider: { width: '1px', height: '36px', background: '#e2e8f0' },

  avatarContainer: {
    position: 'relative', width: '340px', height: '400px',
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringPink: {
    position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
    border: '2px solid transparent', borderTop: `2px solid ${PINK}`, borderRight: `2px solid ${PINK}`,
    animation: 'spinSlow 8s linear infinite', boxShadow: `0 0 20px ${PINK}33`,
  },
  ringCyan: {
    position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
    border: '2px solid transparent', borderBottom: `2px solid ${CYAN}`, borderLeft: `2px solid ${CYAN}`,
    animation: 'spinSlowReverse 6s linear infinite', boxShadow: `0 0 20px ${CYAN}33`,
  },
  avatarWrapper: {
    position: 'relative', zIndex: 2, animation: 'float 4s ease-in-out infinite',
    borderRadius: '50%', overflow: 'hidden', width: '240px', height: '240px',
    border: `3px solid ${CYAN}55`, boxShadow: `0 8px 40px ${CYAN}33, 0 4px 20px ${PINK}22`,
  },
  avatarImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
  floatingBadge: {
    position: 'absolute', bottom: '20px', left: '-20px',
    background: '#ffffff', border: `1px solid ${CYAN}55`,
    borderRadius: '20px', padding: '6px 14px',
    fontSize: '0.75rem', fontWeight: '700', color: CYAN,
    display: 'flex', alignItems: 'center', gap: '6px',
    animation: 'floatReverse 3s ease-in-out infinite', zIndex: 3,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  floatingDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: CYAN, display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite',
  },
  floatingCard1: {
    position: 'absolute', top: '20px', right: '-10px',
    background: '#ffffff', border: `1px solid ${PINK}44`,
    borderRadius: '12px', padding: '8px 14px',
    fontSize: '0.75rem', fontWeight: '700', color: PINK,
    animation: 'float 5s ease-in-out infinite', zIndex: 3,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  floatingCard2: {
    position: 'absolute', bottom: '80px', right: '-20px',
    background: '#ffffff', border: `1px solid ${CYAN}44`,
    borderRadius: '12px', padding: '8px 14px',
    fontSize: '0.75rem', fontWeight: '700', color: CYAN,
    animation: 'floatReverse 4s ease-in-out infinite', zIndex: 3,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
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
    background: '#ffffff', border: `1.5px solid ${PINK}33`,
    borderRadius: '16px', padding: '2rem', minWidth: '220px', textAlign: 'center',
    boxShadow: `0 4px 24px ${PINK}22`,
  },
  pricingLabel: { color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: '800', marginBottom: '0.75rem' },
  pricingAmount: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' },
  pricingCurrency: { color: PINK, fontSize: '1.2rem', fontWeight: '700', marginTop: '8px' },
  pricingValue: { color: PINK, fontSize: '2.8rem', fontWeight: '900', lineHeight: 1 },
  pricingPer: { color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginTop: '4px', marginBottom: '1.5rem' },
  pricingFeatures: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem', color: '#475569', fontSize: '0.82rem', fontWeight: '600' },

  ctaSection: {
    padding: '6rem 2rem', textAlign: 'center',
    background: `linear-gradient(135deg, ${CYAN}08, ${PINK}08)`,
    borderTop: '1px solid #e2e8f0',
  },
  ctaTitle: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px', color: '#0f172a' },
  ctaSubtitle: { color: '#475569', fontWeight: '600', marginBottom: '2.5rem', fontSize: '0.95rem' },

  footer: { padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
    maxWidth: '1000px', margin: '0 auto 1.5rem',
  },
  footerBrand: {
    fontSize: '1.2rem', fontWeight: '800',
    background: `linear-gradient(90deg, ${CYAN}, ${PINK})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  footerLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  footerLink: { color: '#64748b', fontSize: '0.82rem', fontWeight: '600' },
  footerAdminLink: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: '6px' },
  footerDivider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 auto 1.5rem', maxWidth: '1000px' },
  footerDesc: { color: '#94a3b8', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem' },
  footerCopy: { color: '#cbd5e1', fontWeight: '600', fontSize: '0.75rem', textAlign: 'center' },
}
