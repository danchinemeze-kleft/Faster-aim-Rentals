'use client'

export default function Contact() {
  return (
    <div className="faim-contact-page">
      <div className="faim-contact-container">
        <a href="/" className="faim-back-link">← Back to Home</a>
        <h1>Contact Us</h1>
        <p className="faim-subtitle">Have a question, complaint, or partnership proposal? We'd love to hear from you.</p>

        <div className="faim-contact-grid">
          {/* Email */}
          <a href="mailto:hello@fasteraim.com" className="faim-contact-card">
            <div className="faim-contact-icon">✉️</div>
            <div>
              <strong>Email</strong>
              <p>hello@fasteraim.com</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="faim-contact-card">
            <div className="faim-contact-icon">💬</div>
            <div>
              <strong>WhatsApp</strong>
              <p>Chat with us directly</p>
            </div>
          </a>

          {/* Location */}
          <div className="faim-contact-card faim-contact-card--static">
            <div className="faim-contact-icon">📍</div>
            <div>
              <strong>Location</strong>
              <p>Awka, Anambra State, Nigeria</p>
            </div>
          </div>

          {/* AI Chat */}
          <a href="/search" className="faim-contact-card">
            <div className="faim-contact-icon">🏠</div>
            <div>
              <strong>Mr. Rent AI</strong>
              <p>Get instant property help</p>
            </div>
          </a>
        </div>

        {/* Response time */}
        <div className="faim-response-note">
          <span className="faim-dot"></span>
          We typically respond within <strong>24 hours</strong> on business days.
        </div>

        {/* Categories */}
        <div className="faim-contact-topics">
          <h2>What can we help you with?</h2>
          <div className="faim-topic-list">
            <div className="faim-topic">🏡 Listing a property</div>
            <div className="faim-topic">🔍 Finding a rental</div>
            <div className="faim-topic">💳 Payment issues</div>
            <div className="faim-topic">🐛 Bug reports</div>
            <div className="faim-topic">🤝 Partnership enquiries</div>
            <div className="faim-topic">📣 Advertising</div>
          </div>
        </div>

        {/* Legal links */}
        <div className="faim-legal-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span>•</span>
          <a href="/terms-of-service">Terms of Service</a>
          <span>•</span>
          <a href="/refund-policy">Refund Policy</a>
        </div>
      </div>

      <style>{`
        .faim-contact-page {
          background: #f0ede8;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 40px 16px;
        }
        .faim-contact-container {
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
        h1 {
          font-size: 2rem;
          color: #080a0f;
          margin-bottom: 8px;
        }
        .faim-subtitle {
          color: #666;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .faim-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .faim-contact-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-decoration: none;
          border: 1.5px solid transparent;
          transition: all 0.15s;
          border-top: 3px solid #ff2d78;
        }
        .faim-contact-card:hover {
          border-color: #0ef6cc;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .faim-contact-card--static:hover {
          transform: none;
          border-color: transparent;
          box-shadow: none;
          cursor: default;
        }
        .faim-contact-icon { font-size: 1.5rem; }
        .faim-contact-card strong {
          display: block;
          color: #080a0f;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .faim-contact-card p {
          color: #666;
          font-size: 0.82rem;
          margin: 0;
          line-height: 1.4;
        }

        .faim-response-note {
          background: #080a0f;
          color: #a0aec0;
          border-radius: 10px;
          padding: 14px 20px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .faim-dot {
          width: 8px;
          height: 8px;
          background: #0ef6cc;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .faim-response-note strong { color: white; }

        .faim-contact-topics {
          background: white;
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 24px;
          border-left: 3px solid #0ef6cc;
        }
        h2 {
          font-size: 1rem;
          color: #080a0f;
          margin-bottom: 16px;
        }
        .faim-topic-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .faim-topic {
          background: #f0ede8;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 0.82rem;
          color: #444;
        }

        .faim-legal-links {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 0.8rem;
          color: #999;
        }
        .faim-legal-links a {
          color: #ff2d78;
          text-decoration: none;
        }
        .faim-legal-links a:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .faim-contact-grid { grid-template-columns: 1fr; }
          h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}