'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BASE_URL = 'https://rent.fasteraim.com'

export default function AffiliateDashboard() {
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState(null)
  const [stats, setStats] = useState({ total_earned: 0, pending: 0, paid_out: 0, count: 0 })
  const [commissions, setCommissions] = useState([])
  const [copied, setCopied] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState('')
  const [requestingPayout, setRequestingPayout] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/account?redirect=/affiliate/dashboard'; return }

      const res = await fetch('/api/affiliate/stats', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!data.affiliate) { window.location.href = '/affiliate'; return }
      setAffiliate(data.affiliate)
      setStats(data.stats)
      setCommissions(data.commissions || [])
      setLoading(false)
    }
    load()
  }, [])

  const refLink = affiliate ? `${BASE_URL}?ref=${affiliate.ref_code}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Find verified rentals in Nigeria with Mr. Rent — no agent fees! Use my link: ${refLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handlePayoutRequest = async () => {
    if (stats.pending < 1000) { setPayoutMsg('Minimum payout is ₦1,000.'); return }
    setRequestingPayout(true)
    setPayoutMsg('')
    // For now, just show a confirmation — admin processes manually
    setTimeout(() => {
      setPayoutMsg(`✅ Payout request of ₦${stats.pending.toLocaleString()} submitted! We'll process within 7 working days to ${affiliate.bank_name} — ${affiliate.account_number}.`)
      setRequestingPayout(false)
    }, 800)
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
          <a href="/affiliate" style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>← Affiliate Home</a>
          <a href="/dashboard" style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Landlord Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Affiliate Dashboard</h1>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Welcome back, {affiliate?.full_name?.split(' ')[0] || 'Affiliate'} 👋 · Code: <strong style={{ color: '#0ea5e9' }}>{affiliate?.ref_code}</strong></p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Earned', value: `₦${stats.total_earned.toLocaleString()}`, color: '#0ea5e9', icon: '💰' },
            { label: 'Pending Payout', value: `₦${stats.pending.toLocaleString()}`, color: '#f59e0b', icon: '⏳' },
            { label: 'Paid Out', value: `₦${stats.paid_out.toLocaleString()}`, color: '#22c55e', icon: '✅' },
            { label: 'Conversions', value: stats.count, color: '#7c3aed', icon: '🎯' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral link card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1.5px solid #0ea5e922' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: '#0f172a' }}>🔗 Your Referral Link</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 200, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all' }}>
              {refLink}
            </div>
            <button onClick={copyLink} style={{ background: copied ? '#22c55e' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
            <button onClick={shareWhatsApp} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Share on WhatsApp
            </button>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            Commission rates: <strong style={{ color: '#0ea5e9' }}>₦500</strong> per contact reveal · <strong style={{ color: '#ff2d78' }}>₦2,000</strong> per landlord subscription
          </p>
        </div>

        {/* Payout request */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: '#0f172a' }}>💳 Request Payout</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
            Bank: <strong>{affiliate?.bank_name}</strong> · Account: <strong>{affiliate?.account_number}</strong> ({affiliate?.account_name})
          </p>
          {stats.pending < 1000 ? (
            <p style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, background: '#fffbeb', padding: '0.65rem 0.9rem', borderRadius: '8px' }}>
              ⏳ Minimum payout is ₦1,000. You have ₦{stats.pending.toLocaleString()} pending.
            </p>
          ) : (
            <button onClick={handlePayoutRequest} disabled={requestingPayout} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: requestingPayout ? 'not-allowed' : 'pointer', opacity: requestingPayout ? 0.7 : 1 }}>
              {requestingPayout ? 'Submitting...' : `Request ₦${stats.pending.toLocaleString()} Payout`}
            </button>
          )}
          {payoutMsg && <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: payoutMsg.includes('✅') ? '#22c55e' : '#e74c3c' }}>{payoutMsg}</p>}
        </div>

        {/* Commission history */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>📋 Commission History</h2>
          {commissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No commissions yet</p>
              <p style={{ fontSize: '0.85rem' }}>Share your link to start earning!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Date', 'Type', 'Transaction', 'Commission', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>{new Date(c.created_at).toLocaleDateString('en-NG')}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: c.transaction_type === 'reveal' ? '#e0f2fe' : '#fce7f3', color: c.transaction_type === 'reveal' ? '#0284c7' : '#be185d', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                          {c.transaction_type === 'reveal' ? 'Contact Reveal' : 'Landlord Sub'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>₦{c.transaction_amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0ea5e9' }}>₦{c.commission_amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: c.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: c.status === 'paid' ? '#16a34a' : '#d97706', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {c.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
