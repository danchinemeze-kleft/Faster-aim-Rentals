'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token || ''

        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
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

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'Segoe UI, system-ui, sans-serif', color: '#e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {status === 'verifying' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #1a1d24', borderTopColor: '#0ef6cc', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: 15, color: '#666' }}>Verifying your payment…</div>
        </div>
      )}

      {status === 'success' && contact && (
        <div style={{ textAlign: 'center', maxWidth: 460, width: '100%' }}>
          <div style={{ fontSize: 56, marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0ef6cc', marginBottom: 6 }}>Contact Revealed!</h1>
          {listing && (
            <p style={{ color: '#666', fontSize: 13, marginBottom: '1.5rem' }}>
              {listing.title} — {listing.location}, {listing.state}
            </p>
          )}

          <div style={{ background: '#111318', border: '0.5px solid #0ef6cc44', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#0ef6cc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Landlord Contact</div>

            {contact.full_name && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Name</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e8e8' }}>{contact.full_name}</div>
              </div>
            )}

            {contact.phone && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Phone</div>
                <a href={`tel:${contact.phone}`} style={{ fontSize: 22, fontWeight: 700, color: '#0ef6cc', textDecoration: 'none', display: 'block' }}>
                  📞 {contact.phone}
                </a>
              </div>
            )}

            {contact.phone && (
              <a
                href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1f0d', border: '0.5px solid #25D36633', borderRadius: 8, padding: '10px 14px', textDecoration: 'none', marginBottom: 12 }}
              >
                <span style={{ fontSize: 18 }}>💬</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#25D366' }}>WhatsApp Landlord</span>
              </a>
            )}

            {contact.email && (
              <div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Email</div>
                <a href={`mailto:${contact.email}`} style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>
                  ✉️ {contact.email}
                </a>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => router.push('/browse')}
              style={{ width: '100%', padding: '13px', background: '#0ef6cc', color: '#080a0f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Browse More Properties
            </button>
            <button
              onClick={() => router.back()}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#666', border: '0.5px solid #222', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              Back to Listing
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8e8e8', marginBottom: 10 }}>Something went wrong</h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: '2rem' }}>{errorMsg}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => router.push('/browse')}
              style={{ width: '100%', padding: '13px', background: '#0ef6cc', color: '#080a0f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Back to Browse
            </button>
            <a
              href="mailto:info@fasteraim.com"
              style={{ display: 'block', width: '100%', padding: '12px', background: 'transparent', color: '#666', border: '0.5px solid #222', borderRadius: 10, fontWeight: 600, fontSize: 13, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function RevealSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading…</div>}>
      <RevealSuccessInner />
    </Suspense>
  )
}
