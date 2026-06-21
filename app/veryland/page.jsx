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
  { level: 'white',  color: '#9ca3af', bg: '#1f2937', label: 'Survey Plan',          desc: 'Survey Plan on file — pending review' },
  { level: 'yellow', color: '#f59e0b', bg: '#1c1507', label: 'Title Document',        desc: 'C of O or R of O authenticated' },
  { level: 'green',  color: '#10b981', bg: '#051a0f', label: 'Deed & Title Verified', desc: 'Deed of Assignment + C of O confirmed' },
  { level: 'blue',   color: '#3b82f6', bg: '#050f1a', label: 'Fully Authenticated',   desc: 'All documents verified — highest trust level' },
]

// Scalloped badge seal — 12 curved bumps, smooth Q-bezier path, 28×28 viewBox
const SEAL_PATH =
  'M12.68,2.82 Q14.00,1.50 15.32,2.83 Q16.64,4.15 18.45,3.66 Q20.25,3.18 20.73,4.98 Q21.21,6.79 23.02,7.27 Q24.83,7.75 24.34,9.55 Q23.85,11.36 25.18,12.68 Q26.50,14.00 25.18,15.32 Q23.85,16.64 24.34,18.45 Q24.83,20.25 23.02,20.73 Q21.21,21.21 20.73,23.02 Q20.25,24.83 18.44,24.34 Q16.64,23.85 15.32,25.18 Q14.00,26.50 12.68,25.18 Q11.36,23.85 9.56,24.34 Q7.75,24.83 7.27,23.02 Q6.79,21.21 4.98,20.73 Q3.18,20.25 3.66,18.45 Q4.15,16.64 2.82,15.32 Q1.50,14.00 2.82,12.68 Q4.15,11.36 3.66,9.55 Q3.18,7.75 4.98,7.27 Q6.79,6.79 7.27,4.98 Q7.75,3.18 9.56,3.66 Q11.36,4.15 12.68,2.82 Z'

