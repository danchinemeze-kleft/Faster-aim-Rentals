export default function Home() {
  return (
    <main style={styles.main}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>🏠 Mr. Rent</div>
        <div style={styles.navLinks}>
          <a href="/browse" style={styles.navLink}>Browse</a>
          <a href="/search" style={styles.navLink}>AI Chat</a>
          <a href="/account" style={styles.navBtn}>Login / Sign up</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🇳🇬 Nigeria Nationwide</div>
          <h1 style={styles.heroTitle}>
            Find or List Property<br />
            <span style={styles.heroAccent}>for Rent Quickly</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with verified landlords across Nigeria. Browse listings, chat with Mr. Rent AI, and find your perfect home today.
          </p>
          <div style={styles.heroActions}>
            <a href="/browse" style={styles.heroBtnPrimary}>Browse Listings</a>
            <a href="/search" style={styles.heroBtnSecondary}>Ask Mr. Rent AI 🤖</a>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatValue}>100+</span>
              <span style={styles.heroStatLabel}>Listings</span>
            </div>
            <div style={styles.heroStatDivider}></div>
            <div style={styles.heroStat}>
              <span style={styles.heroStatValue}>36</span>
              <span style={styles.heroStatLabel}>States</span>
            </div>
            <div style={styles.heroStatDivider}></div>
            <div style={styles.heroStat}>
              <span style={styles.heroStatValue}>₦5k</span>
              <span style={styles.heroStatLabel}>Per Reveal</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <p style={styles.sectionSubtitle}>Simple, fast, and secure</p>
        <div style={styles.stepsGrid}>
          {[
            { icon: '🔍', title: 'Browse Listings', desc: 'Search properties by location, budget, and type across Nigeria.' },
            { icon: '🤖', title: 'Ask Mr. Rent AI', desc: 'Chat with our AI assistant to find the perfect property for you.' },
            { icon: '💳', title: 'Reveal Contact', desc: 'Pay ₦5,000 to reveal the landlord\'s contact details instantly.' },
            { icon: '🏠', title: 'Move In', desc: 'Contact the landlord directly and arrange your inspection.' },
          ].map((step, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepIcon}>{step.icon}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Landlords */}
      <section style={styles.landlordSection}>
        <div style={styles.landlordContent}>
          <div style={styles.landlordText}>
            <h2 style={styles.landlordTitle}>Are you a Landlord?</h2>
            <p style={styles.landlordDesc}>
              List your property and reach thousands of verified tenants across Nigeria. Subscribe for just ₦10,000/month and list unlimited properties.
            </p>
            <ul style={styles.landlordFeatures}>
              <li>✓ Unlimited property listings</li>
              <li>✓ Appear in AI-powered searches</li>
              <li>✓ Earn from contact reveals</li>
              <li>✓ Professional dashboard</li>
            </ul>
            <a href="/account" style={styles.heroBtnPrimary}>List Your Property →</a>
          </div>
          <div style={styles.landlordCard}>
            <div style={styles.landlordCardIcon}>🏘️</div>
            <h3>₦10,000/month</h3>
            <p>Unlimited listings</p>
            <p>Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to find your next home?</h2>
        <p style={styles.ctaSubtitle}>Join thousands of Nigerians finding homes on Mr. Rent</p>
        <div style={styles.heroActions}>
          <a href="/browse" style={styles.heroBtnPrimary}>Browse Listings</a>
          <a href="/account" style={styles.heroBtnOutline}>Create Account</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerBrand}>🏠 Mr. Rent</div>
        <p style={styles.footerDesc}>Nigerian property rental platform powered by AI</p>
        <div style={styles.footerLinks}>
          <a href="/browse" style={styles.footerLink}>Browse</a>
          <a href="/search" style={styles.footerLink}>AI Chat</a>
          <a href="/list" style={styles.footerLink}>List Property</a>
          <a href="/account" style={styles.footerLink}>Login</a>
        </div>
        <p style={styles.footerCopy}>© 2026 Faster Aim Technology Limited. All rights reserved.</p>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a1a; }
        a { text-decoration: none; }
      `}</style>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#0a0a1a',
    color: '#ffffff',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    background: 'rgba(10,10,26,0.95)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  navBrand: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#00d9d9',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: '#aaa',
    fontSize: '0.9rem',
    transition: 'color 0.15s',
  },
  navBtn: {
    background: '#e67e22',
    color: 'white',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  hero: {
    padding: '5rem 2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  heroContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(0,217,217,0.1)',
    border: '1px solid rgba(0,217,217,0.3)',
    color: '#00d9d9',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '1.25rem',
    color: '#ffffff',
  },
  heroAccent: {
    color: '#00d9d9',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#aaa',
    lineHeight: '1.7',
    marginBottom: '2rem',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  heroBtnPrimary: {
    background: '#e67e22',
    color: 'white',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'background 0.15s',
  },
  heroBtnSecondary: {
    background: 'rgba(0,217,217,0.1)',
    border: '1.5px solid #00d9d9',
    color: '#00d9d9',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  heroBtnOutline: {
    background: 'transparent',
    border: '1.5px solid #e67e22',
    color: '#e67e22',
    padding: '0.875rem 2rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  heroStatValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#00d9d9',
  },
  heroStatLabel: {
    fontSize: '0.78rem',
    color: '#666',
  },
  heroStatDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
  },
  section: {
    padding: '5rem 2rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#ffffff',
  },
  sectionSubtitle: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: '3rem',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  stepCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    transition: 'border-color 0.15s',
  },
  stepIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  stepTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: '#888',
    lineHeight: '1.6',
  },
  landlordSection: {
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    padding: '5rem 2rem',
  },
  landlordContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  landlordText: {
    flex: 1,
    minWidth: '280px',
  },
  landlordTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
  },
  landlordDesc: {
    color: '#aaa',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
  },
  landlordFeatures: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '2rem',
    color: '#ccc',
    fontSize: '0.9rem',
  },
  landlordCard: {
    background: '#1a1a2e',
    border: '1px solid rgba(0,217,217,0.3)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    minWidth: '200px',
    color: '#fff',
  },
  landlordCardIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  ctaSection: {
    padding: '5rem 2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a1a 100%)',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#ffffff',
  },
  ctaSubtitle: {
    color: '#aaa',
    marginBottom: '2rem',
  },
  footer: {
    padding: '3rem 2rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: '#050510',
  },
  footerBrand: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#00d9d9',
    marginBottom: '0.5rem',
  },
  footerDesc: {
    color: '#555',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  footerLink: {
    color: '#666',
    fontSize: '0.85rem',
  },
  footerCopy: {
    color: '#444',
    fontSize: '0.78rem',
  },
}