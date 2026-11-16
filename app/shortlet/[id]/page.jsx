'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const naira = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0)

export default function ShortletDetail() {
  const { id } = useParams()
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  )
  const [row, setRow] = useState(undefined)
  const [photo, setPhoto] = useState(0)

  useEffect(() => {
    if (!id) return
    supabase
      .from('short_let_listings')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setRow(data || null), () => setRow(null))
  }, [supabase, id])

  if (row === undefined) return <main style={s.main}><p style={s.muted}>Loading this stay...</p></main>

  if (row === null)
    return (
      <main style={s.main}>
        <div style={s.wrap}>
          <h1 style={s.h1}>This stay is not available</h1>
          <p style={s.muted}>It may have been removed or is still waiting for approval.</p>
          <Link href="/shortlet" style={s.link}>Back to short-let stays</Link>
        </div>
      </main>
    )

  const images = row.images || []
  const place = [row.area, row.city, row.state].filter(Boolean).join(', ')

  return (
    <main style={s.main}>
      <div style={s.wrap}>
        <Link href="/shortlet" style={s.link}>&larr; All short-let stays</Link>
        <h1 style={s.h1}>{row.title}</h1>
        <p style={s.muted}>{place}</p>

        <div style={s.hero}>
          {images[photo] ? (
            <Image src={images[photo]} alt={row.title} fill sizes="900px" style={{ objectFit: 'cover' }} priority />
          ) : (
            <div style={s.noImg}>No photo yet</div>
          )}
        </div>
        {images.length > 1 && (
          <div style={s.thumbs}>
            {images.map((src, i) => (
              <button key={src} type="button" onClick={() => setPhoto(i)} aria-label={`Show photo ${i + 1}`} style={{ ...s.thumb, outline: i === photo ? '3px solid #0ea5e9' : 'none' }}>
                <Image src={src} alt="" fill sizes="90px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        <div style={s.layout}>
          <div style={s.main2}>
            <p style={s.facts}>
              {row.property_type} &middot; up to {row.max_guests} guests &middot; {row.bedrooms} bedroom{row.bedrooms === 1 ? '' : 's'} &middot; {row.bathrooms} bathroom{row.bathrooms === 1 ? '' : 's'}
            </p>

            {row.description && (<><h2 style={s.h2}>About this stay</h2><p style={s.text}>{row.description}</p></>)}

            {row.amenities?.length > 0 && (
              <>
                <h2 style={s.h2}>What is included</h2>
                <div style={s.chips}>{row.amenities.map((a) => <span key={a} style={s.chip}>{a}</span>)}</div>
              </>
            )}

            {row.house_rules && (<><h2 style={s.h2}>House rules</h2><p style={s.text}>{row.house_rules}</p></>)}

            <p style={{ ...s.muted, marginTop: '1.5rem', fontSize: '.85rem' }}>
              Always confirm the property and the host before you pay. Mr. Rent does not collect money on behalf of hosts outside the platform.
            </p>
          </div>

          <aside style={s.side}>
            <p style={s.price}>{naira(row.price_per_night)} <span style={s.per}>per night</span></p>
            <p style={s.muted}>Minimum stay: {row.min_nights} night{row.min_nights === 1 ? '' : 's'}</p>
            <p style={s.muted}>Check-in {row.check_in_time} &middot; Check-out {row.check_out_time}</p>
            <button type="button" disabled style={s.btnOff}>Booking opens soon</button>
          </aside>
        </div>
      </div>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text-1)', padding: '2rem 1rem 4rem' },
  wrap: { maxWidth: 1000, margin: '0 auto' },
  link: { color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' },
  h1: { fontSize: '2rem', fontWeight: 700, margin: '.8rem 0 .2rem' },
  h2: { fontSize: '1.15rem', fontWeight: 700, margin: '1.6rem 0 .5rem' },
  muted: { color: 'var(--text-2)', margin: '0 0 .6rem' },
  hero: { position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg2)', marginTop: '1rem' },
  noImg: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' },
  thumbs: { display: 'flex', gap: '.5rem', marginTop: '.6rem', overflowX: 'auto' },
  thumb: { position: 'relative', flex: '0 0 90px', height: 64, borderRadius: 10, overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer' },
  layout: { display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem', alignItems: 'flex-start' },
  main2: { flex: '1 1 420px', minWidth: 0 },
  facts: { color: 'var(--text-2)', fontWeight: 600, textTransform: 'capitalize', margin: 0 },
  text: { color: 'var(--text-2)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '.5rem' },
  chip: { padding: '.35rem .8rem', borderRadius: 9999, background: 'var(--card-bg2)', border: '1px solid var(--border-1)', fontSize: '.85rem', color: 'var(--text-2)' },
  side: { flex: '1 1 280px', maxWidth: 360, position: 'sticky', top: 16, background: 'var(--card-bg)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '1.4rem' },
  price: { fontSize: '1.6rem', fontWeight: 700, color: '#0ea5e9', margin: '0 0 .5rem' },
  per: { fontSize: '.85rem', fontWeight: 500, color: 'var(--text-3)' },
  btnOff: { width: '100%', marginTop: '.8rem', padding: '.85rem', borderRadius: 12, border: '1px solid var(--border-1)', background: 'var(--card-bg2)', color: 'var(--text-3)', fontWeight: 600, fontSize: '1rem' },
}