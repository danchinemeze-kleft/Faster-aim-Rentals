'use client'

export default function TermsOfService() {
  return (
    <div className="faim-legal-page">
      <div className="faim-legal-container">
        <a href="/" className="faim-back-link">← Back to Home</a>
        <h1>Terms of Service</h1>
        <p className="faim-last-updated">Last updated: June 2025</p>

        <p>Welcome to Mr. Rent, a property rental platform operated by <strong>Faster Aim Technology Limited</strong>. By using this platform, you agree to the following terms. Please read them carefully.</p>

        <h2>1. About the Platform</h2>
        <p>Mr. Rent connects landlords and property owners with prospective tenants across Nigeria. We are a listing and discovery platform — we do not own, manage, or guarantee any of the properties listed on this site.</p>

        <h2>2. User Accounts</h2>
        <ul>
          <li>You must provide accurate information when creating an account.</li>
          <li>You are responsible for keeping your account credentials secure.</li>
          <li>One person or business may not operate multiple accounts.</li>
          <li>We reserve the right to suspend accounts that violate these terms.</li>
        </ul>

        <h2>3. For Landlords</h2>
        <ul>
          <li>Listing fee is <strong>₦10,000 per month</strong> per property.</li>
          <li>You must own or have legal authority to list the property.</li>
          <li>All property information must be accurate and up to date.</li>
          <li>Fraudulent or misleading listings will result in immediate removal and account suspension.</li>
          <li>Your contact details are only revealed to tenants who pay the contact reveal fee.</li>
        </ul>

        <h2>4. For Tenants</h2>
        <ul>
          <li>Browsing listings is free.</li>
          <li>A <strong>₦5,000 contact reveal fee</strong> is charged to access a landlord's phone number.</li>
          <li>This fee covers platform access and is non-refundable once the contact is revealed.</li>
          <li>You are responsible for verifying properties before making any payments to landlords.</li>
        </ul>

        <h2>5. Payments</h2>
        <p>All payments are processed securely through <strong>Paystack</strong>. By making a payment, you agree to Paystack's terms and conditions. Faster Aim Technology Limited does not store your card details.</p>

        <h2>6. Prohibited Activities</h2>
        <ul>
          <li>Posting fake or duplicate property listings</li>
          <li>Harassing or defrauding other users</li>
          <li>Using the platform for any illegal activity</li>
          <li>Attempting to bypass the contact reveal system</li>
          <li>Scraping or copying platform content without permission</li>
        </ul>

        <h2>7. Disclaimer</h2>
        <p>Mr. Rent is a marketplace platform. We do not verify every listing and are not responsible for disputes between landlords and tenants. Always inspect a property in person before paying any caution fee, agency fee, or rent.</p>

        <h2>8. Limitation of Liability</h2>
        <p>To the maximum extent permitted by Nigerian law, Faster Aim Technology Limited shall not be liable for any indirect, incidental, or consequential damages arising from your use of this platform.</p>

        <h2>9. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

        <h2>10. Governing Law</h2>
        <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

        <h2>11. Contact Us</h2>
        <p><strong>Faster Aim Technology Limited</strong><br />
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