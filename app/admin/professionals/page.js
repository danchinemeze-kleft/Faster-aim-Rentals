'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const TABS = ['pending', 'verified', 'rejected']
const DOC_LABEL = { government_id: 'Government ID', certificate: 'Certificate', practising_licence: 'Practising licence', stamp_or_seal: 'Stamp or seal', other: 'Other' }

export default function AdminProfessionals() {
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reasons, setReasons] = useState({})

  async function load(status) {
    setItems(null)
    setError('')
    const res = await fetch(`/api/admin/professionals?status=${status}`, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Could not load applications'); setItems([]); return }
    setItems(data.professionals)
  }

  useEffect(() => {
    let ignore = false

    async function fetchTabData() {
      setItems(null)
      setError('')
      const res = await fetch(`/api/admin/professionals?status=${tab}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (ignore) return
      if (!res.ok) {
        setError(data.error || 'Could not load applications')
        setItems([])
        return
      }
      setItems(data.professionals)
    }

    void fetchTabData()

    return () => { ignore = true }
  }, [tab])

  async function act(id, action) {
    const reason = (reasons[id] || '').trim()
    if (action === 'reject' && reason.length < 5) return setError('Write a reason of at least 5 characters before rejecting.')
    if (action === 'approve' && !window.confirm('Approve this professional for 12 months?')) return
    setBusyId(id)
    setError('')
    const res = await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId: id, action, reason, months: 12 }),
    })
    const data = await res.json().catch(() => ({}))
    setBusyId(null)
    if (!res.ok) return setError(data.error || 'Action failed')
    load(tab)
  }

  return (
    <main className="faim-adm">
      <style>{css}</style>
      <div className="faim-adm-wrap">
        <Link href="/admin" className="faim-adm-back">&larr; Admin</Link>
        <h1>Professional applications</h1>
        <p className="faim-adm-sub">Open each document, check it against the details, then approve or reject. Document links expire after 10 minutes.</p>

        <div className="faim-adm-tabs">
          {TABS.map((t) => (
            <button key={t} className={t === tab ? 'is-on' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {error && <div className="faim-adm-error" role="alert">{error}</div>}
        {items === null && <p className="faim-adm-sub">Loading…</p>}
        {items && items.length === 0 && !error && <p className="faim-adm-sub">Nothing here.</p>}

        {items && items.map((p) => (
          <article key={p.id} className="faim-adm-card">
            <header>
              <h2>{p.full_name}</h2>
              <span className="faim-adm-tag">{p.profession}</span>
            </header>
            <dl>
              <div><dt>Registration no.</dt><dd>{p.registration_number}</dd></div>
              <div><dt>Email</dt><dd>{p.email || '—'}</dd></div>
              <div><dt>Phone</dt><dd>{p.contact_phone}</dd></div>
              <div><dt>Location</dt><dd>{[...(p.cities || []), p.state].filter(Boolean).join(', ')}</dd></div>
              <div><dt>Experience</dt><dd>{p.years_experience != null ? `${p.years_experience} years` : '—'}</dd></div>
              <div><dt>Specialties</dt><dd>{(p.specialties || []).join(', ') || '—'}</dd></div>
            </dl>
            {p.bio && <p className="faim-adm-bio">{p.bio}</p>}

            <div className="faim-adm-docs">
              {p.documents.length === 0 && <span>No documents uploaded</span>}
              {p.documents.map((d) =>
                d.url
                  ? <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer">{DOC_LABEL[d.doc_type] || d.doc_type}</a>
                  : <span key={d.id}>{DOC_LABEL[d.doc_type] || d.doc_type} (link failed)</span>
              )}
            </div>

            {p.verification_status === 'rejected' && p.rejection_reason && <p className="faim-adm-reason">Rejected: {p.rejection_reason}</p>}
            {p.verification_status === 'verified' && p.verified_until && <p className="faim-adm-reason">Verified until {new Date(p.verified_until).toLocaleDateString('en-NG')}</p>}

            {p.verification_status === 'pending' && (
              <div className="faim-adm-actions">
                <textarea rows={2} placeholder="Reason (required only if rejecting)" value={reasons[p.id] || ''} onChange={(e) => setReasons({ ...reasons, [p.id]: e.target.value })} />
                <button className="is-approve" disabled={busyId === p.id} onClick={() => act(p.id, 'approve')}>Approve</button>
                <button className="is-reject" disabled={busyId === p.id} onClick={() => act(p.id, 'reject')}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}

const css = `
.faim-adm{min-height:100vh;padding:1rem .75rem 3rem;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.faim-adm-wrap{max-width:760px;margin:0 auto}
.faim-adm-back{color:#64748b;font-size:.85rem;font-weight:500;text-decoration:none}
.faim-adm h1{margin:.5rem 0 .3rem;font-size:1.4rem;font-weight:700}
.faim-adm-sub{margin:0 0 1rem;color:#64748b;font-size:.9rem;line-height:1.5}
.faim-adm-tabs{display:flex;gap:.5rem;margin-bottom:1rem}
.faim-adm-tabs button{flex:1;min-height:44px;border:1.5px solid #cbd5e1;border-radius:12px;background:#fff;color:#475569;font:inherit;font-size:.88rem;font-weight:600;text-transform:capitalize;cursor:pointer}
.faim-adm-tabs .is-on{border-color:#14b8a6;background:#f0fdfa;color:#0f766e}
.faim-adm-error{margin-bottom:1rem;padding:.75rem .9rem;border:1px solid #fecaca;border-radius:12px;background:#fef2f2;color:#b91c1c;font-size:.88rem}
.faim-adm-card{margin-bottom:1rem;padding:1.1rem;border:1px solid #e2e8f0;border-radius:16px;background:#fff}
.faim-adm-card header{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.faim-adm-card h2{margin:0;font-size:1.05rem;font-weight:700}
.faim-adm-tag{padding:.15rem .6rem;border-radius:9999px;background:#e0f2fe;color:#0369a1;font-size:.72rem;font-weight:600;text-transform:uppercase}
.faim-adm-card dl{margin:.8rem 0;display:grid;gap:.45rem}
.faim-adm-card dl div{display:flex;gap:.6rem;font-size:.86rem}
.faim-adm-card dt{flex:0 0 7.5rem;color:#64748b}
.faim-adm-card dd{margin:0;min-width:0;word-break:break-word;font-weight:500}
.faim-adm-bio{margin:.5rem 0;color:#475569;font-size:.86rem;line-height:1.5}
.faim-adm-docs{display:flex;flex-wrap:wrap;gap:.5rem;margin:.8rem 0}
.faim-adm-docs a,.faim-adm-docs span{display:inline-flex;align-items:center;min-height:40px;padding:0 .9rem;border:1.5px solid #14b8a6;border-radius:9999px;color:#0f766e;font-size:.82rem;font-weight:600;text-decoration:none}
.faim-adm-docs span{border-color:#cbd5e1;color:#64748b;font-weight:500}
.faim-adm-reason{margin:.4rem 0;color:#64748b;font-size:.84rem}
.faim-adm-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.8rem}
.faim-adm-actions textarea{flex:1 1 100%;box-sizing:border-box;padding:.6rem .8rem;border:1.5px solid #cbd5e1;border-radius:12px;font:inherit;font-size:.95rem}
.faim-adm-actions button{flex:1;min-height:46px;border:none;border-radius:12px;color:#fff;font:inherit;font-size:.92rem;font-weight:600;cursor:pointer}
.faim-adm-actions button:disabled{opacity:.6;cursor:not-allowed}
.faim-adm-actions .is-approve{background:#14b8a6}
.faim-adm-actions .is-reject{background:#ef4444}
`