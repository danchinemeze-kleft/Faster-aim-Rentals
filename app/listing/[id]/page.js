'use client'

// NOTE: Run this in Supabase SQL editor to enable the likes feature:
// ALTER TABLE listings ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import SwitchRoleModal from '../../components/SwitchRoleModal'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const VERYLAND_BADGE = {
  white:  { fill: '#d0d0d0', check: '#888', label: 'Veryland: Submitted' },
  yellow: { fill: '#F59E0B', check: '#fff', label: 'Veryland: Partial Verified' },
  green:  { fill: '#10B981', check: '#fff', label: 'Veryland: Verified' },
  blue:   { fill: '#3B82F6', check: '#fff', label: 'Veryland: Premium Verified' },
}

function VerylandBadge({ level }) {
  const b = VERYLAND_BADGE[level]
  if (!b) return null
  return (
    <a
      href="/veryland"
      title={b.label}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none', background: '#111318', border: `1px solid ${b.fill}44`, borderRadius: 20, padding: '5px 13px 5px 7px' }}
    >
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="22" height="22" rx="7" fill={b.fill}/>
        <path d="M6 11.5l3.5 3.5 6.5-7" stroke={b.check} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color: b.fill }}>{b.label}</span>
    </a>
  )
}

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

function youtubeEmbedUrl(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

function VideoPlayer({ src }) {
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'error'

  if (!src) return null

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>

      {/* Loading overlay */}
      {state === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0a', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #1a1d24', borderTopColor: '#0ef6cc',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: '#cccccc', fontSize: 13 }}>Loading video…</span>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div style={{
          padding: '2.5rem 1.5rem', textAlign: 'center', background: '#0a0a0a',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <div style={{ color: '#cccccc', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
            Video could not be played in the browser.<br />
            You can still open it directly.
          </div>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '10px 24px',
              background: '#0ef6cc', color: '#080a0f',
              borderRadius: 8, fontWeight: 700, fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Open Video →
          </a>
        </div>
      )}

      {/* Actual video — always rendered so browser can attempt load */}
      <video
        controls
        playsInline
        preload="metadata"
        onLoadStart={() => setState('loading')}
        onLoadedMetadata={() => setState('ready')}
        onCanPlay={() => setState('ready')}
        onError={() => setState('error')}
        style={{
          width: '100%',
          maxHeight: 420,
          display: state === 'error' ? 'none' : 'block',
          background: '#000',
        }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" />
        Your browser does not support video playback.{' '}
        <a href={src} target="_blank" rel="noopener noreferrer">Open video</a>
      </video>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const [user, setUser] = useState(null)
  const [revealedContact, setRevealedContact] = useState(null)
  const [hasSub, setHasSub] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: listingData }, { data: { session } }] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).single(),
        supabase.auth.getSession(),
      ])

      if (!listingData) { setNotFound(true); setLoading(false); return }

      setListing(listingData)
      setLikes(listingData.likes || 0)

      if (session) {
        setUser(session.user)
        const [{ data: reveal }, { data: sub }, { data: profile }] = await Promise.all([
          supabase
            .from('Contact_reveals')
            .select('landlord_phone, landlord_email')
            .eq('tenant_id', session.user.id)
            .eq('listing_id', id)
            .maybeSingle(),
          supabase
            .from('Tenant_subscription')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .gte('expiry_date', new Date().toISOString())
            .order('expiry_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('Profiles')
            .select('role')
            .eq('id', session.user.id)
            .single(),
        ])

        setHasSub(!!sub)
        setUserRole(profile?.role || 'tenant')

        if (reveal) {
          if (!reveal.landlord_phone && listingData.landlord_id) {
            const { data: profile } = await supabase
              .from('Profiles')
              .select('phone, email')
              .eq('id', listingData.landlord_id)
              .single()
            setRevealedContact({
              landlord_phone: profile?.phone || null,
              landlord_email: reveal.landlord_email || profile?.email || null,
            })
          } else {
            setRevealedContact(reveal)
          }
        }
      }

      const saved = JSON.parse(localStorage.getItem('mr_rent_liked') || '[]')
      setLiked(saved.includes(id))

      setLoading(false)
    }
    load()
  }, [id])

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!lightboxOpen || !listing) return
    const imgs = Array.isArray(listing.images) ? listing.images : []
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActiveImage(i => (i + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setActiveImage(i => (i - 1 + imgs.length) % imgs.length)
      if (e.key === 'Escape') { setLightboxOpen(false); setVideoOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, listing])

  async function handleLike() {
    const saved = JSON.parse(localStorage.getItem('mr_rent_liked') || '[]')
    if (liked) {
      localStorage.setItem('mr_rent_liked', JSON.stringify(saved.filter(lid => lid !== id)))
      setLiked(false)
      setLikes(l => Math.max(0, l - 1))
      await supabase.from('listings').update({ likes: Math.max(0, likes - 1) }).eq('id', id)
    } else {
      localStorage.setItem('mr_rent_liked', JSON.stringify([...saved, id]))
      setLiked(true)
      setLikes(l => l + 1)
      await supabase.from('listings').update({ likes: likes + 1 }).eq('id', id)
    }
  }

  async function handleReveal() {
    if (!user) { router.push(`/account?redirect=/listing/${id}`); return }
    if (userRole === 'landlord') { setShowRoleModal(true); return }
    await proceedWithReveal()
  }

  async function proceedWithReveal() {
    setRevealing(true)
    try {
      // Guard: never charge/reveal twice for the same listing
      const { data: existing } = await supabase
        .from('Contact_reveals')
        .select('landlord_phone, landlord_email')
        .eq('tenant_id', user.id)
        .eq('listing_id', id)
        .maybeSingle()
      if (existing) {
        setRevealedContact(existing)
        setRevealing(false)
        return
      }

      // Subscribed tenants reveal for free — server re-verifies subscription
      if (hasSub) {
        const res = await fetch('/api/free-reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: id }),
        })
        const data = await res.json()
        if (data.success && data.contact) {
          setRevealedContact({
            landlord_phone: data.contact.phone,
            landlord_email: data.contact.email,
          })
        } else {
          alert(data.error || 'Could not reveal contact. Please try again.')
        }
        setRevealing(false)
        return
      }

      // Non-subscribed tenants pay ₦5,000 via Paystack
      const refCode = document.cookie.match(/mrrent_ref=([^;]+)/)?.[1] || null
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'reveal',
          listing_id: id,
          user_id: user.id,
          ref_code: refCode,
        }),
      })
      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert(data.error || 'Could not start payment. Please try again.')
        setRevealing(false)
      }
    } catch (err) {
      alert('Payment error: ' + err.message)
      setRevealing(false)
    }
  }

  async function handleSwitchToTenant() {
    setSwitchingRole(true)
    try {
      await supabase.from('Profiles').update({ role: 'tenant' }).eq('id', user.id)
      setUserRole('tenant')
      setShowRoleModal(false)
      await proceedWithReveal()
    } catch (err) {
      alert('Could not switch role. Please try again.')
    } finally {
      setSwitchingRole(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading property…</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ fontSize: 48 }}>🏠</div>
      <div style={{ color: 'var(--text-1)', fontSize: 18, fontWeight: 600 }}>Property not found</div>
      <button onClick={() => router.push('/browse')} style={{ background: '#0ef6cc', color: '#080a0f', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
        Back to Browse
      </button>
    </div>
  )

  const images = Array.isArray(listing.images) ? listing.images : []
  const hasImages = images.length > 0
  const hasVideo = !!listing.video_url

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Segoe UI, system-ui, sans-serif', color: 'var(--text-1)' }}>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length) }}
            style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 26, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >‹</button>

          {/* Image */}
          <img
            src={images[activeImage]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 10, userSelect: 'none' }}
          />

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length) }}
            style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 26, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >›</button>

          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            style={{ position: 'fixed', top: 18, right: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>

          {/* Counter + hint */}
          <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>
            {activeImage + 1} / {images.length} &nbsp;·&nbsp; ← → to navigate &nbsp;·&nbsp; Esc to close
          </div>
        </div>
      )}

      {/* Video overlay */}
      {videoOpen && hasVideo && (
        <div
          onClick={() => setVideoOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Close / back button */}
          <button
            onClick={() => setVideoOpen(false)}
            style={{ position: 'fixed', top: 18, left: 18, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', zIndex: 1 }}
          >
            ← Back
          </button>

          {/* Video */}
          <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 860 }}>
            {isYouTube(listing.video_url) ? (
              <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                <iframe
                  src={youtubeEmbedUrl(listing.video_url) + '?autoplay=1'}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                key={videoOpen ? 'open' : 'closed'}
                autoPlay
                controls
                playsInline
                style={{ width: '100%', maxHeight: '80vh', borderRadius: 12, background: '#000', display: 'block' }}
              >
                <source src={listing.video_url} type="video/mp4" />
                <source src={listing.video_url} type="video/webm" />
                <source src={listing.video_url} type="video/quicktime" />
              </video>
            )}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>Tap outside or press Esc to close</p>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: '#111318', borderBottom: '0.5px solid #222', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1, fontFamily: 'inherit', flexShrink: 0 }}>
          ← Back
        </button>
        <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15 }}>Mr. Rent</span>
        <span style={{ color: '#333' }}>/</span>
        <a href="/browse" style={{ color: '#cccccc', fontSize: 14, textDecoration: 'none' }}>Browse</a>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#cccccc', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{listing.title}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 4vw, 1.5rem)' }}>

        {/* Image gallery */}
        {hasImages && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Main image */}
            <div
              onClick={() => setLightboxOpen(true)}
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in', marginBottom: 8 }}
            >
              <img
                src={images[activeImage]}
                alt={listing.title}
                style={{ width: '100%', height: 'clamp(220px, 45vw, 420px)', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                🔍 {activeImage + 1} / {images.length}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length) }}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >‹</button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length) }}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >›</button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 80, height: 58, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                      border: i === activeImage ? '2px solid #0ef6cc' : '2px solid transparent',
                      opacity: i === activeImage ? 1 : 0.55,
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* No image placeholder */}
        {!hasImages && (
          <div style={{ height: 240, background: '#111318', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', color: '#cccccc' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
              <div style={{ fontSize: 13 }}>No photos uploaded yet</div>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="listing-grid">

          {/* LEFT: description, video, amenities */}
          <div>
            {/* Title row */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                {listing.property_type && (
                  <span style={{ background: '#0e1c19', color: '#0ef6cc', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, border: '0.5px solid #0ef6cc33' }}>
                    {listing.property_type}
                  </span>
                )}
                {listing.available && (
                  <span style={{ background: '#0e1c19', color: '#0ef6cc', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20 }}>
                    ● Available
                  </span>
                )}
                {listing.veryland_badge && <VerylandBadge level={listing.veryland_badge} />}
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 10, lineHeight: 1.35 }}>
                {listing.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: '#cccccc', fontSize: 15 }}>
                <span>📍 {listing.location}{listing.city ? `, ${listing.city}` : ''}{listing.state ? `, ${listing.state}` : ''}</span>
                {listing.bedrooms && <span>🛏 {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}</span>}
                {listing.bathrooms && <span>🚿 {listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''}</span>}
                {listing.size && <span>📐 {listing.size}</span>}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  About this property
                </h2>
                <p style={{ color: '#cccccc', fontSize: 16, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Amenities
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map(a => (
                    <span key={a} style={{ background: '#111318', border: '0.5px solid #2a2a2a', color: '#ffffff', fontSize: 15, padding: '6px 14px', borderRadius: 20 }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {hasVideo && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Property Video
                </h2>
                <button
                  onClick={() => setVideoOpen(true)}
                  style={{
                    width: '100%', position: 'relative', borderRadius: 12, overflow: 'hidden',
                    background: '#0a0a0a', border: '0.5px solid #222', cursor: 'pointer',
                    padding: 0, display: 'block',
                  }}
                >
                  {/* Thumbnail — use first listing image or dark placeholder */}
                  {images[0]
                    ? <img src={images[0]} alt="Video thumbnail" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', filter: 'brightness(0.45)' }} />
                    : <div style={{ height: 200, background: '#0d0d0d' }} />
                  }
                  {/* Play icon */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(14,246,204,0.15)', border: '2px solid #0ef6cc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 24, marginLeft: 4 }}>▶</span>
                    </div>
                    <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>Watch Property Video</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: price card + CTA */}
          <div>
            <div style={{ position: 'sticky', top: 70 }}>

              {/* Price card */}
              <div style={{ background: '#111318', border: '0.5px solid #222', borderRadius: 16, padding: '1.5rem', marginBottom: 12 }}>
                <div style={{ paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '0.5px solid #222' }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: '#0ef6cc', lineHeight: 1 }}>
                    ₦{Number(listing.price).toLocaleString('en-NG')}
                  </div>
                  {listing.price_period && (
                    <div style={{ fontSize: 14, color: '#cccccc', marginTop: 4 }}>per {listing.price_period}</div>
                  )}
                </div>

                {/* Property facts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                  {listing.property_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span style={{ color: '#cccccc' }}>Type</span>
                      <span style={{ color: '#ffffff', textTransform: 'capitalize' }}>{listing.property_type}</span>
                    </div>
                  )}
                  {listing.bedrooms && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span style={{ color: '#cccccc' }}>Bedrooms</span>
                      <span style={{ color: '#ffffff' }}>{listing.bedrooms}</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span style={{ color: '#cccccc' }}>Bathrooms</span>
                      <span style={{ color: '#ffffff' }}>{listing.bathrooms}</span>
                    </div>
                  )}
                  {listing.size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                      <span style={{ color: '#cccccc' }}>Size</span>
                      <span style={{ color: '#ffffff' }}>{listing.size}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span style={{ color: '#cccccc' }}>Location</span>
                    <span style={{ color: '#ffffff', textAlign: 'right', maxWidth: 170 }}>{listing.location}{listing.city ? `, ${listing.city}` : ''}{listing.state ? `, ${listing.state}` : ''}</span>
                  </div>
                </div>

                {/* Reveal CTA */}
                {revealedContact ? (
                  <div style={{ background: '#0e1c19', border: '0.5px solid #0ef6cc55', borderRadius: 10, padding: '1.25rem', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#0ef6cc', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Contact Revealed</div>
                    {revealedContact.landlord_phone && (
                      <a href={`tel:${revealedContact.landlord_phone}`} style={{ display: 'block', fontSize: 20, fontWeight: 700, color: '#ffffff', textDecoration: 'none', marginBottom: 10 }}>
                        📞 {revealedContact.landlord_phone}
                      </a>
                    )}
                    {revealedContact.landlord_phone && (
                      <a
                        href={`https://wa.me/${revealedContact.landlord_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property "${listing?.title}" listed on Mr. Rent (rent.fasteraim.com). Is it still available?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1f0d', border: '0.5px solid #25D36633', borderRadius: 8, padding: '9px 12px', textDecoration: 'none', marginBottom: 10 }}
                      >
                        <span style={{ fontSize: 16 }}>💬</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#25D366' }}>WhatsApp Landlord</span>
                      </a>
                    )}
                    {revealedContact.landlord_email && (
                      <a href={`mailto:${revealedContact.landlord_email}`} style={{ display: 'block', fontSize: 13, color: '#cccccc', textDecoration: 'none' }}>
                        ✉️ {revealedContact.landlord_email}
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleReveal}
                      disabled={revealing}
                      style={{
                        width: '100%', padding: '14px',
                        background: revealing ? '#0a5c50' : '#0ef6cc',
                        color: '#080a0f', border: 'none', borderRadius: 10,
                        fontWeight: 700, fontSize: 15, cursor: revealing ? 'not-allowed' : 'pointer',
                        marginBottom: 10, transition: 'background 0.15s',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {revealing
                        ? (hasSub ? 'Revealing…' : 'Redirecting…')
                        : hasSub
                          ? '📞 Reveal Contact — Free'
                          : '📞 Reveal Contact — ₦5,000'
                      }
                    </button>
                    <p style={{ fontSize: 13, color: '#aaaaaa', textAlign: 'center', lineHeight: 1.6 }}>
                      {hasSub
                        ? 'Included in your subscription. Landlord contact revealed instantly.'
                        : <>One-time secure payment via Paystack.<br />Landlord phone number revealed instantly after payment.</>
                      }
                    </p>
                    {!hasSub && (
                      <a
                        href="/tenant-subscribe"
                        style={{ display: 'block', textAlign: 'center', fontSize: 12, color: '#0ef6cc', marginTop: 10, textDecoration: 'none', fontWeight: 600 }}
                      >
                        🔓 Or get unlimited reveals — ₦25,000/month →
                      </a>
                    )}
                  </>
                )}
              </div>

              {/* Like / Save button */}
              <button
                onClick={handleLike}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: liked ? '#1a0c14' : '#111318',
                  border: liked ? '0.5px solid #ff2d78' : '0.5px solid #2a2a2a',
                  borderRadius: 12, cursor: 'pointer',
                  color: liked ? '#ff2d78' : '#666',
                  fontWeight: 600, fontSize: 14,
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{liked ? '♥' : '♡'}</span>
                {liked ? 'Saved' : 'Save this listing'}
                {likes > 0 && (
                  <span style={{ fontSize: 12, color: liked ? '#ff2d7899' : '#444', marginLeft: 2 }}>
                    · {likes}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRoleModal && (
        <SwitchRoleModal
          fromRole="landlord"
          loading={switchingRole}
          onConfirm={handleSwitchToTenant}
          onCancel={() => setShowRoleModal(false)}
        />
      )}

      <style>{`
        .listing-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .listing-grid { grid-template-columns: 1fr; }
          .listing-grid > div:last-child { order: -1; }
        }
        @media (max-width: 600px) {
          .listing-grid { gap: 1.25rem; }
        }
      `}</style>
    </div>
  )
}
