'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GREEN = '#059669';
const GREEN_DARK = '#047857';

const BADGE_CONFIG = {
  white:  { fill: '#cbd5e1', check: '#64748b', label: 'Submitted — Under Review', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  yellow: { fill: '#F59E0B', check: '#fff',    label: 'Partially Verified',        color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  green:  { fill: '#10B981', check: '#fff',    label: 'Verified',                  color: '#065f46', bg: '#f0fdf9', border: '#a7f3d0' },
  blue:   { fill: '#1d4ed8', check: '#fff',    label: 'Premium Verified',          color: '#1e3a8a', bg: '#eff6ff', border: '#bfdbfe' },
};

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara'
];

function BadgeIcon({ fill, check, size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="24" fill={fill} />
      <polyline points="13,24 22,33 36,16" stroke={check} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'var(--input-bg)', border: '1.5px solid rgba(255,255,255,0.25)',
  borderRadius: 8, color: '#ffffff', fontSize: 16,
  boxSizing: 'border-box', outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const labelStyle = {
  fontSize: 16, color: '#ffffff', display: 'block',
  marginBottom: 7, fontWeight: 700,
};

export default function VerylandCheckPage() {
  const [address, setAddress]     = useState('');
  const [state, setState]         = useState('');
  const [docFile, setDocFile]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [dbResult, setDbResult]   = useState(null);
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]         = useState('');

  async function handleCheck(e) {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter the property address to check.');
      return;
    }
    setError('');
    setLoading(true);
    setDbResult(null);
    setAiResult(null);

    try {
      let query = supabase
        .from('veryland_submissions')
        .select('id, property_address, state, badge_level, status, documents, submitted_at, reviewed_at')
        .ilike('property_address', `%${address.trim()}%`)
        .in('status', ['approved_partial', 'approved_full']);
      if (state) query = query.eq('state', state);
      const { data, error: dbErr } = await query;
      if (dbErr) throw new Error(dbErr.message);
      setDbResult(data && data.length > 0 ? { found: true, submissions: data } : { found: false });
    } catch (err) {
      setError('Database check failed: ' + err.message);
    }
    setLoading(false);

    if (docFile) {
      setAiLoading(true);
      try {
        const formData = new FormData();
        formData.append('document', docFile);
        formData.append('address', address);
        formData.append('state', state);
        const res = await fetch('/api/veryland/check', { method: 'POST', body: formData });
        const data = await res.json();
        setAiResult(data.analysis || 'AI analysis unavailable.');
      } catch {
        setAiResult('AI analysis could not be completed. Please try again.');
      }
      setAiLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: 'var(--text-1)' }}>

      {/* Nav */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <a href="/" style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#d1d5db', margin: '0 8px' }}>/</span>
        <a href="/veryland" style={{ color: GREEN, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Veryland</a>
        <span style={{ color: '#d1d5db', margin: '0 8px' }}>/</span>
        <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>Check Documents</span>
      </nav>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Check Property Documents
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, fontWeight: 500, lineHeight: 1.75 }}>
            Enter the property address to check if it&apos;s verified in our database. Optionally upload a document photo for an AI authenticity scan before you make any payment.
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleCheck}>
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.75rem', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Property Address *</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter the address exactly as it appears on the document"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>
                State{' '}
                <span style={{ color: '#cccccc', fontWeight: 400 }}>(optional — narrows the search)</span>
              </label>
              <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}>
                <option value="">All states</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Upload Document for AI Scan{' '}
                <span style={{ color: '#cccccc', fontWeight: 400 }}>(optional — JPG or PNG only)</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={e => setDocFile(e.target.files?.[0] || null)}
                style={{ ...inputStyle, padding: '9px 12px', cursor: 'pointer', color: '#ffffff' }}
              />
              {docFile && (
                <p style={{ fontSize: 15, color: GREEN_DARK, fontWeight: 600, marginTop: 8 }}>
                  ✓ {docFile.name} — will be scanned by Gemini AI
                </p>
              )}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fff1f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800,
              fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              boxShadow: loading ? 'none' : '0 4px 16px rgba(239,68,68,0.35)',
            }}
          >
            {loading ? 'Checking database…' : 'Check This Property →'}
          </button>
        </form>

        {/* DB Result */}
        {dbResult && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 13, color: '#cccccc', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Veryland Database Result
            </div>

            {dbResult.found ? (
              dbResult.submissions.map(sub => {
                const b = BADGE_CONFIG[sub.badge_level] || BADGE_CONFIG.green;
                return (
                  <div key={sub.id} style={{
                    background: b.bg,
                    border: `1.5px solid ${b.border}`,
                    borderRadius: 16, padding: '1.75rem', marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <BadgeIcon fill={b.fill} check={b.check} size={52} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: b.color }}>{b.label}</div>
                        <div style={{ fontSize: 15, color: '#cccccc', fontWeight: 500, marginTop: 3 }}>Found in the Veryland database</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Address', value: sub.property_address },
                        { label: 'State', value: sub.state },
                        { label: 'Documents on file', value: Array.isArray(sub.documents) ? sub.documents.length : 0 },
                        sub.reviewed_at && {
                          label: 'Verified on',
                          value: new Date(sub.reviewed_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                        },
                      ].filter(Boolean).map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 16 }}>
                          <span style={{ color: '#cccccc', fontWeight: 700, minWidth: 140 }}>{row.label}:</span>
                          <span style={{ color: '#ffffff', fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 16, padding: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>⚠️</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#92400e', marginBottom: 10 }}>
                    Not Found in Veryland
                  </div>
                  <p style={{ fontSize: 16, color: '#cccccc', fontWeight: 500, lineHeight: 1.75, margin: 0 }}>
                    This address is not in our verified database. That doesn&apos;t automatically mean it&apos;s fraudulent — but we strongly recommend asking the owner to{' '}
                    <a href="/veryland/submit" style={{ color: GREEN_DARK, textDecoration: 'none', fontWeight: 700, borderBottom: `1px solid ${GREEN_DARK}` }}>
                      submit their documents for verification
                    </a>{' '}
                    before you commit any money.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Result */}
        {(aiLoading || aiResult) && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: '#cccccc', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              AI Document Analysis
            </div>

            {aiLoading ? (
              <div style={{ background: 'var(--card-bg)', border: '1.5px solid #bfdbfe', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#1d4ed8', animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
                <span style={{ color: '#cccccc', fontSize: 16, fontWeight: 600 }}>Gemini AI is analysing your document…</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 8px rgba(29,78,216,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#0ef6cc' }}>Gemini AI Analysis</span>
                </div>
                <div style={{ fontSize: 16, color: '#cccccc', fontWeight: 500, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {!dbResult && !loading && (
          <div style={{ marginTop: 40, background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#cccccc', fontSize: 14, fontWeight: 500, margin: 0 }}>
              Are you a property owner?{' '}
              <a href="/veryland/submit" style={{ color: GREEN_DARK, textDecoration: 'none', fontWeight: 700, borderBottom: `1px solid ${GREEN_DARK}` }}>
                Get your property verified →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
