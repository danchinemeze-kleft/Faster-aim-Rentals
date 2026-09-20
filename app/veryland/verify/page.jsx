'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
]

export default function VerylandVerifyPage() {
  const [phase, setPhase] = useState(1) // 1: Identity, 2: Survey, 3: Title, 4: Chain, 5: Done
  const [state, setState] = useState('')
  const [user, setUser] = useState(null)
  const [nin, setNin] = useState('')
  const [bvn, setBvn] = useState('')
  const [selfie, setSelfie] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [verificationId, setVerificationId] = useState(null)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
  }, [])

  const handleSelfieCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelfie(file)
      const reader = new FileReader()
      reader.onload = () => setSelfiePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const submitIdentity = async () => {
    if (!state) {
      setMsg('Please select your state')
      setMsgType('error')
      return
    }
    if (!nin && !bvn) {
      setMsg('Please enter NIN or BVN')
      setMsgType('error')
      return
    }
    if (!selfie) {
      setMsg('Please capture a selfie')
      setMsgType('error')
      return
    }

    setLoading(true)
    setMsg('')

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const res = await fetch('/api/verify/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nin: nin || undefined,
            bvn: bvn || undefined,
            selfieBase64: reader.result,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setVerificationId(data.verification.id)
        setMsg('✅ Identity verified! Proceed to document uploads.')
        setMsgType('success')
        setTimeout(() => setPhase(2), 2000)
      }
      reader.readAsDataURL(selfie)
    } catch (err) {
      setMsg('Error: ' + err.message)
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Please log in to verify your property.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🏛️ Veryland Verification</h1>
          <p style={{ color: '#666' }}>Phase {phase} of 5: {['', 'Identity', 'Survey Plan', 'Primary Title', 'Chain of Title'][phase]}</p>
          <div style={{ marginTop: '20px', height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(phase / 5) * 100}%`, background: '#0ea5e9', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Phase 1: Identity */}
        {phase === 1 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Verify Your Identity</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>State *</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              >
                <option value="">Select your state...</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>NIN (optional)</label>
                <input
                  type="text"
                  value={nin}
                  onChange={e => setNin(e.target.value)}
                  placeholder="11-digit NIN"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>BVN (optional)</label>
                <input
                  type="text"
                  value={bvn}
                  onChange={e => setBvn(e.target.value)}
                  placeholder="11-digit BVN"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>Selfie *</label>
              <div style={{ border: '2px dashed #ddd', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
                {selfiePreview ? (
                  <div>
                    <img src={selfiePreview} alt="Selfie" style={{ width: '200px', height: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                    <p style={{ marginTop: '10px', color: '#666' }}>✅ Selfie captured</p>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSelfieCapture}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '3rem' }}>📸</div>
                    <p style={{ color: '#0ea5e9', fontWeight: 700 }}>Click to upload selfie</p>
                  </label>
                )}
              </div>
            </div>

            {msg && (
              <p style={{ color: msgType === 'error' ? '#e74c3c' : '#10b981', fontSize: '0.9rem', marginBottom: '20px' }}>
                {msg}
              </p>
            )}

            <button
              onClick={submitIdentity}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </div>
        )}

        {/* Phase 2-4: Document Uploads */}
        {phase >= 2 && phase <= 4 && (
          <div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {phase === 2 && '📋 Upload your Survey Plan (must have Red Seal & Beacon Numbers)'}
              {phase === 3 && '📄 Upload your Primary Title Document (C of O, Governor\'s Consent, or Gazette)'}
              {phase === 4 && '📑 Upload your Deed of Assignment (if primary title owner ≠ your name)'}
            </p>

            <div style={{ background: '#f9f9f9', border: '2px dashed #ddd', borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem' }}>📁</div>
              <p style={{ color: '#666', marginTop: '10px' }}>Document upload coming soon...</p>
            </div>

            <button
              onClick={() => setPhase(phase + 1)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continue to Next Step
            </button>
          </div>
        )}

        {/* Phase 5: Complete */}
        {phase === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Verification Complete!</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your documents are now being reviewed by our admin team. You'll be notified when your Veryland badge is approved.
            </p>
            <button
              onClick={() => window.location.href = '/veryland'}
              style={{
                padding: '12px 30px',
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back to Veryland
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
