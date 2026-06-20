'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function PaySuccessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [expiryDate, setExpiryDate] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      setErrorMsg('No payment reference found. If you completed payment, please contact support.')
      setStatus('error')
      return
    }

    async function verify() {
      try {
        // Get the user's access token so the server route can authenticate the Supabase INSERT
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token || ''

        const res = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reference }),
        })
        const data = await res.json()
        if (data.success) {
          setExpiryDate(data.expiry_date)
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Segoe UI, system-ui, sans-serif', color: 'var(--text-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {status === 'verifying' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #1a1d24', borderTopColor: '#0ef6cc', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: 16, color: '#666' }}>Activating your subscription…</div>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0ef6cc', marginBottom: 10 }}>
            Subscription Activated!
          </h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: '2rem' }}>
            You can now list unlimited properties on Mr. Rent.
            {expiryDate && (
              <> Your subscription is active until <strong style={{ color: '#e8e8e8' }}>
                {new Date(expiryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </strong>.</>
            )}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => router.push('/list')}
              style={{ width: '100%', padding: '14px', background: '#0ef6cc', color: '#080a0f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              + List a Property Now
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '13px', background: 'transparent', color: '#888', border: '0.5px solid #222', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8e8e8', marginBottom: 10 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: '2rem' }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => router.push('/subscribe')}
              style={{ width: '100%', padding: '14px', background: '#0ef6cc', color: '#080a0f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              Try Again
            </button>
            <a
              href="mailto:info@fasteraim.com"
              style={{ width: '100%', padding: '13px', background: 'transparent', color: '#888', border: '0.5px solid #222', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading...</div>}>
      <PaySuccessInner />
    </Suspense>
  )
}
