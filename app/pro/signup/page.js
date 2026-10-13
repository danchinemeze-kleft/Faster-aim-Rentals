'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT']

const SPECIALTIES = {
  lawyer: ['Title search & due diligence', 'Deeds & agreements', 'Tenancy disputes', 'Land disputes', 'Certificate of Occupancy', 'Probate & estates'],
  surveyor: ['Boundary survey', 'Survey plan', 'Topographic survey', 'Land verification', 'Subdivision', 'Beacon placement'],
}

const REG_LABEL = { lawyer: 'Supreme Court enrolment number', surveyor: 'SURCON registration number' }

const docSlots = (profession) => [
  { type: 'government_id', label: 'Government ID', hint: 'NIN slip, passport, driver’s licence or voter’s card', required: true },
  { type: 'certificate', label: profession === 'lawyer' ? 'Call to Bar certificate' : 'SURCON registration certificate', hint: 'Clear photo or PDF', required: true },
  { type: 'practising_licence', label: profession === 'lawyer' ? 'Current NBA practising licence or stamp' : 'Current practising licence or stamp', hint: 'Optional, but speeds up approval', required: false },
]

const EMPTY = { profession: 'lawyer', full_name: '', headline: '', bio: '', years_experience: '', state: '', cities: '', contact_phone: '', registration_number: '', specialties: [] }

