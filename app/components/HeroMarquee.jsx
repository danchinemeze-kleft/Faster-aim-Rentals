'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

const ROTATE_MS = 5000
const PRO_SIGNUP_HREF = '/pro/signup' // same page as the Professional Account button

// Edit these lines freely. Only keep statements that are true today.
const STATIC_MESSAGES = [
  { kind: 'safety', label: 'Safety', text: 'We are watching for fake listings. Spot something suspicious? Report it to us.', href: '/support' },
  { kind: 'safety', label: 'Tip', text: 'Never pay before you see the property.', href: '/faq' },
  { kind: 'safety', label: 'Tip', text: 'Ask for proof of ownership before you pay anyone.', href: '/faq' },
  { kind: 'offer', label: 'Landlords', text: 'List 2 properties free on Mr. Rent.', href: '/list' },
  { kind: 'offer', label: 'Professionals', text: 'Lawyers and surveyors: create a professional account.', href: PRO_SIGNUP_HREF },
]

function naira(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)
}

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

  // Newest real listings
  useEffect(() => {
    let cancelled = false
    supabase
      .from('listings')
      .select('id, title, location, price, price_period')
      .eq('status', 'active')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (!cancelled && data) setListings(data) }, () => {})
    return () => { cancelled = true }
  }, [supabase])

  // Mix: safety / new listing / tip / new listing ... so the strip is never empty
  const messages = useMemo(() => {
    const fresh = listings.map((l) => ({
      kind: 'new',
      label: 'New',
      text: `${l.location ? `${l.location}: ` : ''}${l.title || 'New listing'}, ${naira(l.price)}${l.price_period ? `/${l.price_period}` : ''}`,
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
      className="faim-mq"
      role="region"
      aria-label="Updates from Mr. Rent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style>{css}</style>
      <Link key={`${index}-${msg.text}`} href={msg.href} className="faim-mq-msg">
        <span className={`faim-mq-kind faim-mq-kind--${msg.kind}`}>{msg.label}</span>
        <span className="faim-mq-text">{msg.text}</span>
      </Link>
      <button type="button" className="faim-mq-next" onClick={() => setIndex((i) => i + 1)} aria-label="Next message">
        ›
      </button>
    </div>
  )
}

const css = `
.faim-mq{display:flex;align-items:center;gap:.5rem;max-width:1200px;margin:0 auto .75rem;min-height:40px;padding:.2rem .35rem .2rem .85rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 12px -8px rgba(15,23,42,.18)}
.faim-mq .faim-mq-msg{display:flex;align-items:center;gap:.6rem;flex:1;min-width:0;min-height:36px;color:#334155;text-decoration:none;font-size:.85rem;font-weight:500;animation:faim-mq-in .4s ease both}
.faim-mq .faim-mq-msg:hover{animation:none}
.faim-mq-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.faim-mq-kind{flex-shrink:0;padding:.15rem .55rem;border-radius:9999px;font-size:.7rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase}
.faim-mq-kind--safety{background:#ccfbf1;color:#0f766e}
.faim-mq-kind--new{background:#e0f2fe;color:#0369a1}
.faim-mq-kind--offer{background:#f1f5f9;color:#475569}
.faim-mq .faim-mq-next{flex-shrink:0;width:36px;height:36px;border:none;border-radius:50%;background:transparent;color:#64748b;font-size:1.4rem;line-height:1;cursor:pointer}
.faim-mq .faim-mq-next:hover{background:#f1f5f9;animation:none;filter:none}
.faim-mq .faim-mq-msg:focus-visible,.faim-mq .faim-mq-next:focus-visible{outline:2px solid #0ea5e9;outline-offset:2px}
@keyframes faim-mq-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (max-width:768px){
  .faim-mq{margin:0 0 .75rem;min-height:44px}
  .faim-mq .faim-mq-msg{min-height:44px;font-size:.82rem}
  .faim-mq .faim-mq-next{width:44px;height:44px}
}
@media (prefers-reduced-motion:reduce){.faim-mq .faim-mq-msg{animation:none}}
`