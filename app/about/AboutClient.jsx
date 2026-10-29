'use client'
import GoBackButton from '../components/GoBackButton'
import Breadcrumb from '../components/Breadcrumb'


export default function About() {
  return (
    <div className="faim-about-page">
      <div className="faim-about-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }]} />

        {/* Hero */}
        <div className="faim-about-hero">
          <div className="faim-hero-badge">🏠 Mr. Rent</div>
          <h1>Finding a home in Nigeria<br />just got smarter.</h1>
          <p>Mr. Rent is an AI-powered property rental platform built for Nigerians — starting from the Awka and Onitsha corridor, expanding nationwide.</p>
        </div>

        {/* Mission */}
        <div className="faim-about-section">
          <h2>Our Mission</h2>
          <p>The Nigerian rental market is broken. Tenants waste weeks chasing agents, viewing fake listings, and paying fees for properties that don&apos;t exist. Landlords struggle to find serious tenants without expensive middlemen.</p>
          <p>Mr. Rent fixes this. We connect landlords directly with tenants — transparently, affordably, and intelligently — using AI to guide every search.</p>
        </div>

        {/* How it works */}
        <div className="faim-about-section">
          <h2>How It Works</h2>
          <div className="faim-steps">
            <div className="faim-step">
              <div className="faim-step-num">01</div>
              <div>
                <strong>Landlords list their properties</strong>
                <p>For ₦10,000/month, landlords get their property in front of thousands of verified tenants.</p>
              </div>
            </div>
            <div className="faim-step">
              <div className="faim-step-num">02</div>
              <div>
                <strong>Tenants browse and chat with Mr. Rent AI</strong>
                <p>Our AI assistant helps tenants find the right property by location, budget, and type — no agent needed.</p>
              </div>
            </div>
            <div className="faim-step">
              <div className="faim-step-num">03</div>
              <div>
                <strong>Pay ₦5,000 to reveal contact</strong>
                <p>When a tenant finds the right property, they pay a small fee to get the landlord&apos;s direct contact — no middlemen, no inflated agent fees.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company */}
        <div className="faim-about-section">
          <h2>About Faster Aim Technology</h2>
          <p>Mr. Rent is a product of <strong>Faster Aim Technology Limited</strong> — a CAC-registered Nigerian technology company based in Awka, Anambra State. We build AI-powered tools that solve real Nigerian problems in property and education.</p>
          <p>Our sister platform, <a href="https://fasteraim.com" target="_blank" rel="noopener noreferrer">fasteraim.com</a>, offers AI education courses for individuals and businesses across Nigeria.</p>
        </div>

        {/* CTA */}
        <div className="faim-about-cta">
          <a href="/browse" className="faim-cta-btn faim-cta-primary">Browse Listings</a>
          <a href="/search" className="faim-cta-btn faim-cta-secondary">Chat with Mr. Rent</a>
        </div>
      </div>

      <style jsx>{`.faim-about-page {
  --ab-text: var(--text-1, #fff);
  --ab-text-soft: color-mix(in srgb, var(--text-1, #fff) 88%, transparent);
  --ab-line: color-mix(in srgb, var(--text-1, #fff) 42%, transparent);
  --ab-accent-text: color-mix(in srgb, #0ef6cc 30%, var(--text-1, #fff));
  background: var(--page-bg);
  color: var(--ab-text);
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
  padding: 40px 16px;
}
.faim-about-container { max-width: 720px; margin: 0 auto; }

/* Hero stays a dark brand card in both themes, so its colours are fixed on purpose */
.faim-about-hero {
  background: #080a0f;
  border-radius: 16px;
  padding: 48px 40px;
  margin-bottom: 24px;
  border-bottom: 3px solid #14B8A6;
  outline: 1.5px solid #0ef6cc;
  outline-offset: -5px;
  box-shadow: var(--shadow-card);
}
.faim-hero-badge {
  display: inline-block;
  background: #14B8A6;
  color: #080a0f;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}
.faim-about-hero h1 { font-size: 2rem; color: #ffffff; line-height: 1.25; margin: 0 0 16px; }
.faim-about-hero p { color: #d5dbe3; line-height: 1.7; font-size: 1rem; margin: 0; }

.faim-about-section {
  background: var(--card-bg);
  border: 1.5px solid var(--ab-line);
  border-left: 4px solid var(--ab-accent-text);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-card);
}
.faim-about-section h2 { font-size: 1.2rem; color: var(--ab-text); margin: 0 0 14px; }
.faim-about-section p { color: var(--ab-text-soft); line-height: 1.7; margin: 0 0 12px; }
.faim-about-section a { color: var(--ab-accent-text); font-weight: 600; text-decoration: underline; }
.faim-about-section a:hover { text-decoration: none; }

.faim-steps { display: flex; flex-direction: column; gap: 20px; }
.faim-step { display: flex; gap: 16px; align-items: flex-start; }
.faim-step-num { font-size: 1.4rem; font-weight: 800; color: var(--ab-accent-text); min-width: 36px; line-height: 1; }
.faim-step strong { display: block; color: var(--ab-text); margin-bottom: 4px; font-size: 0.95rem; }
.faim-step p { margin: 0; font-size: 0.88rem; }

.faim-about-cta { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
.faim-cta-btn {
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
}
.faim-cta-primary { background: #0ef6cc; color: #080a0f; border: 1.5px solid #080a0f; }
.faim-cta-primary:hover { opacity: 0.9; }
.faim-cta-secondary { background: var(--card-bg); color: var(--ab-text); border: 1.5px solid var(--ab-line); }
.faim-cta-secondary:hover { border-color: var(--ab-accent-text); color: var(--ab-accent-text); }

@media (max-width: 480px) {
  .faim-about-hero { padding: 32px 20px; }
  .faim-about-hero h1 { font-size: 1.5rem; }
  .faim-about-section { padding: 24px 16px; }
`}</style>
    </div>
  )
}