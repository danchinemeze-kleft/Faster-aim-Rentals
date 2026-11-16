'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

const ROTATE_MS = 5000
const PRO_SIGNUP_HREF = '/pro/signup'

// Only keep statements that are true today.
const STATIC_MESSAGES = [
  { kind: 'safety', label: 'Safety', text: 'We are watching for fake listings. Report anything suspicious.', href: '/support' },
  { kind: 'safety', label: 'Tip', text: 'Inspect the property in person before you pay anything.', href: '/faq' },
  { kind: 'safety', label: 'Tip', text: 'Confirm you are speaking to the real landlord before you transfer money.', href: '/faq' },
  { kind: 'trust', label: 'No agent fees', text: 'Agent fees are prohibited on Mr. Rent. Report anyone who charges one.', href: '/terms' },
  { kind: 'trust', label: 'Veryland', text: 'Check a property document before you pay.', href: '/veryland' },
  { kind: 'offer', label: 'Free search', text: 'Affordable homes, land and shops across Nigeria. Searching is free.', href: '/browse' },
  { kind: 'offer', label: 'AI chat', text: 'Tell Mr. Rent AI what you need and get matches, free.', href: '/search' },
  { kind: 'offer', label: 'Landlords', text: 'List 2 properties free on Mr. Rent.', href: '/list' },
  { kind: 'offer', label: 'Professionals', text: 'Lawyers and surveyors: create a professional account.', href: PRO_SIGNUP_HREF },
  { kind: 'offer', label: 'Earn', text: 'Earn when the people you refer join Mr. Rent.', href: '/affiliate' },
  { kind: 'offer', label: 'Short-let', text: 'Short-let stays are coming soon. Hosts set their own prices.', href: '/shortlet' },
]

export default function HeroMarquee({ supabase }) {
  const [listings, setListings] = useState([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch (e) {
      return false
    }
  })

  // Newest real listings (no prices are fetched or shown)
  useEffect(() => {
    let cancelled = false
    supabase
      .from('listings_public')
      .select('id, title, location')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (!cancelled && data) setListings(data) }, () => {})
    return () => { cancelled = true }
  }, [supabase])

  // Mix: static message, new listing, static message, new listing ...
  const messages = useMemo(() => {
    const fresh = listings.map((l) => ({
      kind: 'new',
      label: 'Just listed',
      text: `${l.location ? `${l.location}: ` : ''}${l.title || 'New property'}. Tap to take a look.`,
      href: `/listing/${l.id}`,
    }))
    const out = []
    const max = Math.max(STATIC_MESSAGES.length, fresh.length)
    for (let i = 0; i < max; i++) {
      if (STATIC_MESSAGES[i]) out.push(STATIC_MESSAGES[i])
      if (fresh[i]) out.push(fresh[i])
    }
    return out
  }, [listings])

  useEffect(() => {
    if (paused || reduced || messages.length < 2) return
    const t = setTimeout(() => setIndex((i) => i + 1), ROTATE_MS)
    return () => clearTimeout(t)
  }, [index, paused, reduced, messages.length])

  const msg = messages[index % messages.length]

  return (
    <div
      className={`faim-mq${paused ? ' is-paused' : ''}`}
      role="region"
      aria-label="Updates from Mr. Rent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style>{css}</style>
      <span className="faim-mq-dot" aria-hidden="true" />
      <Link key={`${index}-${msg.text}`} href={msg.href} className="faim-mq-msg">
        <span className={`faim-mq-kind faim-mq-kind--${msg.kind}`}>{msg.label}</span>
        <span className="faim-mq-text">{msg.text}</span>
      </Link>
      <button type="button" className="faim-mq-next" onClick={() => setIndex((i) => i + 1)} aria-label="Next message">
        ›
      </button>
      {!reduced && messages.length > 1 && (
        <span key={`bar-${index}`} className="faim-mq-bar" aria-hidden="true" />
      )}
    </div>
  )
}

const css = `
.faim-mq{position:relative;overflow:hidden;display:flex;align-items:center;gap:.65rem;max-width:1200px;margin:0 auto .75rem;min-height:46px;padding:.25rem .4rem .25rem 1rem;background:linear-gradient(135deg,#0f172a 0%,#0c4a6e 100%);border:1px solid rgba(255,255,255,.08);border-radius:14px;box-shadow:0 10px 24px -12px rgba(15,23,42,.55)}
.faim-mq-dot{flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#0ef6cc;box-shadow:0 0 0 0 rgba(14,246,204,.6);animation:faim-mq-pulse 2s ease-out infinite}
.faim-mq .faim-mq-msg{display:flex;align-items:center;gap:.65rem;flex:1;min-width:0;min-height:38px;color:#e2e8f0;text-decoration:none;font-size:.88rem;font-weight:500;animation:faim-mq-in .4s ease both}
.faim-mq .faim-mq-msg:hover{color:#fff;animation:none}
.faim-mq-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.faim-mq-kind{flex-shrink:0;padding:.18rem .6rem;border-radius:9999px;font-size:.68rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.faim-mq-kind--safety{background:rgba(20,184,166,.2);color:#5eead4}
.faim-mq-kind--trust{background:rgba(14,165,233,.2);color:#7dd3fc}
.faim-mq-kind--new{background:#0ef6cc;color:#0f172a}
.faim-mq-kind--offer{background:rgba(255,255,255,.12);color:#e2e8f0}
.faim-mq .faim-mq-next{flex-shrink:0;width:36px;height:36px;border:none;border-radius:50%;background:rgba(255,255,255,.08);color:#e2e8f0;font-size:1.4rem;line-height:1;cursor:pointer}
.faim-mq .faim-mq-next:hover{background:rgba(255,255,255,.18);animation:none;filter:none}
.faim-mq .faim-mq-msg:focus-visible,.faim-mq .faim-mq-next:focus-visible{outline:2px solid #0ef6cc;outline-offset:2px}
.faim-mq-bar{position:absolute;left:0;bottom:0;height:2px;width:100%;background:#0ef6cc;transform-origin:left;animation:faim-mq-bar ${ROTATE_MS}ms linear forwards}
.faim-mq.is-paused .faim-mq-bar{animation-play-state:paused}
@keyframes faim-mq-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes faim-mq-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes faim-mq-pulse{0%{box-shadow:0 0 0 0 rgba(14,246,204,.6)}70%{box-shadow:0 0 0 8px rgba(14,246,204,0)}100%{box-shadow:0 0 0 0 rgba(14,246,204,0)}}
@media (max-width:768px){
  .faim-mq{margin:0 0 .75rem;min-height:50px;padding-left:.8rem}
  .faim-mq .faim-mq-msg{min-height:44px;font-size:.82rem}
  .faim-mq .faim-mq-next{width:44px;height:44px}
}
@media (prefers-reduced-motion:reduce){.faim-mq .faim-mq-msg,.faim-mq-dot{animation:none}}
`