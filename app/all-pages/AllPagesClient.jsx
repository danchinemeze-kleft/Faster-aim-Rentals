'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Edit this list when you add, rename or remove a page ──
const SECTIONS = [
  {
    id: 'explore',
    icon: '🔎',
    title: 'Find a property',
    blurb: 'Search, browse and chat your way to the right place.',
    pages: [
      { name: 'Home', path: '/', desc: 'Start here: the Mr. Rent homepage.' },
      { name: 'Browse listings', path: '/browse', desc: 'See all available properties and filter them.' },
      { name: 'Ask Mr. Rent (AI chat)', path: '/search', desc: 'Describe what you want and the AI finds matching listings.' },
    ],
  },
  {
    id: 'owners',
    icon: '🏠',
    title: 'For landlords and owners',
    blurb: 'Put your property in front of serious seekers.',
    pages: [
      { name: 'List a property', path: '/list', desc: 'Add a new rent, sale or short-let listing.' },
      { name: 'Dashboard', path: '/dashboard', desc: 'Manage your listings and see how they perform.' },
      { name: 'Subscribe', path: '/subscribe', desc: 'Upgrade to list more properties.' },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Your account',
    blurb: 'Your profile, payments and unlocked contacts.',
    pages: [
      { name: 'Account', path: '/account', desc: 'Sign in or create your account.' },
      { name: 'My account', path: '/my-account', desc: 'Your profile and saved details.' },
      { name: 'Contact unlocked', path: '/reveal-success', desc: 'Shown after you pay to reveal an owner’s number.', badge: 'After payment' },
    ],
  },
  {
    id: 'earn',
    icon: '💸',
    title: 'Earn with Mr. Rent',
    blurb: 'Refer people and earn commission.',
    pages: [
      { name: 'Affiliate sign up / log in', path: '/affiliate/auth', desc: 'Join the affiliate programme or sign in.' },
      { name: 'Affiliate dashboard', path: '/affiliate/dashboard', desc: 'Track your referrals and earnings.' },
    ],
  },
  {
    id: 'legal',
    icon: '📄',
    title: 'Legal',
    blurb: 'The rules for using Mr. Rent.',
    pages: [
      { name: 'Terms', path: '/terms', desc: 'Our terms of use.' },
      { name: 'Terms of service', path: '/terms-of-service', desc: 'Our terms of service.' },
    ],
  },
  {
    id: 'soon',
    icon: '⏳',
    title: 'Coming soon',
    blurb: 'Features we are still building.',
    pages: [
      { name: 'Veryland', path: null, desc: 'Property document verification to help eliminate forgery.', badge: 'Coming soon' },
    ],
  },
]

export default function AllPagesClient() {
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()

  const sections = SECTIONS
    .map(s => ({
      ...s,
      pages: s.pages.filter(p =>
        !term || `${p.name} ${p.desc} ${p.path || ''} ${s.title}`.toLowerCase().includes(term)),
    }))
    .filter(s => s.pages.length)

  const total = sections.reduce((n, s) => n + s.pages.length, 0)

  return (
    <main className="faim-ap">
      <style>{CSS}</style>

      <header className="faim-ap-hero">
        <Link href="/" className="faim-ap-back">← Back to home</Link>
        <h1>All pages</h1>
        <p>Everything on Mr. Rent in one place. Pick a section or search for a page.</p>
        <input
          className="faim-ap-search"
          type="search"
          placeholder="Search pages, e.g. list, affiliate, terms…"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search pages"
        />
      </header>

      <nav className="faim-ap-chips" aria-label="Jump to section">
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} className="faim-ap-chip">
            <span aria-hidden="true">{s.icon}</span> {s.title}
          </a>
        ))}
      </nav>

      <div className="faim-ap-wrap">
        {total === 0 && (
          <p className="faim-ap-empty">No page matches “{q}”. Try a different word.</p>
        )}

        {sections.map(s => (
          <section key={s.id} id={s.id} className="faim-ap-section">
            <div className="faim-ap-sec-head">
              <span className="faim-ap-sec-icon" aria-hidden="true">{s.icon}</span>
              <div>
                <h2>{s.title}</h2>
                <p>{s.blurb}</p>
              </div>
            </div>

            <ul className="faim-ap-grid">
              {s.pages.map(p => {
                const inner = (
                  <>
                    <span className="faim-ap-name">
                      {p.name}
                      {p.badge && <em className="faim-ap-badge">{p.badge}</em>}
                    </span>
                    <span className="faim-ap-desc">{p.desc}</span>
                    {p.path && <span className="faim-ap-path">{p.path}</span>}
                  </>
                )
                return (
                  <li key={p.name}>
                    {p.path ? (
                      <Link href={p.path} className="faim-ap-card">{inner}</Link>
                    ) : (
                      <div className="faim-ap-card faim-ap-card-off" aria-disabled="true">{inner}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

const CSS = `
.faim-ap{--bg:#0a1014;--panel:#111b21;--line:#1f3a40;--text:#eaf6f6;--muted:#93aab0;--cyan:#19e6c1;--pink:#ff4d8d;
  min-height:100vh;background:radial-gradient(900px 400px at 50% -100px,#0f3a3a 0%,var(--bg) 70%);color:var(--text);
  font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;padding-bottom:64px}
.faim-ap *{box-sizing:border-box}
.faim-ap-hero{max-width:880px;margin:0 auto;padding:28px 20px 12px}
.faim-ap-back{display:inline-block;color:var(--cyan);text-decoration:none;font-size:14px;margin-bottom:18px}
.faim-ap-back:hover{text-decoration:underline}
.faim-ap-hero h1{margin:0 0 6px;font-size:clamp(30px,6vw,44px);letter-spacing:-.02em}
.faim-ap-hero p{margin:0 0 18px;color:var(--muted);font-size:16px;line-height:1.5}
.faim-ap-search{width:100%;padding:14px 18px;border-radius:999px;border:1px solid var(--line);background:var(--panel);
  color:var(--text);font-size:16px;outline:none}
.faim-ap-search:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(25,230,193,.18)}
.faim-ap-chips{position:sticky;top:0;z-index:5;display:flex;gap:8px;overflow-x:auto;padding:12px 20px;
  background:rgba(10,16,20,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);scrollbar-width:none}
.faim-ap-chips::-webkit-scrollbar{display:none}
.faim-ap-chip{flex:0 0 auto;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);
  color:var(--text);text-decoration:none;font-size:14px;white-space:nowrap;transition:transform .15s,border-color .15s}
.faim-ap-chip:hover{transform:translateY(-2px);border-color:var(--cyan)}
.faim-ap-wrap{max-width:880px;margin:0 auto;padding:8px 20px}
.faim-ap-section{padding-top:28px;scroll-margin-top:70px}
.faim-ap-sec-head{display:flex;gap:14px;align-items:center;margin-bottom:14px}
.faim-ap-sec-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;font-size:22px;
  background:linear-gradient(135deg,rgba(25,230,193,.18),rgba(255,77,141,.18));border:1px solid var(--line)}
.faim-ap-sec-head h2{margin:0;font-size:20px}
.faim-ap-sec-head p{margin:2px 0 0;color:var(--muted);font-size:14px}
.faim-ap-grid{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.faim-ap-card{display:flex;flex-direction:column;gap:6px;height:100%;padding:16px;border-radius:16px;
  background:var(--panel);border:1px solid var(--line);border-bottom:3px solid var(--cyan);color:var(--text);text-decoration:none;
  box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .15s,box-shadow .15s,border-color .15s}
a.faim-ap-card:hover{transform:translateY(-4px);box-shadow:0 12px 26px rgba(0,0,0,.5);border-color:var(--pink)}
.faim-ap-name{font-weight:700;font-size:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.faim-ap-desc{color:var(--muted);font-size:14px;line-height:1.45}
.faim-ap-path{margin-top:auto;padding-top:6px;color:var(--cyan);font-size:12px;font-family:ui-monospace,Menlo,Consolas,monospace}
.faim-ap-badge{font-style:normal;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;
  background:rgba(255,77,141,.16);color:var(--pink);border:1px solid rgba(255,77,141,.4)}
.faim-ap-card-off{opacity:.65;border-bottom-color:var(--line);box-shadow:none;cursor:not-allowed}
.faim-ap-empty{margin:40px 0;text-align:center;color:var(--muted)}
@media (prefers-reduced-motion:reduce){.faim-ap *{transition:none!important}}
`