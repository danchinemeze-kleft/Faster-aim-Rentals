'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const FEATURES = [
  'Reveal any landlord contact for free',
  'Unlimited reveals for 30 days',
  'Save money vs paying ₦5,000 per reveal',
  'Instant access — no waiting',
  'Works on every listing across Nigeria',
  'Cancel anytime — no hidden charges',
]

export default function TenantSubscribePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/account?redirect=/tenant-subscribe')
        return
      }
      setUser(session.user)

      const { data: sub } = await supabase
        .from('Tenant_subscription')
        .select('expiry_date, plan_type')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(sub || null)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSubscribe() {
    if (!user) return
    setPaying(true)
    try {
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'tenant_subscription',
          user_id: user.id,
        }),
      })
      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert(data.error || 'Could not start payment. Please try again.')
        setPaying(false)
      }
    } catch (err) {
      alert('Payment error: ' + err.message)
      setPaying(false)
    }
  }

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expiry_date) - new Date()) / 86400000))
    : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Segoe UI, system-ui, sans-serif', color: 'var(--text-1)' }}>

      {/* Top bar */}
      <div style={{ background: '#111318', borderBottom: '0.5px solid #222', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#cccccc', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15 }}>Mr. Rent</span>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#cccccc', fontSize: 13 }}>Tenant Pass</span>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔓</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            Tenant Access Pass
          </h1>
          <p style={{ color: '#cccccc', fontSize: 17, lineHeight: 1.7 }}>
            Reveal unlimited landlord contacts for 30 days.<br />
            Better than paying ₦5,000 per property.
          </p>
        </div>

        {/* Active subscription banner */}
        {subscription && (
          <>
            <div style={{ background: '#0e1c19', border: '0.5px solid #0ef6cc33', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0ef6cc', marginBottom: 2 }}>Pass Active</div>
                <div style={{ fontSize: 13, color: '#cccccc' }}>
                  Expires {new Date(subscription.expiry_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                </div>
              </div>
            </div>
            <a
              href="/browse"
              style={{
                display: 'block', width: '100%', padding: '15px',
                background: '#0ef6cc', color: '#080a0f',
                borderRadius: 12, fontWeight: 700, fontSize: 15,
                textAlign: 'center', textDecoration: 'none',
                marginBottom: '1.5rem', boxSizing: 'border-box',
              }}
            >
              Browse & Reveal Properties →
            </a>
          </>
        )}

        {/* Plan card */}
        <div style={{ background: '#111318', border: '0.5px solid #222', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>

          {/* Price header */}
          <div style={{ background: 'linear-gradient(135deg, #0a1f1a 0%, #111318 100%)', padding: '2rem', borderBottom: '0.5px solid #222', textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: '#cccccc', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>30-day pass</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#0ef6cc', lineHeight: 1 }}>₦25,000</span>
              <span style={{ fontSize: 16, color: '#cccccc', marginBottom: 6 }}>/month</span>
            </div>
            <div style={{ fontSize: 14, color: '#cccccc', marginTop: 8 }}>
              vs ₦5,000 × 5+ reveals = breaks even fast
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '1.5rem' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#ffffff' }}>
                  <span style={{ color: '#0ef6cc', fontSize: 16, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pay-per-reveal comparison */}
        <div style={{ background: '#0d0f14', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: 14, color: '#cccccc', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Without a pass</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['₦5,000 per contact reveal', 'Pay again for every property', 'Costs add up fast'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#cccccc' }}>
                <span style={{ color: '#333' }}>–</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={paying}
          style={{
            width: '100%', padding: '16px',
            background: paying ? '#0a5c50' : '#0ef6cc',
            color: '#080a0f', border: 'none', borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            cursor: paying ? 'not-allowed' : 'pointer',
            marginBottom: 12,
            transition: 'background 0.15s',
          }}
        >
          {paying
            ? 'Redirecting to Paystack…'
            : subscription
              ? 'Renew Pass — ₦25,000'
              : 'Get Tenant Pass — ₦25,000'}
        </button>

        <p style={{ fontSize: 14, color: '#cccccc', textAlign: 'center', lineHeight: 1.7 }}>
          Secure payment via Paystack. Pass activates immediately after payment.<br />
          Renewing extends your current expiry by 30 days.
        </p>

      </div>
    </div>
  )
}
