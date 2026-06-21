'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const PROPERTY_TYPES = [
  { value: 'residential_land', label: 'Residential Land' },
  { value: 'commercial_land', label: 'Commercial Land' },
  { value: 'mixed_use_land', label: 'Mixed-Use Land' },
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'house', label: 'House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bungalow', label: 'Bungalow / Terrace' },
  { value: 'commercial_building', label: 'Commercial Building' },
  { value: 'warehouse', label: 'Warehouse' },
];

const LAND_TYPES = ['residential_land', 'commercial_land', 'mixed_use_land'];

const TITLE_TYPES = [
  'Certificate of Occupancy (C of O)',
  'Right of Occupancy (R of O)',
  "Governor's Consent",
  'Deed of Assignment',
  'Deed of Gift',
  'Survey Plan Only',
  'Family/Community Land',
  'Virgin Land (Never Sold)',
  'Government Allocation',
  'Other',
];

const DEVELOPMENT_STATUSES = [
  'Bare land / Open plot',
  'Virgin land (untouched)',
  'Foundation laid',
  'Roofed (not plastered)',
  'Partially completed',
  'Fully completed building',
  'Occupied / Tenanted',
];

const LAND_OWNERSHIPS = [
  'Individual title (clear ownership)',
  'Family/Community land (never sold to individual)',
  'Virgin land (untouched, community)',
  'Government allocation',
];

const AMENITIES = ['Road access', 'Electricity', 'Water supply', 'Fence', 'Security', 'Drainage', 'Parking', 'Borehole'];

const emptyForm = {
  title: '',
  description: '',
  location: '',
  state: '',
  price: '',
  negotiable: false,
  property_type: 'residential_land',
  title_type: '',
  land_size: '',
  development_status: '',
  land_ownership: '',
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
};

const lbl = {
  fontSize: 14, color: '#ffffff', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 8,
};