const buildDocStoragePath = (userId, docType, fileName) => {
  const ext = (fileName.split('.').pop() || 'file').toLowerCase().replace(/[^a-z0-9]/g, '')
  const stamp = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${userId}/${docType}-${stamp}.${ext}`
}

export default function ProSignup() {
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  )
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [pro, setPro] = useState(null)
  const [docs, setDocs] = useState([])
  const [editing, setEditing] = useState(false)
  const [mode, setMode] = useState('signup')
  const [auth, setAuth] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const fail = (text) => setMsg({ type: 'error', text })

  async function load(u) {
    if (!u) { setUser(null); setPro(null); setDocs([]); setReady(true); return }
    setUser(u)
    const { data: row } = await supabase.from('professionals').select('*').eq('user_id', u.id).maybeSingle()
    setPro(row || null)
    if (row) {
      const { data: d } = await supabase.from('professional_documents').select('id, doc_type, created_at').eq('professional_id', row.id).order('created_at')
      setDocs(d || [])
    } else {
      setDocs([])
    }
    setReady(true)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => load(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        setTimeout(() => load(session?.user ?? null), 0)
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submitAuth(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const { email, password } = auth
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) fail('Email or password is not correct.')
    } else {
      if (password.length < 8) { fail('Use a password of at least 8 characters.'); setBusy(false); return }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/pro/signup` },
      })
      if (error) fail(error.message)
      else if (!data.session) setMsg({ type: 'ok', text: 'Check your email and tap the confirmation link. It brings you back here to continue. If you already have an account, choose Sign in instead.' })
    }
    setBusy(false)
  }

  function startEdit() {
    setForm({
      profession: pro.profession, full_name: pro.full_name || '', headline: pro.headline || '', bio: pro.bio || '',
      years_experience: pro.years_experience ?? '', state: pro.state || '', cities: (pro.cities || []).join(', '),
      contact_phone: pro.contact_phone || '', registration_number: pro.registration_number || '', specialties: pro.specialties || [],
    })
    setMsg(null); setEditing(true)
  }

  function checkProfile() {
    if (form.full_name.trim().length < 3) return 'Enter your full name as it appears on your certificate.'
    if (!form.state) return 'Choose your state.'
    if (form.registration_number.trim().length < 3) return 'Enter your registration number.'
    if (!/^[0-9+\s-]{10,16}$/.test(form.contact_phone.trim())) return 'Enter a valid phone number.'
    if (form.specialties.length === 0) return 'Pick at least one specialty.'
    return null
  }

  async function saveProfile(e) {
    e.preventDefault()
    const problem = checkProfile()
    if (problem) return fail(problem)
    setBusy(true); setMsg(null)
    const payload = {
      profession: form.profession,
      full_name: form.full_name.trim(),
      headline: form.headline.trim() || null,
      bio: form.bio.trim() || null,
      years_experience: form.years_experience === '' ? null : Number(form.years_experience),
      state: form.state,
      cities: form.cities.split(',').map((s) => s.trim()).filter(Boolean),
      specialties: form.specialties,
      contact_phone: form.contact_phone.trim(),
      registration_number: form.registration_number.trim(),
    }
    const { error } = pro
      ? await supabase.from('professionals').update(payload).eq('id', pro.id)
      : await supabase.from('professionals').insert({ ...payload, user_id: user.id })
    if (error) fail('Could not save your details. Please try again.')
    else { setEditing(false); await load(user) }
    setBusy(false)
  }

  async function uploadDoc(docType, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return fail('That file is too large. The maximum is 5 MB.')
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type)) return fail('Upload a JPG, PNG or PDF file.')
    setBusy(true); setMsg(null)
    const path = buildDocStoragePath(user.id, docType, file.name)
    const { error: upErr } = await supabase.storage.from('professional-docs').upload(path, file, { contentType: file.type })
    if (upErr) { fail('Upload failed. Check your connection and try again.'); setBusy(false); return }
    const { error: dbErr } = await supabase.from('professional_documents').insert({ professional_id: pro.id, doc_type: docType, storage_path: path })
    if (dbErr) fail('The file uploaded but could not be recorded. Please try again.')
    else await load(user)
    setBusy(false)
  }

  async function submitForReview() {
    const have = new Set(docs.map((d) => d.doc_type))
    if (!have.has('government_id') || !have.has('certificate')) return fail('Upload your government ID and your professional certificate first.')
    if (!agree) return fail('Please tick the declaration to continue.')
    setBusy(true); setMsg(null)
    const { error } = await supabase.from('professionals').update({ verification_status: 'pending' }).eq('id', pro.id)
    if (error) fail('Could not submit. Please try again.')
    else await load(user)
    setBusy(false)
  }

  const toggleSpecialty = (s) =>
    setForm((f) => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter((x) => x !== s) : [...f.specialties, s] }))

  const status = pro?.verification_status
  const step = !user ? 1 : (!pro || editing) ? 2 : 3
  const slots = docSlots(pro?.profession || form.profession)

  return (
    <main className="faim-pro">
      <style>{css}</style>
      <div className="faim-pro-card">
        <Link href="/" className="faim-pro-back">&larr; Back to Mr. Rent</Link>
        <h1>Professional account</h1>
        <p className="faim-pro-sub">For lawyers and surveyors. Get verified, be found by people buying or renting property, and receive job requests.</p>

        {ready && (status === 'draft' || status === 'rejected' || !pro || editing) && (
          <div className="faim-pro-steps" aria-label={`Step ${step} of 3`}>
            {['Account', 'Details', 'Documents'].map((label, i) => (
              <span key={label} className={i + 1 === step ? 'is-on' : i + 1 < step ? 'is-done' : ''}>{i + 1}. {label}</span>
            ))}
          </div>
        )}

        {msg && <div className={`faim-pro-msg faim-pro-msg--${msg.type}`} role="status">{msg.text}</div>}

        {!ready && <p className="faim-pro-sub">Loading…</p>}

        {ready && !user && (
          <form onSubmit={submitAuth}>
            <div className="faim-pro-toggle">
              <button type="button" className={mode === 'signup' ? 'is-on' : ''} onClick={() => { setMode('signup'); setMsg(null) }}>Create account</button>
              <button type="button" className={mode === 'signin' ? 'is-on' : ''} onClick={() => { setMode('signin'); setMsg(null) }}>Sign in</button>
            </div>
            <label>Email
              <input type="email" required autoComplete="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
            </label>
            <label>Password
              <span className="faim-pro-pw">
                <input type={showPw ? 'text' : 'password'} required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? 'Hide' : 'Show'}</button>
              </span>
            </label>
            <button className="faim-pro-primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Continue' : 'Sign in'}</button>
            <p className="faim-pro-note">Already use Mr. Rent with another sign-in method? Sign in at <Link href="/account">your account page</Link> first, then tap the Professional Account button again.</p>
          </form>
        )}

        {ready && user && (!pro || editing) && (
          <form onSubmit={saveProfile}>
            <div className="faim-pro-toggle">
              {['lawyer', 'surveyor'].map((p) => (
                <button key={p} type="button" disabled={Boolean(pro)} className={form.profession === p ? 'is-on' : ''} onClick={() => setForm({ ...form, profession: p, specialties: [] })}>
                  {p === 'lawyer' ? 'Lawyer' : 'Surveyor'}
                </button>
              ))}
            </div>
            <label>Full name (as on your certificate)
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </label>
            <label>{REG_LABEL[form.profession]}
              <input required value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} />
            </label>
            <label>Phone number
              <input type="tel" required autoComplete="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </label>
            <label>State
              <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                <option value="">Choose a state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Cities you serve (separate with commas)
              <input placeholder="Awka, Onitsha, Nnewi" value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} />
            </label>
            <label>Years of experience
              <input type="number" min="0" max="70" inputMode="numeric" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
            </label>
            <label>Headline (optional)
              <input maxLength={90} placeholder="Property lawyer, land title specialist" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </label>
            <label>About you (optional)
              <textarea rows={4} maxLength={600} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <fieldset>
              <legend>Specialties</legend>
              <div className="faim-pro-chips">
                {SPECIALTIES[form.profession].map((s) => (
                  <button key={s} type="button" className={form.specialties.includes(s) ? 'is-on' : ''} aria-pressed={form.specialties.includes(s)} onClick={() => toggleSpecialty(s)}>{s}</button>
                ))}
              </div>
            </fieldset>
            <button className="faim-pro-primary" disabled={busy}>{busy ? 'Saving…' : pro ? 'Save changes' : 'Save and continue'}</button>
            {pro && <button type="button" className="faim-pro-link" onClick={() => setEditing(false)}>Cancel</button>}
          </form>
        )}

        {ready && user && pro && !editing && (status === 'draft' || status === 'rejected') && (
          <div>
            {status === 'rejected' && (
              <div className="faim-pro-msg faim-pro-msg--error">
                Your last submission was not approved{pro.rejection_reason ? `: ${pro.rejection_reason}` : '.'} Fix the details or upload clearer documents, then submit again.
              </div>
            )}
            <p className="faim-pro-note">Hello {pro.full_name}. Upload clear photos or PDFs (JPG, PNG or PDF, up to 5 MB each). Only our review team can see them.</p>
            {slots.map((slot) => {
              const count = docs.filter((d) => d.doc_type === slot.type).length
              return (
                <div key={slot.type} className="faim-pro-doc">
                  <div>
                    <strong>{slot.label}{slot.required ? ' *' : ''}</strong>
                    <span>{count > 0 ? `✓ ${count} uploaded` : slot.hint}</span>
                  </div>
                  <label className="faim-pro-file">
                    {count > 0 ? 'Add another' : 'Choose file'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy}
                      onChange={(e) => { uploadDoc(slot.type, e.target.files?.[0]); e.target.value = '' }} />
                  </label>
                </div>
              )
            })}
            <label className="faim-pro-check">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I confirm the details and documents are genuine and belong to me. I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</span>
            </label>
            <button className="faim-pro-primary" disabled={busy} onClick={submitForReview}>{busy ? 'Please wait…' : 'Submit for verification'}</button>
            <button type="button" className="faim-pro-link" onClick={startEdit}>Edit my details</button>
          </div>
        )}

        {ready && user && pro && !editing && status === 'pending' && (
          <div className="faim-pro-state">
            <h2>Under review</h2>
            <p>Thank you, {pro.full_name}. We are checking your details and documents. You will appear in the directory once you are verified.</p>
            <Link href="/" className="faim-pro-link">Back to the homepage</Link>
          </div>
        )}

        {ready && user && pro && !editing && status === 'verified' && (
          <div className="faim-pro-state">
            <h2>You are verified</h2>
            <p>Your details were approved. Your public profile goes live once your yearly subscription is active.</p>
            <Link href="/" className="faim-pro-link">Back to the homepage</Link>
          </div>
        )}
      </div>
    </main>
  )
}

