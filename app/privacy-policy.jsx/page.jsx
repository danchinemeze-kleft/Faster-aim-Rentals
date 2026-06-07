'use client'

export default function PrivacyPolicy() {
  return (
    <div className="faim-legal-page">
      <div className="faim-legal-container">
        <a href="/" className="faim-back-link">← Back to Home</a>
        <h1>Privacy Policy</h1>
        <p className="faim-last-updated">Last updated: June 2025</p>

        <p>Faster Aim Technology Limited ("we", "us", or "our") operates the Mr. Rent platform at <strong>rent.fasteraim.com</strong>. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.</p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Account information:</strong> Name, email address, and phone number when you register.</li>
          <li><strong>Listing information:</strong> Property details, location, photos, and pricing submitted by landlords.</li>
          <li><strong>Payment information:</strong> Transaction records processed through Paystack. We do not store your card details.</li>
          <li><strong>Usage data:</strong> Pages visited, search queries, and interactions with Mr. Rent AI chat.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account</li>
          <li>To process payments for subscriptions and contact reveals</li>
          <li>To connect tenants with landlords</li>
          <li>To improve our platform and AI assistant</li>
          <li>To send important service updates</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal data. We only share data with:</p>
        <ul>
          <li><strong>Paystack</strong> — for payment processing</li>
          <li><strong>Supabase</strong> — for secure data storage</li>
          <li><strong>Google</strong> — for authentication (if you use Google sign-in)</li>
        </ul>

        <h2>4. Contact Reveals</h2>
        <p>When a tenant pays ₦5,000 to reveal a landlord's contact, that landlord's phone number is shared with the tenant only. This information is not shared with any third party.</p>

        <h2>5. Data Security</h2>
        <p>We use industry-standard encryption and secure servers to protect your data. All payments are processed securely through Paystack.</p>

        <h2>6. Your Rights</h2>
        <p>You may request to access, correct, or delete your personal data at any time by contacting us at <strong>hello@fasteraim.com</strong>.</p>

        <h2>7. Cookies</h2>
        <p>We use essential cookies to keep you logged in and remember your session. We do not use advertising cookies.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify you of significant changes via email or a notice on the platform.</p>

        <h2>9. Contact Us</h2>
        <p>For privacy-related questions, contact us at:<br />
        <strong>Faster Aim Technology Limited</strong><br />
        Awka, Anambra State, Nigeria<br />
        Email: hello@fasteraim.com</p>
      </div>

      <style>{`
        .faim-legal-page {
          background: #f0ede8;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 40px 16px;
        }
        .faim-legal-container {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 40px;
          border-top: 3px solid #ff2d78;
          outline: 1.5px solid #0ef6cc;
          outline-offset: -5px;
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
          margin-bottom: 4px;
        }
        .faim-last-updated {
          color: #888;
          font-size: 0.8rem;
          margin-bottom: 24px;
        }
        h2 {
          font-size: 1.1rem;
          color: #080a0f;
          margin: 28px 0 10px;
          border-left: 3px solid #0ef6cc;
          padding-left: 10px;
        }
        p { color: #444; line-height: 1.7; margin-bottom: 12px; }
        ul { color: #444; line-height: 1.8; padding-left: 20px; margin-bottom: 12px; }
        li { margin-bottom: 4px; }
        @media (max-width: 480px) {
          .faim-legal-container { padding: 24px 16px; }
          h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}