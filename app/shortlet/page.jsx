'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

const naira = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

export default function ShortletBrowse() {
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  )
  const [rows, setRows] = useState(null)
  const [place, setPlace] = useState('')
  const [guests, setGuests] = useState('')

  useEffect(() => {
    supabase
      .from('short_let_listings')
      .select('id, title, state, city, area, property_type, price_per_night, max_guests, bedrooms, bathrooms, images')
      .eq('status', 'approved')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows(data || []), () => setRows([]))
  }, [supabase])

  const shown = (rows || []).filter((r) => {
    const q = place.trim().toLowerCase()
    const hit = !q || [r.state, r.city, r.area, r.title].some((v) => (v || '').toLowerCase().includes(q))
    const fits = !guests || r.max_guests >= Number(guests)
    return hit && fits
  })

  return (
    <main style={s.main}>
      <section style={s.head}>
        <h1 style={s.h1}>Short-let stays across Nigeria</h1>
        <p style={s.sub}>Stay by the night in homes listed directly by their owners. No agent fees.</p>
        <div style={s.filters}>
          <input style={s.input} placeholder="State, city or area" value={place} onChange={(e) => setPlace(e.target.value)} />
          <input style={{ ...s.input, maxWidth: 140 }} type="number" min="1" placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} />
          <Link href="/shortlet/list" style={s.hostBtn}>List your place</Link>
        </div>
      </section>

      <section style={s.grid}>
        {rows === null && <p style={s.note}>Loading stays...</p>}
        {rows !== null && shown.length === 0 && (
          <p style={s.note}>
            No short-let stays match yet. Try another place, or be the first host in your city.{' '}
            <Link href="/shortlet/list" style={s.link}>List your place</Link>
          </p>
        )}
        {shown.map((r) => (
          <Link key={r.id} href={`/shortlet/${r.id}`} style={s.card}>
            <div style={s.imgWrap}>
              {r.images?.[0] ? (
                <Image src={r.images[0]} alt={r.title} fill sizes="400px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={s.noImg}>No photo yet</div>
              )}
            </div>
            <div style={s.body}>
              <h2 style={s.title}>{r.title}</h2>
              <p style={s.loc}>{[r.area, r.city, r.state].filter(Boolean).join(', ')}</p>
              <p style={s.meta}>
                Up to {r.max_guests} guests &middot; {r.bedrooms} bed &middot; {r.bathrooms} bath
              </p>
              <p style={s.price}>
                {naira(r.price_per_night)} <span style={s.per}>per night</span>
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text-1)', padding: '2rem 1rem 4rem' },
  head: { maxWidth: 1200, margin: '0 auto 2rem' },
  h1: { fontSize: '2rem', fontWeight: 700, margin: '0 0 .4rem' },
  sub: { color: 'var(--text-2)', margin: '0 0 1.25rem' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '.75rem' },
  input: { flex: '1 1 220px', padding: '.7rem 1rem', borderRadius: 12, border: '1px solid var(--border-1)', background: 'var(--card-bg)', color: 'var(--text-1)', fontSize: '1rem' },
  hostBtn: { textDecoration: 'none', background: '#14b8a6', color: '#fff', padding: '.7rem 1.3rem', borderRadius: 12, fontWeight: 600 },
  grid: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  note: { gridColumn: '1 / -1', color: 'var(--text-2)' },
  link: { color: '#0ea5e9', fontWeight: 600 },
  card: { textDecoration: 'none', color: 'inherit', background: 'var(--card-bg)', border: '1px solid var(--border-1)', borderRadius: 16, overflow: 'hidden', display: 'block' },
  imgWrap: { position: 'relative', width: '100%', aspectRatio: '4 / 3', background: 'var(--card-bg2)' },
  noImg: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '.85rem' },
  body: { padding: '1rem 1.1rem 1.2rem' },
  title: { fontSize: '1.05rem', fontWeight: 600, margin: '0 0 .2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  loc: { color: 'var(--text-2)', fontSize: '.9rem', margin: '0 0 .4rem' },
  meta: { color: 'var(--text-3)', fontSize: '.8rem', margin: '0 0 .6rem' },
  price: { fontWeight: 700, color: '#0ea5e9', margin: 0 },
  per: { fontWeight: 500, color: 'var(--text-3)', fontSize: '.8rem' },
}