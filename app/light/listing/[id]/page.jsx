'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function isYouTube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')) }
function youtubeEmbedUrl(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export default function ListingLightPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const [user, setUser] = useState(null)
  const [revealedContact, setRevealedContact] = useState(null)

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
        const { data: reveal } = await supabase.from('Contact_reveals').select('landlord_phone, landlord_email').eq('tenant_id', session.user.id).eq('listing_id', id).maybeSingle()
        if (reveal) {
          if (!reveal.landlord_phone && listingData.landlord_id) {
            const { data: profile } = await supabase.from('Profiles').select('phone, email').eq('id', listingData.landlord_id).single()
            setRevealedContact({ landlord_phone: profile?.phone || null, landlord_email: reveal.landlord_email || profile?.email || null })
          } else setRevealedContact(reveal)
        }
      }
      setLiked(JSON.parse(localStorage.getItem('mr_rent_liked') || '[]').includes(id))
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!lightboxOpen || !listing) return
    const imgs = Array.isArray(listing.images) ? listing.images : []
    const handler = e => {
      if (e.key === 'ArrowRight') setActiveImage(i => (i + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setActiveImage(i => (i - 1 + imgs.length) % imgs.length)
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, listing])

  async function handleLike() {
    const saved = JSON.parse(localStorage.getItem('mr_rent_liked') || '[]')
    if (liked) {
      localStorage.setItem('mr_rent_liked', JSON.stringify(saved.filter(lid => lid !== id)))
      setLiked(false); setLikes(l => Math.max(0, l - 1))
      await supabase.from('listings').update({ likes: Math.max(0, likes - 1) }).eq('id', id)
    } else {
      localStorage.setItem('mr_rent_liked', JSON.stringify([...saved, id]))
      setLiked(true); setLikes(l => l + 1)
      await supabase.from('listings').update({ likes: likes + 1 }).eq('id', id)
    }
  }

  async function handleReveal() {
    if (!user) { router.push(`/account?redirect=/light/listing/${id}`); return }
    setRevealing(true)
    const { data: existing } = await supabase.from('Contact_reveals').select('landlord_phone, landlord_email').eq('tenant_id', user.id).eq('listing_id', id).maybeSingle()
    if (existing) { setRevealedContact(existing); setRevealing(false); return }
    const res = await fetch('/api/init-payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, type: 'reveal', listing_id: id, user_id: user.id }),
    })
    const data = await res.json()
    if (data.authorization_url) window.location.href = data.authorization_url
    else { alert(data.error || 'Could not start payment.'); setRevealing(false) }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}><div style={{ color: '#64748b' }}>Loading property…</div></div>
  if (notFound) return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Segoe UI',system-ui,sans-serif" }}><div style={{ fontSize: 48 }}>🏠</div><div style={{ color: '#0f172a', fontSize: 18, fontWeight: 600 }}>Property not found</div><button onClick={() => router.push('/light/browse')} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Back to Browse</button></div>

  const images = Array.isArray(listing.images) ? listing.images : []

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a' }}>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length) }} style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 26, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          <img src={images[activeImage]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 10 }} />
          <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length) }} style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 26, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', top: 18, right: 18, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, width: 38, height: 38, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{activeImage + 1} / {images.length} · ← → to navigate · Esc to close</div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <a href="/light" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Mr. Rent</a>
        <a href={`/listing/${id}`} title="Switch to dark mode" style={{ marginLeft: 'auto', fontSize: '1.1rem', background: 'rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '5px 9px', textDecoration: 'none' }}>🌙</a>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <a href="/light/browse" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>Browse</a>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ color: '#94a3b8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{listing.title}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Images */}
        {images.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div onClick={() => setLightboxOpen(true)} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in', marginBottom: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <img src={images[activeImage]} alt={listing.title} style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20 }}>🔍 {activeImage + 1} / {images.length}</div>
              {images.length > 1 && <>
                <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length) }} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>›</button>
              </>}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, i) => <img key={i} src={img} alt="" onClick={() => setActiveImage(i)} style={{ width: 80, height: 58, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', flexShrink: 0, border: i === activeImage ? '2px solid #0ea5e9' : '2px solid #e2e8f0', opacity: i === activeImage ? 1 : 0.6, transition: 'all 0.15s' }} />)}
              </div>
            )}
          </div>
        )}

        {!images.length && (
          <div style={{ height: 240, background: '#f1f5f9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}><div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div><div style={{ fontSize: 13 }}>No photos uploaded yet</div></div>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }} className="listing-grid-light">

          {/* Left */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {listing.property_type && <span style={{ background: '#eff6ff', color: '#0ea5e9', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, border: '1px solid #bae6fd' }}>{listing.property_type}</span>}
                {listing.available && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, border: '1px solid #bbf7d0' }}>● Available</span>}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 10, lineHeight: 1.35 }}>{listing.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: '#64748b', fontSize: 13 }}>
                <span>📍 {listing.location}{listing.state ? `, ${listing.state}` : ''}</span>
                {listing.bedrooms && <span>🛏 {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}</span>}
                {listing.bathrooms && <span>🚿 {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}</span>}
              </div>
            </div>

            {listing.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>About this property</h2>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{listing.description}</p>
              </div>
            )}

            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amenities</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map(a => <span key={a} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#374151', fontSize: 13, padding: '6px 14px', borderRadius: 20 }}>✓ {a}</span>)}
                </div>
              </div>
            )}

            {listing.video_url && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property Video</h2>
                {isYouTube(listing.video_url) ? (
                  <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                    <iframe src={youtubeEmbedUrl(listing.video_url)} style={{ width: '100%', height: 380, border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <video controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 380, borderRadius: 12, background: '#000', display: 'block' }}>
                    <source src={listing.video_url} type="video/mp4" />
                    <source src={listing.video_url} type="video/webm" />
                  </video>
                )}
              </div>
            )}
          </div>

          {/* Right: price card */}
          <div style={{ position: 'sticky', top: 70 }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a' }}>₦{Number(listing.price).toLocaleString('en-NG')}</div>
                {listing.price_period && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>per {listing.price_period}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                {listing.property_type && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Type</span><span style={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}>{listing.property_type}</span></div>}
                {listing.bedrooms && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Bedrooms</span><span style={{ color: '#0f172a', fontWeight: 600 }}>{listing.bedrooms}</span></div>}
                {listing.bathrooms && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Bathrooms</span><span style={{ color: '#0f172a', fontWeight: 600 }}>{listing.bathrooms}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Location</span><span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right', maxWidth: 170 }}>{listing.location}{listing.state ? `, ${listing.state}` : ''}</span></div>
              </div>

              {revealedContact ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1.25rem', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Contact Revealed</div>
                  {revealedContact.landlord_phone && (
                    <>
                      <a href={`tel:${revealedContact.landlord_phone}`} style={{ display: 'block', fontSize: 20, fontWeight: 700, color: '#0f172a', textDecoration: 'none', marginBottom: 8 }}>📞 {revealedContact.landlord_phone}</a>
                      <a href={`https://wa.me/${revealedContact.landlord_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property "${listing?.title}" listed on Mr. Rent. Is it still available?`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', textDecoration: 'none', marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>💬</span><span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>WhatsApp Landlord</span>
                      </a>
                    </>
                  )}
                  {revealedContact.landlord_email && <a href={`mailto:${revealedContact.landlord_email}`} style={{ display: 'block', fontSize: 13, color: '#64748b', textDecoration: 'none' }}>✉️ {revealedContact.landlord_email}</a>}
                </div>
              ) : (
                <>
                  <button onClick={handleReveal} disabled={revealing} style={{ width: '100%', padding: '14px', background: revealing ? '#7dd3fc' : '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: revealing ? 'not-allowed' : 'pointer', marginBottom: 10, boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
                    {revealing ? 'Redirecting…' : '📞 Reveal Contact — ₦5,000'}
                  </button>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>One-time secure payment via Paystack.<br />Landlord contact revealed instantly.</p>
                </>
              )}
            </div>

            <button onClick={handleLike} style={{ width: '100%', padding: '12px 16px', background: liked ? '#fff1f2' : '#f8fafc', border: liked ? '1px solid #fda4af' : '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', color: liked ? '#ff2d78' : '#64748b', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{liked ? '♥' : '♡'}</span>
              {liked ? 'Saved' : 'Save this listing'}
              {likes > 0 && <span style={{ fontSize: 12, marginLeft: 2, opacity: 0.7 }}>· {likes}</span>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .listing-grid-light { grid-template-columns: 1fr !important; }
          .listing-grid-light > div:last-child { order: -1; }
        }
      `}</style>
    </div>
  )
}