const inp = {
  width: '100%', padding: '13px 15px',
  background: 'var(--input-bg)',
  border: '2px solid rgba(255,255,255,0.45)',
  borderRadius: 10, color: '#ffffff', fontSize: 15,
  boxSizing: 'border-box', outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

export default function SellPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });
  }, [supabase]);

  const isLand = LAND_TYPES.includes(form.property_type);

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function toggleAmenity(a) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Please enter a property title.');
    if (!form.location.trim()) return setError('Please enter the property location.');
    if (!form.state) return setError('Please select a state.');
    if (!form.price || isNaN(form.price)) return setError('Please enter a valid asking price.');
    if (!form.title_type) return setError('Please select the title type.');
    if (photos.length === 0) return setError('Please upload at least one photo.');

    setSubmitting(true);

    try {
      // Upload photos
      const imageUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const ext = photo.name.split('.').pop();
        const fileName = `sales/${user.id}/${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('property-images')
          .upload(fileName, photo, { contentType: photo.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
        setPhotoProgress(Math.round(((i + 1) / photos.length) * 100));
      }

      // Insert listing
      const payload = {
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        state: form.state,
        price: parseInt(form.price),
        negotiable: form.negotiable,
        property_type: form.property_type,
        title_type: form.title_type,
        land_size: form.land_size.trim() || null,
        development_status: form.development_status || null,
        land_ownership: form.land_ownership || null,
        bedrooms: isLand ? null : parseInt(form.bedrooms),
        bathrooms: isLand ? null : parseInt(form.bathrooms),
        amenities: form.amenities,
        images: imageUrls,
        status: 'pending',
        listing_fee_paid: false,
        available: true,
      };

      const { data: newListing, error: insertErr } = await supabase
        .from('property_sales')
        .insert([payload])
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // Get user email for Paystack
      const { data: profile } = await supabase
        .from('Profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const email = profile?.email || user.email;

      // Init payment
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'sale_listing',
          listing_id: newListing.id,
          user_id: user.id,
        }),
      });
      const payData = await res.json();
      if (!payData.authorization_url) throw new Error(payData.error || 'Payment init failed');

      window.location.href = payData.authorization_url;
    } catch (err) {
      setError('Error: ' + err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
        <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
          <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
          <span style={{ color: '#555', margin: '0 8px' }}>/</span>
          <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>Sell Property</span>
        </nav>
        <div style={{ maxWidth: 480, margin: '6rem auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>Login Required</h1>
          <p style={{ color: '#cccccc', fontSize: 16, lineHeight: 1.75, marginBottom: 28 }}>
            You need to be logged in to list a property for sale.
          </p>
          <a href="/account?redirect=/sell" style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
            Login / Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#555', margin: '0 8px' }}>/</span>
        <a href="/buy" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Buy Property</a>
        <span style={{ color: '#555', margin: '0 8px' }}>/</span>
        <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>Sell Property</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            List Property for Sale
          </h1>
          <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            Reach thousands of buyers across Nigeria. Pay a one-time listing fee of <strong style={{ color: '#0ef6cc' }}>₦20,000</strong> and your property stays live until sold.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Basic info */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
            <h2 style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
              Property Information
            </h2>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Property Title *</label>
              <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. 2 Plots of Land with C of O in GRA Onitsha" style={inp} required />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe the property — location advantages, road access, title history, development status..." rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={lbl}>Location / Address *</label>
                <input value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Street / area name" style={inp} required />
              </div>
              <div>
                <label style={lbl}>State *</label>
                <select value={form.state} onChange={e => setField('state', e.target.value)} style={inp} required>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={lbl}>Asking Price (₦) *</label>
                <input type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="e.g. 5000000" style={inp} min={0} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#cccccc', fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={form.negotiable} onChange={e => setField('negotiable', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#0ef6cc', cursor: 'pointer' }} />
                  Price is negotiable
                </label>
              </div>
            </div>
          </div>

          {/* Property type & title */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
            <h2 style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
              Property Type & Title
            </h2>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Property Type *</label>
              <select value={form.property_type} onChange={e => setField('property_type', e.target.value)} style={inp}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Title / Ownership Document *</label>
              <select value={form.title_type} onChange={e => setField('title_type', e.target.value)} style={inp} required>
                <option value="">Select title type</option>
                {TITLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={lbl}>Land Size</label>
                <input value={form.land_size} onChange={e => setField('land_size', e.target.value)} placeholder="e.g. 2 plots, 600 sqm" style={inp} />
              </div>
              <div>
                <label style={lbl}>Land Ownership</label>
                <select value={form.land_ownership} onChange={e => setField('land_ownership', e.target.value)} style={inp}>
                  <option value="">Select ownership type</option>
                  {LAND_OWNERSHIPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: isLand ? 0 : 18 }}>
              <label style={lbl}>Development Status</label>
              <select value={form.development_status} onChange={e => setField('development_status', e.target.value)} style={inp}>
                <option value="">Select status</option>
                {DEVELOPMENT_STATUSES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {!isLand && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
                <div>
                  <label style={lbl}>Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={e => setField('bedrooms', e.target.value)} min={0} max={20} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} min={0} max={20} style={inp} />
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
            <h2 style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
              Features & Amenities
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {AMENITIES.map(a => {
                const on = form.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                    padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    border: on ? '2px solid #0ef6cc' : '2px solid rgba(255,255,255,0.25)',
                    background: on ? 'rgba(14,246,204,0.12)' : 'transparent',
                    color: on ? '#0ef6cc' : '#cccccc',
                    transition: 'all 0.15s',
                  }}>{a}</button>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 24 }}>
            <h2 style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.25rem', paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
              Photos *
            </h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setPhotos(Array.from(e.target.files || []))}
              style={{ ...inp, padding: '10px 12px', cursor: 'pointer' }}
            />
            {photos.length > 0 && (
              <p style={{ color: '#0ef6cc', fontSize: 14, fontWeight: 700, marginTop: 10 }}>
                ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} selected
              </p>
            )}
            {photoProgress > 0 && photoProgress < 100 && (
              <div style={{ marginTop: 10, background: 'var(--border-1)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${photoProgress}%`, height: '100%', background: '#0ef6cc', transition: 'width 0.3s' }} />
              </div>
            )}
            <p style={{ color: '#888', fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
              Upload clear photos of the land/property, access road, and ownership documents if possible.
            </p>
          </div>

          {/* Fee notice */}
          <div style={{ background: 'rgba(14,246,204,0.06)', border: '2px solid rgba(14,246,204,0.3)', borderRadius: 14, padding: '1.25rem', marginBottom: 24 }}>
            <div style={{ fontWeight: 800, color: '#0ef6cc', fontSize: 15, marginBottom: 6 }}>📋 Listing Fee: ₦20,000 (one-time)</div>
            <p style={{ color: '#cccccc', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              After submitting this form you&apos;ll be redirected to Paystack to pay your listing fee. Your property stays live until it&apos;s sold, no monthly charges. We review and approve listings within 24 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '16px',
              background: submitting ? '#444' : 'linear-gradient(135deg, #0ef6cc, #00c9a7)',
              color: '#080a0f', border: 'none', borderRadius: 12,
              fontWeight: 900, fontSize: 17, cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              boxShadow: submitting ? 'none' : '0 4px 20px rgba(14,246,204,0.35)',
            }}
          >
            {submitting ? `Uploading photos… ${photoProgress}%` : 'Submit & Pay Listing Fee →'}
          </button>
        </form>
      </div>
    </div>
  );
}
