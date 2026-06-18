'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BASE_URL = 'https://rent.fasteraim.com'

export default function AffiliatePage() {
  const [user, setUser] = useState(null)
  const [affiliate, setAffiliate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    full_name: '', phone: '', bank_name: '', account_number: '', account_name: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        const { data } = await supabase.from('affiliates').select('*').eq('id', session.user.id).maybeSingle()
        if (data) setAffiliate(data)
        setForm(f => ({ ...f, full_name: session.user.user_metadata?.full_name || '' }))
      }
      setLoading(false)
    })
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSignup = async e => {
    e.preventDefault()
    if (!user) { window.location.href = '/account?redirect=/affiliate'; return }
    setSubmitting(true)
    setMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/affiliate/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, access_token: session.access_token }),
    })
    const data = await res.json()
    if (data.success) {
      setAffiliate({ ref_code: data.ref_code, ...form })
      setMsg('Welcome to the Mr. Rent Affiliate Program! 🎉')
    } else {
      setMsg(data.error || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const refLink = affiliate ? `${BASE_URL}?ref=${affiliate.ref_code}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a' }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(90deg,#0ea5e9,#ff2d78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>🏠 Mr. Rent</a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {affiliate && <a href="/affiliate/dashboard" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>My Dashboard →</a>}
          {user
            ? <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</span>
            : <a href="/account?redirect=/affiliate" style={{ background: 'linear-gradient(135deg,#ff2d78,#c0135a)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>Login / Sign up</a>
          }
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #0ea5e911, #ff2d7811)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-block', background: '#0ea5e915', border: '1px solid #0ea5e944', color: '#0ea5e9', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          💰 Affiliate Program
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px', lineHeight: 1.15 }}>
          Earn Money by Sharing<br />
          <span style={{ color: '#0ea5e9' }}>Mr. Rent</span>
        </h1>
        <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: 600, maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Share your unique link. Earn ₦500 every time someone reveals a contact. Earn ₦2,000 every time a landlord subscribes. No cap on earnings.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', border: '1.5px solid #0ea5e944', borderRadius: '14px', padding: '1.25rem 2rem', textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0ea5e9' }}>₦500</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: 4 }}>Per Contact Reveal</div>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #ff2d7844', borderRadius: '14px', padding: '1.25rem 2rem', textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff2d78' }}>₦2,000</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: 4 }}>Per Landlord Signup</div>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #7c3aed44', borderRadius: '14px', padding: '1.25rem 2rem', textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7c3aed' }}>∞</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: 4 }}>No Earnings Cap</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 2rem', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: '2.5rem', color: '#0f172a' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { step: '01', icon: '✍️', title: 'Sign Up Free', desc: 'Create your affiliate account in seconds — free for every Mr. Rent user.' },
            { step: '02', icon: '🔗', title: 'Share Your Link', desc: 'Share your unique link on WhatsApp, social media, or anywhere you like.' },
            { step: '03', icon: '💸', title: 'Earn Commission', desc: 'Get ₦500 per reveal and ₦2,000 per landlord subscription through your link.' },
          ].map(s => (
            <div key={s.step} style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 10, right: 14, fontSize: '3.5rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{s.step}</div>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, fontWeight: 600 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active affiliate: show their link */}
      {affiliate && (
        <section style={{ padding: '0 2rem 4rem', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#fff', border: '1.5px solid #0ea5e944', borderRadius: '20px', padding: '2rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a' }}>✅ Your Referral Link</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontWeight: 600 }}>Share this link. Anyone who makes a payment through it earns you a commission.</p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all' }}>
                {refLink}
              </div>
              <button onClick={copyLink} style={{ background: copied ? '#22c55e' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <a href="/affiliate/dashboard" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>View Dashboard & Earnings →</a>
            </div>
          </div>
        </section>
      )}

      {/* Signup form — only show if not yet an affiliate */}
      {!affiliate && (
        <section style={{ padding: '0 2rem 5rem', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem', color: '#0f172a' }}>Join the Affiliate Program</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.75rem', fontWeight: 600 }}>
              {user ? 'Fill in your details to get your unique referral link instantly.' : 'Create a free Mr. Rent account first, then come back here to join.'}
            </p>

            {!user ? (
              <a href="/account?redirect=/affiliate" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#ff2d78,#c0135a)', color: '#fff', padding: '0.875rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}>
                Create Account / Login →
              </a>
            ) : (
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'full_name', label: 'Full Name *', placeholder: 'e.g. Daniel Igboke', type: 'text', required: true },
                  { name: 'phone', label: 'WhatsApp / Phone *', placeholder: 'e.g. 08012345678', type: 'tel', required: true },
                  { name: 'bank_name', label: 'Bank Name *', placeholder: 'e.g. Access Bank', type: 'text', required: true },
                  { name: 'account_number', label: 'Account Number *', placeholder: '10-digit account number', type: 'text', required: true },
                  { name: 'account_name', label: 'Account Name *', placeholder: 'Name on bank account', type: 'text', required: true },
                ].map(f => (
                  <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>{f.label}</label>
                    <input
                      type={f.type} name={f.name} value={form[f.name]}
                      onChange={handleChange} placeholder={f.placeholder} required={f.required}
                      style={{ padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: '#0f172a' }}
                    />
                  </div>
                ))}
                {msg && <p style={{ fontSize: '0.85rem', fontWeight: 700, color: msg.includes('🎉') ? '#22c55e' : '#e74c3c', padding: '0.65rem 0.9rem', background: msg.includes('🎉') ? '#f0fdf4' : '#fff0f0', borderRadius: '8px' }}>{msg}</p>}
                <button type="submit" disabled={submitting} style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Creating your account...' : 'Get My Referral Link →'}
                </button>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>Free to join. Commissions paid manually within 7 working days of request.</p>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
        © 2026 Faster Aim Technology Limited · <a href="/privacy-policy" style={{ color: '#94a3b8' }}>Privacy Policy</a> · <a href="/terms-of-service" style={{ color: '#94a3b8' }}>Terms</a>
      </footer>
    </div>
  )
}
