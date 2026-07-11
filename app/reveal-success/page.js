'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Breadcrumb from '../components/Breadcrumb'

function RevealSuccessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('verifying')
  const [contact, setContact] = useState(null)
  const [listing, setListing] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      setErrorMsg('No payment reference found. Please contact support.')
      setStatus('error')
      return
    }

    async function verify() {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })
        const data = await res.json()
        if (data.success) {
          setContact(data.contact)
          setListing(data.listing)
          setStatus('success')
        } else {
          setErrorMsg(data.error || 'Verification failed. Please contact support.')
          setStatus('error')
        }
      } catch {
        setErrorMsg('Could not reach the server. Please contact support.')
        setStatus('error')
      }
    }
    verify()
  }, [searchParams])

  if (status === 'verifying') return (
    <div className="faim-reveal-page">
      <div style={{ width: '100%', maxWidth: '480px', padding: '0 0 4px' }}>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/browse' }, { label: 'Verifying Payment', href: '/reveal-success' }]} />
      </div>
      <div className="faim-reveal-card">
        <div className="faim-spinner"></div>
        <h2>Verifying your payment...</h2>
        <p>Please wait while we confirm your transaction.</p>
      </div>
      <Styles />
    </div>
  )

  if (status === 'error') return (
    <div className="faim-reveal-page">
      <div style={{ width: '100%', maxWidth: '480px', padding: '0 0 4px' }}>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/browse' }, { label: 'Payment Failed', href: '/reveal-success' }]} />
      </div>
      <div className="faim-reveal-card faim-reveal-card--failed">
        <div className="faim-status-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{errorMsg}</p>
        <div className="faim-actions">
          <a href="/browse" className="faim-btn faim-btn--primary">Browse Listings</a>
          <a href="mailto:info@fasteraim.com" className="faim-btn faim-btn--outline">Contact Support</a>
        </div>
      </div>
      <Styles />
    </div>
  )

  return (
    <div className="faim-reveal-page">
      <div style={{ width: '100%', maxWidth: '480px', padding: '0 0 4px' }}>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/browse' }, { label: 'Contact Revealed', href: '/reveal-success' }]} />
      </div>
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
            {(listing.bedrooms || listing.bathrooms) && (
              <p>🛏 {listing.bedrooms} bed • 🚿 {listing.bathrooms} bath</p>
            )}
          </div>
        )}

        {/* Contact Details */}
        <div className="faim-contact-box">
          <h3>Landlord Contact</h3>
          {contact?.full_name && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">👤 Name</span>
              <span className="faim-contact-value">{contact.full_name}</span>
            </div>
          )}
          {contact?.phone && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">📞 Phone</span>
              <a href={`tel:${contact.phone}`} className="faim-contact-value">
                {contact.phone}
              </a>
            </div>
          )}
          {contact?.email && (
            <div className="faim-contact-item">
              <span className="faim-contact-label">✉️ Email</span>
              <a href={`mailto:${contact.email}`} className="faim-contact-value">
                {contact.email}
              </a>
            </div>
          )}
          {contact?.phone && (
            <a
              href={`https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property "${listing?.title}" listed on Mr. Rent (rent.fasteraim.com). Is it still available?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="faim-whatsapp-btn"
            >
              <span>💬</span>
              <span>WhatsApp Landlord</span>
            </a>
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
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
      }
      .faim-reveal-card {
        background: white;
        border: 1px solid #eaeaea;
        border-radius: 20px;
        padding: 2.5rem 2rem;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        text-align: center;
      }
      .faim-spinner {
        width: 48px; height: 48px;
        border: 3px solid #e0e0e0;
        border-top-color: #0ef6cc;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1.5rem;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .faim-reveal-card h2 { font-size: 1.3rem; color: #080a0f; margin-bottom: 0.5rem; font-family: 'Syne', sans-serif; }
      .faim-reveal-card p { color: #555; font-size: 0.9rem; }
      .faim-status-icon { font-size: 3rem; margin-bottom: 1rem; }
      .faim-success-header { margin-bottom: 1.5rem; }
      .faim-success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
      .faim-success-header h1 { font-size: 1.6rem; font-weight: 700; color: #080a0f; margin-bottom: 0.5rem; font-family: 'Syne', sans-serif; }
      .faim-success-header p { color: #555; font-size: 0.9rem; }
      .faim-property-info {
        background: #f7f7f7;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-type-pill {
        display: inline-block;
        background: #0ef6cc;
        color: #080a0f;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: capitalize;
        margin-bottom: 0.75rem;
      }
      .faim-property-info h3 { font-size: 1rem; font-weight: 700; color: #080a0f; margin-bottom: 0.5rem; }
      .faim-property-info p { font-size: 0.85rem; color: #555; margin-bottom: 4px; }
      .faim-contact-box {
        background: #080a0f;
        border-radius: 14px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-contact-box h3 { font-size: 0.85rem; color: #0ef6cc; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
      .faim-contact-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .faim-contact-item:last-child { border-bottom: none; }
      .faim-contact-label { font-size: 0.85rem; color: #999; }
      .faim-contact-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: white;
        text-decoration: none;
      }
      .faim-contact-value:hover { color: #0ef6cc; }
      .faim-whatsapp-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 0.85rem;
        background: #25d366;
        color: white;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        text-decoration: none;
        margin-top: 1rem;
        transition: background 0.15s;
      }
      .faim-whatsapp-btn:hover { background: #1ebe5b; }
      .faim-tips {
        background: #f0fffb;
        border: 1.5px solid #0ef6cc;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        text-align: left;
      }
      .faim-tips h4 { font-size: 0.85rem; font-weight: 700; color: #0a8f77; margin-bottom: 0.75rem; }
      .faim-tips ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
      .faim-tips li { font-size: 0.82rem; color: #555; padding-left: 1rem; position: relative; }
      .faim-tips li::before { content: '→'; position: absolute; left: 0; color: #0a8f77; }
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
      .faim-btn--primary { background: #0ef6cc; color: #080a0f; }
      .faim-btn--primary:hover { background: #0bd9b3; }
      .faim-btn--outline { border: 1.5px solid #0ef6cc; color: #080a0f; background: white; }
      .faim-btn--outline:hover { background: #f0fffb; }
      .faim-receipt-note { font-size: 0.75rem; color: #999; }
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
      <div style={{minHeight:'100vh', background:'#ffffff', display:'flex', alignItems:'center', justifyContent:'center', color:'#555'}}>
        Verifying payment...
      </div>
    }>
      <RevealSuccessInner />
    </Suspense>
  )
}