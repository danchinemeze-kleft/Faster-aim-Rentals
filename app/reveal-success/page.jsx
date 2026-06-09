'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function RevealSuccessInner() {
  const searchParams = useSearchParams()

  const reference = searchParams.get('reference') || searchParams.get('trxref')

  // Derive initial status from URL — avoids calling setState inside the effect
  const [status, setStatus] = useState(reference ? 'verifying' : 'failed')
  const [landlordContact, setLandlordContact] = useState(null)
  const [listing, setListing] = useState(null)

  useEffect(() => {
    if (!reference) return
    let cancelled = false
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data.success) {
          setLandlordContact(data.contact)
          setListing(data.listing)
          setStatus('success')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => { if (!cancelled) setStatus('failed') })
    return () => { cancelled = true }
  }, [reference])

  if (status === 'verifying') return (
    <div className="faim-reveal-page">
      <div className="faim-reveal-card">
        <div className="faim-spinner"></div>
        <h2>Verifying your payment...</h2>
        <p>Please wait while we confirm your transaction.</p>
      </div>
      <Styles />
    </div>
  )

  if (status === 'failed') return (
    <div className="faim-reveal-page">
      <div className="faim-reveal-card faim-reveal-card--failed">
        <div className="faim-status-icon">❌</div>
        <h2>Payment Verification Failed</h2>
        <p>We couldn&apos;t verify your payment. If you were charged, please contact support.</p>
        <div className="faim-actions">
          <a href="/browse" className="faim-btn faim-btn--primary">Browse Listings</a>
          <a href="mailto:support@fasteraim.com" className="faim-btn faim-btn--outline">Contact Support</a>
        </div>
      </div>
      <Styles />
    </div>
  )

  return (
    <div className="faim-reveal-page">
      <div className="faim-reveal-card faim-reveal-card--success">

        {/* Success Header */}
        <div className="faim-success-header">
          <div className="faim-success-icon">✅</div>
          <h1>Contact Revealed!</h1>
          <p>Payment successful. Here are the landlord&apos;s contact details.</p>
        </div>

        {/* Property Info */}
        {listing && (
          <div className="faim-property-info">
            <span className="faim-type-pill">{listing.property_type}</span>
            <h3>{listing.title}</h3>
            <p>📍 {listing.location}, {listing.state}</p>
            <p>💰 ₦{listing.price?.toLocaleString()} / {listing.price_period}</p>
            <p>🛏 {listing.bedrooms} bed • 🚿 {listing.bathrooms} bath</p>
          </div>
        )}

        {/* Contact Details */}
        <div className="faim-contact-box">
          <h3>Landlord Contact</h3>
          {landlordContact?.phone && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">📞 Phone</span>
              <a href={`tel:${landlordContact.phone}`} className="faim-contact-value">
                {landlordContact.phone}
              </a>
            </div>
          )}
          {landlordContact?.email && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">✉️ Email</span>
              <a href={`mailto:${landlordContact.email}`} className="faim-contact-value">
                {landlordContact.email}
              </a>
            </div>
          )}
          {landlordContact?.whatsapp && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">💬 WhatsApp</span>
              <a
                href={`https://wa.me/${landlordContact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="faim-contact-value faim-whatsapp"
              >
                {landlordContact.whatsapp}
              </a>
            </div>
          )}
          {landlordContact?.full_name && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">👤 Name</span>
              <span className="faim-contact-value">{landlordContact.full_name}</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="faim-tips">
          <h4>Tips for contacting the landlord</h4>
          <ul>
            <li>Call during business hours (8am – 6pm)</li>
            <li>Mention you found the listing on Mr. Rent</li>
            <li>Ask about inspection and available date</li>
            <li>Confirm the caution fee and agency fee upfront</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="faim-actions">
          <a href="/browse" className="faim-btn faim-btn--primary">Browse More Listings</a>
          <a href="/my-account" className="faim-btn faim-btn--outline">View Saved Contacts</a>
        </div>

        <p className="faim-receipt-note">
          A receipt has been sent to your email. Reference: <strong>{reference}</strong>
        </p>
      </div>
      <Styles />
    </div>
  )
}

function Styles() {
  return (
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      .faim-reveal-page {
        min-height: 100vh;
        background: #f5f4f0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .faim-reveal-card {
        background: white;
        border-radius: 20px;
        padding: 2.5rem 2rem;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        text-align: center;
      }
      .faim-spinner {
        width: 48px; height: 48px;
        border: 3px solid #e0e0e0;
        border-top-color: #e67e22;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1.5rem;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .faim-reveal-card h2 { font-size: 1.3rem; color: #1a1a2e; margin-bottom: 0.5rem; }
      .faim-reveal-card p { color: #666; font-size: 0.9rem; }
      .faim-status-icon { font-size: 3rem; margin-bottom: 1rem; }
      .faim-success-header { margin-bottom: 1.5rem; }
      .faim-success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
      .faim-success-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.5rem; }
      .faim-success-header p { color: #666; font-size: 0.9rem; }
      .faim-property-info {
        background: #f5f4f0;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-type-pill {
        display: inline-block;
        background: #e67e22;
        color: white;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: capitalize;
        margin-bottom: 0.75rem;
      }
      .faim-property-info h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.5rem; }
      .faim-property-info p { font-size: 0.85rem; color: #666; margin-bottom: 4px; }
      .faim-contact-box {
        background: #1a1a2e;
        border-radius: 14px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-contact-box h3 { font-size: 0.85rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
      .faim-contact-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .faim-contact-item:last-child { border-bottom: none; }
      .faim-contact-label { font-size: 0.85rem; color: #aaa; }
      .faim-contact-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: white;
        text-decoration: none;
      }
      .faim-contact-value:hover { color: #e67e22; }
      .faim-whatsapp:hover { color: #25d366 !important; }
      .faim-tips {
        background: #fff8f2;
        border: 1.5px solid #e67e22;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-tips h4 { font-size: 0.85rem; font-weight: 700; color: #e67e22; margin-bottom: 0.75rem; }
      .faim-tips ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
      .faim-tips li { font-size: 0.82rem; color: #666; padding-left: 1rem; position: relative; }
      .faim-tips li::before { content: '→'; position: absolute; left: 0; color: #e67e22; }
      .faim-actions { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
      .faim-btn {
        flex: 1;
        padding: 0.75rem;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.85rem;
        text-decoration: none;
        text-align: center;
        transition: all 0.15s;
        cursor: pointer;
        border: none;
      }
      .faim-btn--primary { background: #e67e22; color: white; }
      .faim-btn--primary:hover { background: #cf6d17; }
      .faim-btn--outline { border: 1.5px solid #e67e22; color: #e67e22; background: white; }
      .faim-btn--outline:hover { background: #fff8f2; }
      .faim-receipt-note { font-size: 0.75rem; color: #aaa; }
      @media (max-width: 480px) {
        .faim-reveal-card { padding: 2rem 1.25rem; }
        .faim-actions { flex-direction: column; }
      }
    `}</style>
  )
}

export default function RevealSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        Verifying payment...
      </div>
    }>
      <RevealSuccessInner />
    </Suspense>
  )
}