function PremiumBadge({ size = 28, id = 'pb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Soft outer glow ring */}
      <path d={SEAL_PATH} fill="rgba(37,99,235,0.28)" transform="translate(14,14) scale(1.12) translate(-14,-14)" filter={`url(#${id}-glow)`} />
      {/* Badge body */}
      <path d={SEAL_PATH} fill={`url(#${id}-g)`} />
      {/* White checkmark */}
      <path d="M9.5,14 L12.5,17.5 L19,10.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function BadgeIcon({ color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill={color} />
      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


const TIER_META = {
  white:  { color: '#9ca3af', bg: '#1a1d24', border: '#374151', label: 'Minimum Documentation' },
  yellow: { color: '#f59e0b', bg: '#1c1507', border: '#78350f', label: 'Partial Documentation' },
  green:  { color: '#10b981', bg: '#051a0f', border: '#065f46', label: 'Strong Documentation' },
  blue:   { color: '#3b82f6', bg: '#050f1a', border: '#1e3a5f', label: 'Fully Authenticated' },
}

function VerylandResult({ result, onSubmit }) {
  if (result.error) {
    return (
      <div style={{ marginTop: '1.5rem', background: '#1a0505', border: '0.5px solid #ef4444', borderRadius: 12, padding: '1.25rem', fontSize: 13, color: '#ef4444' }}>
        {result.error}
      </div>
    )
  }

  const tier = TIER_META[result.tier] || TIER_META.white
  const badge = BADGES.find(b => b.level === result.tier) || BADGES[0]

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Tier banner */}
      <div style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
        <BadgeIcon color={badge.color} size={40} />
        <div>
          <div style={{ fontSize: 11, color: tier.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Verification Result</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{result.tier_label || tier.label}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {/* Documents found */}
        <div style={{ background: '#0a1a0f', border: '0.5px solid #065f46', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Documents Found</div>
          {result.documents_found?.length > 0
            ? result.documents_found.map((d, i) => <div key={i} style={{ fontSize: 12, color: '#a7f3d0', padding: '3px 0', display: 'flex', gap: 6 }}><span>✓</span>{d}</div>)
            : <div style={{ fontSize: 12, color: 'var(--text-3)' }}>None identified</div>
          }
        </div>

        {/* Documents missing */}
        <div style={{ background: '#1a0a0a', border: '0.5px solid #7f1d1d', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Documents Missing</div>
          {result.documents_missing?.length > 0
            ? result.documents_missing.map((d, i) => <div key={i} style={{ fontSize: 12, color: '#fca5a5', padding: '3px 0', display: 'flex', gap: 6 }}><span>✗</span>{d}</div>)
            : <div style={{ fontSize: 12, color: 'var(--text-3)' }}>None identified</div>
          }
        </div>
      </div>

      {/* Inconsistencies */}
      {result.inconsistencies_flagged?.length > 0 && (
        <div style={{ background: '#1c1507', border: '0.5px solid #78350f', borderRadius: 10, padding: '1rem', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Flags & Inconsistencies</div>
          {result.inconsistencies_flagged.map((f, i) => <div key={i} style={{ fontSize: 12, color: '#fde68a', padding: '3px 0', display: 'flex', gap: 6 }}><span>⚠</span>{f}</div>)}
        </div>
      )}

      {/* Next steps */}
      {result.recommended_next_steps && result.tier !== 'blue' && (
        <div style={{ background: '#0f1a2e', border: '0.5px solid #1e3a5f', borderRadius: 10, padding: '1rem', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Recommended Next Steps</div>
          <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.6 }}>{result.recommended_next_steps}</div>
        </div>
      )}

      <div style={{ padding: '0.75rem 1rem', background: 'var(--card-bg)', borderRadius: 8, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
        ⚠️ This is an AI-generated preliminary check, not a legal determination. Veryland verifies documentation completeness and consistency — it does not guarantee against future legal disputes or claims outside the submitted document chain. Always engage qualified legal counsel for high-value transactions.{' '}
        <button onClick={onSubmit} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 11, padding: 0, fontWeight: 600 }}>Submit for official human review →</button>
      </div>
    </div>
  )
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
  const [checkDocType, setCheckDocType] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null) // now stores the JSON object from the API
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
      fd.append('docType', checkDocType)
      const res = await fetch('/api/veryland/check', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCheckResult(data)
    } catch (err) {
      setCheckResult({ error: err.message || 'AI check failed. Please try again.' })
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
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'DM Sans, Segoe UI, sans-serif', color: 'var(--text-1)' }}>

      {/* Nav */}
      <nav style={{ background: 'var(--card-bg)', borderBottom: '0.5px solid var(--border-1)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>🏠 Mr. Rent</a>
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
      <section style={{ background: 'var(--card-bg)', padding: '4rem 2rem 3rem', textAlign: 'center', borderBottom: '0.5px solid var(--border-1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, margin: '0 0 1.25rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4em' }}>
            Veryland <PremiumBadge size={52} id="hero-badge" />
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0f1a2e', border: '0.5px solid #1d4ed8', borderRadius: 20, padding: '4px 14px', marginBottom: '1.5rem' }}>
            <BadgeIcon color="#3b82f6" size={16} />
            <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Nigeria&apos;s First Property Document Verification</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Verify Your Property.<br />
            <span style={{ color: '#3b82f6' }}>Earn Trust.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Submit your title documents for human review. Get a Veryland badge displayed on your listing so tenants and buyers know your property is authentic.
          </p>

          {/* Badge levels */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {BADGES.map(b => (
              <div key={b.level} style={{ background: b.bg, border: `1px solid ${b.color}44`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                <BadgeIcon color={b.color} size={22} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: b.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ maxWidth: 800, margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '0.5px solid var(--border-1)', paddingBottom: 12, marginBottom: '2rem' }}>
          {[
            { key: 'check',  label: '🔍 Check a Document',          desc: 'For buyers & tenants — verify authenticity' },
            { key: 'submit', label: '🏠 Verify My Property',          desc: 'For sellers & landlords — earn a badge' },
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
            <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 0.5rem' }}>AI Document Quick Check</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 1.5rem' }}>
                Upload a photo or scan of any property document. Our AI will analyse it for authenticity, red flags, and recommendations in seconds. Free for all signed-in users.
              </p>

              {!session && !authLoading && (
                <div style={{ background: '#0f1a2e', border: '0.5px solid #1d4ed8', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Sign in to use the AI Document Check.</span>
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
                      <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>Click to change file</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                      <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Drop document here or <span style={{ color: '#3b82f6' }}>click to browse</span></div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>JPEG, PNG, PDF — max 5MB</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                  <div>
                    <label style={lbl}>Document type (optional)</label>
                    <select value={checkDocType} onChange={e => setCheckDocType(e.target.value)} style={iStyle}>
                      <option value="">Unknown / Let AI decide</option>
                      {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
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

              {checkResult && <VerylandResult result={checkResult} onSubmit={() => setTab('submit')} />}
            </div>

            {/* How AI check works */}
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { icon: '📤', title: 'Upload document', desc: 'Photo or scan of your title document' },
                { icon: '🤖', title: 'AI analyses it', desc: 'Gemini AI checks for stamps, seals, formatting' },
                { icon: '📊', title: 'Instant report', desc: 'Red flags, authenticity signs, verdict' },
              ].map(s => (
                <div key={s.title} style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border-1)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.desc}</div>
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
                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: '1.5rem' }}>You need to be signed in to submit property documents for verification.</p>
                <a href="/account?redirect=/veryland" style={{ background: '#1d4ed8', color: '#fff', padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Sign In / Create Account</a>
              </div>
            )}

            {session && submitted && (
              <div style={{ background: '#051a0f', border: '1px solid #10b981', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#10b981', margin: '0 0 0.75rem' }}>Submission received!</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
                  Your property documents have been submitted for review. You&apos;ll receive a <strong style={{ color: 'var(--text-1)' }}>white badge</strong> immediately, and our team will review your submission within <strong style={{ color: 'var(--text-1)' }}>3–5 business days</strong>.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setSubmitted(false); setDocs([{ type: '', file: null, preview: null }]); setForm(f => ({ ...f, propertyAddress: '', state: '', listingId: '', additionalInfo: '' })) }} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Submit another property
                  </button>
                  <a href="/dashboard" style={{ background: 'transparent', color: 'var(--text-3)', border: '0.5px solid var(--border-1)', borderRadius: 10, padding: '9px 22px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>Go to dashboard</a>
                </div>
              </div>
            )}

            {session && !submitted && (
              <form onSubmit={handleSubmit}>
                <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>Owner information</h2>
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

                <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Property details</h2>
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

                <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Documents to submit</h2>
                    <button type="button" onClick={addDoc} style={{ background: '#1e293b', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add document</button>
                  </div>

                  {docs.map((doc, i) => (
                    <div key={i} style={{ background: 'var(--input-bg)', border: '0.5px solid var(--border-1)', borderRadius: 12, padding: '1rem', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Document {i + 1}</span>
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
                        <img src={doc.preview} alt="preview" style={{ marginTop: 10, maxHeight: 120, maxWidth: '100%', borderRadius: 8, border: '0.5px solid var(--border-1)', objectFit: 'cover' }} />
                      )}
                    </div>
                  ))}

                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0.5rem 0 0' }}>
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
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
                  Free to submit. Our team reviews within 3–5 business days. You&apos;ll get a Veryland badge on your listing once verified.
                </p>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '0.5px solid var(--border-1)', padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/" style={{ color: 'var(--text-3)', textDecoration: 'none', marginRight: 16 }}>Home</a>
          <a href="/browse" style={{ color: 'var(--text-3)', textDecoration: 'none', marginRight: 16 }}>Browse</a>
          <a href="/search" style={{ color: 'var(--text-3)', textDecoration: 'none', marginRight: 16 }}>AI Chat</a>
          <a href="/privacy-policy" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
        <div>© {new Date().getFullYear()} Faster Aim Technology Limited. Veryland is a service of Mr. Rent.</div>
      </footer>
    </div>
  )
}

const navLink = { color: 'var(--text-2)', textDecoration: 'none', fontSize: 14 }
const lbl = { display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 5, fontWeight: 500 }
const iStyle = {
  width: '100%', padding: '9px 12px', background: 'var(--input-bg)',
  border: '0.5px solid var(--border-1)', borderRadius: 8, color: 'var(--text-1)',
  fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
}
