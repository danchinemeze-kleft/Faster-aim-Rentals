'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe',
  'Zamfara','FCT Abuja',
]

const DOC_TYPES = [
  { value: 'certificate_of_occupancy', label: 'Certificate of Occupancy (C of O)' },
  { value: 'survey_plan', label: 'Survey Plan' },
  { value: 'deed_of_assignment', label: 'Deed of Assignment' },
  { value: 'land_purchase_receipt', label: 'Land Purchase Receipt' },
  { value: 'building_approval', label: 'Building Approval / Plan' },
  { value: 'gazette', label: 'Gazette / Right of Occupancy (R of O)' },
  { value: 'tenancy_agreement', label: 'Tenancy Agreement' },
  { value: 'other', label: 'Other Document' },
]

const BADGES = [
  { level: 'white',  color: '#9ca3af', bg: '#1f2937', label: 'White',  desc: 'Documents received — pending human review' },
  { level: 'yellow', color: '#f59e0b', bg: '#1c1507', label: 'Yellow', desc: 'Partial verification — some documents confirmed' },
  { level: 'green',  color: '#10b981', bg: '#051a0f', label: 'Green',  desc: 'Fully verified — all documents authenticated' },
  { level: 'blue',   color: '#3b82f6', bg: '#050f1a', label: 'Blue',   desc: 'Premium — comprehensive title & survey verified' },
]

function BadgeIcon({ color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill={color} />
      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function renderAnalysis(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} style={{ fontWeight: 700, color: '#e8e8e8', margin: '1rem 0 0.25rem' }}>{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('**')) {
      const parts = line.split('**')
      return <p key={i} style={{ margin: '0.75rem 0 0.15rem' }}><strong style={{ color: '#e8e8e8' }}>{parts[1]}</strong>{parts[2] || ''}</p>
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return <p key={i} style={{ paddingLeft: '1rem', margin: '0.15rem 0', color: '#aaa' }}>• {line.replace(/^[-•]\s*/, '')}</p>
    }
    if (line.includes('LIKELY AUTHENTIC')) {
      return <p key={i} style={{ color: '#10b981', fontWeight: 700, fontSize: 15, margin: '0.5rem 0' }}>{line}</p>
    }
    if (line.includes('LIKELY FRAUDULENT')) {
      return <p key={i} style={{ color: '#ef4444', fontWeight: 700, fontSize: 15, margin: '0.5rem 0' }}>{line}</p>
    }
    if (line.includes('UNCERTAIN')) {
      return <p key={i} style={{ color: '#f59e0b', fontWeight: 700, fontSize: 15, margin: '0.5rem 0' }}>{line}</p>
    }
    if (!line.trim()) return <br key={i} />
    return <p key={i} style={{ margin: '0.15rem 0', color: '#bbb' }}>{line}</p>
  })
}

