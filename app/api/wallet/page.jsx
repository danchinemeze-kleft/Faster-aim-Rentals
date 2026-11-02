'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const naira = (n) => '₦' + Number(n || 0).toLocaleString()
const day = (d) =>
  new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

const STATUS_COLOR = { pending: '#f5b942', paid: '#0ef6cc', rejected: '#ff6b5b' }

const card = {
  background: '#111318',
  border: '0.5px solid #222',
  borderRadius: 16,
  padding: '1.25rem',
  marginBottom: '1.25rem',
}

export default function WalletPage() {
  const router = useRouter()
  const [w, setW] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token || null
  }

  async function load() {
    try {
      const t = await getToken()
      if (!t) {
        router.replace('/account?redirect=/wallet')
        return
      }
      const r = await fetch('/api/wallet', { headers: { Authorization: `Bearer ${t}` } })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) setErr(j.error || 'Could not load your balance.')
      else setW(j)
    } catch (e) {
      setErr('Network problem. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function requestPayout() {
    setBusy(true)
    setErr('')
    try {
      const t = await getToken()
      const r = await fetch('/api/wallet', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) setErr(j.error || 'Request failed.')
      await load()
    } catch (e) {
      setErr('Network problem. Please try again.')
    }
    setBusy(false)
  }

  const shell = (children) => (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Segoe UI, system-ui, sans-serif', color: '#ffffff' }}>
      <div style={{ background: '#111318', borderBottom: '0.5px solid #222', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} aria-label="Go back" style={{ background: 'transparent', border: 'none', color: '#cccccc', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15 }}>Mr. Rent</span>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#cccccc', fontSize: 13 }}>My Balance</span>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1.5rem' }}>{children}</div>
    </div>
  )

  if (loading) return shell(<div style={{ color: '#cccccc', textAlign: 'center' }}>Loading…</div>)

  if (err && !w) return shell(<div style={{ color: '#ffd5cf', textAlign: 'center' }}>{err}</div>)

  if (!w?.affiliate)
    return shell(
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={{ color: '#cccccc', marginBottom: 14 }}>You don’t have an affiliate account yet.</p>
        <a href="/affiliate" style={{ color: '#0ef6cc', fontWeight: 700 }}>Become an affiliate →</a>
      </div>
    )

  const hasBank = !!w.affiliate.account_number
  const enough = w.available >= w.min_payout
  const canRequest = hasBank && enough && !busy

  return shell(
    <>
      {/* Balance card */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #0a1f1a 0%, #111318 100%)', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#cccccc', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Available balance</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: '#0ef6cc', lineHeight: 1.1 }}>{naira(w.available)}</div>
        <div style={{ fontSize: 14, color: '#cccccc', marginTop: 10 }}>
          Processing: {naira(w.processing)} · Paid out: {naira(w.paid)}
        </div>

        <button
          onClick={requestPayout}
          disabled={!canRequest}
          style={{
            width: '100%', padding: '15px', marginTop: 18,
            background: canRequest ? '#0ef6cc' : '#0a5c50',
            color: '#080a0f', border: 'none', borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            cursor: canRequest ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Requesting…' : 'Request payout'}
        </button>

        {!hasBank && (
          <p style={{ fontSize: 13, color: '#f5b942', marginTop: 12 }}>
            Add your bank details in your <a href="/affiliate/dashboard" style={{ color: '#0ef6cc' }}>affiliate dashboard</a> first.
          </p>
        )}
        {hasBank && !enough && (
          <p style={{ fontSize: 13, color: '#cccccc', marginTop: 12 }}>
            Minimum payout is {naira(w.min_payout)}.
          </p>
        )}
        {hasBank && (
          <p style={{ fontSize: 13, color: '#aaaaaa', marginTop: 12 }}>
            Paying to: {w.affiliate.bank_name} · {w.affiliate.account_number} · {w.affiliate.account_name}
          </p>
        )}
        {err && (
          <p role="alert" style={{ fontSize: 14, color: '#ffd5cf', marginTop: 12 }}>{err}</p>
        )}
      </div>

      {/* Payout history */}
      <div style={card}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Payout history</h3>
        {w.payouts.length === 0 && <p style={{ color: '#aaaaaa', fontSize: 14 }}>No payouts yet.</p>}
        {w.payouts.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '0.5px solid #222', fontSize: 14 }}>
            <span style={{ color: '#cccccc' }}>
              {day(p.created_at)}{p.admin_note ? ` · ${p.admin_note}` : ''}
            </span>
            <span>
              {naira(p.amount)}{' '}
              <span style={{ color: STATUS_COLOR[p.status] || '#cccccc', fontWeight: 600 }}>{p.status}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Earnings */}
      <div style={card}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Earnings</h3>
        {w.earnings.length === 0 && (
          <p style={{ color: '#aaaaaa', fontSize: 14 }}>No earnings yet. Share your link to start earning.</p>
        )}
        {w.earnings.map((c) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '0.5px solid #222', fontSize: 14 }}>
            <span style={{ color: '#cccccc' }}>
              {day(c.created_at)} · {c.transaction_type.replace(/_/g, ' ')}
            </span>
            <span style={{ color: '#0ef6cc', fontWeight: 600 }}>+{naira(c.commission_amount)}</span>
          </div>
        ))}
      </div>
    </>
  )
}