const css = `
.faim-pro{min-height:100vh;padding:1rem .75rem 3rem;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.faim-pro-card{max-width:560px;margin:0 auto;padding:1.5rem 1.25rem;background:#fff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 20px 45px -25px rgba(15,23,42,.18)}
.faim-pro-back{display:inline-block;margin-bottom:.75rem;color:#64748b;font-size:.85rem;font-weight:500;text-decoration:none}
.faim-pro h1{margin:0 0 .35rem;font-size:1.5rem;font-weight:700;letter-spacing:-.01em}
.faim-pro h2{margin:0 0 .4rem;font-size:1.15rem;font-weight:700}
.faim-pro-sub,.faim-pro-note,.faim-pro-state p{color:#64748b;font-size:.9rem;line-height:1.55}
.faim-pro-steps{display:flex;gap:.4rem;flex-wrap:wrap;margin:1rem 0}
.faim-pro-steps span{padding:.25rem .65rem;border-radius:9999px;background:#f1f5f9;color:#94a3b8;font-size:.75rem;font-weight:600}
.faim-pro-steps .is-on{background:#ccfbf1;color:#0f766e}
.faim-pro-steps .is-done{background:#e0f2fe;color:#0369a1}
.faim-pro-msg{margin:1rem 0;padding:.75rem .9rem;border-radius:12px;font-size:.88rem;line-height:1.5}
.faim-pro-msg--error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
.faim-pro-msg--ok{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}
.faim-pro form label,.faim-pro fieldset legend{display:block;margin:.9rem 0 .3rem;font-size:.85rem;font-weight:600;color:#334155}
.faim-pro fieldset{margin:0;padding:0;border:none}
.faim-pro input:not([type=checkbox]):not([type=file]),.faim-pro select,.faim-pro textarea{display:block;width:100%;box-sizing:border-box;min-height:48px;margin-top:.3rem;padding:.65rem .8rem;border:1.5px solid #cbd5e1;border-radius:12px;background:#fff;color:#0f172a;font:inherit;font-size:1rem;font-weight:400}
.faim-pro textarea{min-height:100px;resize:vertical}
.faim-pro input:focus,.faim-pro select:focus,.faim-pro textarea:focus{outline:2px solid #14b8a6;outline-offset:1px;border-color:#14b8a6}
.faim-pro-pw{display:flex;gap:.5rem;align-items:center}
.faim-pro-pw button{min-height:48px;padding:0 .9rem;border:1.5px solid #cbd5e1;border-radius:12px;background:#fff;color:#475569;font:inherit;font-size:.85rem;font-weight:600;cursor:pointer}
.faim-pro-toggle{display:flex;gap:.5rem;margin-top:1rem}
.faim-pro-toggle button{flex:1;min-height:48px;border:1.5px solid #cbd5e1;border-radius:12px;background:#fff;color:#475569;font:inherit;font-size:.92rem;font-weight:600;cursor:pointer}
.faim-pro-toggle button.is-on{border-color:#14b8a6;background:#f0fdfa;color:#0f766e}
.faim-pro-toggle button:disabled{opacity:.6;cursor:not-allowed}
.faim-pro-chips{display:flex;flex-wrap:wrap;gap:.5rem}
.faim-pro-chips button{min-height:44px;padding:.4rem .9rem;border:1.5px solid #cbd5e1;border-radius:9999px;background:#fff;color:#475569;font:inherit;font-size:.85rem;font-weight:500;cursor:pointer}
.faim-pro-chips button.is-on{border-color:#14b8a6;background:#14b8a6;color:#fff}
.faim-pro-primary{display:block;width:100%;min-height:50px;margin-top:1.25rem;border:none;border-radius:12px;background:#0ea5e9;color:#fff;font:inherit;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 8px 20px -8px rgba(14,165,233,.55)}
.faim-pro-primary:disabled{opacity:.6;cursor:not-allowed}
.faim-pro-link{display:block;width:100%;min-height:44px;margin-top:.5rem;border:none;background:none;color:#0ea5e9;font:inherit;font-size:.9rem;font-weight:600;text-align:center;text-decoration:none;line-height:44px;cursor:pointer}
.faim-pro-note a,.faim-pro-check a{color:#0ea5e9}
.faim-pro-doc{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin:.75rem 0;padding:.8rem .9rem;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}
.faim-pro-doc div{display:flex;flex-direction:column;gap:.15rem;min-width:0;font-size:.88rem}
.faim-pro-doc strong{font-weight:600}
.faim-pro-doc span{color:#64748b;font-size:.8rem}
.faim-pro-file{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 1rem;border:1.5px solid #14b8a6;border-radius:9999px;background:#fff;color:#0f766e;font-size:.85rem;font-weight:600;cursor:pointer}
.faim-pro-file input{display:none}
.faim-pro .faim-pro-check{display:flex;gap:.6rem;align-items:flex-start;margin-top:1rem;font-weight:400;font-size:.85rem;color:#475569;line-height:1.5}
.faim-pro-check input{width:22px;height:22px;margin-top:.1rem;flex-shrink:0}
.faim-pro-state{padding:1rem 0}
@media (max-width:480px){.faim-pro-doc{flex-direction:column;align-items:stretch}.faim-pro-file{width:100%}}
`