export default function VerylandPage() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState('check')

  // AI check
  const [checkFile, setCheckFile] = useState(null)
  const [checkAddress, setCheckAddress] = useState('')
  const [checkState, setCheckState] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const [checkDrag, setCheckDrag] = useState(false)
  const checkInputRef = useRef(null)

  // Submit
  const [form, setForm] = useState({ ownerName: '', email: '', phone: '', propertyAddress: '', state: '', listingId: '', additionalInfo: '' })
  const [docs, setDocs] = useState([{ type: '', file: null, preview: null }])
  const [userListings, setUserListings] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])

  useEffect(() => {
    let settled = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (settled) return
      settled = true
      setSession(sess)
      setAuthLoading(false)
      if (sess) {
        loadProfile(sess.user.id)
        loadListings(sess.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function loadProfile(uid) {
    const { data } = await supabase.from('Profiles').select('*').eq('id', uid).single()
    if (data) {
      setProfile(data)
      setForm(f => ({ ...f, ownerName: data.full_name || '', email: data.email || '', phone: data.phone || '' }))
    }
  }

  async function loadListings(uid) {
    const { data } = await supabase.from('listings').select('id, title, location').eq('landlord_id', uid)
    if (data) setUserListings(data)
  }

  async function handleAICheck(e) {
    e.preventDefault()
    if (!checkFile) return
    setChecking(true)
    setCheckResult(null)
    try {
      const fd = new FormData()
      fd.append('document', checkFile)
      fd.append('address', checkAddress)
      fd.append('state', checkState)
      const res = await fetch('/api/veryland/check', { method: 'POST', body: fd })
      const data = await res.json()
      setCheckResult(data.analysis || 'No analysis returned.')
    } catch {
      setCheckResult('AI check failed. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  function addDoc() {
    setDocs(d => [...d, { type: '', file: null, preview: null }])
  }
  function removeDoc(i) {
    setDocs(d => d.filter((_, idx) => idx !== i))
  }
  function setDocField(i, field, value) {
    setDocs(d => d.map((doc, idx) => idx === i ? { ...doc, [field]: value } : doc))
  }
  function handleDocFile(i, file) {
    const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setDocs(d => d.map((doc, idx) => idx === i ? { ...doc, file, preview } : doc))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!session) return
    const validDocs = docs.filter(d => d.file && d.type)
    if (validDocs.length === 0) { setSubmitError('Add at least one document with a type selected.'); return }
    if (!form.propertyAddress || !form.state) { setSubmitError('Property address and state are required.'); return }
    setSubmitting(true)
    setSubmitError('')

    try {
      const uploaded = []
      for (const doc of validDocs) {
        const ext = doc.file.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('veryland-docs').upload(path, doc.file, { contentType: doc.file.type })
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`)
        const { data: { publicUrl } } = supabase.storage.from('veryland-docs').getPublicUrl(path)
        uploaded.push({ url: publicUrl, type: doc.type, name: doc.file.name })
      }

      const { error: insErr } = await supabase.from('veryland_submissions').insert({
        owner_name: form.ownerName,
        owner_email: form.email,
        owner_phone: form.phone,
        property_address: form.propertyAddress,
        state: form.state,
        listing_id: form.listingId || null,
        documents: uploaded,
        additional_info: form.additionalInfo,
        status: 'submitted',
        badge_level: 'white',
        submitted_at: new Date().toISOString(),
      })
      if (insErr) throw new Error(insErr.message)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: iStyle,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'DM Sans, Segoe UI, sans-serif', color: '#e8e8e8' }}>

      {/* Nav */}
      <nav style={{ background: '#0c0e14', borderBottom: '0.5px solid #1e293b', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ color: '#e8e8e8', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>🏠 Mr. Rent</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="/browse" style={navLink}>Browse</a>
          <a href="/search" style={navLink}>AI Chat</a>
          <a href="/list" style={navLink}>List Property</a>
          <a href="/veryland" style={{ ...navLink, color: '#3b82f6', fontWeight: 700 }}>Veryland</a>
          <a href="/account" style={{ background: '#1d4ed8', color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            {session ? 'My Account' : 'Sign In'}
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #050a1a 0%, #080a0f 100%)', padding: '4rem 2rem 3rem', textAlign: 'center', borderBottom: '0.5px solid #1e293b' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, margin: '0 0 1.25rem', letterSpacing: '-1px' }}>Veryland☑️</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0f1a2e', border: '0.5px solid #1d4ed8', borderRadius: 20, padding: '4px 14px', marginBottom: '1.5rem' }}>
            <BadgeIcon color="#3b82f6" size={16} />
            <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Nigeria&apos;s First Property Document Verification</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Verify Your Property.<br />
            <span style={{ color: '#3b82f6' }}>Earn Trust.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Submit your title documents for human review. Get a Veryland badge displayed on your listing so tenants and buyers know your property is authentic.
          </p>

          {/* Badge levels */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {BADGES.map(b => (
              <div key={b.level} style={{ background: b.bg, border: `1px solid ${b.color}44`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                <BadgeIcon color={b.color} size={22} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: b.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ maxWidth: 800, margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '0.5px solid #1e293b', paddingBottom: 12, marginBottom: '2rem' }}>
          {[
            { key: 'check', label: '🤖 AI Quick Check', desc: 'Free instant scan' },
            { key: 'submit', label: '📋 Submit for Verification', desc: 'Official human review' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? '#1d4ed8' : 'transparent',
              color: tab === t.key ? '#fff' : '#64748b',
              border: tab === t.key ? 'none' : '0.5px solid #1e293b',
              borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
            }}>
              {t.label}
              <span style={{ display: 'block', fontSize: 10, opacity: 0.7, fontWeight: 400, marginTop: 1 }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ── AI CHECK TAB ── */}
        {tab === 'check' && (
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ background: '#0d1117', border: '0.5px solid #1e293b', borderRadius: 16, padding: '1.75rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 0.5rem' }}>AI Document Quick Check</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 1.5rem' }}>
                Upload a photo or scan of any property document. Our AI will analyse it for authenticity, red flags, and recommendations in seconds. Free for all signed-in users.
              </p>

              {!session && !authLoading && (
                <div style={{ background: '#0f1a2e', border: '0.5px solid #1d4ed8', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Sign in to use the AI Document Check.</span>
                  <a href="/account?redirect=/veryland" style={{ background: '#1d4ed8', color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Sign In / Sign Up</a>
                </div>
              )}

              <form onSubmit={handleAICheck}>
                {/* Drop zone */}
                <div
                  onClick={() => checkInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setCheckDrag(true) }}
                  onDragLeave={() => setCheckDrag(false)}
                  onDrop={e => { e.preventDefault(); setCheckDrag(false); const f = e.dataTransfer.files[0]; if (f) setCheckFile(f) }}
                  style={{
                    border: `2px dashed ${checkDrag ? '#3b82f6' : checkFile ? '#10b981' : '#1e293b'}`,
                    borderRadius: 12, padding: '2rem', textAlign: 'center',
                    cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: '1rem',
                    background: checkFile ? '#051a0f' : '#080c14',
                  }}
                >
                  <input ref={checkInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && setCheckFile(e.target.files[0])} />
                  {checkFile ? (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: 14 }}>{checkFile.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Click to change file</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                      <div style={{ color: '#94a3b8', fontSize: 14 }}>Drop document here or <span style={{ color: '#3b82f6' }}>click to browse</span></div>
                      <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>JPEG, PNG, PDF — max 5MB</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                  <div>
                    <label style={lbl}>Property address (optional)</label>
                    <input placeholder="e.g. 12 Awka Road, Onitsha" value={checkAddress} onChange={e => setCheckAddress(e.target.value)} style={iStyle} />
                  </div>
                  <div>
                    <label style={lbl}>State (optional)</label>
                    <select value={checkState} onChange={e => setCheckState(e.target.value)} style={iStyle}>
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!checkFile || checking || (!session && !authLoading)}
                  style={{
                    background: checking ? '#1e293b' : '#1d4ed8',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: checking ? 'not-allowed' : 'pointer',
                    width: '100%', opacity: (!checkFile || (!session && !authLoading)) ? 0.5 : 1,
                  }}
                >
                  {checking ? '⏳ Analysing document…' : '🔍 Analyse Document'}
                </button>
              </form>

              {checkResult && (
                <div style={{ marginTop: '1.5rem', background: '#050a14', border: '0.5px solid #1e293b', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Analysis Result</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }}>{renderAnalysis(checkResult)}</div>
                  <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#0f1a2e', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
                    ⚠️ This is an AI-generated preliminary check, not a legal verification. For an official badge on your listing, <button onClick={() => setTab('submit')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600 }}>submit for human review →</button>
                  </div>
                </div>
              )}
            </div>

            {/* How AI check works */}
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { icon: '📤', title: 'Upload document', desc: 'Photo or scan of your title document' },
                { icon: '🤖', title: 'AI analyses it', desc: 'Gemini AI checks for stamps, seals, formatting' },
                { icon: '📊', title: 'Instant report', desc: 'Red flags, authenticity signs, verdict' },
              ].map(s => (
                <div key={s.title} style={{ background: '#0d1117', border: '0.5px solid #1e293b', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUBMIT TAB ── */}
        {tab === 'submit' && (
          <div style={{ marginBottom: '4rem' }}>
            {!session && !authLoading && (
              <div style={{ background: '#0f1a2e', border: '0.5px solid #1d4ed8', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center' }}>
                <BadgeIcon color="#3b82f6" size={40} />
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '1rem 0 0.5rem' }}>Sign in to submit</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.5rem' }}>You need to be signed in to submit property documents for verification.</p>
                <a href="/account?redirect=/veryland" style={{ background: '#1d4ed8', color: '#fff', padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Sign In / Create Account</a>
              </div>
            )}

            {session && submitted && (
              <div style={{ background: '#051a0f', border: '1px solid #10b981', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#10b981', margin: '0 0 0.75rem' }}>Submission received!</h2>
                <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
                  Your property documents have been submitted for review. You&apos;ll receive a <strong style={{ color: '#e8e8e8' }}>white badge</strong> immediately, and our team will review your submission within <strong style={{ color: '#e8e8e8' }}>3–5 business days</strong>.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setSubmitted(false); setDocs([{ type: '', file: null, preview: null }]); setForm(f => ({ ...f, propertyAddress: '', state: '', listingId: '', additionalInfo: '' })) }} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Submit another property
                  </button>
                  <a href="/dashboard" style={{ background: 'transparent', color: '#64748b', border: '0.5px solid #1e293b', borderRadius: 10, padding: '9px 22px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>Go to dashboard</a>
                </div>
              </div>
            )}

            {session && !submitted && (
              <form onSubmit={handleSubmit}>
                <div style={{ background: '#0d1117', border: '0.5px solid #1e293b', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 1.25rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>Owner information</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={lbl}>Full name *</label>
                      <input placeholder="Your legal name" {...inp('ownerName')} required />
                    </div>
                    <div>
                      <label style={lbl}>Email *</label>
                      <input type="email" placeholder="your@email.com" {...inp('email')} required />
                    </div>
                    <div>
                      <label style={lbl}>Phone number *</label>
                      <input type="tel" placeholder="+234 …" {...inp('phone')} required />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#0d1117', border: '0.5px solid #1e293b', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 1.25rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Property details</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>Property address *</label>
                      <input placeholder="Full property address" {...inp('propertyAddress')} required />
                    </div>
                    <div>
                      <label style={lbl}>State *</label>
                      <select {...inp('state')} required>
                        <option value="">Select state…</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {userListings.length > 0 && (
                      <div>
                        <label style={lbl}>Link to your listing (optional)</label>
                        <select {...inp('listingId')}>
                          <option value="">None — not yet listed</option>
                          {userListings.map(l => <option key={l.id} value={l.id}>{l.title || l.location || l.id}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>Additional information (optional)</label>
                      <textarea
                        placeholder="Any details about your documents, history of the property, or context that may help our reviewers…"
                        value={form.additionalInfo}
                        onChange={e => setForm(f => ({ ...f, additionalInfo: e.target.value }))}
                        rows={3}
                        style={{ ...iStyle, resize: 'vertical', minHeight: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#0d1117', border: '0.5px solid #1e293b', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Documents to submit</h2>
                    <button type="button" onClick={addDoc} style={{ background: '#1e293b', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add document</button>
                  </div>

                  {docs.map((doc, i) => (
                    <div key={i} style={{ background: '#080c14', border: '0.5px solid #1e293b', borderRadius: 12, padding: '1rem', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Document {i + 1}</span>
                        {docs.length > 1 && (
                          <button type="button" onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: '0 4px' }}>Remove</button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={lbl}>Document type *</label>
                          <select value={doc.type} onChange={e => setDocField(i, 'type', e.target.value)} style={iStyle} required>
                            <option value="">Select type…</option>
                            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>File *</label>
                          <label style={{ ...iStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: doc.file ? '#10b981' : '#475569' }}>
                            <span style={{ fontSize: 16 }}>{doc.file ? '✅' : '📎'}</span>
                            <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.file ? doc.file.name : 'Click to upload file'}
                            </span>
                            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleDocFile(i, e.target.files[0])} />
                          </label>
                        </div>
                      </div>
                      {doc.preview && (
                        <img src={doc.preview} alt="preview" style={{ marginTop: 10, maxHeight: 120, maxWidth: '100%', borderRadius: 8, border: '0.5px solid #1e293b', objectFit: 'cover' }} />
                      )}
                    </div>
                  ))}

                  <p style={{ fontSize: 12, color: '#475569', margin: '0.5rem 0 0' }}>
                    Accepted: JPEG, PNG, PDF. Max 10MB per file. Upload C of O, Survey Plan, or Deed of Assignment for the best verification outcome.
                  </p>
                </div>

                {submitError && (
                  <div style={{ background: '#1a0505', border: '0.5px solid #ef4444', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13, color: '#ef4444' }}>
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', background: submitting ? '#1e293b' : '#1d4ed8', color: '#fff',
                    border: 'none', borderRadius: 12, padding: '13px', fontSize: 15,
                    fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? '⏳ Uploading and submitting…' : '📋 Submit for Verification'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 10 }}>
                  Free to submit. Our team reviews within 3–5 business days. You&apos;ll get a Veryland badge on your listing once verified.
                </p>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '0.5px solid #1e293b', padding: '2rem', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none', marginRight: 16 }}>Home</a>
          <a href="/browse" style={{ color: '#64748b', textDecoration: 'none', marginRight: 16 }}>Browse</a>
          <a href="/search" style={{ color: '#64748b', textDecoration: 'none', marginRight: 16 }}>AI Chat</a>
          <a href="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
        <div>© {new Date().getFullYear()} Faster Aim Technology Limited. Veryland is a service of Mr. Rent.</div>
      </footer>
    </div>
  )
}

const navLink = { color: '#94a3b8', textDecoration: 'none', fontSize: 14 }
const lbl = { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5, fontWeight: 500 }
const iStyle = {
  width: '100%', padding: '9px 12px', background: '#080c14',
  border: '0.5px solid #1e293b', borderRadius: 8, color: '#e8e8e8',
  fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
}
