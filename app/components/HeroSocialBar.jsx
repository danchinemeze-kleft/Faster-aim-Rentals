'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Change these when the pages exist
const PRO_SIGNUP_HREF = '/pro/signup'
const COMMENTS_HREF = '/reviews'
const SHOW_VIEWS_FROM = 100 // the views/users box stays hidden until real views pass this

function visitorId() {
  try {
    let id = localStorage.getItem('mrRentVisitorId')
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('mrRentVisitorId', id)
    }
    return id
  } catch (e) {
    return null
  }
}

function compact(n) {
  const v = Number(n) || 0
  if (v >= 1000000) return `${+(v / 1000000).toFixed(v >= 10000000 ? 0 : 1)}M`
  if (v >= 1000) return `${+(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`
  return String(v)
}

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export default function HeroSocialBar({ supabase }) {
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    const vid = visitorId()
    async function run() {
      try {
        const bot = /bot|crawl|spider|slurp|headless/i.test(navigator.userAgent) || navigator.webdriver
        if (vid && !bot && !sessionStorage.getItem('mrRentViewCounted')) {
          sessionStorage.setItem('mrRentViewCounted', '1') // one view per browser session
          await supabase.rpc('record_homepage_visit', { p_visitor: vid })
        }
      } catch (e) {}
      try {
        const { data } = await supabase.rpc('homepage_stats', { p_visitor: vid })
        if (!cancelled && data) setStats(data)
      } catch (e) {}
    }
    run()
    return () => { cancelled = true }
  }, [supabase])

  const flip = (s) => ({ ...s, loved: !s.loved, loves: Math.max(0, Number(s.loves) + (s.loved ? -1 : 1)) })

  async function toggleLove() {
    if (busy || !stats) return
    setBusy(true)
    setStats(flip) // instant feedback
    const { data, error } = await supabase.rpc('toggle_homepage_love', { p_visitor: visitorId() })
    if (error || !data) setStats(flip) // undo if it failed
    else setStats((s) => ({ ...s, loved: data.loved, loves: Number(data.loves) }))
    setBusy(false)
  }

  const views = Number(stats?.views) || 0
  const loves = Number(stats?.loves) || 0
  const comments = Number(stats?.comments) || 0
  const loveLabel = loves === 0 ? 'Love it' : loves === 1 ? '1 loves it' : `${compact(loves)} love it`

  return (
    <div className="faim-social">
      <style>{css}</style>

      <Link href={PRO_SIGNUP_HREF} className="faim-pro-btn">
        <svg {...icon}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
        Create Professional Account
      </Link>

      <div className="faim-social-chips">
        {stats && views >= SHOW_VIEWS_FROM && (
          <span className="faim-chip" title="Homepage views and unique visitors">
            <svg {...icon}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {compact(views)} views · {compact(stats.users)} users
          </span>
        )}
        {stats && (
          <Link href={COMMENTS_HREF} className="faim-chip faim-chip-link">
            <svg {...icon}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></svg>
            {comments > 0 ? `${compact(comments)} comments` : 'Comments'}
          </Link>
        )}
        {stats && (
          <button type="button" onClick={toggleLove} aria-pressed={Boolean(stats.loved)} className={`faim-chip faim-chip-btn${stats.loved ? ' is-loved' : ''}`}>
            <svg {...icon}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            {loveLabel}
          </button>
        )}
      </div>
    </div>
  )
}

const css = `
.faim-social{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem 1rem;margin-bottom:1.5rem;min-height:40px}
.faim-social-chips{display:flex;flex-wrap:wrap;gap:.5rem}
.faim-pro-btn{display:inline-flex;align-items:center;gap:.45rem;min-height:40px;padding:.45rem 1rem;border-radius:9999px;border:1.5px solid #14b8a6;background:#fff;color:#0f766e;font-size:.85rem;font-weight:600;text-decoration:none;transition:background-color .2s,color .2s}
.faim-pro-btn:hover{background:#14b8a6;color:#fff}
.faim-chip{display:inline-flex;align-items:center;gap:.4rem;min-height:36px;padding:.3rem .8rem;border-radius:9999px;border:1px solid #e2e8f0;background:#f1f5f9;color:#334155;font:inherit;font-size:.8rem;font-weight:500;text-decoration:none}
.faim-chip svg{flex-shrink:0;transition:transform .15s ease}
.faim-chip-link,.faim-chip-btn{cursor:pointer;transition:background-color .2s,border-color .2s}
.faim-chip-link:hover,.faim-chip-btn:hover{background:#e2e8f0}
.faim-chip-btn.is-loved{border-color:#f9a8d4;background:#fdf2f8;color:#be185d}
.faim-chip-btn.is-loved svg{fill:#ec4899;stroke:#ec4899}
.faim-chip-btn:active svg{transform:scale(1.25)}
.faim-pro-btn:focus-visible,.faim-chip-link:focus-visible,.faim-chip-btn:focus-visible{outline:2px solid #0ea5e9;outline-offset:2px}
@media (max-width:768px){
  .faim-social{flex-direction:column;align-items:stretch;margin-bottom:1rem}
  .faim-social-chips{min-height:44px}
  .faim-pro-btn{justify-content:center;min-height:44px}
  .faim-chip-link,.faim-chip-btn{min-height:44px}
}
@media (prefers-reduced-motion:reduce){.faim-chip svg{transition:none}}
`