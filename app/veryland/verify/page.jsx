'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [phase, setPhase] = useState(1) // 1: Identity, 2: Survey, 3: Title, 4: Chain, 5: Done
  const [state, setState] = useState('')
  const [user, setUser] = useState(null)
  const [kycName, setKycName] = useState('')
  const [nin, setNin] = useState('')
  const [bvn, setBvn] = useState('')
  const [selfie, setSelfie] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [verificationId, setVerificationId] = useState(null)

  // Phase 2: Survey Plan
  const [surveyFile, setSurveyFile] = useState(null)
  const [surveyPreview, setSurveyPreview] = useState('')
  const [surveyAnalysis, setSurveyAnalysis] = useState(null)

  // Phase 3: Primary Title
  const [titleType, setTitleType] = useState('c_of_o')
  const [titleFile, setTitleFile] = useState(null)
  const [titlePreview, setTitlePreview] = useState('')
  const [titleAnalysis, setTitleAnalysis] = useState(null)
  const [primaryTitleDocId, setPrimaryTitleDocId] = useState(null)

  // Phase 4: Deed of Assignment
  const [deedFile, setDeedFile] = useState(null)
  const [deedPreview, setDeedPreview] = useState('')
  const [deedAnalysis, setDeedAnalysis] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUser(null)
      } else {
        setUser(session.user)
      }
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

  const handleFileSelect = (file, setFile, setPreview) => {
    if (!file) return
    setFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(file.name)
    }
  }

  // --- Phase 1: Submit Identity ---
  const submitIdentity = async () => {
    if (!state) {
      setMsg('Please select the property state')
      setMsgType('error')
      return
    }
    if (!nin && !bvn) {
      setMsg('Please enter either your NIN or BVN')
      setMsgType('error')
      return
    }
    if (!selfie) {
      setMsg('Please capture or upload a selfie')
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
        if (!res.ok) throw new Error(data.error || 'Identity verification failed')

        setVerificationId(data.verification.id)
        setKycName(data.verification.kyc_name || 'Verified User')
        setMsg('✅ Identity verified successfully! Proceeding to Survey Plan scan...')
        setMsgType('success')
        setTimeout(() => {
          setMsg('')
          setPhase(2)
        }, 1500)
      }
      reader.readAsDataURL(selfie)
    } catch (err) {
      setMsg('Error: ' + err.message)
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  // --- Phase 2: Analyze Survey Plan ---
  const submitSurveyPlan = async () => {
    if (!surveyFile) {
      setMsg('Please select your Survey Plan document')
      setMsgType('error')
      return
    }
    if (!verificationId) {
      setMsg('Missing verification session. Please start from Step 1.')
      setMsgType('error')
      return
    }

    setLoading(true)
    setMsg('Gemini AI is examining Red Seal, beacon numbers, and state stamps...')
    setMsgType('info')

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const res = await fetch('/api/verify/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId,
            docType: 'survey',
            state,
            documentBase64: reader.result,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Survey analysis failed')

        setSurveyAnalysis(data.analysis)
        setMsg('✅ Survey Plan successfully verified by Gemini AI!')
        setMsgType('success')
        setTimeout(() => {
          setMsg('')
          setPhase(3)
        }, 1500)
      }
      reader.readAsDataURL(surveyFile)
    } catch (err) {
      setMsg('Error: ' + err.message)
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  // --- Phase 3: Analyze Primary Title & Check Chain ---
  const submitPrimaryTitle = async () => {
    if (!titleFile) {
      setMsg('Please select your primary title document (C of O, Gazette, etc.)')
      setMsgType('error')
      return
    }

    setLoading(true)
    setMsg('Forensic AI is scanning document authenticity and grantee matching...')
    setMsgType('info')

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const docRes = await fetch('/api/verify/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId,
            docType: titleType,
            state,
            documentBase64: reader.result,
          }),
        })

        const docData = await docRes.json()
        if (!docRes.ok) throw new Error(docData.error || 'Title analysis failed')

        setTitleAnalysis(docData.analysis)
        setPrimaryTitleDocId(docData.document?.id)

        // Run recursive chain check to see if grantee matches user KYC
        const chainRes = await fetch('/api/verify/chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId,
            action: 'check_primary_title',
            primaryTitleId: docData.document?.id,
          }),
        })

        const chainData = await chainRes.json()
        if (chainData.next_step === 'complete') {
          setMsg('🎉 Title owner matches your verified identity! Verification complete.')
          setMsgType('success')
          setTimeout(() => {
            setMsg('')
            setPhase(5)
          }, 1500)
        } else {
          setMsg(chainData.message || 'Primary title requires Deed of Assignment to bridge chain of title.')
          setMsgType('info')
          setTimeout(() => {
            setMsg('')
            setPhase(4)
          }, 2000)
        }
      }
      reader.readAsDataURL(titleFile)
    } catch (err) {
      setMsg('Error: ' + err.message)
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  // --- Phase 4: Submit Deed of Assignment ---
  const submitDeed = async () => {
    if (!deedFile) {
      setMsg('Please select your Deed of Assignment document')
      setMsgType('error')
      return
    }

    setLoading(true)
    setMsg('Validating deed chain from title owner to your verified identity...')
    setMsgType('info')

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const docRes = await fetch('/api/verify/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId,
            docType: 'deed',
            state,
            documentBase64: reader.result,
          }),
        })

        const docData = await docRes.json()
        if (!docRes.ok) throw new Error(docData.error || 'Deed analysis failed')

        setDeedAnalysis(docData.analysis)

        // Validate chain
        const chainRes = await fetch('/api/verify/chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId,
            action: 'validate_chain',
            deedId: docData.document?.id,
          }),
        })

        const chainData = await chainRes.json()
        if (chainData.complete) {
          setMsg('🎉 Chain of title verified successfully!')
          setMsgType('success')
        } else {
          setMsg('📑 Deed submitted and logged for final review by admin team.')
          setMsgType('info')
        }

        setTimeout(() => {
          setMsg('')
          setPhase(5)
        }, 1800)
      }
      reader.readAsDataURL(deedFile)
    } catch (err) {
      setMsg('Error: ' + err.message)
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        <div style={{ background: '#111318', border: '1px solid #222', borderRadius: 16, padding: '40px', maxWidth: 460, textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#0ef6cc' }}>Veryland Verification</h2>
          <p style={{ color: '#cccccc', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Please log in to your account to verify your property documents and earn trusted badges.</p>
          <a
            href="/account?redirect=/veryland/verify"
            style={{ display: 'block', padding: '12px 24px', background: '#0ef6cc', color: '#080a0f', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}
          >
            Log In to Continue →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', color: '#ffffff', padding: '40px 20px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#111318', border: '1px solid #222', borderRadius: 16, padding: '36px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
        
        {/* Header & Stepper */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0e1c19', border: '1px solid #0ef6cc33', borderRadius: 20, padding: '4px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🏛️</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0ef6cc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Veryland Verification</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>Property Risk & Title Audit</h1>
          <p style={{ color: '#888', fontSize: 14 }}>
            Step {phase} of 5: {['', 'Identity Gate', 'Survey Plan Scan', 'Primary Title Validation', 'Chain of Title', 'Complete'][phase]}
          </p>
          <div style={{ marginTop: 18, height: 6, background: '#1a1d24', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(phase / 5) * 100}%`, background: 'linear-gradient(90deg, #0ef6cc 0%, #14B8A6 100%)', transition: 'width 0.35s ease' }} />
          </div>
        </div>

        {/* Status Message */}
        {msg && (
          <div style={{
            background: msgType === 'error' ? '#2c1214' : msgType === 'success' ? '#0d281e' : '#10222b',
            border: `1px solid ${msgType === 'error' ? '#e74c3c66' : msgType === 'success' ? '#10B98166' : '#0ef6cc44'}`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 14,
            color: msgType === 'error' ? '#ff6b6b' : msgType === 'success' ? '#10B981' : '#0ef6cc',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>{msgType === 'error' ? '⚠️' : msgType === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Phase 1: Identity */}
        {phase === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#ffffff' }}>1. Verify Identity (Bakare Rule)</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>
              We authenticate your name and biometric identity first to cross-reference document titleholders.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>Property State *</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: '#1a1d24', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }}
              >
                <option value="">Select state where property is located...</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>NIN (National ID)</label>
                <input
                  type="text"
                  value={nin}
                  onChange={e => setNin(e.target.value)}
                  placeholder="11-digit NIN"
                  style={{ width: '100%', padding: '12px 14px', background: '#1a1d24', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>BVN</label>
                <input
                  type="text"
                  value={bvn}
                  onChange={e => setBvn(e.target.value)}
                  placeholder="11-digit BVN"
                  style={{ width: '100%', padding: '12px 14px', background: '#1a1d24', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>Live Selfie Match *</label>
              <div style={{ border: '2px dashed #333', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#14161d' }}>
                {selfiePreview ? (
                  <div>
                    <img src={selfiePreview} alt="Selfie preview" style={{ width: 140, height: 140, borderRadius: 8, objectFit: 'cover', margin: '0 auto 10px' }} />
                    <p style={{ color: '#0ef6cc', fontSize: 13, fontWeight: 600 }}>✅ Selfie captured</p>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <input type="file" accept="image/*" onChange={handleSelfieCapture} style={{ display: 'none' }} />
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <p style={{ color: '#0ef6cc', fontWeight: 600, fontSize: 14, margin: 0 }}>Click to upload selfie</p>
                    <span style={{ fontSize: 12, color: '#666' }}>Clear face photo in good lighting</span>
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={submitIdentity}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', background: loading ? '#0a5c50' : '#0ef6cc',
                color: '#080a0f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
              }}
            >
              {loading ? 'Verifying with Youverify...' : 'Verify Identity & Proceed →'}
            </button>
          </div>
        )}

        {/* Phase 2: Survey Plan */}
        {phase === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: '#ffffff' }}>2. Survey Plan Forensic Scan</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 18, lineHeight: 1.6 }}>
              Upload your official cadastral survey. Gemini 3.7 Flash AI audits for Red Seal, Beacon numbers, and surveyor certifications.
            </p>

            <div style={{ border: '2px dashed #333', borderRadius: 10, padding: '28px', textAlign: 'center', background: '#14161d', marginBottom: 20 }}>
              {surveyPreview ? (
                <div>
                  {surveyFile?.type?.startsWith('image/') ? (
                    <img src={surveyPreview} alt="Survey preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, margin: '0 auto 12px' }} />
                  ) : (
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                  )}
                  <p style={{ color: '#0ef6cc', fontSize: 14, fontWeight: 600 }}>{surveyFile?.name}</p>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleFileSelect(e.target.files[0], setSurveyFile, setSurveyPreview)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📐</div>
                  <p style={{ color: '#0ef6cc', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Upload Survey Plan (JPG, PNG, PDF)</p>
                  <span style={{ fontSize: 12, color: '#666' }}>Must clearly display the Red Seal and Beacon coordinates</span>
                </label>
              )}
            </div>

            <button
              onClick={submitSurveyPlan}
              disabled={loading || !surveyFile}
              style={{
                width: '100%', padding: '14px',
                background: loading || !surveyFile ? '#1a332d' : '#0ef6cc',
                color: loading || !surveyFile ? '#555' : '#080a0f',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading || !surveyFile ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Scanning Forensic Markers...' : 'Analyze Survey Plan with Gemini AI →'}
            </button>
          </div>
        )}

        {/* Phase 3: Primary Title */}
        {phase === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: '#ffffff' }}>3. Primary Title Document</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 18, lineHeight: 1.6 }}>
              Upload your root title instrument. If the primary grantee matches your verified KYC name ({kycName || 'Owner'}), your chain completes immediately!
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>Title Document Type</label>
              <select
                value={titleType}
                onChange={e => setTitleType(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: '#1a1d24', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }}
              >
                <option value="c_of_o">Certificate of Occupancy (C of O) — Blue Badge eligible</option>
                <option value="c_of_o">Governor's Consent — Deep Green Badge eligible</option>
                <option value="gazette">Government Gazette — Deep Green Badge eligible</option>
              </select>
            </div>

            <div style={{ border: '2px dashed #333', borderRadius: 10, padding: '28px', textAlign: 'center', background: '#14161d', marginBottom: 20 }}>
              {titlePreview ? (
                <div>
                  {titleFile?.type?.startsWith('image/') ? (
                    <img src={titlePreview} alt="Title preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, margin: '0 auto 12px' }} />
                  ) : (
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📜</div>
                  )}
                  <p style={{ color: '#0ef6cc', fontSize: 14, fontWeight: 600 }}>{titleFile?.name}</p>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleFileSelect(e.target.files[0], setTitleFile, setTitlePreview)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📜</div>
                  <p style={{ color: '#0ef6cc', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Upload Primary Title (JPG, PNG, PDF)</p>
                  <span style={{ fontSize: 12, color: '#666' }}>Include official state seals and stamp marks</span>
                </label>
              )}
            </div>

            <button
              onClick={submitPrimaryTitle}
              disabled={loading || !titleFile}
              style={{
                width: '100%', padding: '14px',
                background: loading || !titleFile ? '#1a332d' : '#0ef6cc',
                color: loading || !titleFile ? '#555' : '#080a0f',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading || !titleFile ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Verifying Grantee & Forensics...' : 'Verify Primary Title →'}
            </button>
          </div>
        )}

        {/* Phase 4: Deed of Assignment */}
        {phase === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: '#ffffff' }}>4. Deed of Assignment (Chain of Title)</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 18, lineHeight: 1.6 }}>
              Because the primary title was issued to a previous owner, please upload the registered Deed of Assignment that transferred legal ownership to you.
            </p>

            <div style={{ border: '2px dashed #333', borderRadius: 10, padding: '28px', textAlign: 'center', background: '#14161d', marginBottom: 20 }}>
              {deedPreview ? (
                <div>
                  {deedFile?.type?.startsWith('image/') ? (
                    <img src={deedPreview} alt="Deed preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, margin: '0 auto 12px' }} />
                  ) : (
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📑</div>
                  )}
                  <p style={{ color: '#0ef6cc', fontSize: 14, fontWeight: 600 }}>{deedFile?.name}</p>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleFileSelect(e.target.files[0], setDeedFile, setDeedPreview)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📑</div>
                  <p style={{ color: '#0ef6cc', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Upload Deed of Assignment</p>
                  <span style={{ fontSize: 12, color: '#666' }}>Showing transfer of title to {kycName || 'your name'}</span>
                </label>
              )}
            </div>

            <button
              onClick={submitDeed}
              disabled={loading || !deedFile}
              style={{
                width: '100%', padding: '14px',
                background: loading || !deedFile ? '#1a332d' : '#0ef6cc',
                color: loading || !deedFile ? '#555' : '#080a0f',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading || !deedFile ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Validating Title Chain...' : 'Submit Deed & Complete →'}
            </button>
          </div>
        )}

        {/* Phase 5: Verification Complete */}
        {phase === 5 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>Audit Submission Complete!</h2>
            <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Your documents and AI forensic markers have been compiled. Our admin verification desk is performing final review to attach your <strong style={{ color: '#0ef6cc' }}>Veryland Trust Badge</strong> to your listings.
            </p>

            <div style={{ background: '#14161d', border: '1px solid #222', borderRadius: 12, padding: '18px', textAlign: 'left', marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0ef6cc', marginBottom: 8, textTransform: 'uppercase' }}>Next Steps:</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#ccc', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Admin inspects side-by-side KYC photo match and registry stamps</li>
                <li>Your listing automatically receives the <strong>Blue Badge</strong> (C of O) or <strong>Deep Green Badge</strong> (Gazette/Governor's Consent)</li>
                <li>Tenants on Mr. Rent can see your verified status immediately</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '12px 24px', background: '#0ef6cc', color: '#080a0f',
                  border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14
                }}
              >
                Go to Landlord Dashboard →
              </button>
              <button
                onClick={() => router.push('/browse')}
                style={{
                  padding: '12px 24px', background: '#1a1d24', color: '#fff',
                  border: '1px solid #333', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14
                }}
              >
                Browse Listings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
