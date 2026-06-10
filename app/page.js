'use client'

import Image from 'next/image'

export default function Home() {
  return (
    <main style={styles.main}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>🏠 Mr. Rent</div>
        <div style={styles.navLinks}>
          <a href="/browse" style={styles.navLink}>Browse</a>
          <a href="/search" style={styles.navLink}>AI Chat</a>
          <a href="/list" style={styles.navLink}>List Property</a>
          <a href="/account" style={styles.navBtn}>Login / Sign up</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.heroSection}>
        <div style={styles.heroOuter}>
          <div style={styles.heroInner}>
            <div style={styles.heroLayout}>

              {/* Left: Text */}
              <div style={styles.heroText}>
                <div style={styles.heroBadge}>🇳🇬 Nigeria Nationwide</div>
                <h1 style={styles.heroTitle}>
                  Find or List<br />
                  <span style={styles.heroCyan}>Property for Rent</span><br />
                  <span style={styles.heroPink}>Quickly & Securely</span>
                </h1>
                <p style={styles.heroSubtitle}>
                  Connect with verified landlords across Nigeria. Browse listings, chat with Mr. Rent AI, and find your perfect home today.
                </p>
                <div style={styles.heroActions}>
                  <a href="/browse" style={styles.btnCyan}>Browse Listings</a>
                  <a href="/search" style={styles.btnPink}>Ask Mr. Rent AI 🤖</a>
                  <a href="/list" style={styles.btnWhite}>Add Your Property 🏠</a>
                </div>
                <div style={styles.heroStats}>
                  <div style={styles.heroStat}>
                    <span style={styles.statValueCyan}>100+</span>
                    <span style={styles.statLabel}>Listings</span>
                  </div>
                  <div style={styles.statDivider}></div>
                  <div style={styles.heroStat}>
                    <span style={styles.statValuePink}>36</span>
                    <span style={styles.statLabel}>States</span>
                  </div>
                  <div style={styles.statDivider}></div>
                  <div style={styles.heroStat}>
                    <span style={styles.statValueCyan}>₦5k</span>
                    <span style={styles.statLabel}>Per Reveal</span>
                  </div>
                </div>
              </div>

              {/* Right: Animated Mr. Rent Avatar */}
              <div style={styles.avatarContainer}>
                <div style={styles.ringPink}></div>
                <div style={styles.ringCyan}></div>
                <a href="/search" style={{display: 'block', borderRadius: '50%'}}>
                  <div style={styles.avatarWrapper}>
                    <Image
                      src="/mr-rent-avatar.png"
                      alt="Mr. Rent - Your Property Assistant"
                      width={320}
                      height={380}
                      style={styles.avatarImage}
                      priority
                    />
                  </div>
                </a>
                <div style={styles.floatingBadge}>
                  <span style={styles.floatingDot}></span>
                  AI Powered
                </div>
                <div style={styles.floatingCard1}>
                  🏠 2 new listings
                </div>
                <div style={styles.floatingCard2}>
                  ✓ Verified Landlord
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionTag}>— HOW IT WORKS —</p>
          <h2 style={styles.sectionTitle}>Simple. Fast. <span style={styles.heroCyan}>Secure.</span></h2>
          <div style={styles.stepsGrid}>
            {[
              { icon: '🔍', title: 'Browse Listings', desc: 'Search properties by location, budget, and type across all 36 states.', color: '#00d9d9', link: '/browse' },
              { icon: '🤖', title: 'Ask Mr. Rent AI', desc: 'Chat with our AI assistant to find the perfect property for your needs.', color: '#ff2d78', link: '/search' },
              { icon: '💳', title: 'Reveal Contact', desc: 'Pay ₦5,000 to instantly reveal the landlord\'s contact details.', color: '#00d9d9', link: '/browse' },
              { icon: '🏠', title: 'Move In', desc: 'Contact the landlord directly and arrange your inspection and move.', color: '#ff2d78', link: '/browse' },
            ].map((step, i) => (
              <a href={step.link} key={i} style={{...styles.stepCard, borderColor: step.color + '33', textDecoration: 'none', display: 'block', cursor: 'pointer'}}>
                <div style={{...styles.stepNumber, color: step.color}}>0{i + 1}</div>
                <div style={{...styles.stepIcon, color: step.color}}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section style={styles.landlordSection}>
        <div style={styles.landlordOuter}>
          <div style={styles.landlordInner}>
            <div style={styles.landlordContent}>
              <div style={styles.landlordText}>
                <p style={styles.sectionTag}>— FOR LANDLORDS —</p>
                <h2 style={styles.sectionTitle}>
                  List Your Property.<br />
                  <span style={styles.heroPink}>Reach Thousands.</span>
                </h2>
                <p style={styles.landlordDesc}>
                  Subscribe for ₦10,000/month and list unlimited properties. Tenants pay ₦5,000 to reveal your contact — you earn from every serious inquiry.
                </p>
                <ul style={styles.featureList}>
                  {[
                    'Unlimited property listings',
                    'Appear in AI-powered searches',
                    'Earn from contact reveals',
                    'Professional landlord dashboard',
                    'Available/unavailable toggle',
                  ].map((f, i) => (
                    <li key={i} style={styles.featureItem}>
                      <span style={styles.featureCheck}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/account" style={styles.btnCyan}>Get Started →</a>
              </div>

              <div style={styles.pricingCard}>
                <div style={styles.pricingTop}>
                  <p style={styles.pricingLabel}>LANDLORD PLAN</p>
                  <div style={styles.pricingAmount}>
                    <span style={styles.pricingCurrency}>₦</span>
                    <span style={styles.pricingValue}>10,000</span>
                  </div>
                  <p style={styles.pricingPer}>/month</p>
                </div>
                <div style={styles.pricingFeatures}>
                  <p>✓ Unlimited listings</p>
                  <p>✓ Dashboard access</p>
                  <p>✓ AI promotion</p>
                  <p>✓ Cancel anytime</p>
                </div>
                <a href="/account" style={styles.btnPink}>Subscribe Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <p style={styles.sectionTag}>— JOIN MR. RENT —</p>
        <h2 style={styles.ctaTitle}>
          Your Next Home is<br />
          <span style={styles.heroCyan}>One Click Away</span>
        </h2>
        <p style={styles.ctaSubtitle}>Join thousands of Nigerians finding and listing homes on Mr. Rent</p>
        <div style={styles.heroActions}>
          <a href="/browse" style={styles.btnCyan}>Browse Listings</a>
          <a href="/search" style={styles.btnPink}>Ask Mr. Rent AI 🤖</a>
          <a href="/list" style={styles.btnWhite}>Add Your Property 🏠</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>🏠 Mr. Rent</div>
          <div style={styles.footerLinks}>
            <a href="/browse" style={styles.footerLink}>Browse</a>
            <a href="/search" style={styles.footerLink}>AI Chat</a>
            <a href="/list" style={styles.footerLink}>List Property</a>
            <a href="/account" style={styles.footerLink}>Login</a>
            <a href="/admin" style={styles.footerAdminLink}>⚙ Admin</a>
          </div>
        </div>
        <div style={styles.footerDivider}></div>
        <p style={styles.footerDesc}>Nigerian property rental platform powered by AI</p>
        <p style={styles.footerCopy}>© 2026 Faster Aim Technology Limited. All rights reserved.</p>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #050510; }
        a { text-decoration: none; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .avatar-float { animation: float 4s ease-in-out infinite; }
        .ring-pink-spin { animation: spinSlow 8s linear infinite; }
        .ring-cyan-spin { animation: spinSlowReverse 6s linear infinite; }
        .floating-badge { animation: floatReverse 3s ease-in-out infinite; }
        .floating-card1 { animation: float 5s ease-in-out infinite; }
        .floating-card2 { animation: floatReverse 4s ease-in-out infinite; }

        @media (max-width: 768px) {
          .hero-layout { flex-direction: column !important; }
          .hero-title { font-size: 2rem !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .landlord-content { flex-direction: column !important; }
          .nav-links { gap: 0.5rem !important; }
          .avatar-container { width: 280px !important; height: 320px !important; }
        }
      `}</style>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#050510',
    color: '#ffffff',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  // NAV
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    background: 'rgba(5,5,16,0.95)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(0,217,217,0.15)',
  },
  navBrand: {
    fontSize: '1.4rem',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #00d9d9, #ff2d78)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: '#cccccc',
    fontSize: '0.88rem',
    fontWeight: '700',
  },
  navBtn: {
    background: 'linear-gradient(135deg, #ff2d78, #c0135a)',
    color: 'white',
    padding: '0.55rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
  },

  // HERO
  heroSection: {
    padding: '3rem 2rem',
    background: 'radial-gradient(ellipse at top left, rgba(0,217,217,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,45,120,0.08) 0%, transparent 50%)',
    display: 'flex',
    justifyContent: 'center',
  },
  heroOuter: {
    border: '1.5px solid #ff2d78',
    borderRadius: '24px',
    padding: '4px',
    maxWidth: '1100px',
    width: '100%',
  },
  heroInner: {
    border: '1.5px solid #00d9d9',
    borderRadius: '20px',
    padding: '3.5rem 3rem',
    background: 'linear-gradient(135deg, rgba(0,217,217,0.03), rgba(5,5,16,0.98))',
  },
  heroLayout: {
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  heroText: {
    flex: 1,
    minWidth: '300px',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(0,217,217,0.08)',
    border: '1px solid rgba(0,217,217,0.25)',
    color: '#00d9d9',
    padding: '0.4rem 1.25rem',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    marginBottom: '1.5rem',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    lineHeight: '1.15',
    marginBottom: '1.25rem',
    letterSpacing: '-1px',
  },
  heroCyan: {
    color: '#00d9d9',
    textShadow: '0 0 40px rgba(0,217,217,0.4)',
  },
  heroPink: {
    color: '#ff2d78',
    textShadow: '0 0 40px rgba(255,45,120,0.4)',
  },
  heroSubtitle: {
    fontSize: '0.95rem',
    color: '#cccccc',
    fontWeight: '600',
    lineHeight: '1.7',
    marginBottom: '2rem',
    maxWidth: '480px',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'no-wrap',
    marginBottom: '2.5rem',
  },
  btnCyan: {
    background: 'linear-gradient(135deg, #00d9d9, #00a8a8)',
    color: '#050510',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '0.9rem',
    boxShadow: '0 0 30px rgba(0,217,217,0.3)',
  },
  btnPink: {
    background: 'linear-gradient(135deg, #ff2d78, #c0135a)',
    color: 'white',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '0.9rem',
    boxShadow: '0 0 30px rgba(255,45,120,0.3)',
  },
  btnWhite: {
    background: '#ffffff',
    color: '#050510',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '0.9rem',
    border: '2px solid #00d9d9',
    boxShadow: '0 0 20px rgba(0,217,217,0.2)',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statValueCyan: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#00d9d9',
    textShadow: '0 0 20px rgba(0,217,217,0.5)',
  },
  statValuePink: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ff2d78',
    textShadow: '0 0 20px rgba(255,45,120,0.5)',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statDivider: {
    width: '1px',
    height: '36px',
    background: 'linear-gradient(to bottom, transparent, #333, transparent)',
  },

  // AVATAR
  avatarContainer: {
    position: 'relative',
    width: '340px',
    height: '400px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPink: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTop: '2px solid #ff2d78',
    borderRight: '2px solid #ff2d78',
    animation: 'spinSlow 8s linear infinite',
    boxShadow: '0 0 20px rgba(255,45,120,0.3)',
  },
  ringCyan: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    border: '2px solid transparent',
    borderBottom: '2px solid #00d9d9',
    borderLeft: '2px solid #00d9d9',
    animation: 'spinSlowReverse 6s linear infinite',
    boxShadow: '0 0 20px rgba(0,217,217,0.3)',
  },
  avatarWrapper: {
    position: 'relative',
    zIndex: 2,
    animation: 'float 4s ease-in-out infinite',
    borderRadius: '50%',
    overflow: 'hidden',
    width: '240px',
    height: '240px',
    border: '3px solid rgba(0,217,217,0.3)',
    boxShadow: '0 0 40px rgba(0,217,217,0.2), 0 0 80px rgba(255,45,120,0.1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top center',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: '20px',
    left: '-20px',
    background: 'rgba(5,5,16,0.9)',
    border: '1px solid rgba(0,217,217,0.4)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#00d9d9',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    animation: 'floatReverse 3s ease-in-out infinite',
    zIndex: 3,
    backdropFilter: 'blur(10px)',
  },
  floatingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00d9d9',
    boxShadow: '0 0 8px #00d9d9',
    animation: 'blink 1.5s ease-in-out infinite',
    display: 'inline-block',
  },
  floatingCard1: {
    position: 'absolute',
    top: '20px',
    right: '-10px',
    background: 'rgba(5,5,16,0.9)',
    border: '1px solid rgba(255,45,120,0.4)',
    borderRadius: '12px',
    padding: '8px 14px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ff2d78',
    animation: 'float 5s ease-in-out infinite',
    zIndex: 3,
    backdropFilter: 'blur(10px)',
  },
  floatingCard2: {
    position: 'absolute',
    bottom: '80px',
    right: '-20px',
    background: 'rgba(5,5,16,0.9)',
    border: '1px solid rgba(0,217,217,0.4)',
    borderRadius: '12px',
    padding: '8px 14px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#00d9d9',
    animation: 'floatReverse 4s ease-in-out infinite',
    zIndex: 3,
    backdropFilter: 'blur(10px)',
  },

  // HOW IT WORKS
  section: { padding: '5rem 2rem' },
  sectionInner: { maxWidth: '1100px', margin: '0 auto' },
  sectionTag: {
    textAlign: 'center',
    color: '#aaaaaa',
    fontSize: '0.7rem',
    letterSpacing: '0.2em',
    marginBottom: '1rem',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1.5rem',
  },
  stepCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  stepNumber: {
    fontSize: '4rem',
    fontWeight: '900',
    opacity: 0.06,
    position: 'absolute',
    top: '0.5rem',
    right: '1rem',
    lineHeight: 1,
  },
  stepIcon: { fontSize: '2rem', marginBottom: '0.75rem', display: 'block' },
  stepTitle: { fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' },
  stepDesc: { fontSize: '0.83rem', color: '#cccccc', fontWeight: '600', lineHeight: '1.6' },

  // LANDLORD
  landlordSection: {
    padding: '5rem 2rem',
    borderTop: '1px solid rgba(255,45,120,0.1)',
    borderBottom: '1px solid rgba(0,217,217,0.1)',
  },
  landlordOuter: {
    border: '1.5px solid #00d9d9',
    borderRadius: '24px',
    padding: '4px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  landlordInner: {
    border: '1.5px solid #ff2d78',
    borderRadius: '20px',
    padding: '3rem',
    background: 'rgba(5,5,16,0.98)',
  },
  landlordContent: {
    display: 'flex',
    gap: '4rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  landlordText: { flex: 1, minWidth: '280px' },
  landlordDesc: { color: '#cccccc', fontWeight: '600', lineHeight: '1.8', marginBottom: '1.75rem', fontSize: '0.92rem' },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' },
  featureItem: { color: '#ffffff', fontWeight: '600', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  featureCheck: { color: '#00d9d9', fontWeight: '800' },
  pricingCard: {
    background: 'linear-gradient(135deg, rgba(255,45,120,0.08), rgba(0,217,217,0.05))',
    border: '1px solid rgba(255,45,120,0.2)',
    borderRadius: '16px',
    padding: '2rem',
    minWidth: '220px',
    textAlign: 'center',
  },
  pricingTop: { marginBottom: '1.5rem' },
  pricingLabel: { color: '#ffffff', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: '800', marginBottom: '0.75rem' },
  pricingAmount: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '4px' },
  pricingCurrency: { color: '#ff2d78', fontSize: '1.2rem', fontWeight: '700', marginTop: '8px' },
  pricingValue: { color: '#ff2d78', fontSize: '2.8rem', fontWeight: '900', lineHeight: 1, textShadow: '0 0 30px rgba(255,45,120,0.4)' },
  pricingPer: { color: '#ffffff', fontSize: '0.8rem', fontWeight: '700', marginTop: '4px' },
  pricingFeatures: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem', color: '#cccccc', fontSize: '0.82rem', fontWeight: '600' },

  // CTA
  ctaSection: {
    padding: '6rem 2rem',
    textAlign: 'center',
    background: 'radial-gradient(ellipse at center, rgba(0,217,217,0.05) 0%, transparent 70%)',
  },
  ctaTitle: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px' },
  ctaSubtitle: { color: '#cccccc', fontWeight: '600', marginBottom: '2.5rem', fontSize: '0.95rem' },

  // FOOTER
  footer: { padding: '3rem 2rem', borderTop: '1px solid rgba(0,217,217,0.1)', background: '#030308' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
    maxWidth: '1000px', margin: '0 auto 1.5rem',
  },
  footerBrand: {
    fontSize: '1.2rem', fontWeight: '800',
    background: 'linear-gradient(90deg, #00d9d9, #ff2d78)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  footerLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  footerLink: { color: '#aaaaaa', fontSize: '0.82rem', fontWeight: '600' },
  footerAdminLink: {
    color: '#555555',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #222',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  footerDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
    marginBottom: '1.5rem', maxWidth: '1000px', margin: '0 auto 1.5rem',
  },
  footerDesc: { color: '#aaaaaa', fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem' },
  footerCopy: { color: '#666666', fontWeight: '600', fontSize: '0.75rem', textAlign: 'center' },
}