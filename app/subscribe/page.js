'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const FEATURES = [
  'Unlimited property listings per month',
  'Properties appear in tenant searches',
  'Receive ₦5,000 contact reveal payments',
  'Priority placement in browse results',
  'Full landlord dashboard & analytics',
  'Mr. Rent AI promotes your listings',
  'Cancel anytime',
]

export default function SubscribePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/account?redirect=/subscribe')
        return
      }
      setUser(session.user)

      const { data: sub } = await supabase
        .from('Subscription')
        .select('expiry_date')
        .eq('landlord_id', session.user.id)
        .gte('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1)
        .single()

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
          type: 'landlord',
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
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ color: '#555', fontSize: 14 }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'Segoe UI, system-ui, sans-serif', color: '#e8e8e8' }}>

      {/* Top bar */}
      <div style={{ background: '#111318', borderBottom: '0.5px solid #222', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15 }}>Mr. Rent</span>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#aaa', fontSize: 13 }}>Subscribe</span>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8e8', marginBottom: 8 }}>
            Landlord Plan
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            List unlimited properties and reach thousands of tenants across Nigeria.
          </p>
        </div>

        {/* Active subscription banner */}
        {subscription && (
          <div style={{ background: '#0e1c19', border: '0.5px solid #0ef6cc33', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0ef6cc', marginBottom: 2 }}>Subscription Active</div>
              <div style={{ fontSize: 13, color: '#666' }}>
                Expires {new Date(subscription.expiry_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </div>
            </div>
          </div>
        )}

        {/* Plan card */}
        <div style={{ background: '#111318', border: '0.5px solid #222', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>

          {/* Price header */}
          <div style={{ background: 'linear-gradient(135deg, #0a1f1a 0%, #111318 100%)', padding: '2rem', borderBottom: '0.5px solid #222', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly plan</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#0ef6cc', lineHeight: 1 }}>₦10,000</span>
              <span style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>/month</span>
            </div>
            <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>Billed monthly · Cancel anytime</div>
          </div>

          {/* Features */}
          <div style={{ padding: '1.5rem' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#ccc' }}>
                  <span style={{ color: '#0ef6cc', fontSize: 16, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free tier comparison */}
        <div style={{ background: '#0d0f14', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free tier (current)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Up to 2 listings per month',
              'Basic search visibility',
              'Contact reveal payments',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555' }}>
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
            letterSpacing: '0.2px',
          }}
        >
          {paying
            ? 'Redirecting to Paystack…'
            : subscription
              ? 'Renew Subscription — ₦10,000'
              : 'Subscribe Now — ₦10,000/month'}
        </button>

        <p style={{ fontSize: 12, color: '#444', textAlign: 'center', lineHeight: 1.7 }}>
          Secure payment via Paystack. Your subscription activates immediately after payment.<br />
          Renewing extends your current expiry by 30 days.
        </p>

      </div>
    </div>
  )
}
