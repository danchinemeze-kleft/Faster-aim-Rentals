'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BASE_URL = 'https://rent.fasteraim.com'

export default function AffiliateDashboard() {
  const [user, setUser] = useState(null)
  const [affiliate, setAffiliate] = useState(null)
  const [commissions, setCommissions] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, reveals: 0, subscriptions: 0 })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/account?redirect=/affiliate/dashboard'
        return
      }

      setUser(session.user)

      // Load affiliate profile
      const { data: aff } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!aff) {
        window.location.href = '/affiliate'
        return
      }

      setAffiliate(aff)

      // Load commissions
      const { data: comms } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', session.user.id)
        .order('created_at', { ascending: false })

      if (comms) {
        setCommissions(comms)

        // Calculate stats
        const total = comms.reduce((sum, c) => sum + c.commission_amount, 0)
        const pending = comms
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.commission_amount, 0)
        const paid = comms
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.commission_amount, 0)
        const reveals = comms.filter(c => c.transaction_type === 'reveal').length
        const subscriptions = comms.filter(c => c.transaction_type === 'landlord_subscription').length

        setStats({ total, pending, paid, reveals, subscriptions })
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  const refLink = affiliate ? `${BASE_URL}?ref=${affiliate.ref_code}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-NG', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!affiliate) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a' }}>
      
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(90deg,#0ea5e9,#ff2d78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>🏠 Mr. Rent</a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/affiliate" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>← Back</a>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Affiliate Dashboard</h1>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>Track your earnings and referrals</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>TOTAL EARNINGS</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0ea5e9', marginBottom: '0.25rem' }}>₦{(stats.total).toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>from {commissions.length} transactions</div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>PENDING</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ff9800', marginBottom: '0.25rem' }}>₦{(stats.pending).toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>awaiting payout</div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>PAID</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', marginBottom: '0.25rem' }}>₦{(stats.paid).toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>successfully paid</div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>REFERRAL PERFORMANCE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7c3aed', marginBottom: '0.25rem' }}>{stats.reveals} + {stats.subscriptions}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>reveals + subscriptions</div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '1.5px solid #0ea5e944', marginBottom: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Your Referral Link</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600 }}>Share this link to start earning commissions instantly</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch', marginBottom: '1rem' }}>
            <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all', display: 'flex', alignItems: 'center' }}>
              {refLink}
            </div>
            <button onClick={copyLink} style={{ background: copied ? '#22c55e' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Share on WhatsApp, Facebook, Twitter, or anywhere!</p>
        </div>

        {/* Recent Transactions */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Recent Commissions</h2>
          
          {commissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>No commissions yet</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Share your link and start earning!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontWeight: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#64748b', fontWeight: 700 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#64748b', fontWeight: 700 }}>Type</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#64748b', fontWeight: 700 }}>Amount</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#64748b', fontWeight: 700 }}>Commission</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 0', color: '#64748b', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                      <td style={{ padding: '1rem 0' }}>{formatDate(c.created_at)}</td>
                      <td style={{ padding: '1rem 0' }}>
                        {c.transaction_type === 'reveal' ? '💰 Contact Reveal' : '🏠 Landlord Sub'}
                      </td>
                      <td style={{ padding: '1rem 0', textAlign: 'right' }}>₦{(c.transaction_amount).toLocaleString()}</td>
                      <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: '#0ea5e9' }}>₦{(c.commission_amount).toLocaleString()}</td>
                      <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: c.status === 'pending' ? '#fef08a' : '#dcfce7',
                          color: c.status === 'pending' ? '#854d0e' : '#166534'
                        }}>
                          {c.status === 'pending' ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', border: '1px solid #e2e8f0', marginTop: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Account Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</div>
              <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{affiliate.full_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phone / WhatsApp</div>
              <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{affiliate.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bank</div>
              <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{affiliate.bank_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Number</div>
              <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{affiliate.account_number}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Name</div>
              <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{affiliate.account_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ref Code</div>
              <div style={{ fontSize: '0.95rem', color: '#0ea5e9', fontWeight: 700, fontFamily: 'monospace' }}>{affiliate.ref_code}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
        © 2026 Faster Aim Technology Limited · <a href="/privacy-policy" style={{ color: '#94a3b8' }}>Privacy Policy</a> · <a href="/terms-of-service" style={{ color: '#94a3b8' }}>Terms</a>
      </footer>
    </div>
  )
}
