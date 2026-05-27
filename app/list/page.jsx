'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT Abuja'
]

const AMENITIES = ['WiFi', 'Parking', 'Security', 'Generator', 'Water Supply', 'Furnished', 'AC', 'Kitchen', 'Pool', 'Gym', 'Garden', 'Balcony']

const emptyForm = {
  title: '',
  description: '',
  location: '',
  state: '',
  price: '',
  price_period: 'yearly',
  property_type: 'apartment',
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
  available: true,
}

export default function ListPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(emptyForm)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/account?redirect=/list')
        return
      }
      setUser(session.user)
      fetchListings(session.user.id)
    }
    checkAuth()
  }, [])

  const fetchListings = async (userId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setListings(data || [])
    setLoading(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('listings').insert([{
        landlord_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        state: formData.state,
        price: parseInt(formData.price),
        price_period: formData.price_period,
        property_type: formData.property_type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities,
        status: 'active',
        available: formData.available,
      }])
      if (error) throw error
      setFormData(emptyForm)
      setPreview(false)
      setShowForm(false)
      setSuccessMsg('Listing published successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
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
      {/* Header */}
      <div className="faim-list-header">
        <div>
          <h1>🏠 My Listings</h1>
          <p>Manage your rental properties</p>
        </div>
        <button className="faim-new-btn" onClick={() => { setShowForm(!showForm); setPreview(false) }}>
          {showForm ? '✕ Cancel' : '+ New Listing'}
        </button>
      </div>

      {successMsg && <div className="faim-success">{successMsg}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="faim-form-card">
          <h2>Create New Listing</h2>

          <div className="faim-form-grid">
            {/* Left: Form */}
            <form onSubmit={handleSubmit} className="faim-form">

              <div className="faim-field">
                <label>Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g., Modern 2-Bedroom Flat in Lekki" required />
              </div>

              <div className="faim-row">
                <div className="faim-field">
                  <label>Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    placeholder="e.g., Awka South" required />
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

              <div className="faim-form-actions">
                <button type="button" className="faim-preview-btn" onClick={() => setPreview(!preview)}>
                  {preview ? '🙈 Hide Preview' : '👁️ Preview Listing'}
                </button>
                <button type="submit" className="faim-submit-btn" disabled={submitting}>
                  {submitting ? 'Publishing...' : '✨ Publish Listing'}
                </button>
              </div>
            </form>

            {/* Right: Preview */}
            {preview && (
              <div className="faim-preview">
                <h3>How tenants will see it</h3>
                <div className="faim-preview-card">
                  <div className="faim-preview-badge">{formData.property_type}</div>
                  <h2>{formData.title || 'Your property title'}</h2>
                  <p className="faim-preview-location">📍 {formData.location || 'Location'}, {formData.state || 'State'}</p>
                  <p className="faim-preview-price">{formData.price ? formatPrice(formData.price, formData.price_period) : '₦0'}</p>
                  <div className="faim-preview-specs">
                    <span>🛏 {formData.bedrooms} Bed</span>
                    <span>🚿 {formData.bathrooms} Bath</span>
                    <span>{formData.available ? '✅ Available' : '❌ Not Available'}</span>
                  </div>
                  <p className="faim-preview-desc">{formData.description || 'Your description will appear here...'}</p>
                  {formData.amenities.length > 0 && (
                    <div className="faim-preview-amenities">
                      {formData.amenities.map(a => <span key={a}>✓ {a}</span>)}
                    </div>
                  )}
                  <div className="faim-preview-cta">Contact Landlord — ₦5,000</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listings Grid */}
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
                <h3>{listing.title}</h3>
                <p className="faim-listing-location">📍 {listing.location}, {listing.state}</p>
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
                  <button className="faim-edit-btn">✏️ Edit</button>
                  <button className="faim-delete-btn" onClick={() => handleDelete(listing.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .faim-list-page {
          min-height: 100vh;
          background: #f5f4f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 2rem;
        }
        .faim-list-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #666;
        }
        .faim-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #e67e22;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .faim-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .faim-list-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a1a2e; }
        .faim-list-header p { color: #666; font-size: 0.9rem; }
        .faim-new-btn {
          background: #e67e22;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.15s;
        }
        .faim-new-btn:hover { background: #cf6d17; }
        .faim-success {
          background: #f0fff4;
          color: #27ae60;
          border: 1px solid #b2f0c8;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .faim-form-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .faim-form-card h2 { font-size: 1.3rem; color: #1a1a2e; margin-bottom: 1.5rem; }
        .faim-form-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }
        .faim-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .faim-field { display: flex; flex-direction: column; gap: 6px; }
        .faim-field label { font-size: 0.85rem; font-weight: 600; color: #444; }
        .faim-field input, .faim-field select, .faim-field textarea {
          padding: 0.65rem 0.875rem;
          border: 1.5px solid #e0e0e0;
          border-radius: 9px;
          font-size: 0.9rem;
          color: #1a1a2e;
          outline: none;
          transition: border-color 0.15s;
          background: #fff;
          font-family: inherit;
        }
        .faim-field input:focus, .faim-field select:focus, .faim-field textarea:focus { border-color: #e67e22; }
        .faim-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        .faim-amenities-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .faim-amenity {
          padding: 6px 14px;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
          color: #555;
          user-select: none;
        }
        .faim-amenity--active { border-color: #e67e22; background: #fff8f2; color: #e67e22; font-weight: 600; }
        .faim-form-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
        .faim-preview-btn {
          flex: 1;
          padding: 0.75rem;
          border: 1.5px solid #e67e22;
          border-radius: 10px;
          background: white;
          color: #e67e22;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .faim-preview-btn:hover { background: #fff8f2; }
        .faim-submit-btn {
          flex: 2;
          padding: 0.75rem;
          background: #e67e22;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.15s;
        }
        .faim-submit-btn:hover { background: #cf6d17; }
        .faim-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .faim-preview h3 { font-size: 0.9rem; color: #888; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .faim-preview-card {
          background: #1a1a2e;
          border-radius: 14px;
          padding: 1.5rem;
          color: white;
          position: sticky;
          top: 1rem;
        }
        .faim-preview-badge {
          display: inline-block;
          background: #e67e22;
          color: white;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          margin-bottom: 0.75rem;
        }
        .faim-preview-card h2 { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .faim-preview-location { color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem; }
        .faim-preview-price { font-size: 1.3rem; font-weight: 700; color: #e67e22; margin-bottom: 0.75rem; }
        .faim-preview-specs { display: flex; gap: 1rem; font-size: 0.85rem; margin-bottom: 1rem; color: #ccc; }
        .faim-preview-desc { font-size: 0.85rem; color: #ccc; line-height: 1.6; margin-bottom: 1rem; }
        .faim-preview-amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; }
        .faim-preview-amenities span { font-size: 0.78rem; color: #aaa; }
        .faim-preview-cta {
          background: #e67e22;
          color: white;
          text-align: center;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .faim-listings-section { max-width: 1200px; margin: 0 auto; }
        .faim-listings-section h2 { font-size: 1.3rem; color: #1a1a2e; margin-bottom: 1.5rem; }
        .faim-empty {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          color: #666;
          line-height: 2;
        }
        .faim-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .faim-listing-card {
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .faim-listing-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .faim-type-badge {
          background: #f0ede8;
          color: #666;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .faim-status-badge { font-size: 0.78rem; font-weight: 600; }
        .faim-status-badge--available { color: #27ae60; }
        .faim-status-badge--unavailable { color: #e74c3c; }
        .faim-listing-card h3 { font-size: 1.05rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.4rem; }
        .faim-listing-location { font-size: 0.82rem; color: #888; margin-bottom: 0.4rem; }
        .faim-listing-price { font-size: 1.1rem; font-weight: 700; color: #e67e22; margin-bottom: 0.4rem; }
        .faim-listing-specs { font-size: 0.82rem; color: #666; margin-bottom: 0.5rem; }
        .faim-listing-desc { font-size: 0.82rem; color: #888; line-height: 1.5; margin-bottom: 0.75rem; }
        .faim-listing-amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; }
        .faim-listing-amenities span {
          background: #f0ede8;
          color: #666;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        .faim-listing-actions { display: flex; gap: 0.75rem; }
        .faim-edit-btn {
          flex: 1;
          padding: 0.6rem;
          border: 1.5px solid #e67e22;
          border-radius: 8px;
          background: white;
          color: #e67e22;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.15s;
        }
        .faim-edit-btn:hover { background: #fff8f2; }
        .faim-delete-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 8px;
          background: #fff0f0;
          color: #e74c3c;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.15s;
        }
        .faim-delete-btn:hover { background: #fcc; }
        @media (max-width: 768px) {
          .faim-form-grid { grid-template-columns: 1fr; }
          .faim-list-page { padding: 1rem; }
        }
      `}</style>
    </div>
  )
}