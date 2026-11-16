'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const TYPES = ['apartment', 'house', 'duplex', 'studio', 'room', 'villa']
const AMENITIES = ['Wi-Fi', '24/7 power', 'Air conditioning', 'Running water', 'Parking', 'Kitchen', 'TV', 'Security', 'Swimming pool', 'Washing machine']
const MAX_PHOTOS = 8

export default function ShortletList() {
  const router = useRouter()
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  )
  const [user, setUser] = useState(undefined)
  const [f, setF] = useState({
    title: '', description: '', state: '', city: '', area: '', property_type: 'apartment',
    price_per_night: '', max_guests: 2, bedrooms: 1, bathrooms: 1, min_nights: 1,
    check_in_time: '14:00', check_out_time: '11:00', house_rules: '',
  })
  const [amenities, setAmenities] = useState([])
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/account?redirect=/shortlet/list')
      else setUser(session.user)
    })
  }, [supabase, router])

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const toggle = (a) => setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!f.title.trim() || !f.state.trim() || !f.city.trim()) return setError('Add a title, state and city.')
    if (!(Number(f.price_per_night) > 0)) return setError('Enter a nightly price above zero.')
    if (files.length === 0) return setError('Add at least one photo of the property.')
    setBusy(true)
    try {
      const urls = []
      for (const file of files.slice(0, MAX_PHOTOS)) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const { error: upErr } = await supabase.storage.from('shortlet-images').upload(path, file)
        if (upErr) throw upErr
        urls.push(supabase.storage.from('shortlet-images').getPublicUrl(path).data.publicUrl)
      }
      const { error: insErr } = await supabase.from('short_let_listings').insert({
        owner_id: user.id,
        title: f.title.trim(),
        description: f.description.trim(),
        state: f.state.trim(),
        city: f.city.trim(),
        area: f.area.trim(),
        property_type: f.property_type,
        price_per_night: Number(f.price_per_night),
        max_guests: Number(f.max_guests),
        bedrooms: Number(f.bedrooms),
        bathrooms: Number(f.bathrooms),
        min_nights: Number(f.min_nights),
        check_in_time: f.check_in_time,
        check_out_time: f.check_out_time,
        amenities,
        house_rules: f.house_rules.trim(),
        images: urls,
        status: 'pending',
      })
      if (insErr) throw insErr
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not save your listing. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (user === undefined) return <main style={s.main}><p style={s.note}>Checking your account...</p></main>

  if (done)
    return (
      <main style={s.main}>
        <div style={s.box}>
          <h1 style={s.h1}>Listing submitted</h1>
          <p style={s.note}>Our team reviews every short-let before it goes live. You will see it on the stays page once it is approved.</p>
          <Link href="/shortlet" style={s.btn}>View short-let stays</Link>
        </div>
      </main>
    )

  return (
    <main style={s.main}>
      <form style={s.box} onSubmit={submit}>
        <h1 style={s.h1}>List your short-let</h1>
        <p style={s.note}>You set your own nightly price. Mr. Rent takes a 9% commission on each booking.</p>

        <label style={s.label}>Listing title
          <input style={s.input} value={f.title} onChange={set('title')} placeholder="Clean 2-bedroom apartment in GRA" />
        </label>

        <div style={s.row}>
          <label style={s.label}>State<input style={s.input} value={f.state} onChange={set('state')} /></label>
          <label style={s.label}>City<input style={s.input} value={f.city} onChange={set('city')} /></label>
          <label style={s.label}>Area or street<input style={s.input} value={f.area} onChange={set('area')} /></label>
        </div>

        <div style={s.row}>
          <label style={s.label}>Property type
            <select style={s.input} value={f.property_type} onChange={set('property_type')}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={s.label}>Price per night (₦)<input style={s.input} type="number" min="1" value={f.price_per_night} onChange={set('price_per_night')} /></label>
          <label style={s.label}>Minimum nights<input style={s.input} type="number" min="1" value={f.min_nights} onChange={set('min_nights')} /></label>
        </div>

        <div style={s.row}>
          <label style={s.label}>Max guests<input style={s.input} type="number" min="1" value={f.max_guests} onChange={set('max_guests')} /></label>
          <label style={s.label}>Bedrooms<input style={s.input} type="number" min="0" value={f.bedrooms} onChange={set('bedrooms')} /></label>
          <label style={s.label}>Bathrooms<input style={s.input} type="number" min="0" value={f.bathrooms} onChange={set('bathrooms')} /></label>
        </div>

        <div style={s.row}>
          <label style={s.label}>Check-in time<input style={s.input} type="time" value={f.check_in_time} onChange={set('check_in_time')} /></label>
          <label style={s.label}>Check-out time<input style={s.input} type="time" value={f.check_out_time} onChange={set('check_out_time')} /></label>
        </div>

        <fieldset style={s.fieldset}>
          <legend style={s.legend}>Amenities</legend>
          <div style={s.chips}>
            {AMENITIES.map((a) => (
              <button type="button" key={a} onClick={() => toggle(a)} style={amenities.includes(a) ? s.chipOn : s.chip}>{a}</button>
            ))}
          </div>
        </fieldset>

        <label style={s.label}>Description
          <textarea style={{ ...s.input, minHeight: 110 }} value={f.description} onChange={set('description')} placeholder="What makes this place a good stay?" />
        </label>

        <label style={s.label}>House rules
          <textarea style={{ ...s.input, minHeight: 80 }} value={f.house_rules} onChange={set('house_rules')} placeholder="No smoking, no parties, quiet after 10pm..." />
        </label>

        <label style={s.label}>Photos (up to {MAX_PHOTOS})
          <input style={s.input} type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, MAX_PHOTOS))} />
          {files.length > 0 && <span style={s.note}>{files.length} photo{files.length > 1 ? 's' : ''} selected</span>}
        </label>

        {error && <p style={s.error} role="alert">{error}</p>}
        <button type="submit" style={s.btn} disabled={busy}>{busy ? 'Submitting...' : 'Submit for review'}</button>
      </form>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text-1)', padding: '2rem 1rem 4rem' },
  box: { maxWidth: 760, margin: '0 auto', background: 'var(--card-bg)', border: '1px solid var(--border-1)', borderRadius: 20, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  h1: { fontSize: '1.8rem', fontWeight: 700, margin: 0 },
  note: { color: 'var(--text-2)', fontSize: '.92rem', margin: 0 },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.88rem', fontWeight: 600, color: 'var(--text-2)' },
  input: { padding: '.7rem .9rem', borderRadius: 10, border: '1px solid var(--border-1)', background: 'var(--page-bg)', color: 'var(--text-1)', fontSize: '1rem', fontFamily: 'inherit' },
  fieldset: { border: '1px solid var(--border-1)', borderRadius: 12, padding: '.8rem 1rem' },
  legend: { fontSize: '.88rem', fontWeight: 600, color: 'var(--text-2)', padding: '0 .4rem' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '.5rem' },
  chip: { padding: '.4rem .85rem', borderRadius: 9999, border: '1px solid var(--border-1)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontSize: '.85rem' },
  chipOn: { padding: '.4rem .85rem', borderRadius: 9999, border: '1px solid #14b8a6', background: '#14b8a6', color: '#fff', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 },
  btn: { textDecoration: 'none', textAlign: 'center', background: '#0ea5e9', color: '#fff', padding: '.85rem 1.4rem', borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#dc2626', margin: 0, fontWeight: 600, fontSize: '.92rem' },
}