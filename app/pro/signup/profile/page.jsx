'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

const VERIFIED_BADGE_SRC = '/badges/pro/verified.png'

function ageFromDob(dob) {
  if (!dob) return null
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1
  return age
}

const STATUS_LABEL = {
  draft: 'Not submitted',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Not approved',
}

export default function ProProfilePage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
    []
  )

  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [pro, setPro] = useState(null)

  async function load(u) {
    if (!u) {
      setUser(null)
      setPro(null)
      setReady(true)
      return
    }
    setUser(u)
    const { data: row } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle()
    setPro(row || null)
    setReady(true)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => load(session?.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        setTimeout(() => load(session?.user ?? null), 0)
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = pro?.verification_status || 'draft'
  const age = ageFromDob(pro?.date_of_birth)
  const isVerified = status === 'verified'

  return (
    <main className="faim-pro">
      <style>{css}</style>
      <div className="faim-pro-card">
        <Link href="/" className="faim-pro-back">
          &larr; Back to Mr. Rent
        </Link>
        <h1>Professional profile</h1>
        <p className="faim-pro-sub">Your professional account for Mr. Rent.</p>

        {!ready && <p className="faim-pro-sub">Loading…</p>}

        {ready && !user && (
          <div className="faim-pro-state">
            <p>Sign in to view your professional profile.</p>
            <Link
              href="/pro/signup"
              className="faim-pro-primary"
              style={{ textAlign: 'center', lineHeight: '50px' }}
            >
              Sign in / Sign up
            </Link>
          </div>
        )}

        {ready && user && !pro && (
          <div className="faim-pro-state">
            <p>You do not have a professional profile yet.</p>
            <Link
              href="/pro/signup"
              className="faim-pro-primary"
              style={{ textAlign: 'center', lineHeight: '50px' }}
            >
              Create professional account
            </Link>
          </div>
        )}

        {ready && user && pro && (
          <div>
            <div className="faim-pro-name-row">
              <h2 className="faim-pro-name">
                <span>{pro.full_name}</span>
                {isVerified && (
                  <Image
                    src={VERIFIED_BADGE_SRC}
                    alt="Verified professional"
                    title="Verified professional"
                    className="faim-pro-badge"
                    width={20}
                    height={20}
                  />
                )}
              </h2>
              <span className={`faim-pro-status faim-pro-status--${status}`}>
                {STATUS_LABEL[status] || status}
              </span>
            </div>

            <dl className="faim-pro-dl">
              <div>
                <dt>Profession</dt>
                <dd>{pro.profession === 'lawyer' ? 'Lawyer' : 'Surveyor'}</dd>
              </div>
              {age !== null && (
                <div>
                  <dt>Age</dt>
                  <dd>{age} years</dd>
                </div>
              )}
              <div>
                <dt>Phone</dt>
                <dd>{pro.contact_phone || '—'}</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>{pro.state || '—'}</dd>
              </div>
              <div>
                <dt>City of residence</dt>
                <dd>{pro.residential_city || '—'}</dd>
              </div>
              <div>
                <dt>Home address</dt>
                <dd>{pro.home_address || '—'}</dd>
              </div>
              <div>
                <dt>Cities served</dt>
                <dd>{(pro.cities || []).join(', ') || '—'}</dd>
              </div>
              <div>
                <dt>Registration number</dt>
                <dd>{pro.registration_number || '—'}</dd>
              </div>
              {pro.headline && (
                <div>
                  <dt>Headline</dt>
                  <dd>{pro.headline}</dd>
                </div>
              )}
              {(pro.specialties || []).length > 0 && (
                <div>
                  <dt>Specialties</dt>
                  <dd>{(pro.specialties || []).join(', ')}</dd>
                </div>
              )}
            </dl>

            {(status === 'draft' || status === 'rejected') && (
              <Link
                href="/pro/verify"
                className="faim-pro-primary"
                style={{ textAlign: 'center', lineHeight: '50px' }}
              >
                Apply for verification
              </Link>
            )}

            {status === 'pending' && (
              <p className="faim-pro-note">
                Your verification is under review. This page will update when a decision is made.
              </p>
            )}

            {isVerified && (
              <p className="faim-pro-note">
                You are verified. The badge shows next to your name on your professional profile.
              </p>
            )}

            <Link href="/pro/signup" className="faim-pro-link">
              Edit details
            </Link>
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
.faim-pro-sub,.faim-pro-note{color:#64748b;font-size:.9rem;line-height:1.55}
.faim-pro-name-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem;margin:1rem 0}
.faim-pro-name{margin:0;font-size:1.2rem;font-weight:700;display:inline-flex;align-items:center;gap:.45rem}
.faim-pro-badge{width:20px;height:20px;flex-shrink:0;object-fit:contain}
.faim-pro-status{padding:.25rem .65rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:#f1f5f9;color:#475569}
.faim-pro-status--draft{background:#f1f5f9;color:#64748b}
.faim-pro-status--pending{background:#e0f2fe;color:#0369a1}
.faim-pro-status--verified{background:#ccfbf1;color:#0f766e}
.faim-pro-status--rejected{background:#fef2f2;color:#b91c1c}
.faim-pro-dl{margin:0 0 1rem;display:grid;gap:.75rem}
.faim-pro-dl div{display:grid;gap:.15rem;padding:.65rem .75rem;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0}
.faim-pro-dl dt{font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.02em}
.faim-pro-dl dd{margin:0;font-size:.95rem;color:#0f172a}
.faim-pro-primary{display:block;width:100%;min-height:50px;margin-top:1rem;border:none;border-radius:12px;background:#0ea5e9;color:#fff;font:inherit;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 8px 20px -8px rgba(14,165,233,.55);text-decoration:none}
.faim-pro-link{display:block;width:100%;min-height:44px;margin-top:.5rem;border:none;background:none;color:#0ea5e9;font:inherit;font-size:.9rem;font-weight:600;text-align:center;text-decoration:none;line-height:44px;cursor:pointer}
.faim-pro-state{padding:1rem 0}
`