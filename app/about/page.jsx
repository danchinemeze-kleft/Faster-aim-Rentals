'use client'

export default function About() {
  return (
    <div className="faim-about-page">
      <div className="faim-about-container">
        <a href="/" className="faim-back-link">← Back to Home</a>

        {/* Hero */}
        <div className="faim-about-hero">
          <div className="faim-hero-badge">🏠 Mr. Rent</div>
          <h1>Finding a home in Nigeria<br />just got smarter.</h1>
          <p>Mr. Rent is an AI-powered property rental platform built for Nigerians — starting from the Awka and Onitsha corridor, expanding nationwide.</p>
        </div>

        {/* Mission */}
        <div className="faim-about-section">
          <h2>Our Mission</h2>
          <p>The Nigerian rental market is broken. Tenants waste weeks chasing agents, viewing fake listings, and paying fees for properties that don't exist. Landlords struggle to find serious tenants without expensive middlemen.</p>
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
                <p>When a tenant finds the right property, they pay a small fee to get the landlord's direct contact — no middlemen, no inflated agent fees.</p>
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

      <style>{`
        .faim-about-page {
          background: #f0ede8;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 40px 16px;
        }
        .faim-about-container {
          max-width: 720px;
          margin: 0 auto;
        }
        .faim-back-link {
          color: #ff2d78;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 24px;
        }
        .faim-back-link:hover { text-decoration: underline; }

        .faim-about-hero {
          background: #080a0f;
          border-radius: 16px;
          padding: 48px 40px;
          margin-bottom: 24px;
          border-bottom: 3px solid #ff2d78;
          outline: 1.5px solid #0ef6cc;
          outline-offset: -5px;
        }
        .faim-hero-badge {
          display: inline-block;
          background: #ff2d78;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }
        .faim-about-hero h1 {
          font-size: 2rem;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 16px;
        }
        .faim-about-hero p {
          color: #a0aec0;
          line-height: 1.7;
          font-size: 1rem;
        }

        .faim-about-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 16px;
          border-left: 3px solid #0ef6cc;
        }
        h2 {
          font-size: 1.2rem;
          color: #080a0f;
          margin-bottom: 14px;
        }
        p { color: #444; line-height: 1.7; margin-bottom: 12px; }
        a { color: #ff2d78; }

        .faim-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .faim-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .faim-step-num {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0ef6cc;
          min-width: 36px;
          line-height: 1;
        }
        .faim-step strong {
          display: block;
          color: #080a0f;
          margin-bottom: 4px;
          font-size: 0.95rem;
        }
        .faim-step p {
          margin: 0;
          font-size: 0.88rem;
        }

        .faim-about-cta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .faim-cta-btn {
          padding: 12px 28px;
          border-radius: 24px;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s;
        }
        .faim-cta-primary {
          background: #ff2d78;
          color: white;
        }
        .faim-cta-primary:hover { background: #e0205f; }
        .faim-cta-secondary {
          background: white;
          color: #080a0f;
          border: 1.5px solid #0ef6cc;
        }
        .faim-cta-secondary:hover { background: #f0fffe; }

        @media (max-width: 480px) {
          .faim-about-hero { padding: 32px 20px; }
          .faim-about-hero h1 { font-size: 1.5rem; }
          .faim-about-section { padding: 24px 16px; }
        }
      `}</style>
    </div>
  )
}