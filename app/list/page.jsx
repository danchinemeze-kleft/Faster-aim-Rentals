'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Breadcrumb from '../components/Breadcrumb'

function ListingVideoPlayer({ src }) {
  const [state, setState] = useState('loading')
  if (!src) return null
  return (
    <div style={{ background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: '0.75rem', position: 'relative' }}>
      {state === 'loading' && (
        <div style={{ height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#111' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #ddd', borderTopColor: '#e67e22', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 11, color: '#999' }}>Loading video…</span>
        </div>
      )}
      {state === 'error' && (
        <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#111' }}>
          <span style={{ fontSize: 22 }}>🎬</span>
          <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#e67e22', fontWeight: 700, textDecoration: 'none' }}>Open video directly →</a>
        </div>
      )}
      <video
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setState('ready')}
        onCanPlay={() => setState('ready')}
        onError={() => setState('error')}
        style={{ width: '100%', maxHeight: 180, display: state === 'error' ? 'none' : 'block', background: '#000' }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" />
      </video>
    </div>
  )
}

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT Abuja'
]

const AMENITIES = ['WiFi', 'Parking', 'Security', 'Generator', 'Water Supply', 'Furnished', 'AC', 'Kitchen', 'Pool', 'Gym', 'Garden', 'Balcony']

const FREE_MONTHLY_LIMIT = 2

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const emptyForm = {
  title: '',
  property_number: '',
  description: '',
  location: '',
  city: '',
  state: '',
  price: '',
  price_period: 'yearly',
  property_type: 'apartment',
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
  available: true,
}

function ListPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userClosedFormRef = useRef(false)

  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [formData, setFormData] = useState(emptyForm)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoStatus, setVideoStatus] = useState('idle') // 'idle', 'checking', 'ready', 'error'
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoFiles, setPhotoFiles] = useState([]) // array of File objects
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0)
  const [editingListing, setEditingListing] = useState(null)
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingVideoUrl, setExistingVideoUrl] = useState(null)

  const recheckSubscription = async (userId) => {
    if (!userId) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [{ data: sub }, { data: monthListings }] = await Promise.all([
      supabase
        .from('Subscription')
        .select('expiry_date')
        .eq('landlord_id', userId)
        .gte('expiry_date', now.toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('listings')
        .select('id')
        .eq('landlord_id', userId)
        .gte('created_at', startOfMonth.toISOString()),
    ])
    setIsSubscribed(!!sub)
    setMonthlyCount(monthListings?.length || 0)
  }

  const fetchListings = async (userId) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setListings(data || [])
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/account?redirect=/list')
        return
      }
      const userId = session.user.id
      setUser(session.user)

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [, { data: sub }, { data: monthListings }] = await Promise.all([
        fetchListings(userId),
        supabase
          .from('Subscription')
          .select('expiry_date')
          .eq('landlord_id', userId)
          .gte('expiry_date', new Date().toISOString())
          .order('expiry_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id')
          .eq('landlord_id', userId)
          .gte('created_at', startOfMonth.toISOString()),
      ])

      const subscribed = !!sub
      const count = monthListings?.length || 0
      setIsSubscribed(subscribed)
      setMonthlyCount(count)
      setLoading(false)

      // URL signals from pages that already verified subscription status:
      // ?subscribed=1 → trusted subscribed landlord (from subscribe/dashboard pages)
      // ?free=1       → free-tier landlord with slots remaining
      // ?new=1        → generic, still check Supabase
      const urlSignal = searchParams.get('subscribed') === '1'
        ? 'subscribed'
        : searchParams.get('free') === '1'
          ? 'free'
          : searchParams.get('new') === '1'
            ? 'new'
            : null

      if (urlSignal && !userClosedFormRef.current) {
        if (urlSignal === 'subscribed') {
          // Trust the signal — open form immediately, mark subscribed
          setIsSubscribed(true)
          setShowForm(true)
        } else if (urlSignal === 'free' || (urlSignal === 'new' && (subscribed || count < FREE_MONTHLY_LIMIT))) {
          setShowForm(true)
        } else if (urlSignal === 'new' && !subscribed && count >= FREE_MONTHLY_LIMIT) {
          // Generic ?new=1 and initial check missed subscription — retry once
          const { data: freshSub } = await supabase
            .from('Subscription')
            .select('expiry_date')
            .eq('landlord_id', userId)
            .gte('expiry_date', new Date().toISOString())
            .maybeSingle()
          if (freshSub) {
            setIsSubscribed(true)
            setShowForm(true)
          }
        }
      }
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reactive auto-open: fires if subscription state updates after initial load
  useEffect(() => {
    if (loading) return
    if (showForm) return
    if (userClosedFormRef.current) return
    const hasSignal = searchParams.get('subscribed') === '1'
      || searchParams.get('free') === '1'
      || searchParams.get('new') === '1'
    if (!hasSignal) return
    if (isSubscribed || monthlyCount < FREE_MONTHLY_LIMIT) {
      setShowForm(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscribed, loading, monthlyCount])

  // Re-check subscription when user returns to this tab (e.g. after subscribing)
  useEffect(() => {
    if (!user) return
    const handleVisibility = () => {
      if (!document.hidden) recheckSubscription(user.id)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleEdit = (listing) => {
    setEditingListing(listing)
    setFormData({
      title: listing.title || '',
      property_number: listing.property_number || '',
      description: listing.description || '',
      location: listing.location || '',
      city: listing.city || '',
      state: listing.state || '',
      price: listing.price || '',
      price_period: listing.price_period || 'yearly',
      property_type: listing.property_type || 'apartment',
      bedrooms: listing.bedrooms || 1,
      bathrooms: listing.bathrooms || 1,
      amenities: listing.amenities || [],
      available: listing.available ?? true,
    })
    setExistingPhotos(listing.images || [])
    setExistingVideoUrl(listing.video_url || null)
    setPhotoFiles([])
    setVideoFile(null)
    setVideoStatus('idle')
    setShowForm(true)
    setPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    userClosedFormRef.current = true
    setEditingListing(null)
    setExistingPhotos([])
    setExistingVideoUrl(null)
    setFormData(emptyForm)
    setPhotoFiles([])
    setVideoFile(null)
    setVideoStatus('idle')
    setShowForm(false)
    setPreview(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 200 * 1024 * 1024) {
      alert('Video must be under 200MB')
      return
    }
    setVideoStatus('checking')
    const videoEl = document.createElement('video')
    videoEl.preload = 'metadata'
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src)
      const dur = videoEl.duration
      if (dur < 15) {
        setVideoStatus('error')
        alert('Video is too short. Minimum is 15 seconds.')
        return
      }
      if (dur > 60) {
        setVideoStatus('error')
        alert('Video is too long. Maximum is 60 seconds.')
        return
      }
      setVideoStatus('ready')
      setVideoFile(file)
    }
   videoEl.onerror = () => {
  setVideoStatus('ready')
  setVideoFile(file)
}
const timeout = setTimeout(() => {
  if (videoEl.duration === 0 || isNaN(videoEl.duration)) {
    setVideoStatus('ready')
    setVideoFile(file)
  }
}, 3000)
videoEl.onloadedmetadata = () => {
  clearTimeout(timeout)
  window.URL.revokeObjectURL(videoEl.src)
  const dur = videoEl.duration
  if (dur < 15) {
    setVideoStatus('error')
    alert('Video is too short. Minimum is 15 seconds.')
    return
  }
  if (dur > 60) {
    setVideoStatus('error')
    alert('Video is too long. Maximum is 60 seconds.')
    return
  }
  setVideoStatus('ready')
  setVideoFile(file)
}
videoEl.src = URL.createObjectURL(file)
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const valid = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        alert(`${f.name} is over 10MB and was skipped.`)
        return false
      }
      return true
    })
    setPhotoFiles(prev => {
      const combined = [...prev, ...valid]
      if (combined.length > 10) {
        alert('Maximum 10 photos allowed.')
        return combined.slice(0, 10)
      }
      return combined
    })
  }

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editingListing && !isSubscribed && monthlyCount >= FREE_MONTHLY_LIMIT) {
      alert('You have reached your free listing limit for this month. Subscribe to list more properties.')
      return
    }
    if (!videoFile && !existingVideoUrl) {
      alert('Please add a video of your property before publishing.')
      return
    }
    setSubmitting(true)
    setUploadProgress(0)
    setPhotoUploadProgress(0)

    try {
      // Upload new photos
      const new_photo_urls = []
      if (photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const photo = photoFiles[i]
          const ext = photo.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
          const { error: photoError } = await supabase.storage
            .from('property-images')
            .upload(fileName, photo, { contentType: photo.type })
          if (photoError) throw photoError
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName)
          new_photo_urls.push(urlData.publicUrl)
          setPhotoUploadProgress(Math.round(((i + 1) / photoFiles.length) * 100))
        }
      }

      // Upload new video only if a new file was selected
      let video_url = existingVideoUrl
      if (videoFile) {
        const ext = videoFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        setUploadProgress(30)
        const { error: uploadError } = await supabase.storage
          .from('property-video')
          .upload(fileName, videoFile, { contentType: videoFile.type })
        if (uploadError) throw uploadError
        setUploadProgress(80)
        const { data: urlData } = supabase.storage
          .from('property-video')
          .getPublicUrl(fileName)
        video_url = urlData.publicUrl
        setUploadProgress(100)
      }

      const payload = {
        title: formData.title,
        property_number: formData.property_number || null,
        description: formData.description,
        location: formData.location,
        city: formData.city || null,
        state: formData.state,
        price: parseInt(formData.price),
        price_period: formData.price_period,
        property_type: formData.property_type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities,
        available: formData.available,
        is_available: formData.available,
        video_url,
        images: [...existingPhotos, ...new_photo_urls],
      }

      const wasEditing = !!editingListing
      if (editingListing) {
        const { error } = await supabase.from('listings').update(payload).eq('id', editingListing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('listings').insert([{
          landlord_id: user.id,
          ...payload,
          status: 'pending',
        }])
        if (error) throw error
      }

      setFormData(emptyForm)
      setVideoFile(null)
      setVideoStatus('idle')
      setPhotoFiles([])
      setPreview(false)
      setShowForm(false)
      setUploadProgress(0)
      setPhotoUploadProgress(0)
      setEditingListing(null)
      setExistingPhotos([])
      setExistingVideoUrl(null)
      setSuccessMsg(wasEditing
        ? '✅ Listing updated successfully!'
        : '✅ Listing submitted! It will go live after admin review (usually within 24 hours).')
      setTimeout(() => setSuccessMsg(''), 5000)
      fetchListings(user.id)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else fetchListings(user.id)
  }

  const formatPrice = (price, period) => `₦${parseInt(price).toLocaleString()} / ${period}`

  if (loading) return (
    <div className="faim-list-loading">
      <div className="faim-spinner"></div>
      <p>Loading your listings...</p>
    </div>
  )

  return (
    <div className="faim-list-page">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'List Property', href: '/list' }]} />
      <div className="faim-list-header">
        <div>
          <h1>🏠 My Listings</h1>
          <p>Manage your rental properties</p>
        </div>
        <button
          className="faim-new-btn"
          onClick={async () => {
            if (editingListing) { handleCancelEdit(); return }
            if (showForm) { userClosedFormRef.current = true; setShowForm(false); setPreview(false); return }

            // If already confirmed subscribed or under limit, open form
            if (isSubscribed || monthlyCount < FREE_MONTHLY_LIMIT) {
              setShowForm(true); setPreview(false); return
            }

            // Live subscription check before blocking
            const { data: freshSub } = await supabase
              .from('Subscription')
              .select('expiry_date')
              .eq('landlord_id', user.id)
              .gte('expiry_date', new Date().toISOString())
              .limit(1)
              .maybeSingle()

            if (freshSub) {
              setIsSubscribed(true)
              setShowForm(true)
              setPreview(false)
            } else {
              router.push('/subscribe')
            }
          }}
        >
          {showForm ? (editingListing ? '✕ Cancel Edit' : '✕ Cancel') : '+ New Listing'}
        </button>
      </div>

      {/* Free tier usage indicator */}
      {!isSubscribed && (
        <div style={{ maxWidth: 1200, margin: '0 auto 1.5rem', background: monthlyCount >= FREE_MONTHLY_LIMIT ? '#fff0f0' : '#fff8f2', border: `1.5px solid ${monthlyCount >= FREE_MONTHLY_LIMIT ? '#e74c3c' : '#e67e22'}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: monthlyCount >= FREE_MONTHLY_LIMIT ? '#e74c3c' : '#7a4a1a', marginBottom: 2 }}>
              {monthlyCount >= FREE_MONTHLY_LIMIT
                ? '🔒 Free listing limit reached for this month'
                : `📋 Free tier: ${monthlyCount} of ${FREE_MONTHLY_LIMIT} listings used this month`}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#888' }}>
              {monthlyCount >= FREE_MONTHLY_LIMIT
                ? 'Subscribe for ₦10,000/month to list unlimited properties.'
                : `You have ${FREE_MONTHLY_LIMIT - monthlyCount} free listing${FREE_MONTHLY_LIMIT - monthlyCount === 1 ? '' : 's'} remaining this month.`}
            </div>
          </div>
          {monthlyCount >= FREE_MONTHLY_LIMIT && (
            <button
              onClick={() => router.push('/subscribe')}
              style={{ background: '#e67e22', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Subscribe Now →
            </button>
          )}
        </div>
      )}

      {successMsg && <div className="faim-success">{successMsg}</div>}

      {showForm && (
        <div className="faim-form-card">
          <h2>{editingListing ? 'Edit Listing' : 'Create New Listing'}</h2>
          <div className="faim-form-grid">
            <form onSubmit={handleSubmit} className="faim-form">

              <div className="faim-field">
                <label>Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g., Modern 2-Bedroom Flat in Lekki" required />
              </div>

              <div className="faim-field">
                <label>Property Number <span style={{fontWeight:400,color:'#888'}}>(optional)</span></label>
                <input type="text" name="property_number" value={formData.property_number} onChange={handleChange}
                  placeholder="e.g., Shop 2 / Room 2" />
              </div>

              <div className="faim-row">
                <div className="faim-field">
                  <label>Address *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    placeholder="e.g., 5 Zik Avenue, Awka South" required />
                </div>
                <div className="faim-field">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="e.g., Awka" required />
                </div>
                <div className="faim-field">
                  <label>State *</label>
                  <select name="state" value={formData.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="faim-row">
                <div className="faim-field">
                  <label>Property Type *</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange}>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="house">House</option>
                    <option value="duplex">Duplex</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="studio">Self-Contain / Studio</option>
                    <option value="room">Single Room</option>
                    <option value="office">Office Space</option>
                    <option value="shop">Shop / Store</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="faim-field">
                  <label>Available Now?</label>
                  <select name="available" value={formData.available} onChange={handleChange}>
                    <option value={true}>Yes — Available</option>
                    <option value={false}>No — Not Available</option>
                  </select>
                </div>
              </div>

              <div className="faim-row">
                <div className="faim-field">
                  <label>Bedrooms *</label>
                  <input type="number" name="bedrooms" min="1" max="20" value={formData.bedrooms} onChange={handleChange} required />
                </div>
                <div className="faim-field">
                  <label>Bathrooms *</label>
                  <input type="number" name="bathrooms" min="1" max="20" value={formData.bathrooms} onChange={handleChange} required />
                </div>
                <div className="faim-field">
                  <label>Price (₦) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange}
                    placeholder="500000" required />
                </div>
                <div className="faim-field">
                  <label>Per</label>
                  <select name="price_period" value={formData.price_period} onChange={handleChange}>
                    <option value="yearly">Year</option>
                    <option value="monthly">Month</option>
                    <option value="weekly">Week</option>
                  </select>
                </div>
              </div>

              <div className="faim-field">
                <label>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="5"
                  placeholder="Describe your property in detail. Include information about the neighborhood, nearby facilities, condition of the property, terms and conditions etc." required />
              </div>

              {/* ── PHOTO UPLOAD ── */}
              <div className="faim-field">
                <label>Property Photos <span style={{fontWeight:400,color:'#888'}}>(up to 10, optional)</span></label>
                <div style={{background:'#f8f8ff',border:'1px solid #dde',borderRadius:'8px',padding:'0.6rem 0.9rem',marginBottom:'0.5rem',fontSize:'0.82rem',color:'#555',lineHeight:'1.6'}}>
                  📸 Upload clear photos of the interior and exterior. Max 10MB per photo.
                </div>

                {editingListing && existingPhotos.length > 0 && (
                  <div style={{marginBottom:'0.75rem'}}>
                    <div style={{fontSize:'0.8rem',color:'#888',marginBottom:'6px'}}>Current photos — click ✕ to remove:</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:'8px'}}>
                      {existingPhotos.map((url, i) => (
                        <div key={i} style={{position:'relative',borderRadius:'8px',overflow:'hidden',height:'80px',background:'#eee'}}>
                          <Image src={url} alt={`current ${i+1}`} fill unoptimized style={{objectFit:'cover'}} />
                          <button
                            type="button"
                            onClick={() => setExistingPhotos(prev => prev.filter((_, idx) => idx !== i))}
                            style={{position:'absolute',top:'3px',right:'3px',background:'rgba(0,0,0,0.6)',color:'white',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {photoFiles.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:'8px',marginBottom:'0.75rem'}}>
                    {photoFiles.map((photo, i) => (
                      <div key={i} style={{position:'relative',borderRadius:'8px',overflow:'hidden',height:'80px',background:'#eee'}}>
                        <Image
                          src={URL.createObjectURL(photo)}
                          alt={`photo ${i+1}`}
                          fill
                          unoptimized
                          style={{objectFit:'cover'}}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          style={{position:'absolute',top:'3px',right:'3px',background:'rgba(0,0,0,0.6)',color:'white',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}
                        >✕</button>
                      </div>
                    ))}
                    {photoFiles.length < 10 && (
                      <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'80px',border:'2px dashed #ccc',borderRadius:'8px',cursor:'pointer',color:'#aaa',fontSize:'1.3rem'}}>
                        <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handlePhotoSelect} />
                        +
                      </label>
                    )}
                  </div>
                )}

                {photoFiles.length === 0 && (
                  <label className="faim-video-drop" style={{padding:'1.5rem'}}>
                    <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handlePhotoSelect} />
                    <span style={{fontSize:'1.8rem'}}>📸</span>
                    <span>Tap to upload photos</span>
                    <span className="faim-video-hint">JPG, PNG, WEBP · Max 10MB each · Up to 10 photos</span>
                  </label>
                )}

                {submitting && photoFiles.length > 0 && photoUploadProgress > 0 && (
                  <div style={{marginTop:'0.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'#888',marginBottom:'4px'}}>
                      <span>{photoUploadProgress < 100 ? '📸 Uploading photos...' : '✅ Photos uploaded!'}</span>
                      <span>{photoUploadProgress}%</span>
                    </div>
                    <div className="faim-progress-wrap">
                      <div className="faim-progress-bar" style={{width:`${photoUploadProgress}%`,background:'linear-gradient(90deg,#3498db,#2980b9)'}} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── VIDEO UPLOAD ── */}
              <div className="faim-field">
                <label>Property Video <span style={{fontWeight:400,color:'#c0392b'}}>* Required</span></label>
                <div style={{background:'#fff8f2',border:'1px solid #f0d0b0',borderRadius:'8px',padding:'0.75rem 1rem',marginBottom:'0.5rem',fontSize:'0.83rem',color:'#7a4a1a',lineHeight:'1.7'}}>
                  📹 Record a <strong>15 to 60 second video</strong> showing both the <strong>interior and exterior</strong> of the property. The video must match your description.<br/>
📱 <strong>Use a video you recorded directly</strong> from your phone camera. If you received the video via WhatsApp or file transfer, <strong>rename the file</strong> to something simple like <code style={{background:'#f0e0c8',padding:'1px 5px',borderRadius:'4px'}}>property-video.mp4</code> before uploading.<br/>
⚠️ <strong>AI-generated videos will be rejected</strong> and your property will not be approved.
                </div>

                <div className="faim-video-upload">
                  {editingListing && existingVideoUrl && !videoFile && (
                    <div style={{marginBottom:'0.75rem'}}>
                      <div style={{fontSize:'0.8rem',color:'#888',marginBottom:'6px'}}>Current video:</div>
                      <ListingVideoPlayer src={existingVideoUrl} />
                      <button
                        type="button"
                        onClick={() => setExistingVideoUrl(null)}
                        style={{marginTop:'0.5rem',background:'#fff0f0',color:'#e74c3c',border:'none',padding:'0.4rem 0.8rem',borderRadius:'8px',cursor:'pointer',fontSize:'0.82rem',fontWeight:600}}
                      >✕ Remove & upload new video</button>
                    </div>
                  )}
                  {videoStatus === 'checking' && (
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1.25rem',background:'#fff8f2',border:'1.5px solid #e67e22',borderRadius:'12px',color:'#e67e22',fontWeight:600,fontSize:'0.9rem',marginBottom:'0.5rem'}}>
                      <div style={{width:'20px',height:'20px',border:'3px solid #f0d0b0',borderTopColor:'#e67e22',borderRadius:'50%',animation:'spin 0.8s linear infinite',flexShrink:0}}></div>
                      Checking video duration...
                    </div>
                  )}

                  {videoStatus === 'error' && (
                    <div style={{padding:'1rem',background:'#fff0f0',border:'1.5px solid #e74c3c',borderRadius:'12px',color:'#e74c3c',fontWeight:600,fontSize:'0.85rem',marginBottom:'0.5rem'}}>
                      ❌ Video rejected. Please record a new one (15–60 seconds, MP4/MOV/WEBM, max 200MB).
                      <label style={{display:'block',marginTop:'0.5rem',cursor:'pointer',textDecoration:'underline',fontWeight:400,fontSize:'0.82rem'}}>
                        <input type="file" accept="video/mp4,video/quicktime,video/webm" style={{display:'none'}} onChange={handleVideoSelect} />
                        Try another video →
                      </label>
                    </div>
                  )}

                  {videoStatus === 'ready' && videoFile && (
                    <div className="faim-video-preview">
                      <div style={{background:'#f0fff4',border:'1.5px solid #27ae60',borderRadius:'10px',padding:'0.6rem 1rem',display:'flex',alignItems:'center',gap:'0.5rem',color:'#27ae60',fontWeight:700,fontSize:'0.85rem'}}>
                        ✅ Video ready — looks good!
                      </div>
                      <video src={URL.createObjectURL(videoFile)} controls className="faim-video-player" />
                      <div className="faim-video-info">
                        <span>📹 {videoFile.name}</span>
                        <span>{(videoFile.size / (1024*1024)).toFixed(1)} MB</span>
                      </div>
                      <button type="button" className="faim-remove-video" onClick={() => { setVideoFile(null); setVideoStatus('idle') }}>
                        ✕ Remove video
                      </button>
                    </div>
                  )}

                  {videoStatus === 'idle' && (
                    <label className="faim-video-drop">
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        style={{ display: 'none' }}
                        onChange={handleVideoSelect}
                      />
                      <span className="faim-video-icon">📹</span>
                      <span>Tap to upload property video</span>
                      <span className="faim-video-hint">MP4, MOV or WEBM · 15–60 seconds · Max 200MB</span>
                    </label>
                  )}
                </div>

                {submitting && videoFile && (
                  <div style={{marginTop:'0.75rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'#888',marginBottom:'6px'}}>
                      <span>
                        {uploadProgress < 30 ? '⏳ Preparing upload...' :
                         uploadProgress < 80 ? '📤 Uploading video...' :
                         uploadProgress < 100 ? '🔗 Finalizing...' :
                         '✅ Video uploaded!'}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="faim-progress-wrap">
                      <div className="faim-progress-bar" style={{width:`${uploadProgress}%`}} />
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="faim-field">
                <label>Amenities</label>
                <div className="faim-amenities-grid">
                  {AMENITIES.map(amenity => (
                    <label key={amenity} className={`faim-amenity ${formData.amenities.includes(amenity) ? 'faim-amenity--active' : ''}`}
                      onClick={() => toggleAmenity(amenity)}>
                      {formData.amenities.includes(amenity) ? '✓ ' : '+ '}{amenity}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{background:'#fff8f2',border:'1px solid #f0d0b0',borderRadius:'8px',padding:'0.75rem 1rem',fontSize:'0.83rem',color:'#7a4a1a',lineHeight:'1.7'}}>
  <label style={{display:'flex',alignItems:'flex-start',gap:'0.6rem',cursor:'pointer',fontWeight:600}}>
    <input type="checkbox" required style={{marginTop:'3px',accentColor:'#e67e22',flexShrink:0}} />
    I confirm that all photos and videos are real recordings of this property. I understand that AI-generated or fake media will result in immediate removal and account suspension.
  </label>
</div>
<div className="faim-form-actions">
                <button type="button" className="faim-preview-btn" onClick={() => setPreview(!preview)}>
                  {preview ? '🙈 Hide Preview' : '👁️ Preview Listing'}
                </button>
                <button type="submit" className="faim-submit-btn" disabled={submitting}>
                  {submitting
                    ? (editingListing ? 'Updating...' : 'Publishing...')
                    : (editingListing ? '✏️ Update Listing' : '✨ Publish Listing')}
                </button>
              </div>
            </form>

            {preview && (
              <div className="faim-preview">
                <h3>How tenants will see it</h3>
                <div className="faim-preview-card">
                  <div className="faim-preview-badge">{formData.property_type}</div>
                  <h2>{formData.title || 'Your property title'}</h2>
                  <p className="faim-preview-location">📍 {formData.location || 'Address'}{formData.city ? `, ${formData.city}` : ''}, {formData.state || 'State'}</p>
                  <p className="faim-preview-price">{formData.price ? formatPrice(formData.price, formData.price_period) : '₦0'}</p>
                  <div className="faim-preview-specs">
                    <span>🛏 {formData.bedrooms} Bed</span>
                    <span>🚿 {formData.bathrooms} Bath</span>
                    <span>{formData.available ? '✅ Available' : '❌ Not Available'}</span>
                  </div>
                  {photoFiles.length > 0 && (
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'0.75rem'}}>
                      {photoFiles.slice(0,4).map((p,i) => (
                        <div key={i} style={{position:'relative',height:'70px',borderRadius:'6px',overflow:'hidden'}}>
                          <Image src={URL.createObjectURL(p)} alt="" fill unoptimized style={{objectFit:'cover'}} />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="faim-preview-desc">{formData.description || 'Your description will appear here...'}</p>
                  {formData.amenities.length > 0 && (
                    <div className="faim-preview-amenities">
                      {formData.amenities.map(a => <span key={a}>✓ {a}</span>)}
                    </div>
                  )}
                  {videoFile && (
                    <video src={URL.createObjectURL(videoFile)} controls style={{width:'100%',borderRadius:'8px',marginBottom:'0.75rem'}} />
                  )}
                  <div className="faim-preview-cta">Contact Landlord — ₦5,000</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="faim-listings-section">
        <h2>Your Properties ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="faim-empty">
            <p>🏠 No listings yet.</p>
            <p>Click <strong>+ New Listing</strong> to create your first property listing.</p>
          </div>
        ) : (
          <div className="faim-listings-grid">
            {listings.map(listing => (
              <div key={listing.id} className="faim-listing-card">
                <div className="faim-listing-top">
                  <span className="faim-type-badge">{listing.property_type}</span>
                  <span className={`faim-status-badge ${listing.available ? 'faim-status-badge--available' : 'faim-status-badge--unavailable'}`}>
                    {listing.available ? '● Available' : '● Unavailable'}
                  </span>
                </div>
                {listing.images && listing.images.length > 0 && (
                  <div style={{position:'relative',height:'160px',borderRadius:'10px',overflow:'hidden',marginBottom:'0.75rem'}}>
                    <Image src={listing.images[0]} alt={listing.title} fill unoptimized style={{objectFit:'cover'}} />
                  </div>
                )}
                {listing.video_url && <ListingVideoPlayer src={listing.video_url} />}
                <h3>{listing.title}</h3>
                <p className="faim-listing-location">📍 {listing.location}{listing.city ? `, ${listing.city}` : ''}, {listing.state}</p>
                <p className="faim-listing-price">₦{listing.price?.toLocaleString()} / {listing.price_period}</p>
                <p className="faim-listing-specs">{listing.bedrooms} bed • {listing.bathrooms} bath</p>
                <p className="faim-listing-desc">{listing.description?.substring(0, 120)}...</p>
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="faim-listing-amenities">
                    {listing.amenities.slice(0, 4).map(a => <span key={a}>{a}</span>)}
                    {listing.amenities.length > 4 && <span>+{listing.amenities.length - 4} more</span>}
                  </div>
                )}
                <div className="faim-listing-actions">
                  <button className="faim-edit-btn" onClick={() => handleEdit(listing)}>✏️ Edit</button>
                  <button className="faim-delete-btn" onClick={() => handleDelete(listing.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .faim-list-page { min-height:100vh; background:#f5f4f0; font-family:'Segoe UI',system-ui,sans-serif; padding:2rem; }
        .faim-list-loading { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; color:#666; }
        .faim-spinner { width:40px; height:40px; border:3px solid #e0e0e0; border-top-color:#e67e22; border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .faim-list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; max-width:1200px; margin-left:auto; margin-right:auto; }
        .faim-list-header h1 { font-size:1.8rem; font-weight:700; color:#1a1a2e; }
        .faim-list-header p { color:#666; font-size:0.9rem; }
        .faim-new-btn { background:#e67e22; color:white; border:none; padding:0.75rem 1.5rem; border-radius:10px; font-weight:600; cursor:pointer; font-size:0.95rem; transition:background 0.15s; }
        .faim-new-btn:hover { background:#cf6d17; }
        .faim-success { background:#f0fff4; color:#27ae60; border:1px solid #b2f0c8; padding:0.75rem 1rem; border-radius:8px; margin-bottom:1.5rem; max-width:1200px; margin-left:auto; margin-right:auto; font-weight:600; }
        .faim-form-card { background:white; border-radius:16px; padding:2rem; margin-bottom:2rem; box-shadow:0 4px 24px rgba(0,0,0,0.08); max-width:1200px; margin-left:auto; margin-right:auto; }
        .faim-form-card h2 { font-size:1.3rem; color:#1a1a2e; margin-bottom:1.5rem; }
        .faim-form-grid { display:grid; grid-template-columns:1fr 380px; gap:2rem; }
        .faim-form { display:flex; flex-direction:column; gap:1.25rem; }
        .faim-field { display:flex; flex-direction:column; gap:6px; }
        .faim-field label { font-size:0.85rem; font-weight:600; color:#444; }
        .faim-field input, .faim-field select, .faim-field textarea { padding:0.65rem 0.875rem; border:1.5px solid #e0e0e0; border-radius:9px; font-size:0.9rem; color:#1a1a2e; outline:none; transition:border-color 0.15s; background:#fff; font-family:inherit; }
        .faim-field input:focus, .faim-field select:focus, .faim-field textarea:focus { border-color:#e67e22; }
        .faim-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; }
        .faim-amenities-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .faim-amenity { padding:6px 14px; border:1.5px solid #e0e0e0; border-radius:20px; font-size:0.82rem; cursor:pointer; transition:all 0.15s; color:#555; user-select:none; }
        .faim-amenity--active { border-color:#e67e22; background:#fff8f2; color:#e67e22; font-weight:600; }
        .faim-form-actions { display:flex; gap:1rem; margin-top:0.5rem; }
        .faim-preview-btn { flex:1; padding:0.75rem; border:1.5px solid #e67e22; border-radius:10px; background:white; color:#e67e22; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .faim-preview-btn:hover { background:#fff8f2; }
        .faim-submit-btn { flex:2; padding:0.75rem; background:#e67e22; color:white; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:0.95rem; transition:background 0.15s; }
        .faim-submit-btn:hover { background:#cf6d17; }
        .faim-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .faim-preview h3 { font-size:0.9rem; color:#888; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.05em; }
        .faim-preview-card { background:#1a1a2e; border-radius:14px; padding:1.5rem; color:white; position:sticky; top:1rem; }
        .faim-preview-badge { display:inline-block; background:#e67e22; color:white; padding:3px 12px; border-radius:20px; font-size:0.75rem; font-weight:600; text-transform:capitalize; margin-bottom:0.75rem; }
        .faim-preview-card h2 { font-size:1.2rem; margin-bottom:0.5rem; }
        .faim-preview-location { color:#aaa; font-size:0.85rem; margin-bottom:0.5rem; }
        .faim-preview-price { font-size:1.3rem; font-weight:700; color:#e67e22; margin-bottom:0.75rem; }
        .faim-preview-specs { display:flex; gap:1rem; font-size:0.85rem; margin-bottom:1rem; color:#ccc; }
        .faim-preview-desc { font-size:0.85rem; color:#ccc; line-height:1.6; margin-bottom:1rem; }
        .faim-preview-amenities { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1rem; }
        .faim-preview-amenities span { font-size:0.78rem; color:#aaa; }
        .faim-preview-cta { background:#e67e22; color:white; text-align:center; padding:0.75rem; border-radius:10px; font-weight:600; font-size:0.9rem; }
        .faim-video-upload { width:100%; }
        .faim-video-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; padding:2rem; border:2px dashed #e0e0e0; border-radius:12px; cursor:pointer; transition:border-color 0.15s; text-align:center; color:#888; font-size:0.9rem; }
        .faim-video-drop:hover { border-color:#e67e22; color:#e67e22; }
        .faim-video-icon { font-size:2rem; }
        .faim-video-hint { font-size:0.78rem; color:#aaa; }
        .faim-video-preview { display:flex; flex-direction:column; gap:0.75rem; }
        .faim-video-player { width:100%; border-radius:10px; max-height:200px; background:#000; }
        .faim-video-info { display:flex; justify-content:space-between; font-size:0.82rem; color:#666; }
        .faim-remove-video { background:#fff0f0; color:#e74c3c; border:none; padding:0.5rem 1rem; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; align-self:flex-start; }
        .faim-remove-video:hover { background:#fcc; }
        .faim-progress-wrap { background:#f0f0f0; border-radius:20px; height:8px; overflow:hidden; }
        .faim-progress-bar { height:100%; background:linear-gradient(90deg,#e67e22,#f39c12); border-radius:20px; transition:width 0.3s ease; }
        .faim-listing-video { width:100%; border-radius:10px; max-height:180px; background:#000; margin-bottom:0.75rem; }
        .faim-listings-section { max-width:1200px; margin:0 auto; }
        .faim-listings-section h2 { font-size:1.3rem; color:#1a1a2e; margin-bottom:1.5rem; }
        .faim-empty { text-align:center; padding:3rem; background:white; border-radius:16px; color:#666; line-height:2; }
        .faim-listings-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.5rem; }
        .faim-listing-card { background:white; border-radius:14px; padding:1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .faim-listing-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
        .faim-type-badge { background:#f0ede8; color:#666; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; text-transform:capitalize; }
        .faim-status-badge { font-size:0.78rem; font-weight:600; }
        .faim-status-badge--available { color:#27ae60; }
        .faim-status-badge--unavailable { color:#e74c3c; }
        .faim-listing-card h3 { font-size:1.05rem; font-weight:700; color:#1a1a2e; margin-bottom:0.4rem; }
        .faim-listing-location { font-size:0.82rem; color:#888; margin-bottom:0.4rem; }
        .faim-listing-price { font-size:1.1rem; font-weight:700; color:#e67e22; margin-bottom:0.4rem; }
        .faim-listing-specs { font-size:0.82rem; color:#666; margin-bottom:0.5rem; }
        .faim-listing-desc { font-size:0.82rem; color:#888; line-height:1.5; margin-bottom:0.75rem; }
        .faim-listing-amenities { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1rem; }
        .faim-listing-amenities span { background:#f0ede8; color:#666; padding:3px 10px; border-radius:20px; font-size:0.75rem; }
        .faim-listing-actions { display:flex; gap:0.75rem; }
        .faim-edit-btn { flex:1; padding:0.6rem; border:1.5px solid #e67e22; border-radius:8px; background:white; color:#e67e22; font-weight:600; cursor:pointer; font-size:0.85rem; transition:all 0.15s; }
        .faim-edit-btn:hover { background:#fff8f2; }
        .faim-delete-btn { flex:1; padding:0.6rem; border:none; border-radius:8px; background:#fff0f0; color:#e74c3c; font-weight:600; cursor:pointer; font-size:0.85rem; transition:all 0.15s; }
        .faim-delete-btn:hover { background:#fcc; }
        @media (max-width:768px) { .faim-form-grid { grid-template-columns:1fr; } .faim-list-page { padding:1rem; } }
      `}</style>
    </div>
  )
}

export default function ListPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading…</div>}>
      <ListPageInner />
    </Suspense>
  )
}