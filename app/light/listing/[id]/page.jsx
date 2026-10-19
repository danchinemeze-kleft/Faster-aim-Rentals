'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

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
  const [videoOpen, setVideoOpen] = useState(false)
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

      if (!listingData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setListing(listingData)
      setLikes(listingData.likes || 0)

      if (session) {
        setUser(session.user)
        const { data: reveal } = await supabase
          .from('Contact_reveals')
          .select('landlord_phone, landlord_email')
          .eq('tenant_id', session.user.id)
          .eq('listing_id', id)
          .maybeSingle()

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

      setLiked(JSON.parse(localStorage.getItem('mr_rent_liked') || '[]').includes(id))
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!lightboxOpen || !listing) return
    const imgs = Array.isArray(listing.images) ? listing.images : []
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setActiveImage((i) => (i - 1 + imgs.length) % imgs.length)
      if (e.key === 'Escape') {
        setLightboxOpen(false)
        setVideoOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, listing])

  async function handleLike() {
    const saved = JSON.parse(localStorage.getItem('mr_rent_liked') || '[]')
    if (liked) {
      localStorage.setItem('mr_rent_liked', JSON.stringify(saved.filter((lid) => lid !== id)))
      setLiked(false)
      setLikes((l) => Math.max(0, l - 1))
      await supabase.from('listings').update({ likes: Math.max(0, likes - 1) }).eq('id', id)
    } else {
      localStorage.setItem('mr_rent_liked', JSON.stringify([...saved, id]))
      setLiked(true)
      setLikes((l) => l + 1)
      await supabase.from('listings').update({ likes: likes + 1 }).eq('id', id)
    }
  }

  async function handleReveal() {
    if (!user) {
      router.push(`/account?redirect=/light/listing/${id}`)
      return
    }
    setRevealing(true)

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

    const res = await fetch('/api/init-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        type: 'reveal',
        listing_id: id,
        user_id: user.id,
      }),
    })

    const data = await res.json()
    if (data.authorization_url) {
      window.location.href = data.authorization_url
    } else {
      alert(data.error || 'Could not start payment.')
      setRevealing(false)
    }
  }

  if (loading) {
    return (
      <div className="listing-page loading">
        <div>Loading property…</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="listing-page not-found">
        <div className="not-found-icon">🏠</div>
        <h2>Property not found</h2>
        <button onClick={() => router.push('/light/browse')} className="btn-primary">
          Back to Browse
        </button>
      </div>
    )
  }

  const images = Array.isArray(listing.images) ? listing.images : []

  return (
    <div className="listing-page">
      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="lightbox-nav left"
            onClick={(e) => {
              e.stopPropagation()
              setActiveImage((i) => (i - 1 + images.length) % images.length)
            }}
          >
            ‹
          </button>
          <Image
            src={images[activeImage]}
            alt=""
            width={1200}
            height={800}
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav right"
            onClick={(e) => {
              e.stopPropagation()
              setActiveImage((i) => (i + 1) % images.length)
            }}
          >
            ›
          </button>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            ✕
          </button>
          <div className="lightbox-counter">
            {activeImage + 1} / {images.length} · ← → to navigate · Esc to close
          </div>
        </div>
      )}

      {/* Video Overlay */}
      {videoOpen && listing.video_url && (
        <div className="video-overlay" onClick={() => setVideoOpen(false)}>
          <button className="video-back" onClick={() => setVideoOpen(false)}>
            ← Back
          </button>
          <div className="video-container" onClick={(e) => e.stopPropagation()}>
            {isYouTube(listing.video_url) ? (
              <div className="youtube-wrapper">
                <iframe
                  src={youtubeEmbedUrl(listing.video_url) + '?autoplay=1'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video autoPlay controls playsInline>
                <source src={listing.video_url} type="video/mp4" />
                <source src={listing.video_url} type="video/webm" />
                <source src={listing.video_url} type="video/quicktime" />
              </video>
            )}
          </div>
          <p className="video-hint">Tap outside or press Esc to close</p>
        </div>
      )}

      {/* Top Bar */}
      <div className="listing-topbar">
        <button onClick={() => router.back()} className="back-btn">
          ←
        </button>
        <a href="/light" className="brand">
          Mr. Rent
        </a>
        <span className="separator">/</span>
        <a href="/light/browse" className="breadcrumb">
          Browse
        </a>
        <span className="separator">/</span>
        <span className="breadcrumb current">{listing.title}</span>
      </div>

      <div className="listing-container">
        {/* Images */}
        {images.length > 0 ? (
          <div className="gallery">
            <div className="main-image" onClick={() => setLightboxOpen(true)}>
              <Image
                src={images[activeImage]}
                alt={listing.title}
                width={1200}
                height={800}
                unoptimized
              />
              <div className="image-counter">
                🔍 {activeImage + 1} / {images.length}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    className="nav-btn left"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImage((i) => (i - 1 + images.length) % images.length)
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="nav-btn right"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImage((i) => (i + 1) % images.length)
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={img}
                    alt=""
                    width={80}
                    height={60}
                    onClick={() => setActiveImage(i)}
                    className={i === activeImage ? 'active' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-photos">
            <div>🏠</div>
            <p>No photos uploaded yet</p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="listing-grid">
          {/* Left Content */}
          <div className="listing-main">
            <div className="listing-header">
              <div className="tags">
                {listing.property_type && (
                  <span className="tag type">{listing.property_type}</span>
                )}
                {listing.available && <span className="tag available">● Available</span>}
              </div>
              <h1>{listing.title}</h1>
              <div className="meta">
                <span>
                  📍 {listing.location}
                  {listing.state ? `, ${listing.state}` : ''}
                </span>
                {listing.bedrooms && (
                  <span>
                    🛏 {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}
                  </span>
                )}
                {listing.bathrooms && (
                  <span>
                    🚿 {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {listing.description && (
              <div className="section">
                <h2>About this property</h2>
                <p className="description">{listing.description}</p>
              </div>
            )}

            {listing.amenities?.length > 0 && (
              <div className="section">
                <h2>Amenities</h2>
                <div className="amenities">
                  {listing.amenities.map((a) => (
                    <span key={a} className="amenity">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.video_url && (
              <div className="section">
                <h2>Property Video</h2>
                <button className="video-thumb" onClick={() => setVideoOpen(true)}>
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Video thumbnail"
                      width={640}
                      height={360}
                      unoptimized
                    />
                  ) : (
                    <div className="video-placeholder" />
                  )}
                  <div className="play-overlay">
                    <div className="play-btn">▶</div>
                    <span>Watch Property Video</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="listing-sidebar">
            <div className="price-card">
              <div className="price">
                ₦{Number(listing.price).toLocaleString('en-NG')}
                {listing.price_period && (
                  <span>per {listing.price_period}</span>
                )}
              </div>

              <div className="details">
                {listing.property_type && (
                  <div className="detail-row">
                    <span>Type</span>
                    <strong>{listing.property_type}</strong>
                  </div>
                )}
                {listing.bedrooms && (
                  <div className="detail-row">
                    <span>Bedrooms</span>
                    <strong>{listing.bedrooms}</strong>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="detail-row">
                    <span>Bathrooms</span>
                    <strong>{listing.bathrooms}</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>Location</span>
                  <strong>
                    {listing.location}
                    {listing.state ? `, ${listing.state}` : ''}
                  </strong>
                </div>
              </div>

              {revealedContact ? (
                <div className="contact-revealed">
                  <div className="revealed-label">✅ Contact Revealed</div>
                  {revealedContact.landlord_phone && (
                    <>
                      <a
                        href={`tel:${revealedContact.landlord_phone}`}
                        className="phone"
                      >
                        📞 {revealedContact.landlord_phone}
                      </a>
                      <a
                        href={`https://wa.me/${revealedContact.landlord_phone.replace(
                          /[^0-9]/g,
                          ''
                        )}?text=${encodeURIComponent(
                          `Hi, I'm interested in your property "${listing?.title}" listed on Mr. Rent. Is it still available?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                      >
                        💬 WhatsApp Landlord
                      </a>
                    </>
                  )}
                  {revealedContact.landlord_email && (
                    <a
                      href={`mailto:${revealedContact.landlord_email}`}
                      className="email"
                    >
                      ✉️ {revealedContact.landlord_email}
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleReveal}
                    disabled={revealing}
                    className="reveal-btn"
                  >
                    {revealing ? 'Redirecting…' : '📞 Reveal Contact — ₦5,000'}
                  </button>
                  <p className="reveal-note">
                    One-time secure payment via Paystack.
                    <br />
                    Landlord contact revealed instantly.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleLike}
              className={`like-btn ${liked ? 'liked' : ''}`}
            >
              <span>{liked ? '♥' : '♡'}</span>
              {liked ? 'Saved' : 'Save this listing'}
              {likes > 0 && <span className="like-count">· {likes}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}