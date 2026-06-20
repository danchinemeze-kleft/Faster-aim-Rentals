'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GREEN = '#059669';
const GREEN_DARK = '#047857';
const GREEN_LIGHT = '#d1fae5';

const DOC_TYPES = [
  { value: 'certificate_of_occupancy', label: 'Certificate of Occupancy (C of O)' },
  { value: 'survey_plan', label: 'Survey Plan' },
  { value: 'deed_of_assignment', label: 'Deed of Assignment' },
  { value: 'governors_consent', label: "Governor's Consent" },
  { value: 'purchase_receipt', label: 'Purchase Receipt' },
  { value: 'building_plan_approval', label: 'Building Plan Approval' },
  { value: 'tax_clearance', label: 'Tax Clearance Certificate' },
  { value: 'gazette', label: 'Government Gazette' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
  { value: 'other', label: 'Other Document' },
];

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara'
];

const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'mansion', label: 'Mansion' },
  { value: 'room_and_parlour', label: 'Room & Parlour' },
  { value: 'shop', label: 'Shop / Office' },
  { value: 'land', label: 'Land / Plot' },
];

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'var(--input-bg)', border: '1.5px solid var(--border-2)',
  borderRadius: 8, color: '#111827', fontSize: 14,
  boxSizing: 'border-box', outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const labelStyle = {
  fontSize: 13, color: 'var(--text-2)', display: 'block',
  marginBottom: 7, fontWeight: 600,
};

