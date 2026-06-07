'use client'

export default function RefundPolicy() {
  return (
    <div className="faim-legal-page">
      <div className="faim-legal-container">
        <a href="/" className="faim-back-link">← Back to Home</a>
        <h1>Refund Policy</h1>
        <p className="faim-last-updated">Last updated: June 2025</p>

        <p>This Refund Policy explains how Faster Aim Technology Limited handles refund requests for payments made on the Mr. Rent platform.</p>

        <h2>1. Contact Reveal Fee (₦5,000)</h2>
        <p>The contact reveal fee is <strong>non-refundable</strong> once a landlord's contact details have been displayed to you. This is because the service — delivery of the contact information — has been fulfilled at the point of reveal.</p>
        <p>However, we will issue a full refund if:</p>
        <ul>
          <li>The contact details revealed were incorrect or non-functional due to a platform error.</li>
          <li>Your payment was debited but the contact was not revealed due to a technical fault.</li>
        </ul>

        <h2>2. Landlord Listing Subscription (₦10,000/month)</h2>
        <p>Listing subscriptions are <strong>non-refundable</strong> once your property has been published and made visible to tenants.</p>
        <p>We will issue a refund if:</p>
        <ul>
          <li>Your listing was not published within 24 hours of payment due to a platform error.</li>
          <li>You were charged twice for the same listing period.</li>
        </ul>

        <h2>3. How to Request a Refund</h2>
        <p>To request a refund, contact us within <strong>48 hours</strong> of the transaction:</p>
        <ul>
          <li>Email: <strong>hello@fasteraim.com</strong></li>
          <li>WhatsApp: available on our Contact page</li>
          <li>Include your email address, transaction reference, and reason for the request.</li>
        </ul>

        <h2>4. Refund Processing</h2>
        <p>Approved refunds are processed within <strong>3–7 business days</strong> back to your original payment method via Paystack.</p>

        <h2>5. Disputes</h2>
        <p>If you believe you have been charged in error, please contact us before raising a dispute with your bank. We are committed to resolving all issues fairly and promptly.</p>

        <h2>6. Contact Us</h2>
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