export default function VerylandSubmitPage() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('form');
  const [submissionId, setSubmissionId] = useState(null);
  const [error, setError] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyState, setPropertyState] = useState('');
  const [propertyLGA, setPropertyLGA] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [documents, setDocuments] = useState([
    { type: 'certificate_of_occupancy', file: null, uploading: false, url: '', error: '' },
  ]);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);
      setOwnerEmail(session.user.email || '');
      const { data } = await supabase
        .from('Profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data) {
        setOwnerName(data.full_name || '');
        setOwnerPhone(data.phone || '');
      }
    }
    loadUser();
  }, []);

  function addDocument() {
    setDocuments(prev => [...prev, { type: '', file: null, uploading: false, url: '', error: '' }]);
  }

  function removeDocument(idx) {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  }

  function updateType(idx, type) {
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, type } : d));
  }

  function updateFile(idx, file) {
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, file, error: '' } : d));
  }

  async function uploadOne(idx) {
    const doc = documents[idx];
    if (!doc.file) return null;
    const ts = Date.now();
    const ext = doc.file.name.split('.').pop().toLowerCase();
    const path = `submissions/${ts}/${doc.type || 'doc'}_${idx}.${ext}`;
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, uploading: true } : d));
    const { error: upErr } = await supabase.storage
      .from('veryland-docs')
      .upload(path, doc.file, { upsert: false });
    if (upErr) {
      setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, uploading: false, error: upErr.message } : d));
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('veryland-docs').getPublicUrl(path);
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, uploading: false, url: publicUrl } : d));
    return publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!ownerName.trim() || !ownerEmail.trim() || !propertyAddress.trim() || !propertyState) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }
    if (documents.every(d => !d.file)) {
      setError('Please upload at least one property document.');
      return;
    }
    setScreen('uploading');
    const uploadedDocs = [];
    for (let i = 0; i < documents.length; i++) {
      if (!documents[i].file) continue;
      const url = await uploadOne(i);
      if (!url) {
        setError('Failed to upload a document. Please check your connection and try again.');
        setScreen('form');
        return;
      }
      uploadedDocs.push({ type: documents[i].type, name: documents[i].file.name, url });
    }
    const { data, error: dbErr } = await supabase
      .from('veryland_submissions')
      .insert({
        user_id: user?.id || null,
        owner_name: ownerName.trim(),
        owner_email: ownerEmail.trim(),
        owner_phone: ownerPhone.trim(),
        property_address: propertyAddress.trim(),
        state: propertyState,
        lga: propertyLGA.trim(),
        property_type: propertyType,
        documents: uploadedDocs,
        additional_info: additionalInfo.trim(),
        status: 'submitted',
        badge_level: 'white',
      })
      .select('id')
      .single();
    if (dbErr) {
      setError('Submission failed: ' + dbErr.message);
      setScreen('form');
      return;
    }
    setSubmissionId(data.id);
    setScreen('success');
  }

  if (screen === 'uploading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: `4px solid ${GREEN_LIGHT}`, borderTopColor: GREEN, animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ color: 'var(--text-2)', fontSize: 15, fontWeight: 600 }}>Uploading documents and submitting…</div>
            <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>Please keep this page open</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', background: '#fff', border: '1.5px solid #d1fae5', borderRadius: 20, padding: '3rem 2.5rem', boxShadow: '0 8px 32px rgba(5,150,105,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="40" fill={GREEN_LIGHT} />
              <polyline points="22,40 36,54 58,26" stroke={GREEN} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 14px' }}>
            Submission Received!
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, fontWeight: 500, lineHeight: 1.75, marginBottom: 10 }}>
            Your documents are in our queue. Our verification team will review them and assign your Veryland badge within 3–5 business days.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 36 }}>
            Reference ID:{' '}
            <span style={{ color: GREEN_DARK, fontFamily: 'monospace', fontWeight: 800 }}>
              {submissionId?.slice(0, 8).toUpperCase()}
            </span>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/browse" style={{ background: GREEN, color: '#fff', padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Browse Listings
            </a>
            <a href="/veryland" style={{ background: 'var(--card-bg)', color: 'var(--text-2)', border: '1.5px solid var(--border-2)', padding: '12px 26px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Back to Veryland
            </a>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: 'var(--text-1)' }}>

      {/* Nav */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <a href="/" style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: 'var(--border-2)', margin: '0 8px' }}>/</span>
        <a href="/veryland" style={{ color: GREEN, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Veryland</a>
        <span style={{ color: 'var(--border-2)', margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>Submit Documents</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Verify Your Property
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, fontWeight: 500, lineHeight: 1.7 }}>
            Submit your property ownership documents. Our team manually reviews each submission and awards the appropriate Veryland badge — no bots, no shortcuts.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fff1f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#dc2626', fontSize: 14, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Section 1: Your Details */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: GREEN, color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>1</span>
              Your Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="As on your documents" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Phone Number</label>
                <input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="+234 080 XXXX XXXX" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Section 2: Property Details */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: GREEN, color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>2</span>
              Property Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Property Address *</label>
                <input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Exact address as it appears on your documents" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <select value={propertyState} onChange={e => setPropertyState(e.target.value)} required style={inputStyle}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>LGA / Area</label>
                <input value={propertyLGA} onChange={e => setPropertyLGA(e.target.value)} placeholder="Local Government Area" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Property Type</label>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={inputStyle}>
                  <option value="">Select type (optional)</option>
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Documents */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: GREEN, color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>3</span>
              Property Documents *
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginBottom: 20, marginLeft: 36 }}>
              Upload scanned copies or clear photos. Accepted: PDF, JPG, PNG. Max 10MB per file.
            </p>

            {documents.map((doc, idx) => (
              <div key={idx} style={{ background: 'var(--page-bg)', border: '1.5px solid var(--border-1)', borderRadius: 12, padding: '1.25rem', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700 }}>Document {idx + 1}</span>
                  {documents.length > 1 && (
                    <button type="button" onClick={() => removeDocument(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Document Type</label>
                    <select value={doc.type} onChange={e => updateType(idx, e.target.value)} style={inputStyle}>
                      <option value="">Select type</option>
                      {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Upload File</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e => updateFile(idx, e.target.files?.[0] || null)}
                      style={{ ...inputStyle, padding: '9px 12px', cursor: 'pointer', color: 'var(--text-2)' }}
                    />
                  </div>
                </div>
                {doc.error && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginTop: 10 }}>{doc.error}</p>}
                {doc.url && <p style={{ color: GREEN_DARK, fontSize: 13, fontWeight: 700, marginTop: 10 }}>✓ Uploaded successfully</p>}
              </div>
            ))}

            <button
              type="button"
              onClick={addDocument}
              style={{
                background: 'var(--card-bg)', border: `2px dashed var(--border-2)`, color: 'var(--text-3)',
                borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', width: '100%', marginTop: 4,
              }}
            >
              + Add Another Document
            </button>
          </div>

          {/* Section 4: Notes */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#f3f4f6', color: 'var(--text-2)', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, border: '1.5px solid #e5e7eb' }}>4</span>
              Additional Notes <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 13 }}>(optional)</span>
            </div>
            <textarea
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              placeholder="Anything else our review team should know about this property or the documents..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
            />
          </div>

          <button type="submit" style={{
            width: '100%', padding: '16px',
            background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
            color: '#fff', border: 'none', borderRadius: 12,
            fontWeight: 800, fontSize: 16, cursor: 'pointer',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            boxShadow: `0 4px 16px ${GREEN}44`,
          }}>
            Submit for Verification →
          </button>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, fontWeight: 500, marginTop: 16, lineHeight: 1.6 }}>
            Review takes 3–5 business days. You&apos;ll be notified by email once your badge is awarded.
          </p>
        </form>
      </div>
    </div>
  );
}
